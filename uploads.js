/* User-selected reference files. No uploads to a server, image analysis or transcription. */
"use strict";
const OH_UPLOADS = (() => {
  const MAX_FILES = 6;
  const MAX_TOTAL = 100 * 1024 * 1024;
  const MAX_TEXT = 16000;
  const types = {
    jpg: ["image", "image/jpeg"],
    jpeg: ["image", "image/jpeg"],
    png: ["image", "image/png"],
    webp: ["image", "image/webp"],
    gif: ["image", "image/gif"],
    avif: ["image", "image/avif"],
    heic: ["image", "image/heic"],
    heif: ["image", "image/heif"],
    pdf: ["document", "application/pdf"],
    txt: ["text", "text/plain"],
    md: ["text", "text/markdown"],
    mp4: ["video", "video/mp4"],
    mov: ["video", "video/quicktime"],
    webm: ["video", "video/webm"],
  };
  const limits = {
    image: 20 * 1024 * 1024,
    document: 20 * 1024 * 1024,
    text: 1024 * 1024,
    video: 50 * 1024 * 1024,
  };
  const extension = (name) =>
    String(name || "")
      .split(".")
      .pop()
      .toLowerCase();
  const sizeLabel = (bytes) =>
    bytes < 1024 * 1024
      ? Math.max(1, Math.round(bytes / 1024)) + " KB"
      : (bytes / (1024 * 1024)).toFixed(1) + " MB";
  function format(file) {
    const ext = extension(file.name);
    const mime = String(file.type || "").toLowerCase();
    // A photo-library export can become JPEG while keeping the original HEIC name.
    if (["heic", "heif", "avif"].includes(ext) && mime === "image/jpeg")
      return "jpeg";
    if (!String(file.name).includes("."))
      return Object.keys(types).find((key) => types[key][1] === mime) || ext;
    return ext;
  }
  function classify(file) {
    const type = types[format(file)];
    if (!type || !Number.isFinite(file.size) || file.size <= 0)
      throw new Error(
        "Choose a photo, PDF, text file, MP4, MOV or WebM video. Empty files and SVG images aren’t supported.",
      );
    if (file.size > limits[type[0]])
      throw new Error(
        `${file.name} is too large. ${type[0] === "video" ? "Videos can be up to 50 MB" : type[0] === "text" ? "Text files can be up to 1 MB" : "Photos and PDFs can be up to 20 MB"}.`,
      );
    // Mobile photo libraries sometimes provide an empty MIME type; the extension and header still apply.
    const mime = String(file.type || "").toLowerCase();
    const allowedMime =
      !mime ||
      mime === "application/octet-stream" ||
      mime === type[1] ||
      (type[0] === "text" && ["text/plain", "text/markdown"].includes(mime)) ||
      (["heic", "heif"].includes(extension(file.name)) &&
        [
          "image/heic",
          "image/heif",
          "image/heic-sequence",
          "image/heif-sequence",
        ].includes(mime));
    if (!allowedMime)
      throw new Error(
        `${file.name} has a different file type than its name suggests. Export it as JPEG, PNG, PDF or plain text and try again.`,
      );
    return { kind: type[0], type: type[1] };
  }
  function checkHeader(file, bytes) {
    const ext = format(file);
    const ascii = (from, to) => String.fromCharCode(...bytes.slice(from, to));
    const isIso = ascii(4, 8) === "ftyp";
    const checks = {
      jpg: bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
      jpeg: bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
      png: bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10",
      gif: ["GIF87a", "GIF89a"].includes(ascii(0, 6)),
      webp: ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP",
      heic: isIso && /heic|heix|hevc|hevx|mif1|msf1/.test(ascii(8, 64)),
      heif: isIso && /heic|heix|hevc|hevx|mif1|msf1/.test(ascii(8, 64)),
      avif: isIso && /avif|avis/.test(ascii(8, 64)),
      mp4: isIso,
      mov: isIso || ["moov", "mdat", "wide"].includes(ascii(4, 8)),
      webm: bytes.slice(0, 4).join(",") === "26,69,223,163",
      pdf: ascii(0, 5) === "%PDF-",
      txt: !bytes.includes(0),
      md: !bytes.includes(0),
    };
    if (!checks[ext])
      throw new Error(
        `${file.name} could not be read as a supported file. Try exporting a fresh JPEG, PNG, PDF or text copy.`,
      );
  }
  const fingerprint = (file) =>
    [file.name, file.size, file.lastModified || 0].join(":");
  function descriptor(item) {
    return {
      id: item.id,
      name: item.name,
      size: item.size,
      type: item.type,
      kind: item.kind,
      lastModified: item.lastModified || 0,
    };
  }
  function validDescriptor(item) {
    return (
      !!item &&
      typeof item.id === "string" &&
      /^[a-zA-Z0-9-]{1,80}$/.test(item.id) &&
      typeof item.name === "string" &&
      item.name.length <= 255 &&
      Number.isFinite(item.size) &&
      item.size > 0 &&
      ["image", "video", "document", "text"].includes(item.kind)
    );
  }
  async function readFiles(files, existing = []) {
    const accepted = [],
      errors = [];
    let total = existing.reduce((sum, file) => sum + file.size, 0);
    const fingerprints = new Set(
      existing.map((item) => fingerprint(item.file || item)),
    );
    for (const file of files) {
      try {
        if (fingerprints.has(fingerprint(file)))
          throw new Error(`${file.name} is already attached.`);
        if (existing.length + accepted.length >= MAX_FILES)
          throw new Error(
            `Keep up to ${MAX_FILES} files in one plan. Remove a file before adding another.`,
          );
        const type = classify(file);
        if (total + file.size > MAX_TOTAL)
          throw new Error(
            "These files exceed 100 MB together. Try fewer files or a shorter video.",
          );
        checkHeader(
          file,
          new Uint8Array(await file.slice(0, 64).arrayBuffer()),
        );
        const text =
          type.kind === "text"
            ? (await file.text()).replace(/^\uFEFF/, "")
            : "";
        accepted.push({
          id: crypto.randomUUID(),
          name: file.name.slice(0, 255),
          size: file.size,
          lastModified: file.lastModified || 0,
          ...type,
          file,
          text: text.slice(0, MAX_TEXT),
          textTruncated: text.length > MAX_TEXT,
        });
        total += file.size;
        fingerprints.add(fingerprint(file));
      } catch (error) {
        errors.push(error.message);
      }
    }
    return { accepted, errors };
  }
  // Blobs live in IndexedDB, never in localStorage or a server request.
  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) {
        reject(
          new Error(
            "This browser cannot keep reference files. Try a regular browsing window, or remove the files to save a text-only plan.",
          ),
        );
        return;
      }
      const request = indexedDB.open("oh-reference-files", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("files", { keyPath: "id" });
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
      request.onerror = () =>
        reject(
          new Error(
            "Your browser could not open file storage. Try a regular browsing window.",
          ),
        );
      request.onblocked = () =>
        reject(new Error("Close other Other Hours tabs and try saving again."));
    });
  }
  async function transaction(mode, operation) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", mode);
      let result;
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onerror = tx.onabort = () => {
        db.close();
        reject(
          new Error(
            "Your files couldn’t be saved. Free up browser storage, try a regular browsing window, or remove the files to save a text-only plan.",
          ),
        );
      };
      try {
        operation(tx.objectStore("files"), (value) => (result = value));
      } catch (error) {
        tx.abort();
      }
    });
  }
  async function saveFiles(items) {
    if (!items.length) return;
    return transaction("readwrite", (store) => {
      for (const item of items) {
        if (!validDescriptor(item) || !(item.file instanceof Blob))
          throw new Error("Missing reference file");
        store.put({ ...descriptor(item), blob: item.file });
      }
    });
  }
  async function getFiles(ids) {
    if (!ids.length) return [];
    return transaction("readonly", (store, set) => {
      const rows = new Array(ids.length);
      set(rows);
      ids.forEach((id, i) => {
        const request = store.get(id);
        request.onsuccess = () => (rows[i] = request.result || null);
      });
    });
  }
  async function deleteFiles(ids) {
    if (!ids.length) return;
    return transaction("readwrite", (store) =>
      ids.forEach((id) => store.delete(id)),
    );
  }
  return {
    MAX_FILES,
    MAX_TOTAL,
    MAX_TEXT,
    classify,
    checkHeader,
    readFiles,
    descriptor,
    validDescriptor,
    sizeLabel,
    saveFiles,
    getFiles,
    deleteFiles,
  };
})();
if (typeof module !== "undefined" && module.exports)
  module.exports = OH_UPLOADS;
