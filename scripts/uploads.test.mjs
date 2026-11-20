import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const uploads = require("../uploads.js");
const ingestion = require("../ingestion.js");
const data = require("../data.js");
const discovery = require("../discovery.js").create(data);
const textFile = (name, body) =>
  new File([body], name, { type: "text/plain", lastModified: 1 });
const photo = () =>
  new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 1, 2, 3])],
    "camera-roll.png",
    { type: "image/png", lastModified: 1 },
  );

test("native image and text files are accepted with descriptors, not server uploads", async () => {
  const { accepted, errors } = await uploads.readFiles([
    photo(),
    textFile("my-journal.txt", "Use paper and thread."),
  ]);
  assert.equal(errors.length, 0);
  assert.equal(accepted.length, 2);
  assert.equal(accepted[0].kind, "image");
  assert.equal(accepted[1].text, "Use paper and thread.");
  assert.equal(uploads.descriptor(accepted[0]).file, undefined);
  assert.ok(uploads.validDescriptor(uploads.descriptor(accepted[0])));
});
test("HEIC camera originals remain accepted even when a browser cannot preview them", async () => {
  const bytes = new Uint8Array(32);
  bytes.set([0, 0, 0, 32, ...Buffer.from("ftypheic")]);
  const { accepted, errors } = await uploads.readFiles([
    new File([bytes], "IMG_001.HEIC", { type: "image/heic" }),
  ]);
  assert.equal(errors.length, 0);
  assert.equal(accepted[0].kind, "image");
  assert.equal(accepted[0].type, "image/heic");
});
test("unsupported, empty and disguised active files are rejected", async () => {
  const files = [
    new File(["<svg/>"], "picture.svg", { type: "image/svg+xml" }),
    new File(["<html>evil</html>"], "picture.png", { type: "image/png" }),
    new File([], "empty.txt", { type: "text/plain" }),
    new File(["hello"], "wrong.png", { type: "text/html" }),
  ];
  const { accepted, errors } = await uploads.readFiles(files);
  assert.equal(accepted.length, 0);
  assert.equal(errors.length, 4);
});
test("file size, combined size and count limits are enforced before reading content", async () => {
  assert.throws(
    () =>
      uploads.classify({
        name: "large.png",
        type: "image/png",
        size: 21 * 1024 * 1024,
      }),
    /20 MB/,
  );
  assert.throws(
    () =>
      uploads.classify({
        name: "large.mov",
        type: "video/quicktime",
        size: 51 * 1024 * 1024,
      }),
    /50 MB/,
  );
  const existing = [
    {
      ...uploads.descriptor({
        id: "file-one",
        name: "old.mp4",
        type: "video/mp4",
        kind: "video",
        size: 100 * 1024 * 1024,
      }),
    },
  ];
  const full = await uploads.readFiles([photo()], existing);
  assert.equal(full.accepted.length, 0);
  assert.match(full.errors[0], /100 MB/);
  const count = await uploads.readFiles(
    Array.from({ length: 7 }, (_, i) => textFile(`note-${i}.txt`, "hello")),
  );
  assert.equal(count.accepted.length, 6);
  assert.match(count.errors[0], /6 files/);
});
test("adding the same file twice preserves one copy and reports the duplicate", async () => {
  const file = photo();
  const first = await uploads.readFiles([file]);
  const second = await uploads.readFiles([file], first.accepted);
  assert.equal(second.accepted.length, 0);
  assert.match(second.errors[0], /already attached/);
});
test("long text is bounded for evidence while the original blob is retained", async () => {
  const text = "Make a leather journal. " + "paper ".repeat(5000);
  const result = await uploads.readFiles([textFile("long.txt", text)]);
  assert.equal(result.accepted[0].text.length, 16000);
  assert.equal(result.accepted[0].textTruncated, true);
  assert.equal(await result.accepted[0].file.text(), text);
});
test("photos and filenames alone do not invent visual analysis or a supply list", async () => {
  const { accepted } = await uploads.readFiles([photo()]);
  accepted[0].name = "leather-journal-photo.png";
  const result = ingestion.fromUploads(
    { attachments: accepted },
    { data, discovery },
  );
  assert.equal(result.provider, "uploads");
  assert.equal(result.sourceUrl, "");
  assert.equal(result.matches.length, 0);
  assert.equal(result.requirements.length, 0);
  assert.equal(result.evidence.length, 0);
  assert.match(result.warnings[0], /visual contents have not been analyzed/);
});
test("readable file text supplies legitimate project matches and literal requirements", async () => {
  const { accepted } = await uploads.readFiles([
    textFile(
      "my-notes.txt",
      "Make a leather journal using 20 sheets of paper and thread. Fold the paper. Sew the pages.",
    ),
  ]);
  const result = ingestion.fromUploads(
    { attachments: accepted },
    { data, discovery },
  );
  assert.equal(result.matches[0].slug, "leather-journal");
  assert.ok(
    result.requirements.some(
      (m) => m.name === "paper" && m.quantity === "20 sheets of",
    ),
  );
  assert.ok(!result.requirements.some((m) => m.name === "awl"));
  assert.equal(result.evidence[0].kind, "document");
  assert.equal(result.evidence[0].origin, "user-upload");
  assert.equal(result.evidence[0].fileName, "my-notes.txt");
  assert.equal(result.attachments[0].text, undefined);
});
test("a dropped link and reference files preserve their separate provenance", async () => {
  const { accepted } = await uploads.readFiles([
    photo(),
    textFile("supplies.txt", "Use paper and thread."),
  ]);
  const base = ingestion.buildResult(
    { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", provider: "youtube" },
    [
      {
        kind: "title",
        text: "Make a leather journal",
        origin: "public-oembed",
      },
    ],
    ["No transcript retrieved"],
    data,
    discovery,
  );
  const result = ingestion.fromUploads(
    { attachments: accepted },
    { data, discovery },
    base,
  );
  assert.equal(result.sourceType, "link-and-files");
  assert.equal(result.sourceUrl, base.sourceUrl);
  assert.equal(result.evidence[0].origin, "public-oembed");
  assert.equal(result.evidence[1].origin, "user-upload");
  assert.equal(result.transcriptStatus, "not-retrieved");
  assert.equal(result.attachments.length, 2);
});
test("missing IndexedDB rejects a file save without pretending references persisted", async () => {
  const { accepted } = await uploads.readFiles([photo()]);
  await assert.rejects(
    uploads.saveFiles(accepted),
    /cannot keep reference files/,
  );
});

test("iPhone JPEG conversions and pasted images without an extension retain valid photo support", async () => {
  const jpeg = new Uint8Array([255, 216, 255, 224, 0, 10, 1, 2, 3]);
  const converted = new File([jpeg], "IMG_123.HEIC", { type: "image/jpeg" });
  const clipboard = new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 1])],
    "image",
    { type: "image/png" },
  );
  const result = await uploads.readFiles([converted, clipboard]);
  assert.equal(result.errors.length, 0);
  assert.equal(result.accepted.length, 2);
  assert.equal(result.accepted[0].type, "image/jpeg");
  assert.equal(result.accepted[1].type, "image/png");
});
