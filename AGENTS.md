# Codex working notes — Other Hours

## Product
Other Hours is an NYC-first, mobile-first hobby-to-real-life discovery website. Users search for a hobby or paste a social link to see curated starter materials, NYC suppliers, classes and community groups. The design is an editorial, tactile, vintage-inspired publication — not a generic AI app or chat feed.

## Stack and files
- Static HTML/CSS/vanilla JavaScript. No build step, frameworks or backend yet.
- `index.html`: layout, metadata and structure.
- `styles.css`: visual system, typography and responsive layout.
- `data.js`: curated `projects`, `places`, `communities`. Edit this to add projects.
- `app.js`: search, filters, project detail views, saved checklists, link preview and UI behavior.
- `scripts/validate.mjs`: zero-dependency content integrity checks.

## Design principles
Keep serif editorial headings, offset shadows, warm paper palette and custom project illustration treatments. Avoid generic gradients, AI stock visual language, and placeholder metrics. Keep accessible labels, keyboard navigation and mobile usability. Do not over-engineer: ship clear improvements.

## Data integrity
Never invent real-time merchant inventory, prices, class availability, meetup membership or platform transcripts. Shop and community URLs must be public and checked. Materials and budgets are curated *starter estimates*. Use `placeIds` and `communityIds` to connect each project to relevant NYC organizations; don't fabricate organizations.

## Video link policy
The static app attempts to read public oEmbed metadata for YouTube, TikTok and Instagram. Metadata often lacks the full caption and is not a transcript. Pinterest is recognized but currently relies on descriptive links or an optional user description. If matching is uncertain, explain what could not be determined and allow the user to enter a short project description. Never claim to have watched a video without a real extraction/transcription pipeline. Future production version: authenticated server-side ingestion with permitted media sources and a fallback when captions are unavailable. Do not scrape private or restricted content.

## Working with code / GitHub
Use feature branches, open a PR, run `node --check app.js && node --check data.js && node scripts/validate.mjs`. On merge to `main`, GitHub Pages publishes the branch at `https://riyagoelrs.github.io/other-hours/`. Branches don't automatically create preview URLs with the current GitHub Pages setup. Create reversible commits; don't force-push `main`.

## Near-term product work
1. Support a real server-side video ingestion flow using authorized/public sources, video transcripts when permitted, and a confidence score.
2. Add NYC borough and neighborhood filters (not GPS by default), plus geocoded supplier locations.
3. Build a small curated CMS for checking and refreshing shops, classes and groups.
4. Create project-specific cards for creators to share, and track conversion to starting/completing a project.
