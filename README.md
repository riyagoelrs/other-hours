# Other Hours — NYC hobby discovery MVP

> **Working title.** Rename the product by changing `BRAND_NAME` in `app.js` and the title/meta tags in `index.html`. No commitment to an Instagram handle or trademark is implied.

A zero-dependency, mobile-first prototype that bridges online project inspiration and real-world making: project guides, editable materials checklists, local suppliers, studios, and shareable project URLs.

## Run locally

This is a static web app: no API key or package installation needed.

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

Or use VS Code Live Server. Deploy as a static site on Vercel, Netlify, or GitHub Pages.

## NYC launch edition — expanded

**33 original starter projects, 12 local shops / studios / libraries, and 10 community and class resources.**

Projects cover bookbinding, embroidery, knitting, crochet, punch needle, sashiko mending, fabric block printing, weaving, linocut, zines, watercolor, film photography, jewelry, ceramics and more. Open a project for a materials checklist, 3–4 steps, local sourcing options and relevant groups. Click **People** to browse NYC meetups and classes directly.

**Paste a link:** The link tab accepts public YouTube, TikTok, Instagram and Pinterest URLs. It attempts permitted public oEmbed metadata for YouTube/TikTok/Instagram, then matches available post-title information against curated starter guides. If a post only reveals an opaque identifier or insufficient metadata, add a short optional video description and try again. It does *not* fetch full transcripts, watch videos, or generatively deduce supplies from hidden contents. Results show materials, local places and people together with source/provenance notes.

**NYC-only beta:** the hero explicitly says NYC-first / all five boroughs. Supplier and community discovery is curated, not sorted by real-time distance, availability or inventory. All users may browse the site; other cities are not listed yet.

**To edit in Codex:** open this GitHub repo in Codex; see [AGENTS.md](./AGENTS.md) for design, data and safety guidelines. Edit [data.js](./data.js) to add projects without touching UI code. Each project connects to real places and groups through `placeIds` and `communityIds`. Run:
```bash
node --check app.js
node --check data.js
node scripts/validate.mjs
```

## What works

- Hobby-keyword search with 33 curated projects
- Discoverable filters, category browsing, mobile layouts
- Project detail view with a materials checklist saved locally in your browser
- Save/unsave projects, saved project index, and copyable deep links (`#project/slug`)
- Social-link intake with limited permitted public title lookups and an optional user-description fallback
- Verified external links to a broader NYC places & community directory (curated, **no live stock/booking claims**)
- Keyboard-friendly modal/detail navigation, no external analytics

## Important MVP limitations

- Not an AI chatbot. Search is deterministic (local keyword matching). The UI never claims to have parsed a video when it hasn't.
- Some public links automatically match projects using their public metadata; many posts do not expose enough details. If they fail, users must provide a brief description. We never imply a complete video has been transcribed.
- No full video transcripts, integrated live inventory, live class booking, GPS, accounts, payment processing, or automatic price comparison.
- Budget values are **illustrative supply estimates**, not quotations or in-stock prices.
- Shops and classes are curated for NYC; verify opening times and availability on provider websites.
- `localStorage` is device/browser-local, not a cloud account.

## Suggested v2

1. Server-side `/api/parse` with authorized media access and safe transcription fallback.
2. Postgres project schema (`projects`, `materials`, `places`, `project_places`, `workshops`, `creators`) and admin verification workflow.
3. Geocoded store locations and accessible neighborhood filtering (explicit user location input only).
4. Live class inventory through opt-in partners; reuse-store inventory via merchant feeds.
5. Project completion tracking and creator referral attribution.

## Useful official sources for curated listings

- Brooklyn Creative Reuse: https://brooklyncreativereuse.org/visit-us
- Mood Fabrics NYC: https://www.moodfabrics.com/pages/new-york-store
- BKLYN CLAY: https://bklynclay.com/
- Center for Book Arts: https://centerforbookarts.org/

## Publish a live preview with GitHub Pages (no Vercel needed)

The app is a plain static site, so you can host it free with GitHub Pages.

1. Open **[Repository → Settings → Pages](https://github.com/riyagoelrs/other-hours/settings/pages)**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select branch **main**, folder **/(root)**, then click **Save**.
4. After GitHub finishes publishing, the website will appear at **https://riyagoelrs.github.io/other-hours/**.

GitHub Pages publishes the current `main` branch automatically whenever it changes. No API keys, Vercel connection, or build tools are required.

### Safe edit/revert workflow

- Open a feature branch from `main`, make changes there, and open a pull request.
- GitHub Pages (branch publishing) shows **only the merged `main` version**, not separate automatic PR previews. Review source diffs or use the local preview before merging.
- Merge only what you want live. If you dislike a merged change, use **Revert** on the merged pull request or revert its commit.
- The site's current public URL is predictable, but it **will not work until Pages is enabled** in repo settings.

## GitHub workflow — preview and revert

This repository is the source of truth for the prototype. Each change is a Git commit. For a visual preview, enable GitHub Pages as described above. Optional Vercel integration can create per-pull-request previews later.

1. Start a new branch for each experiment (e.g. `feature/homepage-type`).
2. Make edits and open a pull request against `main`.
3. Review the preview URL and the **Files changed** tab before merging.
4. If you dislike a merged change, use **Revert** on the merged pull request or revert the commit in GitHub. This creates another commit without erasing history.

All code is framework-free static HTML/CSS/JS. No secrets or install commands needed.

**Status:** NYC-first prototype, not live supplier inventory, automatic video parsing or AI-powered search.