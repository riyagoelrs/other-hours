> Historical design, superseded by the [activity finder](finder.md) on 19 November 2026. Its studies are not current UI screenshots.

# Other Hours: the workroom

The reference is [HUMAN.md](https://www.human-md.ai/). Its opening is a staged room: a blue wall, floor, huge Bricolage lettering with Instrument Serif punctuation, foreground objects and independent movement as the reader scrolls. That structure informed this pass. The reference's HTML, CSS, opening-scene markup and public preview image were inspected. Other Hours does not ship its artwork, characters, JavaScript, wording or camera choreography.

## The resulting composition

- **A type wall.** The Other Hours name spans a solid cobalt field in heavy Bricolage Grotesque and oversized Instrument Serif italic. The product name is the focal point of the room.
- **A workspace.** The pink surface holds the search, link field, native photo/file pickers, descriptions and upload previews. These controls retain normal document flow when a file draft grows.
- **An object with a purpose.** The original timer/thread/book scene is a large native button. “Pick a hobby for me” opens an existing guide; consecutive picks avoid the previous guide. It uses the catalog's global lexical binding, without a separate API or invented content.
- **Independent movement.** Native scroll and a fine pointer move the object and type at different small distances. There is no scroll hijacking, forced waiting, entrance loader, autoplay, perpetual animation loop or motion requirement. Reduced-motion mode is static.
- **A connected index.** A charcoal strip introduces five curiosity shortcuts. The guide index uses readable type entries, and the materials feature uses an acid-green field. The scene palette and grotesque type continue through guides, saved plans and the footer.

The phone composition keeps the timer and book above the form, uses the full width for search, and keeps the picker label clear of the search heading. The desktop retains the spool and bead strand on the right side of the table.

| Role                         | Current choice                                                 |
| ---------------------------- | -------------------------------------------------------------- |
| Cobalt wall                  | `#1844d8`                                                      |
| Pink desk                    | `#ffabc8`                                                      |
| Ink / neutral paper          | `#201e1f` / `#f5f5f1`                                          |
| Green object/materials field | `#c7ec58`                                                      |
| Main type                    | Bricolage Grotesque, variable 400–800, self-hosted Latin WOFF2 |
| Serif interruption           | Existing Instrument Serif regular/italic                       |
| Metadata                     | Existing DM Mono                                               |

Bricolage's 77 KB Latin font comes from Google Fonts with its OFL license, replacing DM Sans. Scene artwork is original SVG. The Pexels fabric photo retains its source and photographer link; it illustrates reuse and is independent of directory listings.

## Visual studies and verification boundaries

[Desktop composition](design/workroom-desktop-study.png) · [Phone composition](design/workroom-mobile-study.png)

These are static design studies, generated with actual font outlines and the final scene assets to inspect the intended composition. They are **not screenshots of the running app**, and do not establish browser layout, wrapping or interaction correctness. The standalone SVG art was also rendered and inspected. Type width calculations cover 320–1600 px.

The managed environment still lacks its supported `cua_repl.js` browser route. The Sites workflow requires skipping browser QA, and no alternative browser or preview server was started. The deployed page needs an actual browser review; no new screenshot, Axe scan or physical-iPhone test is claimed.

The Node suite includes two new integration checks that execute the real catalog and scene controller: the picker opens valid, non-repeating guide routes with `OH_DATA` as a global lexical const; reduced motion prevents scene frame requests while leaving the picker usable. These checks do not validate the visual design. Static checks, packaging builds, relative asset validation, source embedding and color contrast are also run.

The catalog, original 33 slugs, checklist positions, upload validation, IndexedDB references, local save keys and metadata provenance remain compatible. The same owner-private Site and existing PR are updated; GitHub Pages `main` is unchanged.
