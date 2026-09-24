/* ------------------------------------------------------------------ */
/* Raw WordPress REST API shapes (only the fields we actually read)    */
/* ------------------------------------------------------------------ */

export interface WPRendered {
  rendered: string;
  protected?: boolean;
}

export interface WPSeoHead {
  title?: string;
  description?: string;
  canonical?: string;
  og_title?: string;
  og_description?: string;
  og_image?: { url: string; width?: number; height?: number }[];
}

export interface WPMediaSize {
  source_url: string;
  width: number;
  height: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, WPMediaSize>;
  };
}

export interface WPEmbedded {
  author?: { name: string }[];
  "wp:featuredmedia"?: WPMedia[];
}

export interface WPPage {
  id: number;
  slug: string;
  link: string;
  modified: string;
  title: WPRendered;
  content: WPRendered;
  excerpt: WPRendered;
  featured_media: number;
  /** Present when Yoast SEO is active. */
  yoast_head_json?: WPSeoHead;
  _embedded?: WPEmbedded;
}

export interface WPPost extends WPPage {
  date: string;
}

export interface WPPostType {
  slug: string;
  name: string;
  rest_base: string;
  rest_namespace: string;
}

export interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
}

/** Generic item from a custom post type (doctors, testimonials, …). */
export interface WPCustomItem extends WPPage {
  acf?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Normalised content the landing page renders                         */
/* ------------------------------------------------------------------ */

export interface ImageData {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Stat {
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: ImageData | null;
  badges: Stat[];
}

export interface Treatment {
  slug: string;
  title: string;
  /** Sanitised HTML (intro paragraphs from the WP page). */
  summaryHtml: string;
  highlights: string[];
  url: string;
}

export interface Doctor {
  name: string;
  designation: string;
  photo: ImageData | null;
  profileUrl: string | null;
}

export interface VideoItem {
  id: string;
  title: string;
}

export interface Reason {
  title: string;
  text: string;
}

export interface WhyContent {
  heading: string;
  paragraphs: string[];
  video: VideoItem | null;
  teamImage: ImageData | null;
  reasons: Reason[];
}

export interface StoriesContent {
  /** True only when real patient-testimonial IDs are configured. */
  isPatientTestimonials: boolean;
  videos: VideoItem[];
}

export interface Testimonial {
  name: string;
  text: string;
  /** 1–5 */
  rating: number;
  /** Only set when the review itself names the treatment. */
  treatment: string | null;
  photo: string | null;
  source: "google" | "wordpress";
}

export interface TestimonialsContent {
  items: Testimonial[];
  /** Overall Google rating shown in the widget (stars rounded to halves). */
  google: { stars: number; reviewCount: number } | null;
}

export interface TechTab {
  id: string;
  label: string;
  heading: string;
  /** Sanitised HTML. */
  html: string;
  sourceUrl: string | null;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  url: string;
  image: ImageData | null;
}

export interface TrustContent {
  text: string;
  logos: ImageData[];
}

export interface ContactInfo {
  phones: string[];
  primaryPhone: string;
  whatsapp: string;
  emails: string[];
  address: string;
  mapEmbedUrl: string;
}

export interface KeywordLink {
  label: string;
  url: string;
}

export interface SeoData {
  title: string;
  description: string;
  ogImage: string | null;
}

export interface LandingContent {
  site: { name: string; url: string };
  seo: SeoData;
  hero: HeroContent;
  stats: Stat[];
  treatments: Treatment[];
  doctors: Doctor[];
  why: WhyContent;
  stories: StoriesContent;
  /** Robotic-surgery explainer linked from the WP home hero; shown in the Technology tab. */
  roboticVideo: VideoItem | null;
  technology: TechTab[];
  articles: Article[];
  trust: TrustContent;
  contact: ContactInfo;
  keywords: KeywordLink[];
}
