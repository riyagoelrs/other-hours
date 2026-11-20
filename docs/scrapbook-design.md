# Other Hours: the hobby club journal

Historical design pass, superseded by the [simpler original direction](simple-design.md) after user feedback. The photos and handwriting font mentioned below were removed when no longer used. The checks here document this earlier state.

The user's written references were newspapers, journals, girls enjoying hobbies together, _Clueless_ and _Mean Girls_. This pass interprets those as a fashion scrapbook: a large newspaper masthead, warm paper, blush pink and berry ink, a little yellow plaid, handwritten margin notes and taped photo prints. It uses original layouts and licensed activity photography; no film stills, characters or uninspected Pinterest pins are represented as source material.

The hero reads “Find your next little obsession.” Search, photo/file intake and idea shortcuts stay together in the first column. The opposite column is a ruled-paper collage of women making art, a scrapbook page, a newspaper clipping, a yellow plaid reminder and a small drawn bow. The two photo prints link to real classes/communities and the journal guide. On narrow screens the search comes first, followed by the collage; collage elements stay inside their own grid and do not cover form controls.

The five curiosity collections become taped photo/illustration cards, and guides become paper cards. Existing guide illustrations keep their original content with lighter pastel backgrounds. The reuse feature pairs a fabric-offcut photograph with the journal palette. Neighborhood entry points read as pink, yellow and sage notes. The scrapbook treatment reaches saved-reference screens through the shared palette, larger labels and readable form fields.

| Role                   | Current choice                          |
| ---------------------- | --------------------------------------- |
| Paper / surface        | `#fffaf3` / `#fffefa`                   |
| Ink / secondary        | `#30282c` / `#71616a`                   |
| Blush / pale pink      | `#f6d5df` / `#fcebf0`                   |
| Berry / plum           | `#922c4f` / `#492c3d`                   |
| Butter / sage          | `#f6e6a4` / `#e7e6d4`                   |
| Masthead and headlines | Instrument Serif, regular and italic    |
| Handwritten notes      | Caveat, self-hosted with OFL license    |
| Reading / interface    | DM Sans; DM Mono for secondary metadata |

Five compressed, self-hosted photos total approximately 297 KB. Their [photographer credits and sources](../assets/photos/README.md) are also available in the footer. They are mood photography and do not imply that pictured people or spaces are directory listings. The self-contained review document embeds photos, fonts, illustrations and scripts; the ordinary site retains relative URLs for repository-subpath hosting.

The search, filters, catalog data, native pickers, IndexedDB file references, saved plans and legacy storage keys retain their existing behavior. Link labels use words without decorative arrows; native selects have inset chevrons. Primary inputs remain 16 px on phones. There is no new animation, tracking or external image request.

## Validation and limits

JavaScript/catalog integrity checks, the existing 31 Node tests and both static packaging commands are run for this change. Asset validation covers the new local photos, font, photo collection references and embedded review assets. Contrast checks cover the new text/surface pairs.

The managed environment currently has neither the supported `cua_repl.js` browser route nor its preview handoff tool. The Sites workflow therefore requires skipping browser QA here. No new browser screenshots, physical-iPhone checks or accessibility scan are claimed for this design pass. The preceding [browser results](browser-results.json), [file-intake results](upload-browser-results.json) and screenshots apply to the prior presentation. A browser review of the updated private Site remains necessary to confirm wrapping, cropped photos and visual balance at device sizes.

The GitHub Pages production branch remains unchanged. This refinement is delivered through the existing feature PR and the same owner-private Sites review copy.
