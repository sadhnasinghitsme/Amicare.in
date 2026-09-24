/**
 * App-wide constants.
 *
 * Page copy is NOT here: it comes from WordPress. This file only holds brand
 * assets, lead/tracking settings, and the wiring that says *where* on the WP
 * site each piece of content lives (slugs, media IDs, headings to extract).
 *
 * Phone and WhatsApp numbers are also read from WordPress (Contacts page);
 * their offline copies live in data/fallback.json → contact.
 */

/* ------------------------------------------------------------------ brand */

export const BRAND = {
  logo: "/images/amicare-logo.png",
  logoWidth: 480,
  logoHeight: 175,
  /** Browser theme colour = brand-700. */
  themeColor: "#056a7c",
  /** Pre-filled WhatsApp message. */
  whatsappMessage: "Hi, I would like to book an appointment at AmiCare Hospital.",
} as const;

/* ------------------------------------------------------ leads & tracking */

/** URL parameters captured with every lead (Google/Meta ads attribution). */
export const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

export const STORAGE_KEYS = {
  /** Set on successful submit, consumed on /thank-you (fires the conversion once). */
  leadSubmitted: "amicare_lead_submitted",
  /** Popup already shown or lead already sent → no auto-open this session. */
  popupSeen: "amicare_popup_seen",
} as const;

/** Fraction of the page scrolled before the lead popup opens by itself. */
export const AUTO_OPEN_SCROLL_DEPTH = 0.5;

/* ------------------------------------------------------------- WordPress */

export const WP_SITE_URL = "https://amicarehospital.in";

export const PAGE_SLUGS = {
  home: "home",
  about: "about-us",
  contact: "contacts",
} as const;

/** Treatments shown in the accordion, in display order. */
export const TREATMENT_SLUGS = [
  "robotic-knee-replacement-surgery-in-ghaziabad",
  "total-knee-replacement-surgery-in-ghaziabad",
  "hip-replacement-surgery-in-ghaziabad",
  "arthro-knee-and-shoulder-treatment",
  "acl-surgery-in-delhi-ncr",
  "shoulder-care-and-treatment-in-ghaziabad",
  "sports-injury-treatment-in-ghaziabad",
  "spine-surgery-in-ghaziabad",
  "pediatric-orthopedic-surgery-in-ghaziabad",
  "orthopaedics-treatment-in-ghaziabad",
];

/** WP media library IDs (see /wp-json/wp/v2/media/<id>). */
export const MEDIA_IDS = {
  heroBackground: 14094, // Reception / front desk photo
  teamCutout: 14175, // Transparent team photo (Dr. Himanshu Gupta centre)
};

/** Doctor whose card must always be shown first. */
export const LEAD_DOCTOR_MATCH = /himanshu\s+gupta/i;

/**
 * Technology tabs: each is a heading on a WP page. The section under that
 * heading (up to the next heading) becomes the tab body. Tabs with no WP
 * source (or whose source is missing) use data/fallback.json.
 */
export const TECH_TABS: {
  id: string;
  label: string;
  source: { slug: string; heading: RegExp } | null;
}[] = [
  {
    id: "robotic",
    label: "Robotic Joint Replacement",
    source: {
      slug: "robotic-knee-replacement-surgery-in-ghaziabad",
      heading: /^what is robotic knee replacement\??$/i,
    },
  },
  { id: "modular-ot", label: "Modular OT", source: null },
  {
    id: "diagnostics",
    label: "Diagnostics",
    source: {
      slug: "where-to-find-best-orthopaedic-doctor-hospital-in-ghaziabad",
      heading: /^diagnostic facilities$/i,
    },
  },
];

/** Page slugs excluded from the SEO keyword pills. */
export const KEYWORD_EXCLUDE_SLUGS = new Set([
  "home",
  "about-us",
  "our-services",
  "contacts",
  "our-blogs",
  "book-appointment",
  "html-sitemap",
  "privacy-policy",
  "terms-and-condition",
  "tpa-insurance-company",
  "dr-himanshu-gupta",
]);

/** Facility icon grid (UI labels; icons live in components/ui/icons.tsx). */
export const FACILITIES = [
  { icon: "emergency", label: "24x7 Emergency" },
  { icon: "icu", label: "ICU / MICU / CCU" },
  { icon: "ot", label: "Modular OT" },
  { icon: "xray", label: "Digital X-ray" },
  { icon: "lab", label: "Pathology & USG" },
  { icon: "pharmacy", label: "24x7 Pharmacy" },
  { icon: "ambulance", label: "Ambulance" },
  { icon: "physio", label: "Physiotherapy" },
  { icon: "cghs", label: "CGHS Empanelled" },
] as const;

export type FacilityIcon = (typeof FACILITIES)[number]["icon"];

/**
 * Video for the "Why AmiCare" section, from AmiCare's official YouTube
 * channel (youtube.com/@AmicareHospital-ortho): "10 Years of Orthopaedic
 * Excellence & Innovation". Override with WHY_AMICARE_YOUTUBE_ID.
 */
export function whyVideoId(): string {
  const id = process.env.WHY_AMICARE_YOUTUBE_ID?.trim();
  return id && /^[\w-]{11}$/.test(id) ? id : "8wfJ_vZ7diU";
}

/**
 * Testimonials: reviews that name other hospital chains are skipped (the
 * Google listing has a few that praise doctors "at Fortis" etc.), as are
 * one-liners like "Excellent".
 */
export const TESTIMONIAL_EXCLUDE = /\b(fortis|apollo|medanta|manipal|yashoda|max hospital|max super|blk)\b/i;
export const TESTIMONIAL_MIN_LENGTH = 40;

/** Treatment label shown on a card only when the review text names it. First match wins. */
export const TESTIMONIAL_TREATMENTS: [RegExp, string][] = [
  [/robotic/i, "Robotic Joint Replacement"],
  [/knee replace/i, "Knee Replacement"],
  [/hip replace/i, "Hip Replacement"],
  [/\b(spine|spinal|slip ?disc|back pain|sciatica)\b/i, "Spine Care"],
  [/\b(acl|ligament|menisc|arthroscop)/i, "Arthroscopy / ACL"],
  [/shoulder/i, "Shoulder Treatment"],
  [/\b(fracture|trauma)\b/i, "Fracture Care"],
  [/\b(delivery|pregnan|gyn(a)?ec)/i, "Maternity Care"],
  [/\bknee\b/i, "Knee Treatment"],
];

/**
 * Real patient-testimonial YouTube IDs, comma separated. The WP site
 * currently only embeds specialist explainer videos, so until these are
 * provided the "stories" section is labelled as expert videos instead.
 */
export function testimonialVideoIds(): string[] {
  return (process.env.TESTIMONIAL_YOUTUBE_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[\w-]{11}$/.test(s));
}
