# Codex working notes — Other Hours

## Product and stack

Other Hours is an NYC-first, mobile-first hobby discovery website: find an activity, find people and supplies, and get started. Keep the framework-free static GitHub Pages deployment working.

- `index.html`, `styles.css`: compact activity finder, visible filters, readable responsive results.
- `data.js`: sourced catalog with stable guides, materials, places, classes, communities and profiles.
- `discovery.js`: pure intent, ranking, time/budget/category filters, geography and distances.
- `nearby.js`: explicit geolocation request, errors and cancellation of late callbacks.
- `ingestion.js`: allowed platform URLs, permitted metadata, grounded text extraction and fallback.
- `uploads.js`, `upload-ui.js`: file checks, picker/drop/paste, OCR review and IndexedDB references.
- `ocr.js`, `assets/ocr/`: lazy self-hosted Tesseract English OCR, licenses and source record.
- `app.js`, `finder.js`: results, native dialogs, saved interests/plans/checklists, copy and surprise picker.
- `config.js`, `service/`: optional public ingestion endpoint and standalone Node service. Never secrets; Pages works without either.

## Design and accessibility

Use the current curiosity club direction in `docs/club-design.md`: an editorial masthead, strong Bricolage/Instrument hierarchy, real hobby photography, a visual activity board and restrained blue/pink/green fields. The prior bare finder and animated room are historical. Keep task controls useful: sidebar refinements on desktop, an obvious native filter disclosure with count on phones, real group/supply entry points and honest inspiration fallbacks. Avoid decorative tape, fake handwritten notes, oversized object scenes and ornamental loaders. Preserve keyboard operation, readable type, reduced motion, native dialog behavior and mobile photo-library picking without forcing camera capture. Activity photos are illustrative; do not imply they are specific guide outcomes or actual NYC listings. Source credits live in `assets/photos/README.md`.

## Integrity and location

Never invent stock, prices, event dates, seats, membership, creator accounts or transcripts. Link real public sources and check dates, and preserve eligibility and tool training restrictions. Estimate active time conservatively from stated numeric ranges; do not guess workshop/weekend lengths. Distances use sourced venue points. A host venue is not a guarantee about the next meeting. Do not assign a point to citywide, rotating or multi-branch groups. Label unlocated listings explicitly and keep them out of radius claims.

Device geolocation is opt-in. Never persist coordinates, put them in a URL or send them to metadata services/maps. Keep NYC coverage explicit; retain manual borough/neighborhood selection. Home activities remain available and can rank by related nearby places.

Catalog IDs and slugs are foreign keys. Retain the original 33 guide slugs, `oh:saved` and material `legacyIndex` positions in `oh:checked:<slug>`. Do not clear localStorage. Keep geography scoped by `cityId`.

## Reference files and inspiration

Selected files stay on device. Preserve count/type/header/size checks, safe filename rendering and reference-aware deletion. Keep original Blobs in IndexedDB and descriptors in plans; never put file bytes in localStorage or silently transmit them. OCR may read English screenshot text locally after an explicit action; it does not understand objects, PDFs or videos. Preserve recognized text provenance and its possibility of errors. Review edits must invalidate a stale source before saving. Keep HEIC originals even if preview/recognition fails.

A public title can suggest a guide, but cannot prove a supply list. Keep source-backed requirements, OCR text and editorial suggestions distinct. Unsupported/private platform content needs a caption, screenshot or description. Do not scrape restricted pages or imply active video/vision analysis.

## Checks and delivery

```sh
npm run check
npm test
npm run build:pages
npm run build:preview
```

Optional engine and DOM-controller checks: `node scripts/check-ocr.mjs` and `node scripts/check-dom.mjs`; development dependencies/reproduction are in README. These are not browser-rendering checks. Follow the active Sites skill for managed browser QA; if its supported tool is unavailable, skip browser QA and explicitly report that limit. Historical Python Playwright reports are not evidence for the current layout.

Use a dedicated branch/PR. Do not force-push, merge or overwrite production without user authorization. Pages publishes `main`; the private review copy has its own retained Sites identity and audience. Build, package and publish the private review through its supported workflow. Never persist or print hosting credentials.
