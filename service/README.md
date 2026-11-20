# Optional inspiration ingestion service

GitHub Pages works without this service. It is a standalone Node 22+ HTTP server with no package dependencies and no Vercel account or authentication requirement.

## Local use

```sh
cp service/.env.example service/.env
node --env-file=service/.env service/server.mjs
# http://127.0.0.1:4174/health
```

To connect a development site, set the public `ingestionEndpoint` in `config.js` to `http://127.0.0.1:4174/api/ingest`. For production, host the service behind HTTPS on a Node-capable provider, configure `HOST` / `PORT` as appropriate, allow the site’s exact origin, and set `ingestionEndpoint` to its HTTPS URL. Public configuration contains no credentials. Leave it empty to retain the static flow. Secrets belong only in ignored server environment files or your host’s secret store.

`POST /api/ingest` accepts JSON:

```json
{
  "url": "https://www.youtube.com/watch?v=<public-video-id>",
  "text": "optional caption, description or transcript",
  "textKind": "description"
}
```

`textKind` is `manual`, `description` or `transcript`. Output includes source evidence, warnings, extracted requirements, literal steps, curated guide suggestions, confidence, transcript status and provenance. This is a planning tool; a match is not a reconstruction of hidden video content.

## Supported source adapters

1. **Public oEmbed:** fixed official YouTube / TikTok endpoints, with HTTPS content-URL allowlists, bounded timeouts and redirects disabled. No user URL is fetched directly. Instagram and Pinterest use the text fallback unless an authorized operator integration supplies evidence.
2. **Official YouTube descriptions:** set `YOUTUBE_DATA_API_KEY` on the server to use `videos.list` with `part=snippet`. This retrieves titles / descriptions, not transcripts, and is subject to API quota and video availability.
3. **Authorized transcripts:** set `AUTHORIZED_TRANSCRIPT_ENDPOINT` to an operator-controlled HTTPS service. It receives `{url,provider}` and must return `{"authorized":true,"text":"..."}`. `TRANSCRIPT_SERVICE_TOKEN`, if supplied, goes only in a server-side authorization header. This is a contract for access you already have; it does not unlock restricted platform captions. The app also accepts a transcript the user is authorized to share.
4. **Semantic analysis:** optionally set `ANALYZER_MODULE` to an absolute path to an operator-supplied ES module exporting `analyze({evidence,hobbies,materialNames})`. There is no AI provider or key configured in this repository. The adapter can use an authorized provider under the operator’s credentials. It must return this structured shape:

```json
{
  "hobbyIds": ["bookbinding"],
  "requirements": [
    {
      "name": "paper",
      "quantity": null,
      "provenance": "extracted",
      "evidence": "Use paper and thread."
    },
    { "name": "awl", "quantity": null, "provenance": "inferred" }
  ],
  "steps": []
}
```

Extracted entries must cite a literal excerpt of non-title source text containing the claimed material / step. Inferred entries remain separately labeled suggestions. IDs, field lengths, array sizes, provenance and evidence grounding are checked. Invalid or timed-out adapter output falls back to curated matching rather than inventing facts. The browser validates service results and checks they belong to the submitted content URL.

## Operational behavior

- Strict origin allowlist; no credentials or permissive wildcard CORS.
- HTTPS source allowlists reject credentials, lookalike domains, arbitrary ports and unsupported hosts.
- JSON-only input, 64 KB body limit, 16,000-character supplied text and per-process request limits.
- No request body, source transcript or credential logging; no persistent server-side user records.
- Metadata, description, transcript and analyzer failures are independent fallbacks. A disconnected service returns the user to browser metadata and manual text.
- For a public multi-instance service, apply your host’s request limits and abuse controls as well. The included limiter is process-local.

`npm test` verifies URL boundaries, rejected origins and payloads, rate limits, authorized transcript assertions, source-grounded output and fallback behavior without calling external services. Live network restrictions and fixture coverage are recorded separately in [verification](../docs/verification.md).
