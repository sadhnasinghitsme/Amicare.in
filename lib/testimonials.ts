import { cache } from "react";
import * as cheerio from "cheerio";
import fallbackJson from "@/data/testimonials.json";
import type { Testimonial, TestimonialsContent, WPCustomItem } from "@/types/wordpress";
import { titleCase } from "./extract";
import { toPlainText } from "./sanitize";
import { TESTIMONIAL_EXCLUDE, TESTIMONIAL_MIN_LENGTH, TESTIMONIAL_TREATMENTS, WP_SITE_URL } from "./constants";
import { discoverCustomTypes, getCustomItems, getSiteHtml } from "./wordpress";

export const testimonialsFallback = fallbackJson as TestimonialsContent;

function inferTreatment(text: string): string | null {
  return TESTIMONIAL_TREATMENTS.find(([re]) => re.test(text))?.[1] ?? null;
}

/** Drops one-liners, low ratings and reviews that name other hospitals. */
function keep(t: Testimonial): boolean {
  return t.rating >= 4 && t.text.length >= TESTIMONIAL_MIN_LENGTH && !TESTIMONIAL_EXCLUDE.test(t.text);
}

/* ------------------------------------------- 1. WP custom post type */

function fromCustomType(items: WPCustomItem[]): Testimonial[] {
  return items.map((item) => {
    const acf = item.acf ?? {};
    const pick = (...keys: string[]) =>
      keys.map((k) => acf[k]).find((v) => typeof v === "string" || typeof v === "number");
    const text = toPlainText(item.content?.rendered || item.excerpt?.rendered);
    const rating = Number(pick("rating", "stars", "star_rating")) || 5;
    const treatment = pick("treatment", "procedure", "designation");
    return {
      name: toPlainText(item.title.rendered),
      text,
      rating: Math.min(5, Math.max(1, rating)),
      treatment: typeof treatment === "string" ? treatment : inferTreatment(text),
      photo: item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
      source: "wordpress",
    };
  });
}

/* ------------------------------------------- 2. Homepage review widget */

/** Google avatar URLs end in "=w40-h40-…"; ask for a sharper 96px version. */
const upscaleAvatar = (url: string) => url.replace(/=w\d+-h\d+/, "=w96-h96");

/**
 * Parses the Trustindex Google-reviews widget that the WP homepage renders
 * server-side (`.ti-review-item` cards, `.ti-footer` summary).
 */
export function parseReviewWidget(html: string): TestimonialsContent | null {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const items: Testimonial[] = [];

  $(".ti-review-item").each((_, el) => {
    const card = $(el);
    const name = titleCase(card.find(".ti-name").first().text().trim().replace(/\s+/g, " "));
    const text = card.find(".ti-review-content").first().text().replace(/\s+/g, " ").trim();
    const key = `${name}|${text.slice(0, 40)}`;
    if (!name || !text || seen.has(key)) return;
    seen.add(key);

    const stars = card.find(".ti-stars .ti-star");
    const full = stars.filter((_, s) => /\/f\.svg$/.test($(s).attr("data-imgurl") ?? "")).length;
    const half = stars.filter((_, s) => /\/h\.svg$/.test($(s).attr("data-imgurl") ?? "")).length;
    const photo = card.find(".ti-profile-img trustindex-image, .ti-profile-img img").first();
    const photoUrl = photo.attr("data-imgurl") ?? photo.attr("src") ?? null;

    items.push({
      name,
      text,
      rating: full + half * 0.5 || 5,
      treatment: inferTreatment(text),
      photo: photoUrl && /googleusercontent\.com/.test(photoUrl) ? upscaleAvatar(photoUrl) : null,
      source: "google",
    });
  });

  if (items.length === 0) return null;

  // Overall rating: the widget footer shows stars + "816 Google reviews".
  const footer = $(".ti-footer").first();
  const footerStars = footer.find(".ti-stars .ti-star");
  const starsValue =
    footerStars.filter((_, s) => /\/f\.svg$/.test($(s).attr("data-imgurl") ?? "")).length +
    footerStars.filter((_, s) => /\/h\.svg$/.test($(s).attr("data-imgurl") ?? "")).length * 0.5;
  const count = Number(
    footer
      .find(".ti-rating-text")
      .text()
      .match(/([\d,]+)\s+Google reviews/i)?.[1]
      ?.replace(/,/g, ""),
  );

  return {
    items,
    google: starsValue > 0 && count > 0 ? { stars: starsValue, reviewCount: count } : null,
  };
}

/* ------------------------------------------------------------- loader */

/**
 * Testimonials, in order of preference:
 *   1. a testimonial/review custom post type in WP (none exists today),
 *   2. the Google reviews rendered on the WP homepage (parsed with cheerio),
 *   3. data/testimonials.json.
 * Cached with ISR through the underlying fetches (revalidate: 3600).
 */
export const getTestimonials = cache(async (): Promise<TestimonialsContent> => {
  const types = await discoverCustomTypes();
  if (types.testimonials) {
    const items = fromCustomType(await getCustomItems(types.testimonials)).filter(keep);
    if (items.length) return { items, google: testimonialsFallback.google };
  }

  const html = await getSiteHtml(`${WP_SITE_URL}/`);
  const parsed = html ? parseReviewWidget(html) : null;
  const items = parsed?.items.filter(keep) ?? [];
  if (items.length) return { items, google: parsed?.google ?? testimonialsFallback.google };

  console.warn("[testimonials] no reviews from WordPress — using data/testimonials.json");
  return testimonialsFallback;
});
