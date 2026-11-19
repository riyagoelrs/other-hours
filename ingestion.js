/* Permitted metadata and user-supplied text only. No video downloading or scraping. */
"use strict";
const OH_INGESTION = (() => {
  const HOSTS = {
    youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
    tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],
    instagram: ["instagram.com", "www.instagram.com"],
    pinterest: ["pinterest.com", "www.pinterest.com", "pin.it"],
  };
  function identify(raw) {
    let url;
    try {
      url = new URL(
        raw.trim().startsWith("www.") ? "https://" + raw.trim() : raw.trim(),
      );
    } catch {
      return null;
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      raw.length > 2048
    )
      return null;
    const provider = Object.keys(HOSTS).find((key) =>
      HOSTS[key].includes(url.hostname.toLowerCase()),
    );
    if (!provider || (url.pathname === "/" && !url.search)) return null;
    if (provider === "youtube") {
      const id =
        url.hostname === "youtu.be"
          ? url.pathname.slice(1)
          : url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
      if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
      return {
        provider,
        url: `https://www.youtube.com/watch?v=${id}`,
        videoId: id,
      };
    }
    // Remove tracking parameters, preserve only the public content URL.
    url.hash = "";
    url.search = "";
    return { provider, url: url.href };
  }
  async function metadata(link, options = {}) {
    const endpoints = {
      youtube: "https://www.youtube.com/oembed?format=json&url=",
      tiktok: "https://www.tiktok.com/oembed?url=",
    };
    const endpoint = endpoints[link.provider];
    if (!endpoint)
      return {
        evidence: [],
        warnings: [
          `${link.provider === "instagram" ? "Instagram" : "Pinterest"} public text is not available through this static app. Paste a caption or your description.`,
        ],
      };
    try {
      const response = await (options.fetcher || fetch)(
        endpoint + encodeURIComponent(link.url),
        {
          signal: AbortSignal.timeout(options.timeout || 5000),
          headers: { Accept: "application/json" },
          credentials: "omit",
          redirect: "error",
        },
      );
      if (!response.ok) throw new Error("Metadata unavailable");
      const info = await response.json();
      const evidence = [];
      if (typeof info.title === "string" && info.title.trim())
        evidence.push({
          kind: "title",
          text: info.title.trim().slice(0, 2000),
          origin: "public-oembed",
        });
      if (typeof info.description === "string" && info.description.trim())
        evidence.push({
          kind: "description",
          text: info.description.trim().slice(0, 8000),
          origin: "public-oembed",
        });
      return {
        evidence,
        warnings: evidence.length
          ? []
          : [
              "The public metadata did not include a usable title or description.",
            ],
      };
    } catch {
      return {
        evidence: [],
        warnings: [
          "Public metadata could not be retrieved. The platform may restrict browser access. Paste a caption or description to continue.",
        ],
      };
    }
  }
  const materialTerms = [
    ["leather", /\b(?:leather(?: remnant| scrap)?|leatherette)\b/i],
    ["paper", /\b(?:paper|cardstock|card stock)\b/i],
    [
      "thread",
      /\b(?:waxed linen thread|linen thread|cotton thread|thread|floss)\b/i,
    ],
    ["needle", /\b(?:tapestry needle|bookbinding needle|needle)\b/i],
    ["awl", /\b(?:awl|piercing tool)\b/i],
    ["fabric", /\b(?:cotton fabric|canvas|denim|fabric|cloth)\b/i],
    ["yarn", /\b(?:cotton yarn|wool yarn|yarn)\b/i],
    ["crochet hook", /\b(?:crochet hook|hook)\b/i],
    ["scissors", /\b(?:fabric scissors|scissors)\b/i],
    ["sewing machine", /\bsewing machine\b/i],
    ["clay", /\b(?:air[- ]dry clay|clay)\b/i],
    ["paint", /\b(?:watercolor paint|gouache|acrylic paint|paint)\b/i],
    ["beads", /\bbeads?\b/i],
    ["glue", /\b(?:craft glue|glue stick|glue)\b/i],
    ["seeds", /\b(?:herb seeds|seeds)\b/i],
    ["potting mix", /\bpotting (?:mix|soil)\b/i],
    ["film", /\b35\s?mm film\b/i],
  ];
  function extract(evidence) {
    // Titles can identify an interest; only descriptions/transcripts can support a supply extraction.
    const body = evidence.filter((e) => e.kind !== "title");
    const requirements = [];
    for (const [name, pattern] of materialTerms) {
      const entry = body.find((e) => pattern.test(e.text));
      if (!entry) continue;
      const match = entry.text.match(pattern);
      const preceding = entry.text.slice(
        Math.max(0, match.index - 32),
        match.index,
      );
      const quantity =
        preceding.match(
          /(\d+(?:[.,]\d+)?\s*(?:sheets?(?: of)?|m(?:et(?:er|re)s?)?(?: of)?|cm(?: of)?|yards?(?: of)?|g(?:rams?)?(?: of)?|pieces?(?: of)?)?)\s*$/i,
        )?.[1] || null;
      requirements.push({
        name: match[0].trim(),
        quantity,
        provenance: "extracted",
        sourceKind: entry.kind,
        evidence: entry.text.slice(
          Math.max(0, match.index - 45),
          Math.min(entry.text.length, match.index + match[0].length + 80),
        ),
      });
    }
    const steps = body
      .flatMap((e) =>
        e.text
          .split(/[\n.!?]+/)
          .map((s) => s.trim())
          .filter((s) =>
            /^(?:\d+[).:]?\s*)?(?:cut|fold|sew|stitch|bind|glue|mix|thread|cast|knit|crochet|plant|water|press|paint|carve|attach)\b/i.test(
              s,
            ),
          )
          .map((text) => ({
            text: text.slice(0, 500),
            provenance: "extracted",
            sourceKind: e.kind,
          })),
      )
      .slice(0, 12);
    return { requirements, steps };
  }
  function buildResult(link, evidence, warnings, data, discovery) {
    const text = evidence.map((e) => e.text).join(" ");
    const matches = text.trim()
      ? discovery
          .search("projects", text, {})
          .slice(0, 4)
          .map(({ item }) => ({ slug: item.slug, title: item.title }))
      : [];
    const extracted = extract(evidence);
    return {
      schemaVersion: 1,
      sourceUrl: link.url,
      provider: link.provider,
      evidence,
      warnings,
      ...extracted,
      matches,
      confidence: !matches.length
        ? "unresolved"
        : evidence.some((e) =>
              [
                "transcript",
                "description",
                "manual",
                "document",
                "ocr",
              ].includes(e.kind),
            )
          ? "suggested-match"
          : "title-only",
      transcriptStatus: evidence.some((e) => e.kind === "transcript")
        ? "user-or-authorized-transcript"
        : "not-retrieved",
      method: "curated-matching",
      disclosure:
        "Matched guides are editorial starting points. Suggested supplies are not an exact reconstruction of the video.",
      createdAt: new Date().toISOString(),
    };
  }
  function fromUploads(
    { attachments, query = "", description = "", textKind = "manual" },
    options,
    baseResult = null,
  ) {
    const evidence = baseResult ? [...baseResult.evidence] : [];
    if (!baseResult && query.trim())
      evidence.push({
        kind: "manual",
        text: query.trim().slice(0, 16000),
        origin: "user-supplied",
      });
    if (!baseResult && description.trim())
      evidence.push({
        kind: ["description", "transcript"].includes(textKind)
          ? textKind
          : "manual",
        text: description.trim().slice(0, 16000),
        origin: "user-supplied",
      });
    for (const file of attachments)
      if (file.kind === "text" && file.text?.trim())
        evidence.push({
          kind: "document",
          text: file.text.trim().slice(0, 16000),
          origin: "user-upload",
          fileName: file.name,
        });
    for (const file of attachments)
      if (
        file.kind === "image" &&
        typeof file.ocrText === "string" &&
        file.ocrText.trim()
      )
        evidence.push({
          kind: "ocr",
          text: file.ocrText.trim().slice(0, 16000),
          origin: "on-device-ocr",
          fileName: file.name,
        });
    const warnings = baseResult ? [...baseResult.warnings] : [];
    if (attachments.some((file) => file.ocrText))
      warnings.push(
        "Screenshot text was recognized on this device and may contain errors. Review the text and any quantities before using it.",
      );
    if (attachments.some((f) => f.kind !== "text"))
      warnings.push(
        "Image objects and video contents have not been analyzed; PDF visual contents have not been analyzed. Matches can use your description, uploaded text or recognized screenshot text.",
      );
    if (attachments.some((f) => f.textTruncated))
      warnings.push(
        "Only the first 16,000 characters of each text file were used for matching. The original file is kept when you save the plan.",
      );
    const result = buildResult(
      {
        url: baseResult?.sourceUrl || "",
        provider: baseResult?.provider || "uploads",
      },
      evidence,
      warnings,
      options.data,
      options.discovery,
    );
    return {
      ...result,
      sourceType: baseResult ? "link-and-files" : "files",
      attachments: attachments.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        kind: f.kind,
        lastModified: f.lastModified || 0,
      })),
      disclosure:
        "Matches use your notes, readable text files or recognized screenshot text. Recognized text may contain errors; pictured objects and video are not interpreted. Original files save only on this device.",
    };
  }
  async function ingest(input, options) {
    const link = identify(input.url);
    if (!link)
      throw new Error(
        "Use an HTTPS YouTube, TikTok, Instagram or Pinterest content link.",
      );
    let remote = { evidence: [], warnings: [] };
    if (options.endpoint) {
      try {
        const response = await (options.fetcher || fetch)(options.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: link.url,
            text: input.text || "",
            textKind: input.textKind || "manual",
          }),
          signal: AbortSignal.timeout(15000),
          credentials: "omit",
        });
        if (!response.ok) throw new Error("Service unavailable");
        const result = await response.json();
        if (
          validResult(result, options.data) &&
          result.sourceUrl === link.url &&
          result.provider === link.provider
        )
          return result;
        throw new Error("Invalid service response");
      } catch {
        remote.warnings.push(
          "The optional analysis service is unavailable. Continuing with public metadata and your text.",
        );
      }
    }
    const publicInfo = await metadata(link, options);
    remote.evidence.push(...publicInfo.evidence);
    remote.warnings.push(...publicInfo.warnings);
    if (input.text?.trim())
      remote.evidence.push({
        kind: ["description", "transcript"].includes(input.textKind)
          ? input.textKind
          : "manual",
        text: input.text.trim().slice(0, 16000),
        origin: "user-supplied",
      });
    if (!remote.evidence.some((e) => e.kind === "transcript"))
      remote.warnings.push(
        "No transcript was retrieved. We have not watched or transcribed this video.",
      );
    return buildResult(
      link,
      remote.evidence,
      remote.warnings,
      options.data,
      options.discovery,
    );
  }
  function validResult(result, data) {
    if (
      !result ||
      result.schemaVersion !== 1 ||
      typeof result.sourceUrl !== "string" ||
      !identify(result.sourceUrl) ||
      !Object.keys(HOSTS).includes(result.provider)
    )
      return false;
    if (
      !["unresolved", "suggested-match", "title-only"].includes(
        result.confidence,
      ) ||
      !["not-retrieved", "user-or-authorized-transcript"].includes(
        result.transcriptStatus,
      ) ||
      typeof result.disclosure !== "string" ||
      result.disclosure.length > 2000
    )
      return false;
    if (
      !Array.isArray(result.evidence) ||
      result.evidence.length > 12 ||
      !result.evidence.every(
        (e) =>
          e &&
          ["title", "description", "transcript", "manual"].includes(e.kind) &&
          typeof e.text === "string" &&
          e.text.length <= 16000 &&
          [
            "public-oembed",
            "youtube-data-api",
            "authorized-transcript-service",
            "user-supplied",
          ].includes(e.origin),
      )
    )
      return false;
    const hasTranscript = result.evidence.some((e) => e.kind === "transcript");
    if ((result.transcriptStatus === "not-retrieved") === hasTranscript)
      return false;
    const supported = (value, field) => {
      if (
        !value ||
        typeof value[field] !== "string" ||
        !value[field].trim() ||
        value[field].length > 1000 ||
        value.provenance !== "extracted"
      )
        return false;
      const excerpt =
        typeof value.evidence === "string" ? value.evidence : value[field];
      return (
        excerpt.toLowerCase().includes(value[field].toLowerCase()) &&
        result.evidence.some(
          (e) => e.kind !== "title" && e.text.includes(excerpt),
        )
      );
    };
    if (
      !Array.isArray(result.matches) ||
      result.matches.length > 8 ||
      !result.matches.every(
        (m) => m && data.projects.some((p) => p.slug === m.slug),
      )
    )
      return false;
    if (
      !Array.isArray(result.requirements) ||
      result.requirements.length > 80 ||
      !result.requirements.every(
        (m) =>
          supported(m, "name") &&
          m.name.length <= 200 &&
          (!m.quantity ||
            (typeof m.quantity === "string" && m.quantity.length <= 100)),
      )
    )
      return false;
    if (
      !Array.isArray(result.steps) ||
      result.steps.length > 30 ||
      !result.steps.every((s) => supported(s, "text"))
    )
      return false;
    if (
      !Array.isArray(result.warnings) ||
      result.warnings.length > 20 ||
      !result.warnings.every((s) => typeof s === "string" && s.length <= 1000)
    )
      return false;
    if (
      result.suggestions &&
      !["requirements", "steps"].every(
        (field) =>
          Array.isArray(result.suggestions[field]) &&
          result.suggestions[field].length <= 60 &&
          result.suggestions[field].every(
            (v) =>
              v &&
              v.provenance === "inferred" &&
              typeof (v.name || v.text) === "string" &&
              (v.name || v.text).length <= 500,
          ),
      )
    )
      return false;
    return true;
  }
  return {
    identify,
    metadata,
    extract,
    buildResult,
    fromUploads,
    ingest,
    validResult,
  };
})();
if (typeof module !== "undefined" && module.exports)
  module.exports = OH_INGESTION;
