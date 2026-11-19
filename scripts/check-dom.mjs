// DOM unit harness, not a browser renderer. No server or browser is launched.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { parseHTML } from "../work/ocr-deps/node_modules/linkedom/esm/index.js";
const { window, document } = parseHTML(fs.readFileSync("index.html", "utf8"));
Object.defineProperty(window.HTMLSelectElement.prototype, "options", {
  get() {
    return [...this.querySelectorAll("option")];
  },
});
Object.defineProperty(window.HTMLSelectElement.prototype, "value", {
  get() {
    return (
      this.options.find((o) => o.hasAttribute("selected"))?.value ||
      this.options[0]?.value ||
      ""
    );
  },
  set(value) {
    this.options.forEach((o) =>
      o.toggleAttribute("selected", o.value === String(value)),
    );
  },
  configurable: true,
});
window.HTMLSelectElement.prototype.add = function (option) {
  this.append(option);
};
window.HTMLElement.prototype.scrollIntoView = function () {};
window.HTMLElement.prototype.focus = function () {};
const store = new Map();
const localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, v),
};
const location = {
  href: "https://example.test/other-hours/",
  hash: "",
  protocol: "https:",
};
window.location = location;
window.scrollTo = () => {};
window.scrollY = 0;
let geoSuccess,
  geoRequests = 0,
  fetchRequests = 0;
const navigator = {
  geolocation: {
    getCurrentPosition(ok) {
      geoSuccess = ok;
      geoRequests++;
    },
  },
};
const context = vm.createContext({
  document,
  window,
  location,
  navigator,
  localStorage,
  history: {
    replaceState(_a, _b, hash) {
      location.hash = hash;
    },
  },
  URL,
  Blob,
  File,
  crypto: globalThis.crypto,
  AbortController,
  AbortSignal,
  Event: window.Event,
  console,
  setTimeout,
  clearTimeout,
  Option: function (text, value) {
    const o = document.createElement("option");
    o.value = value;
    o.textContent = text;
    return o;
  },
  fetch: async () => {
    fetchRequests++;
    throw new Error("blocked fixture");
  },
});
for (const file of [
  "config.js",
  "data.js",
  "discovery.js",
  "nearby.js",
  "ingestion.js",
  "uploads.js",
  "ocr.js",
  "upload-ui.js",
  "app.js",
  "finder.js",
])
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
const $ = (s) => document.querySelector(s),
  change = (id, value) => {
    const e = $("#" + id);
    e.value = value;
    e.dispatchEvent(new window.Event("change", { bubbles: true }));
  };
assert.equal(geoRequests, 0);
assert.equal(fetchRequests, 0);
assert.equal($("#project-grid").querySelectorAll(".project-card").length, 8);
change("duration-select", "60");
assert.match($("#result-summary").textContent, /guides/);
assert.equal(
  $("#project-grid").querySelectorAll('[data-save="crochet-bookmark"]').length,
  0,
);
vm.runInContext('showView("community",false)', context);
assert.equal($("#duration-label").hidden, true);
assert.equal($("#community-type-label").hidden, false);
change("community-type", "classes");
assert.match($("#community-grid").textContent, /workshops/);
$("#use-location").click();
assert.equal(geoRequests, 1);
geoSuccess({ coords: { latitude: 40.7128, longitude: -74.006 } });
vm.runInContext('showView("materials",false)', context);
assert.equal($("#radius-label").hidden, false);
assert.match($("#places-grid").textContent, /mi away/);
assert.equal(
  [...store.values()].some((v) => v.includes("40.7128")),
  false,
);
change("borough-select", "queens");
assert.equal($("#radius-label").hidden, true);
assert.match($("#result-summary").textContent, /Queens/);
// Screenshot matching uses recognized text; the actual OCR engine is tested separately.
await vm.runInContext(
  'OH_UPLOAD_UI.add([new File([new Uint8Array([137,80,78,71,13,10,26,10,0,1])],"screenshot.png",{type:"image/png"})])',
  context,
);
assert.equal($("#ocr-tools").hidden, false);
// Use the controller's real input event and source augmentation, with a bounded OCR test double.
vm.runInContext(
  'OH_OCR.read=async()=>({text:"Sashiko repair. Mend denim with needle and thread.",confidence:95})',
  context,
);
$("#read-screenshots").click();
await new Promise((r) => setTimeout(r, 0));
assert.ok($("[data-ocr-text]"));
$("#search-query").value = "";
$("#search-form").dispatchEvent(
  new window.Event("submit", { bubbles: true, cancelable: true }),
);
assert.match($("#link-result").textContent, /sashiko|Sashiko/i);
assert.equal($(".plan-details").open, undefined); // collapsed by default in this DOM implementation
assert.equal($("#save-plan").disabled, false);
const recognized = $("[data-ocr-text]");
recognized.value = "crochet yarn";
recognized.dispatchEvent(new window.Event("input", { bubbles: true }));
assert.equal(
  $("#save-plan").disabled,
  true,
  "Changing recognized text invalidates the old source before saving",
);
$("#clear-uploads").click();
$("#caption-input").value = "Make a leather journal using paper and thread.";
await vm.runInContext(
  'submitLink("https://www.pinterest.com/pin/1234567890/")',
  context,
);
assert.match($("#link-result").textContent, /leather journal/i);
assert.equal(
  $("#save-plan").disabled,
  false,
  "Removing attachments must not prevent saving a later caption-based link plan",
);
assert.match($("#link-result").textContent, /Pinterest|PINTEREST/);
$("#caption-input").value = "";
await vm.runInContext(
  'submitLink("https://www.instagram.com/p/example/")',
  context,
);
assert.match($("#link-status").textContent, /isn’t readable/);
assert.ok($('[data-inspiration-input="caption"]'));
assert.ok($('[data-inspiration-input="photo"]'));
console.log(
  JSON.stringify(
    {
      status: "passed",
      scope: "Node DOM integration, not browser rendering",
      flows: [
        "initial activity results",
        "time filtering",
        "groups/classes switch",
        "opt-in location and manual reset",
        "coordinates not persisted",
        "image attachment",
        "recognized-text matching",
        "stale-source save guard",
        "link + caption fallback after removing files",
        "unreadable link exposes caption and screenshot actions",
      ],
      contentFetchCalls: fetchRequests,
    },
    null,
    2,
  ),
);
