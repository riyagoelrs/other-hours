import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createService, validateAnalysis } from "../service/server.mjs";
async function withService(options, fn) {
  const server = createService(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn("http://127.0.0.1:" + server.address().port);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
const titleFetch = async () =>
  new Response(JSON.stringify({ title: "Sew a canvas tote bag" }), {
    status: 200,
  });
const post = (base, body, origin = "http://localhost:4173") =>
  fetch(base + "/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
test("service accepts metadata and applies CORS without leaking secrets", async () => {
  await withService({ fetcher: titleFetch, env: {} }, async (base) => {
    const reply = await post(base, { url: "https://youtu.be/dQw4w9WgXcQ" }),
      result = await reply.json();
    assert.equal(reply.status, 200);
    assert.equal(
      reply.headers.get("access-control-allow-origin"),
      "http://localhost:4173",
    );
    assert.ok(result.matches.some((m) => m.slug === "sewn-tote"));
    assert.equal(result.transcriptStatus, "not-retrieved");
  });
});
test("service rejects SSRF, disallowed origins, malformed and oversized input before fetching", async () => {
  let calls = 0;
  await withService(
    {
      fetcher: async () => {
        calls++;
        return titleFetch();
      },
      env: {},
    },
    async (base) => {
      assert.equal(
        (await post(base, { url: "https://127.0.0.1/private" })).status,
        400,
      );
      assert.equal(
        (
          await post(
            base,
            { url: "https://youtu.be/dQw4w9WgXcQ" },
            "https://untrusted.test",
          )
        ).status,
        403,
      );
      assert.equal(
        (await post(base, { url: "https://youtu.be/dQw4w9WgXcQ", text: 123 }))
          .status,
        400,
      );
      assert.equal(
        (
          await post(base, {
            url: "https://youtu.be/dQw4w9WgXcQ",
            text: "x".repeat(70000),
          })
        ).status,
        413,
      );
      assert.equal(calls, 0);
    },
  );
});
test("authorized transcript adapter requires an authorization assertion", async () => {
  await withService(
    {
      env: {
        AUTHORIZED_TRANSCRIPT_ENDPOINT:
          "https://transcripts.example.test/content",
        TRANSCRIPT_SERVICE_TOKEN: "test-secret",
      },
      fetcher: async (url, options) => {
        if (String(url).startsWith("https://transcripts.example.test/")) {
          assert.equal(options.headers.Authorization, "Bearer test-secret");
          return new Response(
            JSON.stringify({
              authorized: true,
              text: "Make a leather journal. Fold 20 sheets of paper. Sew with thread.",
            }),
          );
        }
        return new Response("{}", { status: 404 });
      },
    },
    async (base) => {
      const result = await (
        await post(base, { url: "https://youtu.be/dQw4w9WgXcQ" })
      ).json();
      assert.ok(
        result.evidence.some(
          (e) => e.origin === "authorized-transcript-service",
        ),
      );
      assert.ok(result.matches.some((m) => m.slug === "leather-journal"));
      assert.ok(!JSON.stringify(result).includes("test-secret"));
    },
  );
});
test("semantic output distinguishes facts from inferences and rejects unsupported claims", () => {
  const evidence = [{ kind: "description", text: "Use paper and thread." }];
  assert.ok(
    validateAnalysis(
      {
        hobbyIds: ["bookbinding"],
        requirements: [
          {
            name: "paper",
            provenance: "extracted",
            evidence: "Use paper and thread.",
          },
          { name: "awl", provenance: "inferred" },
        ],
        steps: [],
      },
      evidence,
    ),
  );
  assert.equal(
    validateAnalysis(
      {
        hobbyIds: ["bookbinding"],
        requirements: [
          {
            name: "leather",
            provenance: "extracted",
            evidence: "Use paper and thread.",
          },
        ],
        steps: [],
      },
      evidence,
    ),
    false,
  );
  assert.equal(
    validateAnalysis(
      { hobbyIds: ["fake-hobby"], requirements: [], steps: [] },
      evidence,
    ),
    false,
  );
});
test("invalid analyzer output keeps the metadata fallback", async () => {
  await withService(
    { fetcher: titleFetch, analyze: async () => ({ madeUp: true }), env: {} },
    async (base) => {
      const result = await (
        await post(base, { url: "https://youtu.be/dQw4w9WgXcQ" })
      ).json();
      assert.equal(result.method, "curated-matching");
      assert.ok(result.matches.length);
      assert.ok(result.warnings.some((w) => w.includes("semantic analyzer")));
    },
  );
});
test("service enforces a per-process request limit", async () => {
  await withService(
    { fetcher: titleFetch, env: { RATE_LIMIT_PER_MINUTE: "1" } },
    async (base) => {
      assert.equal(
        (await post(base, { url: "https://youtu.be/dQw4w9WgXcQ" })).status,
        200,
      );
      assert.equal(
        (await post(base, { url: "https://youtu.be/dQw4w9WgXcQ" })).status,
        429,
      );
    },
  );
});
test("valid semantic adapter keeps extracted and inferred requirements separate", async () => {
  await withService(
    {
      fetcher: titleFetch,
      env: {},
      analyze: async () => ({
        hobbyIds: ["bookbinding"],
        requirements: [
          {
            name: "paper",
            quantity: null,
            provenance: "extracted",
            evidence: "Use paper and thread.",
          },
          { name: "awl", quantity: null, provenance: "inferred" },
        ],
        steps: [],
      }),
    },
    async (base) => {
      const result = await (
        await post(base, {
          url: "https://youtu.be/dQw4w9WgXcQ",
          text: "Use paper and thread.",
          textKind: "description",
        })
      ).json();
      assert.equal(result.method, "configured-semantic-adapter");
      assert.equal(result.requirements[0].name, "paper");
      assert.equal(result.suggestions.requirements[0].name, "awl");
      assert.equal(result.requirements[0].sourceKind, "description");
    },
  );
});
