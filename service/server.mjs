/** Optional Node 22+ ingestion service. GitHub Pages has no dependency on it. */
import http from "node:http";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const catalog = require("../data.js");
const ingestion = require("../ingestion.js");
const discovery = require("../discovery.js").create(catalog);

export function validateAnalysis(output, evidence) {
  if (
    !output ||
    !Array.isArray(output.hobbyIds) ||
    output.hobbyIds.length > 10 ||
    !output.hobbyIds.every((id) => catalog.hobbies[id])
  )
    return false;
  const validEntry = (entry, field) =>
    entry &&
    typeof entry[field] === "string" &&
    entry[field].length > 0 &&
    entry[field].length <= 500 &&
    ["extracted", "inferred"].includes(entry.provenance) &&
    (!entry.quantity ||
      (typeof entry.quantity === "string" && entry.quantity.length <= 100)) &&
    (entry.provenance === "inferred" ||
      (typeof entry.evidence === "string" &&
        entry.evidence.length > 0 &&
        evidence.some(
          (e) =>
            e.kind !== "title" &&
            e.text.includes(entry.evidence) &&
            entry.evidence.toLowerCase().includes(entry[field].toLowerCase()) &&
            (!entry.quantity ||
              entry.evidence
                .toLowerCase()
                .includes(entry.quantity.toLowerCase())),
        )));
  return (
    Array.isArray(output.requirements) &&
    output.requirements.length <= 60 &&
    output.requirements.every((e) => validEntry(e, "name")) &&
    Array.isArray(output.steps) &&
    output.steps.length <= 20 &&
    output.steps.every((e) => validEntry(e, "text"))
  );
}

export function createService({
  fetcher = fetch,
  analyze = null,
  env = process.env,
} = {}) {
  const allowedOrigins = (
    env.ALLOWED_ORIGINS ||
    "http://localhost:4173,http://127.0.0.1:4173,https://riyagoelrs.github.io"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const requestCounts = new Map();
  return http.createServer(async (request, response) => {
    const origin = request.headers.origin;
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Origin",
    };
    if (origin && allowedOrigins.includes(origin))
      Object.assign(headers, {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
    const send = (status, payload) => {
      response.writeHead(status, headers);
      response.end(JSON.stringify(payload));
    };
    if (origin && !allowedOrigins.includes(origin))
      return send(403, { error: "Origin not allowed" });
    if (request.url === "/health" && request.method === "GET")
      return send(200, {
        ok: true,
        metadata: true,
        transcripts: !!env.AUTHORIZED_TRANSCRIPT_ENDPOINT,
        semanticAnalysis: !!analyze,
      });
    if (request.url !== "/api/ingest") return send(404, { error: "Not found" });
    if (request.method === "OPTIONS") return send(204, {});
    if (request.method !== "POST") return send(405, { error: "Use POST" });
    const ip = request.socket.remoteAddress,
      now = Date.now();
    for (const [key, value] of requestCounts)
      if (value.until < now) requestCounts.delete(key);
    const rate = requestCounts.get(ip) || { count: 0, until: now + 60000 };
    requestCounts.set(ip, rate);
    rate.count++;
    if (rate.count > Number(env.RATE_LIMIT_PER_MINUTE || 30))
      return send(429, { error: "Too many requests. Try again in a minute." });
    if (!(request.headers["content-type"] || "").startsWith("application/json"))
      return send(415, { error: "Send application/json" });
    if (Number(request.headers["content-length"]) > 65536)
      return send(413, { error: "Request too large" });
    let body = "";
    try {
      for await (const chunk of request) {
        body += chunk;
        if (Buffer.byteLength(body) > 65536) {
          send(413, { error: "Request too large" });
          request.resume();
          return;
        }
      }
      let input;
      try {
        input = JSON.parse(body);
      } catch {
        return send(400, { error: "Invalid JSON" });
      }
      if (
        !input ||
        typeof input !== "object" ||
        typeof input.url !== "string" ||
        (input.text != null && typeof input.text !== "string") ||
        (input.text || "").length > 16000 ||
        !["manual", "description", "transcript", undefined].includes(
          input.textKind,
        )
      )
        return send(400, { error: "Invalid URL or text payload" });
      const link = ingestion.identify(input.url);
      if (!link)
        return send(400, {
          error: "Unsupported or invalid public content URL",
        });
      const publicInfo = await ingestion.metadata(link, { fetcher });
      const evidence = publicInfo.evidence,
        warnings = publicInfo.warnings;
      // Official YouTube Data API descriptions, only when the operator configures its key.
      if (link.provider === "youtube" && env.YOUTUBE_DATA_API_KEY) {
        try {
          const endpoint = new URL(
            "https://www.googleapis.com/youtube/v3/videos",
          );
          endpoint.search = new URLSearchParams({
            part: "snippet",
            id: link.videoId,
            key: env.YOUTUBE_DATA_API_KEY,
          });
          const reply = await fetcher(endpoint, {
            signal: AbortSignal.timeout(6000),
            redirect: "error",
          });
          if (!reply.ok) throw new Error("API unavailable");
          const snippet = (await reply.json()).items?.[0]?.snippet;
          if (
            typeof snippet?.description === "string" &&
            snippet.description.trim()
          )
            evidence.push({
              kind: "description",
              text: snippet.description.slice(0, 16000),
              origin: "youtube-data-api",
            });
          if (
            !evidence.some((e) => e.kind === "title") &&
            typeof snippet?.title === "string"
          )
            evidence.push({
              kind: "title",
              text: snippet.title.slice(0, 2000),
              origin: "youtube-data-api",
            });
        } catch {
          warnings.push(
            "The configured YouTube description service was unavailable.",
          );
        }
      }
      // Operator-provided authorized transcript service. No platform scraping or hidden access.
      if (env.AUTHORIZED_TRANSCRIPT_ENDPOINT) {
        try {
          const endpoint = new URL(env.AUTHORIZED_TRANSCRIPT_ENDPOINT);
          if (endpoint.protocol !== "https:") throw new Error("HTTPS required");
          const headers = { "Content-Type": "application/json" };
          if (env.TRANSCRIPT_SERVICE_TOKEN)
            headers.Authorization = "Bearer " + env.TRANSCRIPT_SERVICE_TOKEN;
          const reply = await fetcher(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({ url: link.url, provider: link.provider }),
            signal: AbortSignal.timeout(8000),
            redirect: "error",
          });
          if (!reply.ok) throw new Error("Transcript unavailable");
          const transcript = await reply.json();
          if (
            transcript.authorized !== true ||
            typeof transcript.text !== "string" ||
            !transcript.text.trim()
          )
            throw new Error("No authorized transcript");
          evidence.push({
            kind: "transcript",
            text: transcript.text.slice(0, 16000),
            origin: "authorized-transcript-service",
          });
        } catch {
          warnings.push(
            "No authorized transcript was available from the configured service.",
          );
        }
      }
      if (input.text?.trim())
        evidence.push({
          kind: input.textKind || "manual",
          text: input.text.trim().slice(0, 16000),
          origin: "user-supplied",
        });
      if (!evidence.some((e) => e.kind === "transcript"))
        warnings.push(
          "No transcript was retrieved. We have not watched or transcribed this video.",
        );
      let result = ingestion.buildResult(
        link,
        evidence,
        warnings,
        catalog,
        discovery,
      );
      if (analyze && evidence.length) {
        try {
          const output = await Promise.race([
            analyze({
              evidence,
              hobbies: catalog.hobbies,
              materialNames: Object.values(catalog.materials).map(
                (m) => m.name,
              ),
            }),
            new Promise((_, reject) => {
              const timer = setTimeout(
                () => reject(new Error("Timeout")),
                10000,
              );
              timer.unref?.();
            }),
          ]);
          if (!validateAnalysis(output, evidence))
            throw new Error("Unverified analyzer output");
          const query = output.hobbyIds
            .map((id) => catalog.hobbies[id].synonyms[0])
            .join(" ");
          const semanticMatches = query
            ? discovery
                .search("projects", query, {})
                .slice(0, 4)
                .map(({ item }) => ({ slug: item.slug, title: item.title }))
            : result.matches;
          const withSource = (entry) => ({
            ...entry,
            sourceKind:
              evidence.find((e) => e.text.includes(entry.evidence))?.kind ||
              "manual",
          });
          result = {
            ...result,
            method: "configured-semantic-adapter",
            matches: semanticMatches,
            confidence: semanticMatches.length
              ? "suggested-match"
              : "unresolved",
            requirements: output.requirements
              .filter((m) => m.provenance === "extracted")
              .map(withSource),
            steps: output.steps
              .filter((s) => s.provenance === "extracted")
              .map(withSource),
            suggestions: {
              requirements: output.requirements.filter(
                (m) => m.provenance === "inferred",
              ),
              steps: output.steps.filter((s) => s.provenance === "inferred"),
            },
          };
        } catch {
          result.warnings.push(
            "The optional semantic analyzer did not return valid, source-supported output. Using curated matching.",
          );
        }
      }
      return send(200, result);
    } catch {
      return send(500, {
        error:
          "Analysis is temporarily unavailable. Try a short description in the static site.",
      });
    }
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  let analyze = null;
  if (process.env.ANALYZER_MODULE) {
    const adapter = await import(
      pathToFileURL(process.env.ANALYZER_MODULE).href
    );
    if (typeof adapter.analyze !== "function")
      throw new Error("ANALYZER_MODULE must export analyze");
    analyze = adapter.analyze;
  }
  const port = Number(process.env.PORT || 4174);
  const server = createService({ analyze });
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  server.listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log("Optional ingestion service listening on port", port),
  );
}
