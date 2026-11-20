# Other Hours — the curiosity club

20 November 2026. The previous finder had usable controls but too little visual identity. This pass gives it an editorial composition while retaining activity, community, supplies, location and reference-file behavior.

## Direction

The references are the user’s interest in journals, newspaper layouts, Pinterest boards and the typography of [HUMAN.md](https://www.human-md.ai/). HUMAN.md’s public preview image, previously saved HTML and stylesheet were inspected again. Its bold grotesque type, expressive serif accents and confident colors inform the hierarchy; its characters, artwork, room scenes and code are not reused.

- A large blue wordmark, a fine masthead rule and an italic subtitle establish a recognizable publication.
- “Make time for your thing” combines bold Bricolage with Instrument Serif. The search sits in the same composition as an asymmetric spread of real beading and clay photography.
- Pink, blue and occasional green accents carry through the navigation, bookmarks, filters, community feature and footer. There is no animated room or ornamental loader.
- Activities form a responsive photographic board, with varied image proportions and original illustrations for other interests. Photo descriptions are illustrative, not promises about a specific finished guide result. Keyboard navigation follows DOM order down each column.
- Desktop filters sit beside the board. On phones, a clearly labeled native disclosure opens the same filters and shows an active-filter count. The introductory photo spread appears between the headline and search visually; document reading order keeps the task controls together.
- Communities and supplies use the same serif titles, blue rules and type hierarchy. The photographic community feature links to the real directory, without pretending the pictured people are local members.

The current palette is paper `#f5f3ed`, ink `#222420`, blue `#263dc5`, pink `#f3c5d5` and green `#dce9b4`. Body text is 16px; control labels and time/budget metadata are 14px or larger. Secondary image/category metadata is at least 12px; small lettering in the decorative seal is artwork hidden from assistive technology. The photo source record is in [assets/photos](../assets/photos/README.md).

## Verification

Syntax/catalog/asset checks, all 40 existing Node regressions and the ten-flow DOM-controller check pass. Both Pages and portable builds pass. JPEG and WebP references are embedded in the portable page, including paths used dynamically by activity cards. Filters, location sorting, screenshot text recognition, link fallback and local saves retain their existing contracts; no catalog IDs or storage keys change.

The source photos were visually inspected. The supported `cua_repl.js` browser tool is not exposed in this turn, so the managed Sites workflow requires skipping browser QA. No alternate browser, preview server or generated mockup is presented as a current screenshot. Browser rendering, viewport layout, physical-iPhone picking and hosted OCR loading remain unverified. Earlier browser captures and the real OCR-engine result retain their historical scope.

The same private Site and existing GitHub PR are updated. Public GitHub Pages `main` remains unchanged.
