import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

function openScene(reducedMotion = false) {
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
      matches: query.includes("reduced-motion") ? reducedMotion : true,
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
  vm.runInContext(fs.readFileSync("scene.js", "utf8"), context);
  return {
    context,
    events,
    styles,
    window,
    frameRequests: () => frameRequests,
  };
}

test("the worktable picker opens real guides without immediately repeating one", () => {
  const scene = openScene();
  assert.equal(scene.window.OH_DATA, undefined);
  const slugs = new Set(
    vm.runInContext("OH_DATA.projects.map(p => p.slug)", scene.context),
  );
  let previous = "";
  for (let i = 0; i < 100; i++) {
    scene.events.get("picker:click")();
    const slug = scene.window.location.hash.replace("#project/", "");
    assert.ok(slugs.has(slug), "The object must open an existing guide");
    assert.notEqual(slug, previous);
    previous = slug;
  }
});

test("reduced motion keeps the scene static while preserving the hobby action", () => {
  const scene = openScene(true);
  scene.events.get("window:scroll")();
  scene.events.get("hero:pointermove")({ clientX: 100, clientY: 100 });
  assert.equal(scene.frameRequests(), 0);
  scene.events.get("picker:click")();
  assert.match(scene.window.location.hash, /^#project\/[a-z0-9-]+$/);
});
