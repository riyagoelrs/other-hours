// Optional real-engine integration check. Runtime assets are the vendored v7/model files.
// Install test tooling: npm install --prefix work/ocr-deps tesseract.js@7.0.0
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  createWorker,
  PSM,
} = require("../work/ocr-deps/node_modules/tesseract.js");
const data = require("../data.js");
const discovery = require("../discovery.js").create(data);
const ingestion = require("../ingestion.js");
const uploads = require("../uploads.js");
const worker = await createWorker("eng", 1, {
  langPath: path.resolve("assets/ocr"),
  cacheMethod: "none",
  errorHandler: () => {},
});
try {
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    user_defined_dpi: "150",
  });
  const fixture = "scripts/fixtures/ocr-sashiko.png";
  const { data: output } = await worker.recognize(fixture);
  assert.ok(
    output.confidence > 70,
    "Synthetic screenshot should have clear text",
  );
  assert.match(output.text, /sashiko repair/i);
  const original = fs.readFileSync(fixture);
  const { accepted } = await uploads.readFiles([
    new File([original], "screenshot.png", { type: "image/png" }),
  ]);
  accepted[0].ocrText = output.text;
  const result = ingestion.fromUploads(
    { attachments: accepted },
    { data, discovery },
  );
  assert.ok(result.matches.some((m) => m.slug === "sashiko-mending"));
  assert.ok(
    result.requirements.some(
      (r) => /thread/i.test(r.name) && r.sourceKind === "ocr",
    ),
  );
  assert.equal(result.evidence[0].origin, "on-device-ocr");
  assert.deepEqual(
    Buffer.from(await accepted[0].file.arrayBuffer()),
    original,
    "OCR must preserve the original reference",
  );
  console.log(
    JSON.stringify(
      {
        status: "passed",
        fixture: "synthetic text screenshot",
        confidence: output.confidence,
        text: output.text.trim(),
        matchedGuides: result.matches.map((m) => m.slug),
        originalUnchanged: true,
        scope:
          "Real Node OCR engine and ingestion; not browser, iPhone picker or hosted-worker verification",
      },
      null,
      2,
    ),
  );
} finally {
  await worker.terminate();
}
