# Codex working notes — Other Hours

## Product and stack

Other Hours is an NYC-first, mobile-first hobby-to-real-life discovery website. People search an interest or paste inspiration to connect a starter guide to materials, places, public classes, communities and creative people. Preserve the tactile editorial identity and the working static GitHub Pages deployment.

- `index.html`, `styles.css`: page structure, design tokens and responsive editorial layouts.
- `data.js`: versioned catalog with cities, hobbies, projects, materials, places, classes, communities and creators.
- `discovery.js`: shared pure intent parsing, ranking, geographic filters and distance calculation.
- `ingestion.js`: allowlisted platform URLs, official metadata, source-backed extraction and fallback.
- `app.js`: rendering, native project dialog, saved interests / plans, checklists and copy actions.
- `config.js`: public optional service endpoint, never secrets.
- `service/`: standalone, optional Node ingestion service. Pages must work without it.

## Design and accessibility

Keep serif editorial hierarchy, warm paper, deliberate illustration treatments, thin rules and restrained shadows. Avoid stock AI imagery, generic gradients, fake metrics or excessive decoration. Preserve labels, keyboard operation, native dialog behavior, reduced-motion support and mobile layouts. Prefer well-researched useful content to bulk listings.

## Data integrity

Never invent stock, quotes, event dates, enrollment, follower counts, official creator accounts, independence of ownership or platform transcripts. Cite real public URLs and record check dates and access restrictions. Price ranges and substitutes are editorial suggestions. An HTTP success alone does not prove inventory or a current class offering. Show organizational eligibility and tool training / membership restrictions.

IDs and project slugs are foreign keys. Retain the original 33 guide slugs and `materials[].legacyIndex` positions so `oh:saved` and `oh:checked:<slug>` remain readable and rollback stays safe. Add explicit migrations if a future change genuinely requires them; do not clear local storage. Keep geography scoped by `cityId`. Sourced coordinate points are approximate address locations, not entrances or GPS observations.

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
