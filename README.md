# Other Hours — a field guide to your free time

Other Hours connects an interesting idea to the supplies, places, learning resources and people that make it possible. The NYC edition covers all five boroughs with **39 starter guides, 28 places, 12 class programs, 19 communities and 6 public creator / educator profiles**. The original 33 guides and their saved checklist positions are preserved.

This remains a framework-free **static HTML/CSS/JavaScript site on GitHub Pages**. There are no runtime package dependencies, required accounts, API keys, build server, analytics or Vercel authorization.

## Run and verify

```sh
python3 -m http.server 4173
# http://localhost:4173
npm run check
npm test
npm run build:pages
npm run build:preview # optional self-contained review document
```

Node 22+ is used only for checks and the optional service. `build:pages` creates a static package in ignored `work/pages/`, excluding server code and secrets. The repository root itself remains deployable with Pages. All asset paths are relative, including fonts. Browser checks also run below `/other-hours/` to reproduce the Pages repository path.

For the repeatable desktop / mobile journeys, install Python Playwright in your development environment and provide Chromium, then run `BASE_URL=http://localhost:4173/ python scripts/browser-check.py`. See [verification](docs/verification.md) for commands, results, fixtures and live-network limits.

## Product behavior

- One search accepts an interest, a beginner question, budget / neighborhood constraints, or an HTTPS YouTube, TikTok, Instagram or Pinterest content link.
- **Add photos / Add files** opens the native device picker (including the photo library). Drag files or a link into the same search area, or paste an image from the clipboard. Files can be kept with an editable inspiration plan.
- A synonym-based intent engine ranks specific project terms, then related interests and selected-area resources. It is deterministic, not an AI chatbot.
- A map / list toggle uses 21 sourced address points, with nearby results measured from a chosen place, not the user’s GPS. Map tiles load from OpenStreetMap only when the map is selected. Unmapped places retain their address and external map links.
- Borough and neighborhood choices persist locally. Location is optional and never requires GPS. Interest, beginner, budget, free-start and reuse refinements do not require retyping a query.
- Projects, materials, classes / communities and people are related views of the same search. Inapplicable filters are disabled rather than silently implying a supplier price or a creator’s fee.
- Materials discovery distinguishes reuse, specialist retail, shared equipment, community resources and learning spaces. Eligibility, equipment training and access restrictions are visible in profiles.
- Guides compare reuse, local purchase and workshops; studio-only projects ask for a provider fee rather than showing an unsupported DIY budget. They show quantities, alternatives, estimated material ranges and reusable equipment separately; and connect to public learning, places and people.
- Checklists, bookmarks, interests, recent searches and edited inspiration plans are browser-local. Copy a supply list or guide link to share it. There is no cloud account or full social network.

## Data and architecture

| File                         | Responsibility                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `index.html`, `styles.css`   | Accessible page structure, editorial visual system and responsive layouts                                                 |
| `data.js`                    | Versioned catalog: cities, interests, projects, structured supplies, estimates, places, classes, communities and creators |
| `discovery.js`               | Shared pure intent parsing, ranking, filters and geographic matching                                                      |
| `ingestion.js`               | Platform validation, permitted public metadata, source-backed text extraction, structured results and static fallback     |
| `uploads.js`, `upload-ui.js` | File checks, native picking/drop/paste, previews and reference-aware IndexedDB persistence                                |
| `app.js`                     | Rendering, native dialog, refinement, persistence, editable inspiration plans and copy / share actions                    |
| `config.js`                  | Public endpoint configuration only; never secrets                                                                         |
| `service/`                   | Optional standalone Node ingestion service; deployment-independent                                                        |
| `scripts/`                   | Content integrity, regression tests, browser journeys and static packaging                                                |

Catalog IDs and project slugs are stable foreign keys. `projects[].materials[].legacyIndex` retains the old `oh:checked:<slug>` positions; bookmarks still use `oh:saved`. No destructive migration or storage reset runs. Additional preferences and plans have versioned keys. Storage errors and malformed data have usable fallbacks.

Geographic records carry a `cityId`, boroughs and neighborhoods rather than free-text matching alone. `OH_DISCOVERY.create(catalog, cityId)` scopes the shared engine to a city. Another city can add its own geographic record and linked listings without a new page architecture; the shipped city picker intentionally exposes only researched NYC content.

Facts carry public source URLs and check dates. Editorial guides, substitutes and price estimates have separate provenance. Source accessibility is not proof of current stock, enrollment, ownership or every program’s beginner suitability. [Source checks](docs/source-checks.json) and [NYC geocoding evidence](docs/geocoding-sources.json) preserve the HTTP outcomes; Queens Public Library restricted automated access and is marked accordingly.

## Photos and files

Choose **Add photos** for the device photo library or **Add files** for photos, PDFs, text/Markdown notes and MP4/MOV/WebM videos. Up to six files can be combined with a link or a typed idea. JPEG, PNG, WebP, GIF, AVIF and HEIC/HEIF are supported as photo references; HEIC preview depends on the browser, while the original is retained. Native JPEG exports that keep a HEIC filename are handled as JPEG. No `capture` attribute forces the camera instead of the library.

Photos and PDFs can be up to 20 MB each, videos 50 MB and text 1 MB, with a 100 MB combined limit. Unsupported formats, empty files, mismatched headers, duplicates and oversized selections receive a visible error. Filenames and document text are escaped when rendered.

**Files stay on the device.** Saving a plan stores originals as Blobs in IndexedDB and keeps only their descriptors with the plan in localStorage. Reopening the saved plan shows its references and offers the original downloads. Deleting a plan removes file records only when another saved plan does not reference them. Failed storage does not report a successful save. This is browser-local file intake, not a server upload or cloud library; it also does not send pictures to the assistant chat.

Photo/PDF/video contents are not analyzed visually or transcribed. Add a description to match a guide, or select one yourself. Plain-text files contribute literal source text, quantities and steps, labeled with their filename; the first 16,000 characters per text file are used for matching, and the complete original is kept. No image filename is treated as evidence of a project. Automatic vision, OCR, PDF extraction and cloud syncing would be separate integrations.

[Upload verification and screenshots](docs/uploads.md) covers native picking, dropping, persistence, removal, limits and privacy.

## Inspiration links: exactly what works

The static app tries official public YouTube / TikTok oEmbed metadata. It does not fetch platform pages, download videos, bypass restrictions or claim a title is a transcript. Instagram and Pinterest may require user-supplied text. A title can suggest a curated guide, but cannot generate an “extracted” supply list.

Captions, descriptions or authorized transcript text can support literal material / quantity mentions and steps. Results disclose their source, missing transcripts and uncertainty. Editable starter supplies remain editorial suggestions, even after the user saves a plan. Requirements from source text are displayed separately from inferred additions.

The [optional service](service/README.md) improves browser-restricted metadata access and can use an official YouTube Data API description, an operator-authorized transcript service, or a validated semantic analysis adapter. None is configured or required for Pages. A semantic provider and authorized transcript access still require external integration; they are not presented as an active AI/video-analysis feature.

## Design and review

The current [simpler design](docs/simple-design.md) returns to the original headline and compact identity: warm paper, dark ink, one rust accent, a single project photograph beside the search and a text-led hobby index. Typography and contrast draw on the supplied HUMAN.md reference. The decorative scrapbook styling was removed. Two self-hosted Pexels photographs retain [source and license records](assets/photos/README.md); the pictures are independent of the NYC directory. The three self-hosted typeface families retain their OFL licenses.

The supplied HUMAN.md page and stylesheet were inspected. The X post's official public embed describes a loader experiment; its animation could not be viewed. The earlier Pinterest board returned HTTP 403. The [earlier design review](docs/design-review.md), [scrapbook pass](docs/scrapbook-design.md) and [screenshots](docs/screenshots) are historical. The supported managed browser tool remains unavailable, so the current layout has static/build checks but no new browser captures or accessibility scan.

## GitHub Pages, review and rollback

The production URL is **https://riyagoelrs.github.io/other-hours/**. Pages continues to publish the repository root from `main`. `.nojekyll` and relative assets preserve static hosting. The check workflow validates the code, runs the Node tests and packages the static site; it does not deploy this feature branch.

Review this work through its dedicated feature branch and pull request. **There is no automatic feature-branch preview deployment.** The separately hosted [private review copy](https://other-hours-nyc-review-1115.brinycashew1.chatgpt.site) was published only for the requested design review. Merge through the normal PR flow when ready. To roll back after a merge, revert the merged PR; saved projects and legacy checklist keys still work with the previous version. Before merging a future catalog change, retain IDs or explicitly migrate them.
