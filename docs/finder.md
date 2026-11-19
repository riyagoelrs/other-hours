# Activity finder — 19 November 2026

The primary task is now visible: find something to try, then find people and supplies. A compact search replaces the large cobalt/pink workroom. Activities, Communities and Reuse & supplies lead directly to filtered results. Typography, a blue accent and a small surprise button retain some personality without putting a visual scene before the task. The stylesheet is consolidated instead of layering another theme on the prior four layouts.

## Behavior

- Visible category, active-time, starting-budget, beginner, free and reuse controls. Inapplicable controls are hidden for each view. Numeric time ranges use their upper end; unknown class lengths and multi-week projects do not get guessed durations.
- Communities default to groups and public communities; the Show filter switches to classes/workshops or all programs. The directory contains 20 community resources, including NYC Urban Sketchers. Known host-venue associations support distance sorting. Rotating meetups and branch networks keep no invented point.
- Optional device location sorts known places by straight-line distance within 1/3/5/10 miles. Changing/unlisted locations have separate labels/counts and can be excluded. Manual area changes cancel pending device requests. Coordinates stay in memory and are not sent to a map, service, localStorage or saved plan. Outside NYC, the interface explains its current coverage.
- Screenshot text reading is explicit and local. The first use lazily downloads a same-origin Tesseract runtime, one compatible core and an English model. A resized working canvas is used; originals are retained unchanged. Progress/cancel, low-readability errors and editable recognized text are provided. Recognized text is labeled as OCR and may be wrong. It is not general image understanding.
- Links attempt allowed public metadata. Instagram/Pinterest use caption, description or screenshot text in this static deployment. A blocked link exposes useful input actions; it does not claim an interpretation. Matched activities appear first, and the full plan editor is collapsed until requested.

## Current verification

- `npm run check`: syntax, catalog foreign keys, legacy IDs and static assets pass.
- `npm test`: 40 Node tests pass, including duration queries, group/class separation, radius/distance ordering, unlocated listings, coverage, location cancellation, OCR evidence and existing upload/service regressions.
- `node scripts/check-dom.mjs`: actual page/controller scripts in LinkeDOM pass 10 flows, including filter controls, opt-in location, manual reset, image staging, recognized-text matching, invalidating a stale plan after editing OCR, saving a later link plan after clearing files, and restricted-link fallback actions. OCR output is a declared test double in this DOM check. No browser layout or native picker is exercised. See [DOM output](finder-dom-check.json).
- `node scripts/check-ocr.mjs`: real Tesseract.js 7 Node engine reads an explicitly synthetic sashiko screenshot at confidence 95, passes its output through actual upload validation/ingestion, finds sashiko/mending guides, retains OCR provenance and preserves original bytes. Uses the shipped English model. See [engine output](finder-ocr-check.json). This does not verify the browser worker or native photo picker.
- Live YouTube metadata request failed in this environment; the actual supplied-caption fallback still matched the leather-journal guide and reported no transcript retrieved. Browser CORS and live platform success are unverified. Success/failure metadata cases also have deterministic regression fixtures.
- Both static builds pass. Main assets and all worker/model/core paths are relative to the page so the repository subpath is supported by construction. The downloadable core page requires sibling OCR assets over HTTP(S) for OCR; direct file viewing falls back to a description.

**No current browser-rendering, viewport, Axe, iPhone photo-library, browser geolocation-permission or hosted-worker claim is made.** The supported managed Sites browser tool is unavailable, so no preview server, alternate browser or screenshot path was launched. Earlier screenshots and browser reports belong to prior versions.

## Source refreshes

- [NYC Urban Sketchers](https://www.nycurbansketchers.org/): official live blog and changing-venue instructions; checked 2026-11-19. Newcomers are welcome, but venue admission can vary. No event date is stored as a live promise.
- [NYC Resistor participation](https://www.nycresistor.com/participate/): public craft nights, public Discord, no unrelated drop-ins, separate membership/tool access; checked 2026-11-19.
- [FABSCRAP volunteering](https://fabscrap.org/volunteer): choose and register for a Brooklyn warehouse session through the official page; checked 2026-11-19. No current openings or fabric allowance are promised.

Public GitHub Pages continues to use `main`. This change is reviewed on the existing feature PR and the separately published owner-private review copy.
