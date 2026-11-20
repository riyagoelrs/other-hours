# Other Hours

Find an activity, people to do it with, and somewhere to get started. This NYC edition has **39 starter guides, 28 places, 20 community resources, 12 class programs and 6 public creative profiles** across all five boroughs. Saved guides and the original 33 checklist IDs are preserved.

The site is static HTML, CSS and JavaScript. GitHub Pages can serve the repository directly. There is no required account, API key, build server or installation to use it; screenshot text recognition uses a vendored, lazily loaded Tesseract runtime.

## What works

- **Activities:** search by interest, then filter by category, time, starting budget, beginner level, free starts and reuse. Time limits use the upper end of stated active time. Drying, curing and ongoing care can take longer; unknown class lengths are not guessed.
- **Communities:** browse groups separately from classes, with actual public joining links. NYC Urban Sketchers, NYC Resistor and FABSCRAP have refreshed participation information. These are external organizations, not Other Hours accounts or live event bookings.
- **Reuse & supplies:** filter reuse shops, specialist shops, shared equipment, community resources and studios. Read addresses, eligibility and equipment access before visiting. Stock is not live.
- **Nearby:** choose a borough/neighborhood, or explicitly tap **Use my location** for straight-line distance sorting and a 1/3/5/10-mile radius. Device coordinates stay in memory and are never saved, included in link-service requests or sent to the venue map. Changing/unlisted locations are labeled and can be excluded. Activities remain available to start at home; nearby resources influence their order. The directory currently covers NYC only.
- **Links:** paste/drop an HTTPS YouTube, TikTok, Instagram or Pinterest content URL. YouTube/TikTok attempt permitted public metadata. Instagram/Pinterest need a caption, description or screenshot text in the shipped static app. Restricted metadata gives an explicit fallback, not an invented analysis. No video is watched or transcribed.
- **Screenshots:** attach an image, choose **Read screenshot text**, review/correct the recognized English text, then **Find activities**. Text recognition runs on the device with same-origin assets and has cancellation/error handling. It does not recognize pictured objects. HEIC originals remain attachable even when a browser cannot decode them; use PNG/JPEG for readable screenshots.
- **Files and saves:** native photo library/files, clipboard images and dropped files become local references. Save an edited plan to retain originals in IndexedDB; only descriptors and notes go in localStorage. PDFs/videos need a description. Text/Markdown excerpts can supply their own evidence. Nothing is uploaded to the assistant chat or a file-analysis server.

Inspiration shows related activities and ways to find groups/supplies first. The editable plan is secondary. Source text, recognized text, literal extracted requirements and editorial suggestions remain distinguishable.

## Run and verify

```sh
python3 -m http.server 4173
# http://localhost:4173
npm run check
npm test
npm run build:pages
npm run build:preview
```

Node 22+ runs checks and the optional service. `build:pages` creates `work/pages/` with static assets, excluding server code, tooling and secrets. `build:preview` embeds the core page/fonts/illustrations into `work/download/other-hours-preview.html`. OCR requires sibling `assets/ocr/` over HTTP(S); direct `file:` viewing offers a description fallback.

Optional deeper checks use development tooling in ignored `work/`:

```sh
npm install --prefix work/ocr-deps --ignore-scripts tesseract.js@7.0.0 linkedom@0.18.12
node scripts/check-ocr.mjs
node scripts/check-dom.mjs
```

The current [verification record](docs/finder.md) covers 40 Node tests, DOM-controller integration and a real OCR engine run on an explicitly synthetic screenshot. **Current browser rendering, native iPhone picking, browser geolocation permission and hosted OCR-worker loading have not been verified.** The managed Sites workflow does not expose its supported browser tool. Earlier browser/Axe reports describe prior layouts.

## Source map

| File                         | Role                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `index.html`, `styles.css`   | Activity-first page, visible filters and responsive layouts                          |
| `data.js`                    | Sourced catalog, stable guide IDs, community formats and known host venues           |
| `discovery.js`               | Intent parsing, duration/budget/category filters, area matching and distance sorting |
| `nearby.js`                  | Explicit device-location request, errors and stale-callback cancellation             |
| `ingestion.js`               | Allowed platform links, permitted metadata, text evidence and guide matching         |
| `uploads.js`, `upload-ui.js` | File validation, native picker/drop/paste, OCR review and reference persistence      |
| `ocr.js`, `assets/ocr/`      | Lazy on-device English text recognition and upstream licenses                        |
| `app.js`, `finder.js`        | Results, guide dialogs, plans, bookmarks and surprise activity selection             |
| `config.js`, `service/`      | Optional ingestion endpoint / Node service; no service is configured                 |

Catalog facts cite public URLs and check dates. Budgets, guides and substitutions are editorial suggestions; a provider-only workshop never claims an unverified supply budget. Sourced coordinates are approximate address points, not entrances or next-event locations. Saved guides use `oh:saved`; material positions use `oh:checked:<slug>`. No destructive storage migration runs.

## Review and publishing

The [private review copy](https://other-hours-nyc-review-1115.brinycashew1.chatgpt.site) uses its own owner-private Sites deployment. The [pull request](https://github.com/riyagoelrs/other-hours/pull/2) remains the merge boundary. [GitHub Pages production](https://riyagoelrs.github.io/other-hours/) publishes `main`, which this feature branch does not overwrite. Roll back a merged change by reverting the PR.

The current [curiosity club design](docs/club-design.md) pairs an editorial masthead and bold/serif typography with real activity photography, a visual hobby board, blue/pink accents and a photographic community feature. Desktop filters sit beside results; phones use a visible native filter disclosure with an active count. Historical design studies are retained as history, not current screenshots. Fonts are self-hosted with OFL licenses; OCR licenses and origins are in [assets/ocr](assets/ocr/README.md).
