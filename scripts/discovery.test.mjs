import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const data = require("../data.js");
const discovery = require("../discovery.js").create(data);
const ingestion = require("../ingestion.js");

test("A: leather journal leads to Brooklyn reuse, separate tools and legacy checklist positions", () => {
  const results = discovery.search("projects", "make a leather journal", {
    borough: "brooklyn",
  });
  assert.equal(results[0].item.slug, "leather-journal");
  const p = results[0].item;
  assert.ok(
    discovery
      .relatedPlaces(p, { borough: "brooklyn" })
      .local.some((p) => p.type === "reuse"),
  );
  assert.ok(p.budgets.reuse.max < p.budgets.local.max);
  assert.ok(p.budgets.equipment && p.budgets.workshop);
  assert.deepEqual(
    p.materials.slice(0, 6).map((m) => m.legacyIndex),
    [0, 1, 2, 3, 4, 5],
  );
});
test("C: sewing class intent and Garment District relationships", () => {
  const parsed = discovery.intent(
    "Beginner sewing classes near the Garment District",
  );
  assert.equal(parsed.borough, "manhattan");
  assert.equal(parsed.neighborhood, "Garment District");
  assert.equal(parsed.view, "community");
  assert.ok(parsed.hobbyIds.includes("sewing"));
  const filters = { ...parsed, category: "all" };
  assert.ok(
    discovery
      .search("community", parsed.query, filters)
      .some((r) => r.item.id === "nysewing"),
  );
  assert.ok(
    discovery
      .search("materials", parsed.query, filters)
      .some((r) => r.item.id === "mood"),
  );
  assert.ok(
    discovery
      .search("people", parsed.query, filters)
      .some((r) => r.item.id === "mood"),
  );
});
test("D: budget and Queens persist across result types", () => {
  const parsed = discovery.intent(
    "I live in Queens and want a new hobby under $50",
  );
  assert.equal(parsed.budget, 50);
  assert.equal(parsed.borough, "queens");
  const projects = discovery.search("projects", parsed.query, parsed);
  assert.ok(
    projects.length > 0 && projects.every((r) => r.item.budgetMin <= 50),
  );
  assert.ok(projects[0].localCount > 0);
  for (const view of ["community", "materials"]) {
    const results = discovery.search(view, parsed.query, parsed);
    assert.ok(
      results.length > 0 &&
        results.every((r) => discovery.inArea(r.item, parsed)),
    );
  }
});
test("E: every browse collection includes a practical start", () => {
  for (const category of data.categories) {
    const results = discovery.search("projects", "", { category: category.id });
    assert.ok(results.length > 0, category.name);
    assert.ok(
      results.every(
        (r) => r.item.placeIds.length && r.item.communityIds.length,
      ),
    );
  }
});
test("all five boroughs have references; precise neighborhood filtering", () => {
  for (const borough of Object.keys(data.cities.nyc.boroughs))
    assert.ok(
      discovery.search("materials", "", { borough }).length > 0,
      borough,
    );
  const results = discovery.search("materials", "", {
    borough: "brooklyn",
    neighborhood: "Greenpoint",
  });
  assert.ok(results.some((r) => r.item.id === "craft"));
  assert.ok(!results.some((r) => r.item.id === "fabscrap"));
});
test("unknown interests are empty; synonyms and free/reuse constraints are useful", () => {
  assert.equal(
    discovery.search("projects", "quantum unicycle mushroom orchestra", {})
      .length,
    0,
  );
  assert.ok(
    discovery
      .intent("I want to sew a dress in Bushwick under $30")
      .hobbyIds.includes("sewing"),
  );
  assert.equal(
    discovery.intent("I want to sew a dress in Bushwick under $30")
      .neighborhood,
    "Bushwick",
  );
  assert.ok(
    discovery.search("projects", "", { free: true }).every((r) => r.item.free),
  );
  assert.ok(
    discovery
      .search("materials", "", { reuse: true })
      .every((r) =>
        ["reuse", "shared-equipment", "community-exchange"].includes(
          r.item.type,
        ),
      ),
  );
});
test("B: allowlisted content URLs cannot become arbitrary fetch targets", () => {
  for (const url of [
    "http://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ",
    "https://127.0.0.1/sewing",
    "https://youtube.com/watch?v=bad",
    "javascript:alert(1)",
  ])
    assert.equal(ingestion.identify(url), null, url);
  assert.equal(
    ingestion.identify("https://youtu.be/dQw4w9WgXcQ?si=tracking").url,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );
});
test("B: title is a suggested match, not an extracted supply list", async () => {
  const result = await ingestion.ingest(
    { url: "https://youtu.be/dQw4w9WgXcQ" },
    {
      data,
      discovery,
      fetcher: async () =>
        new Response(
          JSON.stringify({ title: "How to bind a leather journal" }),
          { status: 200 },
        ),
    },
  );
  assert.equal(result.matches[0].slug, "leather-journal");
  assert.equal(result.requirements.length, 0);
  assert.equal(result.steps.length, 0);
  assert.equal(result.confidence, "title-only");
  assert.equal(result.transcriptStatus, "not-retrieved");
});
test("B: restricted access has no invented match; pasted text extracts supported facts", async () => {
  const failure = async () => {
    throw new Error("Restricted");
  };
  const unavailable = await ingestion.ingest(
    { url: "https://www.tiktok.com/@maker/video/1234567890123456789" },
    { data, discovery, fetcher: failure },
  );
  assert.equal(unavailable.matches.length, 0);
  assert.equal(unavailable.evidence.length, 0);
  const result = await ingestion.ingest(
    {
      url: "https://www.tiktok.com/@maker/video/1234567890123456789",
      text: "Make a leather journal with 20 sheets of paper and thread. Fold the paper. Sew the pages.",
      textKind: "transcript",
    },
    { data, discovery, fetcher: failure },
  );
  assert.ok(result.matches.some((m) => m.slug === "leather-journal"));
  assert.ok(
    result.requirements.some(
      (m) => m.name === "paper" && m.quantity === "20 sheets of",
    ),
  );
  assert.ok(!result.requirements.some((m) => m.name === "awl"));
  assert.equal(result.evidence[0].origin, "user-supplied");
  assert.ok(result.steps.some((s) => s.text === "Fold the paper"));
});
test("service failure falls back to useful manual text", async () => {
  const result = await ingestion.ingest(
    {
      url: "https://www.instagram.com/reel/example/",
      text: "Crochet a granny square bag from yarn and a crochet hook.",
    },
    {
      data,
      discovery,
      endpoint: "https://example.test/api/ingest",
      fetcher: async () => {
        throw new Error("Service offline");
      },
    },
  );
  assert.ok(result.matches.some((m) => m.slug === "crochet-granny-square-bag"));
  assert.ok(
    result.warnings.some((w) => w.includes("optional analysis service")),
  );
  assert.equal(result.transcriptStatus, "not-retrieved");
});
test("map coordinates cite address sources and nearby distances use geography, not GPS", () => {
  const points = Object.values(data.places).filter((p) => p.coordinates);
  assert.ok(points.length >= 20);
  assert.ok(points.every((p) => /^https:\/\//.test(p.coordinates.source)));
  const km = require("../discovery.js").distanceKm(
    data.places.reuse.coordinates,
    data.places.fabscrap.coordinates,
  );
  assert.ok(
    km > 0 && km < 5,
    "Brooklyn reuse locations should be close to each other",
  );
});
test("browser rejects malformed or falsely grounded service results", () => {
  const link = ingestion.identify("https://youtu.be/dQw4w9WgXcQ");
  const result = ingestion.buildResult(
    link,
    [
      {
        kind: "description",
        text: "Use paper and thread.",
        origin: "user-supplied",
      },
    ],
    [],
    data,
    discovery,
  );
  assert.ok(ingestion.validResult(result, data));
  assert.equal(
    ingestion.validResult(
      {
        ...result,
        requirements: [
          {
            name: "secret magic resin",
            quantity: null,
            provenance: "extracted",
            evidence: "not present",
          },
        ],
      },
      data,
    ),
    false,
  );
  assert.equal(ingestion.validResult({ ...result, provider: 42 }, data), false);
  assert.equal(
    ingestion.validResult(
      {
        ...result,
        requirements: [
          {
            name: "leather",
            provenance: "extracted",
            evidence: "Use paper and thread.",
          },
        ],
      },
      data,
    ),
    false,
  );
  assert.equal(
    ingestion.validResult(
      { ...result, transcriptStatus: "user-or-authorized-transcript" },
      data,
    ),
    false,
  );
});

test("workshop-only guides cannot claim an unverified price fits a supply budget", () => {
  const studio = data.projects.find((p) => p.slug === "glass-bead-intro");
  assert.equal(studio.budgetStatus, "provider-quote-required");
  assert.equal(studio.budgets.reuse.min, null);
  assert.equal(studio.materials[0].estimate.status, "provider-quote-required");
  assert.equal(
    discovery
      .search("projects", "glass beads", { budget: 100 })
      .some((r) => r.item.slug === "glass-bead-intro"),
    false,
  );
});
