# On-device screenshot text recognition

Vendored unmodified browser builds of [Tesseract.js 7.0.0](https://github.com/naptha/tesseract.js), [tesseract.js-core 7.0.0](https://github.com/naptha/tesseract.js-core), and the English integer LSTM model from [@tesseract.js-data/eng 1.0.0](https://github.com/naptha/tessdata). Apache 2.0 licenses are included; the bundled browser licenses identify transitive dependencies. The trained data originates in [tessdata_best](https://github.com/tesseract-ocr/tessdata_best) (Apache 2.0).

All six core variants are included for feature detection. Each `.wasm.js` embeds its WASM binary. Only one variant and the English model load after the visitor chooses **Read screenshot text**. All URLs are same-origin, including the worker and language model. Selected images are processed in the browser, never posted to a server. This reads English text; it does not understand the pictured objects or watch video. Original references remain unchanged.
