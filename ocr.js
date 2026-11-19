/* Lazy, same-origin English OCR. Original files never leave the device. */
"use strict";
const OH_OCR = (() => {
  let library;
  function load() {
    if (globalThis.Tesseract) return Promise.resolve(globalThis.Tesseract);
    if (location.protocol === "file:")
      return Promise.reject(
        new Error(
          "Screenshot text reading needs the hosted preview. You can still attach the original and describe it here.",
        ),
      );
    if (!library)
      library = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = new URL(
          "./assets/ocr/tesseract.min.js",
          document.baseURI,
        ).href;
        const timer = setTimeout(() => {
          script.remove();
          library = null;
          reject(
            new Error(
              "Text reading could not load. Try again or add a description.",
            ),
          );
        }, 20000);
        script.onload = () => {
          clearTimeout(timer);
          resolve(globalThis.Tesseract);
        };
        script.onerror = () => {
          clearTimeout(timer);
          script.remove();
          library = null;
          reject(
            new Error(
              "Text reading could not load. Try again or add a description.",
            ),
          );
        };
        document.head.append(script);
      });
    return library;
  }
  async function resized(file) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(
        1,
        2400 / Math.max(image.naturalWidth, image.naturalHeight),
        Math.sqrt(4000000 / (image.naturalWidth * image.naturalHeight)),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } catch {
      throw new Error(
        "This image could not be read. Try a PNG or JPEG screenshot, or add a description. The original is still attached.",
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const cleanText = (text) =>
    String(text || "")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
      .trim()
      .slice(0, 16000);
  async function read(file, { signal, onProgress = () => {} } = {}) {
    let worker,
      stopped = false,
      timer;
    const stoppedError = () =>
      new Error(
        signal?.aborted
          ? "Text reading cancelled. Your original is still attached."
          : "Text reading took too long. Try a tighter screenshot or add a description.",
      );
    let abort;
    const interrupted = new Promise((_, reject) => {
      abort = () => {
        stopped = true;
        worker?.terminate().catch(() => {});
        reject(stoppedError());
      };
      if (signal?.aborted) abort();
      else signal?.addEventListener("abort", abort, { once: true });
      timer = setTimeout(abort, 60000);
    });
    const operation = async () => {
      const Tesseract = await load();
      if (stopped) throw stoppedError();
      onProgress("Preparing text reading. First use may take a moment…");
      const base = new URL("./assets/ocr/", document.baseURI);
      worker = await Tesseract.createWorker("eng", 1, {
        workerPath: new URL("worker.min.js", base).href,
        corePath: base.href,
        langPath: base.href,
        workerBlobURL: false,
        logger: ({ status, progress }) => {
          if (!stopped && status === "recognizing text")
            onProgress("Reading text… " + Math.round(progress * 100) + "%");
        },
        errorHandler: () => {},
      });
      // Cancellation can arrive during worker initialization. Dispose of late workers too.
      if (stopped) {
        await worker.terminate();
        throw stoppedError();
      }
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        user_defined_dpi: "150",
      });
      const image = await resized(file);
      if (stopped) throw stoppedError();
      const { data } = await worker.recognize(image);
      const text = cleanText(data.text);
      if (data.confidence < 35 || (text.match(/[a-z]/gi) || []).length < 5)
        throw new Error(
          "No clear English text found. Add a short description of the image, or try a clearer screenshot.",
        );
      return { text, confidence: data.confidence };
    };
    try {
      return await Promise.race([operation(), interrupted]);
    } finally {
      stopped = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (worker) await worker.terminate().catch(() => {});
    }
  }
  return { read, cleanText };
})();
if (typeof module !== "undefined" && module.exports) module.exports = OH_OCR;
