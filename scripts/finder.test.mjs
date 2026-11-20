import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

function openFinder() {
  const events = new Map();
  const styles = new Map();
  let frameRequests = 0;
  const hero = {
    addEventListener: (name, handler) => events.set("hero:" + name, handler),
    style: { setProperty: (name, value) => styles.set(name, value) },
    getBoundingClientRect: () => ({
      top: 0,
      left: 0,
      bottom: 900,
      width: 1440,
      height: 900,
    }),
  };
  const picker = {
    addEventListener: (name, handler) => events.set("picker:" + name, handler),
  };
  const window = {
    location: { hash: "" },
    innerHeight: 1000,
    addEventListener: (name, handler) => events.set("window:" + name, handler),
    matchMedia: (query) => ({
      matches: false,
      addEventListener: () => {},
    }),
    requestAnimationFrame: () => ++frameRequests,
    cancelAnimationFrame: () => {},
  };
  const context = vm.createContext({
    window,
    document: {
      querySelector: () => hero,
      getElementById: () => picker,
    },
  });
  // Match classic scripts: the real catalog creates a lexical OH_DATA const,
  // which is deliberately not a property on window.
  vm.runInContext(fs.readFileSync("data.js", "utf8"), context);
  vm.runInContext(fs.readFileSync("finder.js", "utf8"), context);
  return {
    context,
    events,
    styles,
    window,
    frameRequests: () => frameRequests,
  };
}

test("the surprise picker opens real guides without immediately repeating one", () => {
  const scene = openFinder();
  assert.equal(scene.window.OH_DATA, undefined);
  const slugs = new Set(
    vm.runInContext("OH_DATA.projects.map(p => p.slug)", scene.context),
  );
  let previous = "";
  for (let i = 0; i < 100; i++) {
    scene.events.get("picker:click")();
    const slug = scene.window.location.hash.replace("#project/", "");
    assert.ok(slugs.has(slug), "The picker must open an existing guide");
    assert.notEqual(slug, previous);
    previous = slug;
  }
});
