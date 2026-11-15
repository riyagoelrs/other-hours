import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const data = require("../data.js");
const {
  projects,
  places,
  communities,
  creators,
  classes,
  hobbies,
  cities,
  materials,
} = data;
const originalSlugs = JSON.parse(
  fs.readFileSync("scripts/legacy-projects.json", "utf8"),
);
assert.equal(data.schemaVersion, 2);
assert.equal(
  new Set(projects.map((p) => p.slug)).size,
  projects.length,
  "Duplicate project slug",
);
assert.ok(
  originalSlugs.every((slug) => projects.some((p) => p.slug === slug)),
  "Legacy saved project links must survive",
);
for (const project of projects) {
  for (const field of [
    "slug",
    "title",
    "category",
    "intro",
    "time",
    "tip",
    "source",
    "budgets",
  ])
    assert.ok(project[field], project.slug + " missing " + field);
  assert.ok(
    project.hobbyIds.every((id) => hobbies[id]),
    project.slug + " invalid hobby reference",
  );
  assert.ok(
    project.materials.length >= 3 && project.steps.length >= 3,
    project.slug + " incomplete starter guide",
  );
  assert.ok(
    project.placeIds.length && project.placeIds.every((id) => places[id]),
    project.slug + " invalid place reference",
  );
  for (const [refs, items] of [
    ["communityIds", communities],
    ["creatorIds", creators],
    ["classIds", classes],
  ])
    assert.ok(
      project[refs].every((id) => items[id]),
      project.slug + " invalid " + refs,
    );
  assert.ok(project.budgetMax >= project.budgetMin && project.budgetMin >= 0);
  assert.equal(
    new Set(project.materials.map((m) => m.legacyIndex)).size,
    project.materials.length,
    "Checklist indexes must be stable and unique",
  );
  for (const material of project.materials) {
    for (const field of [
      "name",
      "quantity",
      "note",
      "substitute",
      "group",
      "estimate",
    ])
      assert.ok(
        material[field],
        project.slug + " incomplete material " + field,
      );
    assert.ok(
      materials[material.materialId],
      project.slug + " invalid material reference",
    );
    assert.ok(material.placeIds.every((id) => places[id]));
    assert.ok(
      ["editorial-estimate", "provider-quote-required"].includes(
        material.estimate.status,
      ),
    );
    assert.ok(material.estimate.max >= material.estimate.min);
  }
}
for (const items of [places, communities, creators, classes])
  for (const [id, item] of Object.entries(items)) {
    assert.equal(item.id, id);
    assert.ok(
      item.url.startsWith("https://") && item.source.url.startsWith("https://"),
      id + " missing source",
    );
    assert.match(item.source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(cities[item.location.cityId], id + " invalid city");
    assert.ok(
      item.location.boroughs.every(
        (id) => cities[item.location.cityId].boroughs[id],
      ),
      id + " invalid borough",
    );
    assert.ok(
      item.hobbyIds.length && item.hobbyIds.every((id) => hobbies[id]),
      id + " invalid hobby",
    );
  }
for (const c of Object.values(classes))
  assert.ok(places[c.placeId] && c.creatorIds.every((id) => creators[id]));
const index = fs.readFileSync("index.html", "utf8");
for (const id of [
  "project-grid",
  "places-grid",
  "community-grid",
  "creator-grid",
  "link-result",
  "link-status",
  "search-form",
  "detail-dialog",
  "borough-select",
  "neighborhood-select",
])
  assert.ok(index.includes('id="' + id + '"'), "Missing UI anchor " + id);
for (const file of [
  "data.js",
  "discovery.js",
  "ingestion.js",
  "app.js",
  "config.js",
  "styles.css",
  "site.webmanifest",
])
  assert.ok(index.includes(file));
for (const path of [...index.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map(
  (m) => m[1],
))
  assert.ok(fs.existsSync(path), "Missing asset " + path);
for (const name of [
  "journal",
  "sewing",
  "camera",
  "clay",
  "botanical",
  "dance",
  "chess",
  "print",
  "yarn",
  "bird",
  "writing",
  "beads",
])
  assert.ok(fs.existsSync("assets/illustrations/" + name + ".svg"));
const manifest = JSON.parse(fs.readFileSync("site.webmanifest", "utf8"));
assert.ok(
  !manifest.start_url?.startsWith("/"),
  "Manifest must work below a GitHub Pages repository path",
);
console.log(
  `OK: ${projects.length} guides, ${Object.keys(places).length} places, ${Object.keys(communities).length} communities, ${Object.keys(classes).length} class programs, ${Object.keys(creators).length} creator profiles. Legacy slugs, references and static assets valid.`,
);
