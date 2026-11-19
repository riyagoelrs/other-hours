# Photos, screenshots, files and links

**Photo / screenshot** opens a native image picker with multiple selection and no camera-forcing `capture` attribute. **Add files** opens the broader file picker. The search area accepts dropped files, supported platform links and clipboard images. This is the website’s picker; it cannot modify attachment controls in the ChatGPT iPhone app.

Images preview locally. If a browser cannot decode a HEIC original, the original stays attached and available to download. PDFs and videos remain references rather than embedded analysis players.

## Read screenshot text

Attach an image, choose **Read screenshot text**, review/correct the recognized English text, then **Find activities**. Tesseract.js, its worker/core and the English model load from this site only on demand. The device reads a resized working canvas; the original file stays unchanged. There is progress, cancellation and a fallback for unclear text or unsupported image decoding. OCR can misread quantities and words; source notes label it explicitly. Editing recognized text or changing attachments disables saving a stale result until the search runs again.

This reads text, not pictured objects or a video. Photos without legible text need a description. PDFs/videos need a description; text/Markdown files can supply their own evidence. Public titles can suggest a guide but cannot establish a supply list. Recognized/source text and curated starter supplies are separate.

## Local saving

Save an edited plan to keep its original references in IndexedDB. Only descriptors, source notes and plan text go into localStorage; no file bytes are stored there. Files are not sent to the optional link service, a model provider, cloud storage or the assistant chat. Reopening a saved plan restores files on the same browser/device. Reference-aware deletion keeps files another plan still uses. Clearing browser data clears these local references. A storage failure is shown rather than presented as a successful save.

| Input                                 | Limit / treatment                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| JPEG, PNG, WebP, GIF, AVIF, HEIC/HEIF | 20 MB each; native preview when supported; local OCR requires a decodable image |
| PDF                                   | 20 MB each; original reference, no PDF extraction                               |
| MP4, MOV, WebM                        | 50 MB each; original reference, no transcription                                |
| Text / Markdown                       | 1 MB each; first 16,000 characters used as text evidence; original retained     |
| Whole plan                            | 6 files, 100 MB total                                                           |

Names, MIME types and file headers are checked. Duplicates, unsupported active formats and oversize inputs are rejected. Filenames and recognized text are escaped when rendered. HEIC-to-JPEG picker conversions and pasted images without extensions are supported when their headers/types are valid.

## Verification

See [the current finder record](finder.md), [real OCR output](finder-ocr-check.json) and [DOM-controller output](finder-dom-check.json). Forty Node tests pass alongside a real-engine synthetic screenshot check and DOM integration checks. Browser rendering, native iPhone picker behavior and hosted OCR loading are not verified in this environment. Earlier upload browser reports are historical.
