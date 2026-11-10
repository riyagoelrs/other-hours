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

## What works

- Hobby-keyword search with 6 curated projects
- Discoverable filters, category browsing, mobile layouts
- Project detail view with a materials checklist saved locally in your browser
- Save/unsave projects, saved project index, and copyable deep links (`#project/slug`)
- Instagram/TikTok/YouTube/Pinterest link intake **with user-supplied video description**
- Verified external links to a starter NYC directory (curated, **no live stock/booking claims**)
- Keyboard-friendly modal/detail navigation, no external analytics

## Important MVP limitations

- Not an AI chatbot. Search is deterministic (local keyword matching). The UI never claims to have parsed a video when it hasn't.
- A link alone cannot automatically yield supplies today; users can paste a description or choose a related category. Official social platforms restrict general transcript access.
- No integrated live inventory, live class booking, GPS, accounts, payment processing, or automatic price comparison.
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

## GitHub workflow — preview and revert

This repository is the source of truth for the prototype. Each change is a Git commit. For a visual preview, connect this repository to Vercel or enable GitHub Pages; Vercel can create a separate preview URL for every pull request.

1. Start a new branch for each experiment (e.g. `feature/homepage-type`).
2. Make edits and open a pull request against `main`.
3. Review the preview URL and the **Files changed** tab before merging.
4. If you dislike a merged change, use **Revert** on the merged pull request or revert the commit in GitHub. This creates another commit without erasing history.

All code is framework-free static HTML/CSS/JS. No secrets or install commands needed.

**Status:** NYC-first prototype, not live supplier inventory, automatic video parsing or AI-powered search.