import { cache } from "react";
import fallbackJson from "@/data/fallback.json";
import type { Doctor, LandingContent, Stat, TechTab, Treatment, WPPage } from "@/types/wordpress";
import {
  cleanPageTitle,
  extractContact,
  extractCounters,
  extractDoctors,
  extractExperienceBadge,
  extractHero,
  extractHeroVideoId,
  extractHighlights,
  extractIntro,
  extractParagraphs,
  extractReasons,
  extractRoboticBadge,
  extractSection,
  extractTrust,
  extractWhyHeading,
  extractYouTubeIds,
  mediaToImage,
  postToArticle,
  sortDoctors,
} from "./extract";
import { sanitizeWpHtml, toPlainText } from "./sanitize";
import {
  KEYWORD_EXCLUDE_SLUGS,
  MEDIA_IDS,
  PAGE_SLUGS,
  TECH_TABS,
  TREATMENT_SLUGS,
  WP_SITE_URL,
  testimonialVideoIds,
  whyVideoId,
} from "./site-config";
import {
  discoverCustomTypes,
  getCustomItems,
  getLatestPosts,
  getMediaByIds,
  getPageBySlug,
  getPageIndex,
  getPagesBySlugs,
  getSeoHead,
  getSiteInfo,
} from "./wordpress";
import { toVideoItems } from "./youtube";

export const fallback = fallbackJson as LandingContent;

function isEmpty(v: unknown): boolean {
  return v == null || v === "" || (Array.isArray(v) && v.length === 0);
}

/** Returns `value`, or the fallback (logging which section fell back). */
function orFallback<T>(section: string, value: T | null | undefined, fb: T): T {
  if (isEmpty(value)) {
    console.warn(`[content] "${section}" unavailable from WordPress — using data/fallback.json`);
    return fb;
  }
  return value as T;
}

async function getDoctors(customDoctorsBase: string | undefined, about: WPPage | null): Promise<Doctor[]> {
  if (customDoctorsBase) {
    const items = await getCustomItems(customDoctorsBase);
    const fromCpt = items.map<Doctor>((item) => {
      const acf = item.acf ?? {};
      const designation = [acf.designation, acf.position, acf.speciality].find((v) => typeof v === "string");
      return {
        name: toPlainText(item.title.rendered),
        designation: (designation as string | undefined) ?? toPlainText(item.excerpt?.rendered),
        photo: mediaToImage(item._embedded?.["wp:featuredmedia"]?.[0], ["medium_large", "large", "full"]),
        profileUrl: item.link,
      };
    });
    if (fromCpt.length) return sortDoctors(fromCpt);
  }
  return about ? extractDoctors(about.content.rendered) : [];
}

/**
 * Loads and normalises everything the landing page needs. Wrapped in
 * React `cache` so `generateMetadata` and the page share one set of fetches.
 */
export const getLandingContent = cache(async (): Promise<LandingContent> => {
  const techSlugs = TECH_TABS.flatMap((t) => (t.source ? [t.source.slug] : []));

  const [home, about, contactPage, pages, posts, media, pageIndex, customTypes, siteInfo] = await Promise.all([
    getPageBySlug(PAGE_SLUGS.home),
    getPageBySlug(PAGE_SLUGS.about),
    getPageBySlug(PAGE_SLUGS.contact),
    getPagesBySlugs([...new Set([...TREATMENT_SLUGS, ...techSlugs])]),
    getLatestPosts(6),
    getMediaByIds(Object.values(MEDIA_IDS)),
    getPageIndex(),
    discoverCustomTypes(),
    getSiteInfo(),
  ]);

  const homeHtml = home?.content.rendered ?? "";
  const aboutHtml = about?.content.rendered ?? "";

  /* hero */
  const heroText = homeHtml ? extractHero(homeHtml) : null;
  const badges = [
    heroText ? extractRoboticBadge(heroText.description) : null,
    aboutHtml ? extractExperienceBadge(aboutHtml) : null,
  ].filter((b): b is Stat => b !== null);
  const hero = heroText
    ? {
        ...heroText,
        image: mediaToImage(media.get(MEDIA_IDS.heroBackground), ["2048x2048", "full"]) ?? fallback.hero.image,
        badges: badges.length === 2 ? badges : fallback.hero.badges,
      }
    : orFallback("hero", null, fallback.hero);

  /* treatments */
  const treatments = TREATMENT_SLUGS.map<Treatment | undefined>((slug) => {
    const page = pages.get(slug);
    if (!page) return fallback.treatments.find((t) => t.slug === slug);
    return {
      slug,
      title: cleanPageTitle(page.title.rendered, { stripLocation: true }),
      summaryHtml: extractIntro(page.content.rendered) || sanitizeWpHtml(page.excerpt.rendered),
      highlights: extractHighlights(page.content.rendered),
      url: page.link,
    };
  }).filter((t): t is Treatment => !!t);

  /* technology tabs */
  const technology = TECH_TABS.map<TechTab | undefined>((tab) => {
    const page = tab.source ? pages.get(tab.source.slug) : undefined;
    const section = page && tab.source ? extractSection(page.content.rendered, tab.source.heading) : null;
    if (!section) return fallback.technology.find((t) => t.id === tab.id);
    return { id: tab.id, label: tab.label, heading: section.heading, html: section.html, sourceUrl: page!.link };
  }).filter((t): t is TechTab => !!t);

  /* videos */
  // Titles come from YouTube (oEmbed); IDs from config (why) and the WP home page (the rest).
  const roboticVideoId = extractHeroVideoId(homeHtml);
  const patientIds = testimonialVideoIds();
  const storyIds = patientIds.length
    ? patientIds
    : extractYouTubeIds(homeHtml).filter((id) => id !== roboticVideoId && id !== whyVideoId());
  const [whyVideos, roboticVideos, storyVideos] = await Promise.all([
    toVideoItems([whyVideoId()]),
    toVideoItems(roboticVideoId ? [roboticVideoId] : []),
    toVideoItems(storyIds),
  ]);

  /* doctors */
  const doctors = await getDoctors(customTypes.doctors, about);

  /* contact */
  const contact = {
    ...fallback.contact,
    ...(contactPage ? extractContact(contactPage.content.rendered, homeHtml) : {}),
  };

  /* keyword pills */
  const seenKeywords = new Set<string>();
  const keywords = pageIndex
    .filter((p) => !KEYWORD_EXCLUDE_SLUGS.has(p.slug))
    .map((p) => ({ label: cleanPageTitle(p.title.rendered), url: p.link }))
    .filter((k) => k.label && !seenKeywords.has(k.label.toLowerCase()) && !!seenKeywords.add(k.label.toLowerCase()));

  /* SEO */
  const seoHead = await getSeoHead(home, `${WP_SITE_URL}/`);
  const siteName = siteInfo ? toPlainText(siteInfo.name) : fallback.site.name;
  const seo = {
    title: toPlainText(seoHead?.title) || (siteInfo ? `${siteName} | ${toPlainText(siteInfo.description)}` : fallback.seo.title),
    description: toPlainText(seoHead?.description) || hero.description || fallback.seo.description,
    ogImage: seoHead?.og_image?.[0]?.url ?? hero.image?.src ?? fallback.seo.ogImage,
  };

  return {
    site: { name: siteName, url: siteInfo?.home ?? fallback.site.url },
    seo,
    hero,
    stats: orFallback("stats", extractCounters(homeHtml), fallback.stats),
    treatments: orFallback("treatments", treatments, fallback.treatments),
    doctors: orFallback("doctors", doctors, fallback.doctors),
    why: {
      heading: orFallback("why.heading", extractWhyHeading(homeHtml), fallback.why.heading),
      paragraphs: orFallback("why.paragraphs", extractParagraphs(aboutHtml, /^about amicare hospital$/i), fallback.why.paragraphs),
      video: whyVideos[0] ?? fallback.why.video,
      teamImage: mediaToImage(media.get(MEDIA_IDS.teamCutout), ["full"]) ?? fallback.why.teamImage,
      reasons: orFallback("why.reasons", extractReasons(homeHtml), fallback.why.reasons),
    },
    stories: storyVideos.length
      ? { isPatientTestimonials: patientIds.length > 0, videos: storyVideos }
      : orFallback("stories", null, fallback.stories),
    roboticVideo: roboticVideos[0] ?? fallback.roboticVideo ?? null,
    technology: orFallback("technology", technology, fallback.technology),
    articles: orFallback("articles", posts.map(postToArticle), fallback.articles),
    trust: orFallback("trust", homeHtml ? extractTrust(homeHtml) : null, fallback.trust),
    contact,
    keywords: orFallback("keywords", keywords, fallback.keywords),
  };
});
