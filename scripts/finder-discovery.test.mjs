import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const data = require("../data.js");
const core = require("../discovery.js");
const discovery = core.create(data);
const ingestion = require("../ingestion.js");
const downtown = { lat: 40.7128, lng: -74.006 };

test("time filters use the full range and never guess workshop or drying times", () => {
  assert.equal(core.durationMinutes("30–60 min"), 60);
  assert.equal(core.durationMinutes("1–2 hours"), 120);
  assert.equal(core.durationMinutes("30 min + ongoing care"), 30);
  assert.equal(core.durationMinutes("One workshop"), null);
  assert.equal(core.durationMinutes("1–3 weeks (drying)"), null);
  const results = discovery.search("projects", "", { duration: 60 });
  assert.ok(results.length > 0);
  assert.ok(results.some((r) => r.item.slug === "cyanotype-prints"));
  assert.ok(!results.some((r) => r.item.slug === "crochet-bookmark"));
  assert.ok(results.every((r) => core.durationMinutes(r.item.time) <= 60));
});
test("time-only searches return activities and do not turn minutes into dollars", () => {
  for (const [query, limit] of [
    ["I have an hour", 60],
    ["under 30 minutes", 30],
    ["half an hour", 30],
  ]) {
    const parsed = discovery.intent(query);
    assert.equal(parsed.duration, limit);
    assert.equal(parsed.budget, "");
    assert.ok(discovery.search("projects", query, parsed).length > 0);
  }
  const both = discovery.intent("hobbies under $30 in 2 hours");
  assert.equal(both.budget, 30);
  assert.equal(both.duration, 120);
});
test("group discovery separates communities from classes and keeps rotating groups unlocated", () => {
  const groups = discovery.search("community", "", { communityType: "groups" });
  assert.ok(groups.some((r) => r.item.id === "urbansketchers"));
  assert.ok(
    groups.every(
      (r) => r.item.type === "community" && r.item.format !== "workshop",
    ),
  );
  const classes = discovery.search("community", "", {
    communityType: "classes",
  });
  assert.equal(classes.length, Object.keys(data.classes).length);
  assert.ok(classes.every((r) => r.item.type === "class"));
  assert.equal(discovery.pointFor(data.communities.urbansketchers), null);
  assert.equal(discovery.pointFor(data.communities.purls), null);
  assert.equal(
    discovery.pointFor(data.communities.resistor),
    data.places.resistor.coordinates,
  );
  const parsed = discovery.intent("urban sketching groups");
  assert.equal(
    discovery.search("community", parsed.query, parsed)[0].item.id,
    "urbansketchers",
  );
});
test("nearby resources sort by sourced distance, respect the radius and label missing points as null", () => {
  const filters = {
    center: downtown,
    radiusKm: 5,
    includeUnlocated: false,
    cityId: "nyc",
  };
  for (const view of ["materials", "community"]) {
    const rows = discovery.search(view, "", filters);
    assert.ok(rows.length > 1);
    assert.ok(rows.every((r) => r.distance !== null && r.distance <= 5));
    assert.ok(
      rows.every((r, i) => i === 0 || rows[i - 1].distance <= r.distance),
    );
  }
  const rows = discovery.search("community", "", {
    ...filters,
    includeUnlocated: true,
    communityType: "groups",
  });
  const rotating = rows.find((r) => r.item.id === "purls");
  assert.equal(rotating.distance, null);
  assert.equal(
    rows.slice(rows.indexOf(rotating)).every((r) => r.distance === null),
    true,
  );
});
test("device location keeps home activities available and counts only verified nearby resources", () => {
  const filters = { center: downtown, radiusKm: 1, includeUnlocated: false };
  const rows = discovery.search("projects", "", filters);
  assert.equal(rows.length, data.projects.length);
  for (const row of rows) {
    assert.equal(row.distance, null);
    assert.equal(
      row.localCount,
      row.item.placeIds.filter((id) => {
        const distance = discovery.distanceTo(data.places[id], filters);
        return distance !== null && distance <= 1;
      }).length,
    );
  }
});
test("invalid and remote coordinates do not invent a nearby NYC listing", () => {
  assert.equal(core.distanceKm({ lat: NaN, lng: 0 }, downtown), null);
  assert.equal(core.distanceKm({ lat: 91, lng: 0 }, downtown), null);
  assert.ok(
    Math.abs(
      core.distanceKm(downtown, { lat: -40.7128, lng: 105.994 }) -
        Math.PI * 6371,
    ) < 0.01,
  );
  assert.equal(
    discovery.search("materials", "", {
      center: { lat: 34.0522, lng: -118.2437 },
      radiusKm: 10,
      includeUnlocated: false,
    }).length,
    0,
  );
  assert.equal(
    discovery.inArea(
      { location: { cityId: "other" }, coordinates: downtown },
      { center: downtown },
    ),
    false,
  );
});
function locationHarness() {
  let success,
    failure,
    requests = 0,
    options;
  const states = [],
    positions = [];
  const context = vm.createContext({
    geo: {
      getCurrentPosition(ok, fail, opts) {
        requests++;
        success = ok;
        failure = fail;
        options = opts;
      },
    },
    onPosition: (p) => positions.push(p),
    onStatus: (message, busy) => states.push({ message, busy }),
  });
  vm.runInContext(fs.readFileSync("discovery.js", "utf8"), context);
  vm.runInContext(fs.readFileSync("nearby.js", "utf8"), context);
  const lookup = vm.runInContext(
    "OH_NEARBY.create({geolocation:geo,onPosition,onStatus})",
    context,
  );
  return {
    lookup,
    positions,
    states,
    requests: () => requests,
    options: () => options,
    success: () => success,
    failure: () => failure,
  };
}
test("device location is opt-in, coarse, cancellable and robust to late callbacks", () => {
  const h = locationHarness();
  assert.equal(h.requests(), 0);
  h.lookup.locate();
  assert.equal(h.requests(), 1);
  assert.equal(h.options().enableHighAccuracy, false);
  assert.equal(h.options().timeout, 10000);
  const late = h.success();
  h.lookup.cancel();
  late({ coords: { latitude: 40.7, longitude: -74 } });
  assert.equal(h.positions.length, 0);
  h.lookup.locate();
  h.success()({ coords: { latitude: 40.71, longitude: -74.01 } });
  assert.equal(h.positions.length, 1);
  assert.equal(h.states.at(-1).busy, false);
  h.lookup.locate();
  h.failure()({ code: 1 });
  assert.match(h.states.at(-1).message, /not shared/);
});
test("recognized screenshot text has explicit provenance and never grants remote OCR trust", () => {
  const result = ingestion.fromUploads(
    {
      attachments: [
        {
          id: "ref-1",
          name: "screenshot.png",
          kind: "image",
          type: "image/png",
          size: 100,
          ocrText:
            "Make a leather journal using paper and thread. Fold the paper.",
        },
      ],
    },
    { data, discovery },
  );
  assert.equal(result.matches[0].slug, "leather-journal");
  assert.equal(result.evidence[0].kind, "ocr");
  assert.equal(result.evidence[0].origin, "on-device-ocr");
  assert.ok(result.requirements.every((r) => r.sourceKind === "ocr"));
  assert.match(result.warnings.join(" "), /may contain errors/);
  assert.equal(
    ingestion.validResult(
      {
        ...result,
        provider: "youtube",
        sourceUrl: "https://www.youtube.com/watch?v=abcdef12345",
      },
      data,
    ),
    false,
  );
  assert.equal(
    require("../ocr.js").cleanText("\0paper\u0001\nthread"),
    "paper\nthread",
  );
});
