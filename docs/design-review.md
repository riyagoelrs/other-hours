# Other Hours: before-and-after design review

## Audit before implementation

The repository’s README, AGENTS, page, styles, interaction code and complete original catalog were inspected. The live page’s HTML matched the checkout byte for byte. Desktop (1440 px) and mobile (390 px) captures covered the home page and its lower sections; the leather journal detail was also inspected. External browser certificates in the Cloud environment were not trusted, so the matching original source was served locally, with public font resources retrieved through the system-trusted HTTP client.

**What worked:** Instrument Serif, a warm paper background and original object illustrations already gave Other Hours a recognizable editorial identity. The 33-guide catalog connected projects to public venues, and browser-local bookmarks and checklist progress were useful working features.

**What needed work:** The large collage and repeated slogans delayed discovery, especially on mobile. Separate idea / link modes required a decision before searching. The location label did not affect recommendations. Most illustrations beyond the first few were text placeholders. Long project, venue and community grids formed a marketing-style scroll; “People” mainly repeated studio organizations. Project prices mixed starting supplies with equipment and classes, while quantities, substitutions and per-material sourcing were thin.

**Pinterest limitation:** `https://pin.it/5ah2vE6gg` resolved to the `riyagoelco/hobby-design` board, which returned HTTP 403. Its actual pins could not be inspected. No claims about its typography, images or composition informed this work. Reference screenshots were requested; this is a provisional direction based on the existing editorial brand and the written brief.

## The resulting design

The page now starts with a masthead, four explicit discovery destinations, Saved, and visible borough / neighborhood controls. “What are you into?” is the primary action. A shorter, illustrated field note sits beside the desktop search; mobile prioritizes the search and a horizontally browsable collection strip. Five collections lead directly to useful results without requiring a query.

Projects, materials, classes / communities and public creative profiles are searchable views of one connected catalog. Refinements preserve context, empty states give a clear way forward, and irrelevant price controls are disabled. The reuse feature is a working entry into a dedicated directory, rather than a decorative sustainability badge.

Guides use an illustrated overview, three ways to start, separate equipment costs, grouped supplies with quantities and substitutes, local sourcing, steps, public learning resources and people. The native dialog keeps background content inert, traps focus, supports Escape and restores the reading position. Link results show actual source evidence before an editable plan and keep literal extraction separate from curated or inferred suggestions.

## Design system

| Element                  | Decision                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Paper / surface          | `#f4f0e6` / `#faf7ef`                                                                                     |
| Ink / secondary text     | `#30362d` / `#67695c`                                                                                     |
| Rust / burgundy          | `#963e2c` / `#4c2925`                                                                                     |
| Olive / butter           | `#dce0c7` / `#e4cf8f`                                                                                     |
| Display type             | Instrument Serif, regular and italic                                                                      |
| Reading / interface type | DM Sans, regular and bold                                                                                 |
| Small editorial labels   | DM Mono                                                                                                   |
| Spacing                  | 8, 16, 24, 32, 48, 64 and 96 px tokens; consistent section rhythm                                         |
| Grid                     | Max 1280 px; four project columns, three directory columns; tablet and two-column phone project layouts   |
| Surfaces                 | Thin rules, restrained offset shadows, square editorial cards and clear selected / focus states           |
| Illustration             | Twelve original vector still lifes; limited material palette and subtle print grain; no stock photography |
| Motion                   | Small hover responses, no ticker or looping decoration; reduced-motion support                            |

Fonts are self-hosted with their OFL licenses. Images have stable dimensions and lazy loading where appropriate. Important operations use native buttons, selects, checkboxes and a dialog, with explicit labels and live status messages. The reuse budget text was darkened after the accessibility check caught insufficient contrast on olive.

## Engineering decisions and limits

The existing static stack is retained. A versioned catalog links hobbies → projects → materials → places → learning → people. Public facts cite sources and dates; prices and substitutes remain labeled editorial estimates. All original guide slugs and numeric checklist positions survive. Geographic records are city-scoped, with 21 sourced address points; map / list and nearby selection require no GPS. Other locations retain addresses and external map links.

The optional Node ingestion service is independent of Pages and hosting vendors. It supports permitted metadata, official YouTube descriptions when configured, authorized transcript evidence and a source-validated semantic adapter. No AI provider, automatic platform transcription, live inventory, live booking, cloud saves or creator accounts are represented as active integrations.

The map uses external OpenStreetMap tiles only after the user selects it. Distances are approximate straight lines between address points, not walking routes. The browser journey verifies map selection, reference changes and nearby results; map-provider rendering depends on network access.

## Screenshots

| Before                                    | After                                    |
| ----------------------------------------- | ---------------------------------------- |
| [Desktop](screenshots/before-desktop.png) | [Desktop](screenshots/after-desktop.png) |
| [Mobile](screenshots/before-mobile.png)   | [Mobile](screenshots/after-mobile.png)   |

Additional views: [desktop project](screenshots/project-desktop.png), [mobile project](screenshots/project-mobile.png), [materials](screenshots/materials-desktop.png), [public creators](screenshots/creators-all-desktop.png), [inspiration fallback](screenshots/inspiration-desktop.png).

The requested [private review copy](https://other-hours-nyc-review-1115.brinycashew1.chatgpt.site) is hosted separately with Sites. It is a confirmed deployment for review, not an automatic GitHub feature-branch preview. The GitHub Pages production site remains on `main` until the PR is merged.
