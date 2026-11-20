# Other Hours: a simpler original direction

Historical iteration, superseded by the [workroom direction](workroom-design.md). The beadwork hero photo and DM Sans files described here are no longer shipped.

The user preferred the original site's simplicity and supplied [HUMAN.md](https://www.human-md.ai/) and an [Egor loader experiment](https://x.com/egorvert/status/2115141484957909187) as references. HUMAN.md's actual HTML, stylesheet and public preview image were inspected: the relevant influence here is the strong type hierarchy, dark ink/paper contrast and selective serif emphasis. The X post's official public oEmbed caption was available, but its animation was not; no motion treatment is claimed to reproduce it. No reference code, artwork or photography was reused.

This pass returns to “Make something of your free time.” The header is compact, the navigation uses direct labels, and one real beadwork photograph sits beside the search. File/photo picking, dropping links and adding descriptions remain in the main search area. Area controls sit next to the results they refine.

The hobby index uses two columns of text entries on desktop and one readable column on phones, with a title, starting cost, time, local resource note and bookmark. Collection shortcuts are text buttons. There are no repeated image tiles, tape, bows, plaid, handwritten annotations, paper shadows or decorative issue labels. The reuse section retains one fabric photograph; neighborhood links and the footer use thin rules and the same paper background.

| Role                 | Current choice                                |
| -------------------- | --------------------------------------------- |
| Paper / surface      | `#f4efe8` / `#faf7f2`                         |
| Ink / secondary text | `#201e1f` / `#68635e`                         |
| Accent / rules       | `#a73f29` / `#cec7bf`                         |
| Headlines            | Existing Instrument Serif, regular and italic |
| Reading / controls   | Existing DM Sans                              |
| Secondary metadata   | Existing DM Mono                              |

The unused Caveat font and three collage photos were removed. The two remaining photos total about 87 KB and keep [source/license records](../assets/photos/README.md). Existing guide illustrations retain their earlier material palette and appear in the detailed guides. The static package builder now clears only its generated output before copying assets, so removed assets do not linger in the published package. Original source files, browser-local user files and saved plans are not cleared.

## Verification

The required JavaScript/catalog checks, 31 existing Node tests and both static packaging commands are run for this pass. Static checks cover local assets, unique HTML IDs, project links, embedded review assets, the removed decorative classes/font/photos and contrast pairs. These checks do not establish visual correctness.

The supported `cua_repl.js` browser route and preview handoff remain unavailable in this managed environment. Following the Sites workflow, no alternative preview server or browser was started. The new layout therefore has no browser verification, new screenshot, physical-iPhone test or fresh Axe scan. Prior browser and file-upload reports are historical evidence of the earlier UI, not a claim about this layout.

The feature branch and existing PR are updated, and the same owner-private Sites review copy is refreshed. GitHub Pages `main` remains unchanged; file storage keys, catalog IDs and legacy checklists remain compatible.
