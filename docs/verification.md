> This report describes the earlier discovery layout. For current capabilities and verification limits, see [Activity finder, 19 November 2026](finder.md). Prior browser/Axe results do not verify the current page.

# Historical verification — Verification — 15 November 2026

## Automated and browser results

| Check                   | Result                                                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`         | JavaScript syntax, 39 guides, all entity relationships, all 33 legacy slugs, material/checklist positions, geography and static assets passed                                                                                    |
| `npm test`              | 20 Node tests passed: intent, budgets, five-borough coverage, synonyms, reuse, source provenance, URL boundaries, service input/CORS/rate limits, transcript authorization assertions, semantic validation and graceful fallback |
| `npm run build:pages`   | Static package generated without the service, credentials or runtime dependencies                                                                                                                                                |
| `npm run build:preview` | Self-contained review document generated with embedded fonts and illustrations                                                                                                                                                   |
| Browser journeys        | 14 groups passed: A–E on desktop and mobile, map/list plus nearby selection on both, and responsive sweeps on both                                                                                                               |
| Axe Core 4.10.3         | Zero WCAG 2 A/AA and 2.1 A/AA rule violations across home, project dialog, materials and creators at 1440 and 390 px                                                                                                             |
| Public directory URLs   | 40 returned HTTP 200; Queens Public Library returned HTTP 403 and is explicitly marked access-restricted; no retained 404 listings                                                                                               |
| Geocoding               | 20 NYC GeoSearch address matches accepted after checking address number, borough, confidence and the returned street label; one official NYC Resistor coordinate retained                                                        |

Browser assertions used installed Chromium and Python Playwright at **1440 × 1000** and **390 × 844**, with width sweeps at **320, 360, 390, 768, 1024 and 1440 px**. There were no page JavaScript errors or horizontal page overflow. Tests ran at `/other-hours/`, preserving the GitHub Pages repository subpath. The packaged static output also loaded successfully with all images present. A workshop-only guide was separately checked for provider-fee labels and overflow.

The native project dialog was checked for keyboard focus containment and Escape dismissal. Legacy `oh:saved` and `oh:checked:leather-journal` data were seeded before testing; bookmarks and material progress survived saves, area changes, reloads and deep links. Clipboard supply-list copying, custom plan editing, persistent area choices and cross-view refinements were exercised.

The self-contained document was tested over HTTP with embedded assets, search, project opening and saving. Direct `file:` navigation is blocked by this managed browser’s administrator policy, so file-mode behavior on a user’s own browser was not verified.

Evidence: [browser results](browser-results.json), [accessibility results](accessibility-results.json), [HTTP checks](source-checks.json), [geocoding responses](geocoding-sources.json), and [screenshots](screenshots).

## The requested journeys

- **A:** Leather-journal search ranks the specific guide first. Brooklyn selects local reuse resources, the guide compares $8–22 reuse and $24–60 local-supply estimates, reusable tools are separate, and saves/checklists persist.
- **B:** A controlled oEmbed fixture verifies title-only matching without inventing supplies. Restricted-access fixtures verify unresolved results and a helpful user-caption fallback. Literal supported requirements and steps remain separate from suggested guide supplies. Edited plans and source notes save and reopen correctly.
- **C:** Beginner sewing near the Garment District exposes The New York Sewing Center, related public communities, Mood supplies and Mood Sewciety resources. Tabs preserve the query and area; public destination URLs were checked separately.
- **D:** A hobby under $50 in Queens parses the budget and area, then retains context through guides, community resources and materials, including Sunnyside Arts. Price filters do not assert shop prices or a creator’s fees.
- **E:** Browsing Movement without a query opens an introductory dance action plan, with clothing/footwear preparation and a real Mark Morris learning route.

## Live ingestion checks and exact limits

A real request to the official public YouTube oEmbed endpoint returned HTTP 403 in this environment. The live optional Node service therefore used only the separately supplied description, labeled `user-supplied`; it extracted paper, its stated quantity and waxed linen thread, suggested the leather-journal guide, and reported **no transcript retrieved**. This verifies the real failure/fallback path. Metadata success and authorized-transcript success were verified with explicit fixtures, not presented as live platform analysis.

No full video was downloaded, watched or automatically transcribed. Instagram / Pinterest access remains a text-first fallback when public metadata is unavailable. Automatic transcript retrieval requires an authorized upstream service; semantic AI analysis requires an operator-supplied adapter and provider credentials. No such provider or transcript service is configured for the shipped static site. YouTube Data API descriptions also need server-side credentials and quota.

Map/list tests verify sourced coordinates, selecting a reference location and nearby straight-line distances without GPS. OpenStreetMap tile rendering is an external network dependency; address/map links remain available. No live stock, price comparison, class booking, cloud accounts or creator account ownership is implied.

## Deployment and review

The existing public GitHub Pages site responded successfully and its HTML matched the starting checkout. The feature branch has a working static package and an expanded check workflow; **GitHub Pages production was not overwritten or redeployed from this branch**. The pull request is the merge/rollback boundary. There is no automatic Pages branch-preview pipeline.

At the user’s request, a separate owner-private [review copy](https://other-hours-nyc-review-1115.brinycashew1.chatgpt.site) was published with Sites and confirmed by a successful native deployment result. Its [downloadable review copy](https://other-hours-nyc-review-1115.brinycashew1.chatgpt.site/other-hours-preview.zip) includes a self-contained page and font licenses. Hosting identity and credentials for that copy are outside the GitHub repository.

The Pinterest visual-reference board returned HTTP 403. No observations about inaccessible pins were fabricated; reference screenshots are still needed to evaluate fidelity to that board.
