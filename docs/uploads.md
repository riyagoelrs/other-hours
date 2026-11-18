# Photos, files and link dropping

Other Hours now accepts device photos, PDF references, text/Markdown notes and short video files beside the existing idea/link input. **Add photos** opens a native image picker with multiple selection and no camera-forcing `capture` attribute. **Add files** provides the broader file picker. The same area accepts dropped files and dropped links; clipboard images can be pasted there as well.

Photo thumbnails show immediately. A browser that cannot decode a HEIC original keeps the reference and offers the original file; it does not claim a visual interpretation. PDF/video references offer the original download rather than an embedded or automatically analyzed player. A user description or an uploaded text file can generate a related editable starter plan. Literal text-file evidence is identified by filename and remains separate from editorial supply suggestions.

Files are private to the current browser/device and save with the plan in IndexedDB. There is no new cloud storage, server upload, user-account requirement or transmission to the assistant chat. The existing optional link-analysis service receives no file bytes. Reopening a plan restores its files; downloads preserve original bytes. Reference-aware deletion retains files that another saved plan still needs. Clearing browser site data also clears these local references.

## Limits and behavior

| Input                                         | Limit / treatment                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Photos: JPEG, PNG, WebP, GIF, AVIF, HEIC/HEIF | 20 MB each; native preview when supported; original retained                           |
| PDF                                           | 20 MB each; reference/original download; no automatic PDF extraction                   |
| MP4, MOV, WebM                                | 50 MB each; reference/original download; no transcription                              |
| Plain text / Markdown                         | 1 MB each; first 16,000 characters provide source evidence; complete original retained |
| A plan’s references                           | Six files, 100 MB combined; can be combined with a public inspiration link             |
| Unsupported / empty / mismatched files        | Rejected with a readable status; existing files remain available                       |

Changing files after creating a plan marks the draft as needing a refresh. **Find my thing** rebuilds the evidence before saving, so a removed document cannot silently remain an active source. A storage failure leaves the editable plan open and does not claim that its files were saved. Filenames and source text are escaped; uploaded active SVG/HTML content is not embedded.

On narrow screens, editable intake and plan fields use 16 px text to avoid the usual iPhone Safari focus zoom. The native operating-system photo chooser and any app photo permissions remain under the device’s control.

## Verification

- **31 Node tests pass** across the complete discovery/service suite and file validation, including size/count limits, duplicate files, HEIC originals, JPEG exports retaining a HEIC name, clipboard images without an extension, text bounds, literal provenance and absent browser storage.
- The existing **14 desktop/mobile journey groups pass**, preserving ideas, links, geography, legacy saves and checklists.
- **Eight additional browser groups pass** on desktop and an iPhone-sized viewport: a real native file chooser, photo previews, file/link dropping, mixed provenance, source refresh after removal, saving/reloading files, original text downloads, safe filenames, reselection, reference-aware deletion and storage failure behavior.
- **Zero Axe WCAG 2/2.1 A/AA rule violations** were found across the home/intake, reference result and saved-reference dialog on both widths.
- File-only intake was checked for zero external requests. Tests use a previous site screenshot and explicitly written text as fixtures. Successful oEmbed metadata in mixed-link tests is a labeled fixture.
- Browser checks use Chromium at 1440 px and 390 px with width sweeps from 320 to 1440 px. This is not a physical-device test of the iPhone Photos application or Safari’s operating-system chooser.

Run `python scripts/upload-browser-check.py` against the local static site. Native file choosers are exercised through Playwright’s file-chooser event, and persisted originals are checked after a reload rather than inferred from a success message.

Evidence: [upload browser results](upload-browser-results.json), [upload accessibility results](upload-accessibility-results.json), [desktop intake](screenshots/upload-intake-desktop.png), [mobile intake](screenshots/upload-intake-mobile.png), and [saved files](screenshots/saved-upload-files.png).
