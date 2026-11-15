// A reviewable Pages package, excluding service code, tests and secrets.
import fs from "node:fs";
const out = "work/pages";
fs.mkdirSync(out, { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "data.js",
  "discovery.js",
  "ingestion.js",
  "app.js",
  "config.js",
  "site.webmanifest",
  ".nojekyll",
])
  fs.copyFileSync(file, out + "/" + file);
fs.cpSync("assets", out + "/assets", { recursive: true });
console.log(
  "GitHub Pages static package created at " +
    out +
    ". No service, key, account or build-time dependency required.",
);
