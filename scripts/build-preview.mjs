// Bundle the working static site for an offline review. No remote asset requests required.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const out = "work/download/other-hours-preview.html";
const encode = (file, type) =>
  "data:" + type + ";base64," + fs.readFileSync(file).toString("base64");
const illustrations = Object.fromEntries(
  fs
    .readdirSync("assets/illustrations")
    .filter((f) => f.endsWith(".svg"))
    .map((file) => [
      path.basename(file, ".svg"),
      encode("assets/illustrations/" + file, "image/svg+xml"),
    ]),
);
let css = fs
  .readFileSync("styles.css", "utf8")
  .replace(
    /url\(['"]?\.\/([^)'"\s]+)['"]?\)/g,
    (_, file) =>
      'url("' +
      encode(file, file.endsWith(".ttf") ? "font/ttf" : "image/svg+xml") +
      '")',
  );
let page = fs
  .readFileSync("index.html", "utf8")
  .replace(/\s*<script defer[^>]+><\/script>/g, "")
  .replace(/\s*<link[^>]+rel="(?:preload|manifest)"[^>]*>/g, "")
  .replace(
    '<link rel="stylesheet" href="./styles.css" />',
    () => "<style>" + css + "</style>",
  );
for (const [id, url] of Object.entries(illustrations))
  page = page.replaceAll("./assets/illustrations/" + id + ".svg", url);
page = page.replaceAll(
  "./assets/favicon.svg",
  encode("assets/favicon.svg", "image/svg+xml"),
);
const app = fs
  .readFileSync("app.js", "utf8")
  .replaceAll(
    'src="./assets/illustrations/${artFor(p)}.svg"',
    'src="${OH_PREVIEW_ASSETS[artFor(p)]}"',
  )
  .replaceAll(
    'src="./assets/illustrations/${c.art}.svg"',
    'src="${OH_PREVIEW_ASSETS[c.art]}"',
  );
const scripts =
  [
    "config.js",
    "data.js",
    "discovery.js",
    "ingestion.js",
    "uploads.js",
    "upload-ui.js",
  ]
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n;\n") +
  "\n;\nconst OH_PREVIEW_ASSETS=" +
  JSON.stringify(illustrations) +
  ";\n" +
  app;
page = page.replace(
  "</body>",
  () =>
    "<script>" +
    scripts.replaceAll("</script", "<\\/script") +
    "</script>\n</body>",
);
// Validate the emitted script, including HTML insertion: replacement strings must
// not reinterpret JavaScript's $$, $& or template-literal currency markers.
new vm.Script(page.match(/<script>([\s\S]*?)<\/script>/)[1], {
  filename: "other-hours-preview-inline.js",
});
const licenses = fs
  .readdirSync("assets/fonts")
  .filter((f) => f.endsWith("-OFL.txt"))
  .map(
    (file) =>
      "\n" + file + "\n" + fs.readFileSync("assets/fonts/" + file, "utf8"),
  )
  .join("\n");
page +=
  "\n<!-- Bundled typeface licenses\n" +
  licenses.replaceAll("--", "—") +
  "\n-->\n";
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
console.log(
  "Self-contained review saved at " +
    out +
    " (" +
    Math.round(Buffer.byteLength(page) / 1024) +
    " KB).",
);
