import { leadSchema, type Lead } from "@/lib/lead-schema";

/**
 * Receives landing-page leads and forwards them to every destination that
 * is configured via env variables:
 *
 *   Email (Resend)   RESEND_API_KEY + LEAD_EMAIL_TO (+ LEAD_EMAIL_FROM)
 *   Zoho CRM         ZOHO_WEBHOOK_URL
 *   Google Sheet     GOOGLE_SHEET_WEBHOOK_URL (+ GOOGLE_SHEET_SECRET)
 *
 * The request succeeds if at least one destination accepted the lead.
 */

interface LeadRecord extends Omit<Lead, "website"> {
  phoneE164: string;
  submittedAt: string;
  pageUrl: string | null;
  userAgent: string | null;
}

/* --------------------------------------------------------- rate limiting */
// Best-effort, per serverless instance. Stops accidental double-submits and
// simple floods; use a shared store (e.g. Upstash) if abuse becomes real.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/* ---------------------------------------------------------- destinations */

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function leadRows(lead: LeadRecord): [string, string][] {
  return [
    ["Name", lead.name],
    ["Phone", lead.phoneE164],
    ["Treatment", lead.treatment],
    ["Submitted", lead.submittedAt],
    ["Page", lead.pageUrl ?? "—"],
    ...Object.entries(lead.tracking ?? {}),
  ];
}

async function sendEmail(lead: LeadRecord): Promise<void> {
  const to = process.env.LEAD_EMAIL_TO!.split(",").map((s) => s.trim()).filter(Boolean);
  const rows = leadRows(lead);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_EMAIL_FROM ?? "AmiCare Leads <onboarding@resend.dev>",
      to,
      subject: `New lead: ${lead.name} — ${lead.treatment}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `<h2>New landing-page lead</h2><table cellpadding="6">${rows
        .map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`)
        .join("")}</table>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function postJson(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
    redirect: "follow", // Google Apps Script web apps answer with a 302
  });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
}

function destinations(lead: LeadRecord) {
  const env = process.env;
  const list: { name: string; send: () => Promise<void> }[] = [];
  if (env.RESEND_API_KEY && env.LEAD_EMAIL_TO) list.push({ name: "email", send: () => sendEmail(lead) });
  if (env.ZOHO_WEBHOOK_URL)
    list.push({
      name: "zoho",
      // Zoho Flow / CRM webhook URLs carry their own key in the URL.
      send: () =>
        postJson(env.ZOHO_WEBHOOK_URL!, {
          Last_Name: lead.name,
          Mobile: lead.phoneE164,
          Description: `Treatment: ${lead.treatment}`,
          Lead_Source: lead.tracking?.utm_source ?? "Landing Page",
          ...lead,
        }),
    });
  if (env.GOOGLE_SHEET_WEBHOOK_URL)
    list.push({
      name: "sheet",
      send: () => postJson(env.GOOGLE_SHEET_WEBHOOK_URL!, { ...lead, secret: env.GOOGLE_SHEET_SECRET ?? "" }),
    });
  return list;
}

/* ----------------------------------------------------------------- route */

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many requests. Please call us directly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 422 },
    );
  }

  const { website, ...data } = parsed.data;
  // Honeypot filled → bot. Pretend success so it doesn't retry.
  if (website) return Response.json({ ok: true });

  const lead: LeadRecord = {
    ...data,
    phoneE164: `+91${data.phone}`,
    submittedAt: new Date().toISOString(),
    pageUrl: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
  };

  const targets = destinations(lead);
  if (targets.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[lead] No destination configured — lead logged only:", lead);
      return Response.json({ ok: true });
    }
    console.error("[lead] No lead destination configured. Set RESEND_*, ZOHO_* or GOOGLE_SHEET_* env vars.", lead);
    return Response.json({ error: "We couldn't submit your request. Please call us." }, { status: 500 });
  }

  const results = await Promise.allSettled(targets.map((t) => t.send()));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[lead] ${targets[i].name} failed:`, r.reason);
  });

  if (!results.some((r) => r.status === "fulfilled")) {
    return Response.json({ error: "We couldn't submit your request. Please call us." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
