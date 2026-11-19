# Codex working notes — Other Hours

## Product and stack

Other Hours is an NYC-first, mobile-first hobby-to-real-life discovery website. People search an interest or paste inspiration to connect a starter guide to materials, places, public classes, communities and creative people. Preserve the tactile editorial identity and the working static GitHub Pages deployment.

- `index.html`, `styles.css`: page structure, design tokens and responsive editorial layouts.
- `data.js`: versioned catalog with cities, hobbies, projects, materials, places, classes, communities and creators.
- `discovery.js`: shared pure intent parsing, ranking, geographic filters and distance calculation.
- `ingestion.js`: allowlisted platform URLs, official metadata, source-backed extraction and fallback.
- `uploads.js`, `upload-ui.js`: local reference-file intake, native photo library picking, drop/paste and IndexedDB-backed plan attachments.
- `app.js`: rendering, native project dialog, saved interests / plans, checklists and copy actions.
- `config.js`: public optional service endpoint, never secrets.
- `service/`: standalone, optional Node ingestion service. Pages must work without it.

## Design and accessibility

Keep the simpler original direction: a compact header, Instrument Serif headlines, warm paper, dark ink and a restrained rust accent. Search and uploads come first; hobbies form a text-led index. Use a small amount of activity photography with real provenance in `assets/photos/README.md`. Do not add decorative tape, handwriting, collage layers, repeated card frames or themed slogans. Mood photography must not imply a pictured venue or person is a catalog listing. Avoid stock AI imagery, generic gradients and fake metrics. Preserve labels, keyboard operation, native dialog behavior, reduced-motion support and mobile layouts. Prefer useful content to bulk listings.

## Data integrity

Never invent stock, quotes, event dates, enrollment, follower counts, official creator accounts, independence of ownership or platform transcripts. Cite real public URLs and record check dates and access restrictions. Price ranges and substitutes are editorial suggestions. An HTTP success alone does not prove inventory or a current class offering. Show organizational eligibility and tool training / membership restrictions.

IDs and project slugs are foreign keys. Retain the original 33 guide slugs and `materials[].legacyIndex` positions so `oh:saved` and `oh:checked:<slug>` remain readable and rollback stays safe. Add explicit migrations if a future change genuinely requires them; do not clear local storage. Keep geography scoped by `cityId`. Sourced coordinate points are approximate address locations, not entrances or GPS observations.

## Reference files

Selected files stay in the browser. Preserve file-count/type/header/size checks, safe filename rendering and reference-aware deletion. Store Blobs in IndexedDB and descriptors in existing plan records; never put file bytes in localStorage or silently transmit them. Photos/PDFs/videos are references until a legitimate analysis integration exists. Text-file excerpts must retain their filename and provenance. A native photo picker must allow the library, without forcing camera capture.

## Inspiration policy

A public title can suggest an editorial guide, but cannot establish an exact material list. Use only permitted metadata or text a user / authorized service supplies. Keep extracted requirements, inferred suggestions and editorial guide materials separate. Preserve provenance in saved plans. Do not scrape restricted pages, bypass platform access or expose API keys in static files. Backend descriptions and transcripts must fail gracefully to the static workflow.

## Verification and delivery

```sh
npm run check
npm test
npm run build:pages
```

For browser regression checks, use Python Playwright and Chromium with `BASE_URL=http://localhost:4173/ python scripts/browser-check.py`. Verify a repository subpath as well as mobile widths. Screenshots and evidence live in `docs/`; transient builds and test captures live in ignored `work/`.

Use a dedicated feature branch and open a PR. Do not force-push or overwrite production. Pages publishes `main` at https://riyagoelrs.github.io/other-hours/; branches do not automatically receive live previews. A separately hosted private review copy must be labeled accurately and deployed through its own workflow. Revert a merged PR to roll back.
