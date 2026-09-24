import { parse, type HTMLElement } from "node-html-parser";
import { decode } from "html-entities";
import type {
  Article,
  ContactInfo,
  Doctor,
  HeroContent,
  ImageData,
  Reason,
  Stat,
  TrustContent,
  WPMedia,
  WPPost,
} from "@/types/wordpress";
import { sanitizeWpHtml, toPlainText } from "./sanitize";
import { LEAD_DOCTOR_MATCH } from "./site-config";

/**
 * Pulls structured data out of the Elementor-rendered HTML that the WP REST
 * API returns in `content.rendered`. Every function returns `null`/`[]` when
 * the markup it expects isn't there, so the caller can fall back.
 */

const text = (el: HTMLElement | null | undefined) => toPlainText(el?.innerHTML);

const SMALL_WORDS = new Set(["a", "an", "and", "at", "for", "in", "of", "on", "or", "the", "to", "by", "with"]);

/** "spine surgery in ghaziabad" → "Spine Surgery in Ghaziabad" (never lowercases). */
export function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Removes SEO suffixes like " – Best Hospital of Ghaziabad | Amicare Hospital". */
export function cleanPageTitle(raw: string, { stripLocation = false } = {}): string {
  let t = toPlainText(raw)
    .split(/\s+\|\s+/)[0]
    .split(/\s*[–—-]\s*(?=(?:best|near|amicare|expert)\b)/i)[0]
    .trim();
  if (stripLocation) t = t.replace(/\s+in\s+(ghaziabad|indirapuram|delhi ncr)$/i, "");
  return titleCase(t);
}

function imgToData(img: HTMLElement | null): ImageData | null {
  const src = img?.getAttribute("src");
  if (!img || !src) return null;
  return {
    src,
    alt: decode(img.getAttribute("alt") ?? ""),
    width: Number(img.getAttribute("width")) || 600,
    height: Number(img.getAttribute("height")) || 600,
  };
}

export function mediaToImage(m: WPMedia | null | undefined, preferred = ["large", "full"]): ImageData | null {
  if (!m?.source_url) return null;
  const sizes = m.media_details?.sizes ?? {};
  for (const key of preferred) {
    const s = sizes[key];
    if (s?.source_url) return { src: s.source_url, alt: m.alt_text ?? "", width: s.width, height: s.height };
  }
  return {
    src: m.source_url,
    alt: m.alt_text ?? "",
    width: m.media_details?.width ?? 1200,
    height: m.media_details?.height ?? 800,
  };
}

/* ------------------------------------------------------------------ hero */

export function extractHero(homeHtml: string): Omit<HeroContent, "image" | "badges"> | null {
  const root = parse(homeHtml);
  const scope = root.querySelector(".amicare-hero") ?? root;
  const title = text(scope.querySelector("h1"));
  if (!title) return null;
  return {
    eyebrow: text(scope.querySelector(".hero-tagline")),
    title,
    subtitle: text(scope.querySelector("h2")),
    description: text(scope.querySelector("p")),
  };
}

/** "Over 1500+ robotic joint replacements…" → { 1500+, Robotic Joint Replacements } */
export function extractRoboticBadge(description: string): Stat | null {
  const m = description.match(/(\d[\d,]*\+)\s+(robotic joint replacements?)/i);
  return m ? { value: m[1], label: titleCase(m[2].toLowerCase()) } : null;
}

/** "10+ Years of Experience" heading on the About page. */
export function extractExperienceBadge(aboutHtml: string): Stat | null {
  const m = toPlainText(aboutHtml).match(/(\d+\+)\s*Years?\s+of\s+Experience/i);
  return m ? { value: m[1], label: "Years Experience" } : null;
}

/* -------------------------------------------------------------- counters */

export function extractCounters(html: string): Stat[] {
  return html
    .split("pxl--counter-value")
    .slice(1)
    .map((chunk) => {
      const value = chunk.match(/data-to-value="([^"]*)"/)?.[1];
      const suffix = chunk.match(/counter-suffix">([^<]*)/)?.[1] ?? "";
      const label = toPlainText(chunk.match(/(?:item-title|counter--title)[^>]*>([^<]*)/)?.[1]);
      return value && label ? { value: `${Number(value).toLocaleString("en-IN")}${suffix.trim()}`, label } : null;
    })
    .filter((s): s is Stat => s !== null);
}

/* --------------------------------------------------------------- doctors */

export function extractDoctors(aboutHtml: string): Doctor[] {
  const root = parse(aboutHtml);
  const seen = new Set<string>();
  const doctors: Doctor[] = [];
  for (const item of root.querySelectorAll(".pxl-team-grid .pxl-grid-item")) {
    const name = text(item.querySelector(".pxl-item--title")).replace(/^Dr\.?\s*/i, "Dr. ");
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const photo = imgToData(item.querySelector("img"));
    doctors.push({
      name,
      designation: text(item.querySelector(".pxl-item--position")).replace(/\(Physician0$/, "(Physician)"),
      photo: photo ? { ...photo, alt: name } : null,
      profileUrl: item.querySelector(".pxl-item--title a")?.getAttribute("href") ?? null,
    });
  }
  return sortDoctors(doctors);
}

/** Lead doctor (Dr. Himanshu Gupta) first; everyone else keeps WP order. */
export function sortDoctors(doctors: Doctor[]): Doctor[] {
  return [...doctors].sort(
    (a, b) => Number(LEAD_DOCTOR_MATCH.test(b.name)) - Number(LEAD_DOCTOR_MATCH.test(a.name)),
  );
}

/* ------------------------------------------------------ sections / intros */

/**
 * Returns the sanitised HTML between the heading matching `heading` and the
 * next heading. Works on Elementor output, where headings and their
 * paragraphs are not siblings.
 */
export function extractSection(html: string, heading: RegExp): { heading: string; html: string } | null {
  const parts = html.split(/(?=<h[1-4][\s>])/i);
  for (const part of parts) {
    const m = part.match(/^<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
    if (!m) continue;
    const title = toPlainText(m[1]);
    if (!heading.test(title)) continue;
    const body = sanitizeWpHtml(part.slice(m[0].length));
    return body ? { heading: title, html: body } : null;
  }
  return null;
}

/** First two substantial paragraphs of a treatment page. */
export function extractIntro(html: string): string {
  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => m[1])
    .filter((p) => toPlainText(p).length > 80)
    .slice(0, 2);
  return sanitizeWpHtml(paras.map((p) => `<p>${p}</p>`).join(""));
}

/** First short bullet list on the page (3–10 items), as plain strings. */
export function extractHighlights(html: string, max = 5): string[] {
  const root = parse(html);
  for (const ul of root.querySelectorAll("ul")) {
    const items = ul.querySelectorAll("li").map(text).filter(Boolean);
    if (items.length >= 3 && items.length <= 10 && items.every((t) => t.length < 110)) {
      return items.slice(0, max);
    }
  }
  return [];
}

/** Paragraph texts under a heading, e.g. "About Amicare Hospital". */
export function extractParagraphs(html: string, heading: RegExp, max = 2): string[] {
  const section = extractSection(html, heading);
  if (!section) return [];
  return [...section.html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => toPlainText(m[1]))
    .filter((p) => p.length > 40)
    .slice(0, max);
}

/* --------------------------------------------------------------- why us */

export function extractReasons(homeHtml: string): Reason[] {
  return parse(homeHtml)
    .querySelectorAll(".pxl-icon-box")
    .map((box) => ({
      title: text(box.querySelector(".pxl-item--title")),
      text: text(box.querySelector(".pxl-item--excerpt")),
    }))
    .filter((r) => r.title && r.text);
}

/** `"Why AmiCare is Your Trusted Healthcare Choice"` subtitle on Home. */
export function extractWhyHeading(homeHtml: string): string | null {
  const sub = parse(homeHtml)
    .querySelectorAll(".pxl-item--subtitle")
    .map(text)
    .find((t) => /why\s+amicare/i.test(t));
  return sub ? sub.replace(/^["“]|["”]$/g, "").trim() : null;
}

/* --------------------------------------------------------------- videos */

export function extractYouTubeIds(html: string): string[] {
  const ids = [...html.matchAll(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/g)].map((m) => m[1]);
  return [...new Set(ids)];
}

/** First video linked from the home hero (the robotic surgery explainer). */
export function extractHeroVideoId(homeHtml: string): string | null {
  const m = homeHtml.match(/class="btn-video"[^>]*href="[^"]*(?:v=|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? extractYouTubeIds(homeHtml)[0] ?? null;
}

/* ---------------------------------------------------------------- trust */

export function extractTrust(homeHtml: string): TrustContent | null {
  const root = parse(homeHtml);
  const heading = root.querySelectorAll("h2, h3, h4, h5, h6").map(text).find((t) => /CGHS/.test(t));
  if (!heading) return null;
  const seen = new Set<string>();
  const logos = root
    .querySelectorAll(".elementor-widget-pxl_partner_carousel img")
    .map(imgToData)
    .filter((i): i is ImageData => !!i && !seen.has(i.src) && !!seen.add(i.src));
  return { text: heading, logos };
}

/* -------------------------------------------------------------- contact */

type JsonLd = Record<string, unknown>;

function walkJsonLd(node: unknown, visit: (n: JsonLd) => void) {
  if (Array.isArray(node)) node.forEach((n) => walkJsonLd(n, visit));
  else if (node && typeof node === "object") {
    visit(node as JsonLd);
    Object.values(node).forEach((v) => walkJsonLd(v, visit));
  }
}

const formatPhone = (digits: string) => `+91 ${digits.slice(-10)}`;

export function extractContact(contactHtml: string, homeHtml: string): Partial<ContactInfo> {
  const plain = toPlainText(contactHtml);
  const out: Partial<ContactInfo> = {};

  const phones = [...plain.matchAll(/\+91[\s-]?(\d{5}\s?\d{5})/g)].map((m) => formatPhone(m[1].replace(/\s/g, "")));
  if (phones.length) out.phones = [...new Set(phones)];

  const emails = [...new Set(plain.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [])].filter(
    (e) => !/@(email|example)\.com$/i.test(e), // theme placeholders
  );
  if (emails.length) out.emails = emails;

  // JSON-LD block embedded in the Contacts page
  for (const m of contactHtml.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walkJsonLd(JSON.parse(m[1]), (n) => {
        if (n["@type"] === "PostalAddress" && !out.address) {
          out.address = [n.streetAddress, n.addressLocality, `${n.addressRegion ?? ""} ${n.postalCode ?? ""}`.trim()]
            .filter(Boolean)
            .join(", ");
        }
        if (n["@type"] === "ContactPoint" && typeof n.telephone === "string" && !out.primaryPhone) {
          out.primaryPhone = formatPhone(n.telephone.replace(/\D/g, ""));
        }
      });
    } catch {
      /* malformed JSON-LD in WP — ignore */
    }
  }

  const iframe = contactHtml.match(/<iframe[^>]+src="(https:\/\/maps\.google\.com[^"]+)"/i)?.[1];
  if (iframe) out.mapEmbedUrl = decode(iframe);

  const wa = homeHtml.match(/(?:api\.whatsapp\.com\/send\?phone=|wa\.me\/)\+?(\d{10,12})/)?.[1];
  if (wa) out.whatsapp = wa.length === 10 ? `91${wa}` : wa;

  if (!out.primaryPhone && out.phones) out.primaryPhone = out.phones[0];
  return out;
}

/* ------------------------------------------------------------- articles */

export function postToArticle(post: WPPost): Article {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const excerpt = toPlainText(post.excerpt?.rendered).replace(/\s*\[?(…|&hellip;|\.\.\.)\]?\s*$/, "");
  return {
    id: post.id,
    title: toPlainText(post.title.rendered),
    excerpt: excerpt.length > 150 ? `${excerpt.slice(0, 147).replace(/\s+\S*$/, "")}…` : excerpt,
    date: post.date,
    author: post._embedded?.author?.[0]?.name ?? "",
    url: post.link,
    image: mediaToImage(media, ["medium_large", "large", "full"]),
  };
}
