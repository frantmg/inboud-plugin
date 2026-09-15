#!/usr/bin/env node
/**
 * Files a prepared payload over `POST /api/inbound/communication`.
 *
 * The fallback for when the MCP connector is not configured. It speaks the
 * same schema, gets the same attribution and the same dedupe — but it cannot
 * read the catalog, so nothing it files can be matched to a service and every
 * suggestion needs a team of its own.
 *
 * Nothing it files becomes work: suggestions are proposals in a review queue
 * until a person accepts them, and no payload here can reach ClickUp.
 *
 *   MACALLAN_URL=https://app.example.com \
 *   INBOUND_API_TOKEN=… \
 *   node scripts/file-communication.mjs payload.json [--dry-run]
 *
 * Reads stdin when the path is `-` or omitted.
 */

const CHANNELS = ["sms", "email", "fathom", "note"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const path = args.find((a) => !a.startsWith("--")) ?? "-";

function die(message) {
  console.error(message);
  process.exit(1);
}

async function readInput() {
  if (path === "-") {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8");
  }
  const { readFile } = await import("node:fs/promises");
  return readFile(path, "utf8");
}

/**
 * The checks worth making before a round trip — not a copy of the server's
 * schema, which stays the authority. These are the four mistakes that cost a
 * re-file: a missing dedupe key, a naive timestamp, an unmatched suggestion
 * with nowhere to go, and a suggestion nobody can check against the transcript.
 */
function lint(payload) {
  const problems = [];
  const warnings = [];

  if (!CHANNELS.includes(payload.channel)) {
    problems.push(`channel must be one of ${CHANNELS.join(", ")}`);
  }
  if (!payload.externalThreadId) {
    warnings.push("no externalThreadId — every reply to this thread will file as a separate record");
  }
  if (payload.occurredAt && !/[+-]\d{2}:\d{2}$|Z$/.test(payload.occurredAt)) {
    problems.push("occurredAt needs an ISO 8601 offset, e.g. 2026-09-12T14:05:00-04:00");
  }
  if (!payload.occurredAt) {
    warnings.push("no occurredAt — the platform will stamp it now, which is wrong for anything forwarded");
  }

  if (!payload.clientId && !payload.clientName) {
    problems.push("no clientId or clientName — everything filed carries a verified client");
  }
  // There is no owner column anywhere in the schema, so the owner rides along
  // as a participant. Nothing in the database enforces this, which is why it
  // is enforced here.
  const owners = (payload.participants ?? []).filter((p) => p.role === "owner");
  if (owners.length !== 1) {
    problems.push(
      owners.length === 0
        ? 'no participant with role "owner" — every comm and ticket carries the Macallan person accountable for it'
        : `${owners.length} participants with role "owner" — there is exactly one`,
    );
  }

  for (const [i, s] of (payload.suggestions ?? []).entries()) {
    const at = `suggestions[${i}]${s.title ? ` "${s.title}"` : ""}`;
    if (!s.title) problems.push(`${at}: title is required`);

    const matched = Boolean(s.serviceKey && s.stepKey);
    if (Boolean(s.serviceKey) !== Boolean(s.stepKey)) {
      problems.push(`${at}: serviceKey and stepKey go together — one alone names nothing and is dropped`);
    }
    // Over this route there is no catalog to match against, so a key here is
    // almost certainly stale or invented; the ingest would demote it to
    // unmatched and it would then have no team.
    if (matched) {
      warnings.push(`${at}: filed with catalog keys over the HTTP route — verify they are live, or the suggestion lands unmatched with no team`);
    }
    if (!matched && !s.team) {
      problems.push(`${at}: an unmatched suggestion needs a team NAME — without one it blocks the whole tray in the queue`);
    }
    if (!s.sourceExcerpt) {
      warnings.push(`${at}: no sourceExcerpt — a reviewer has nothing to check this against`);
    }
  }

  return { problems, warnings };
}

const raw = await readInput();
let payload;
try {
  payload = JSON.parse(raw);
} catch (err) {
  die(`Could not parse ${path === "-" ? "stdin" : path} as JSON: ${err.message}`);
}

const { problems, warnings } = lint(payload);
for (const w of warnings) console.error(`warning: ${w}`);
if (problems.length > 0) {
  for (const p of problems) console.error(`error: ${p}`);
  process.exit(1);
}

const counts = {
  channel: payload.channel,
  participants: (payload.participants ?? []).length,
  transcriptChars: (payload.transcript ?? "").length,
  suggestions: (payload.suggestions ?? []).length,
  matched: (payload.suggestions ?? []).filter((s) => s.serviceKey && s.stepKey).length,
};

if (dryRun) {
  // Counts, never content: this output is the kind of thing that ends up in a
  // CI log, and the transcript is client health-care conversation.
  console.log("ok, not sent:", JSON.stringify(counts));
  process.exit(0);
}

const base = process.env.MACALLAN_URL?.replace(/\/$/, "");
const token = process.env.INBOUND_API_TOKEN;
if (!base) die("MACALLAN_URL is not set.");
if (!token) die("INBOUND_API_TOKEN is not set.");

const response = await fetch(`${base}/api/inbound/communication`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  // The route answers with field paths and rule names, never values.
  die(`Refused (${response.status}): ${JSON.stringify(body)}`);
}

console.log(JSON.stringify(body, null, 2));
console.log(
  body.filedToProjectId
    ? "\nFiled onto a project without queueing."
    : "\nWaiting at /inbound. Nothing is work until somebody accepts it — no tasks, no ClickUp.",
);
