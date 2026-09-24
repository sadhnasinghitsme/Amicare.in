import type {
  WPCustomItem,
  WPMedia,
  WPPage,
  WPPost,
  WPPostType,
  WPSeoHead,
  WPSiteInfo,
} from "@/types/wordpress";

/**
 * Typed helpers for the WordPress REST API.
 *
 * Every helper runs on the server only (Server Components / Route Handlers),
 * is cached with ISR for an hour, and resolves to `null` (or `[]`) on
 * failure after logging — callers then fall back to data/fallback.json.
 */

export const REVALIDATE_SECONDS = 3600;

const API_BASE = (
  process.env.WP_API_URL ?? "https://www.amicarehospital.in/wp-json/wp/v2"
).replace(/\/+$/, "");

/** `/wp-json` root, used for the site index and plugin namespaces. */
const API_ROOT = API_BASE.replace(/\/wp\/v2$/, "");

interface FetchOptions {
  /** Don't log a 404 (used for optional plugin endpoints). */
  optional?: boolean;
}

async function wpFetch<T>(url: string, opts: FetchOptions = {}): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      if (!(opts.optional && res.status === 404)) {
        console.error(`[wordpress] ${res.status} ${res.statusText} — ${url}`);
      }
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(
      `[wordpress] request failed — ${url}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

const api = (path: string) => `${API_BASE}${path}`;

/* ---------------------------------------------------------------- pages */

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await wpFetch<WPPage[]>(api(`/pages?slug=${encodeURIComponent(slug)}`));
  return pages?.[0] ?? null;
}

/**
 * Fetches several pages in one request, keyed by slug. `_fields` keeps the
 * response well under Next's 2 MB data-cache limit per fetch.
 */
export async function getPagesBySlugs(slugs: string[]): Promise<Map<string, WPPage>> {
  if (slugs.length === 0) return new Map();
  const pages = await wpFetch<WPPage[]>(
    api(
      `/pages?slug=${slugs.map(encodeURIComponent).join(",")}&per_page=100` +
        `&_fields=id,slug,link,modified,title,content,excerpt,featured_media`,
    ),
  );
  return new Map((pages ?? []).map((p) => [p.slug, p]));
}

/** Lightweight list of every page (no content), for the keyword pills. */
export async function getPageIndex(): Promise<Pick<WPPage, "id" | "slug" | "link" | "title">[]> {
  const pages = await wpFetch<Pick<WPPage, "id" | "slug" | "link" | "title">[]>(
    api(`/pages?per_page=100&_fields=id,slug,link,title`),
  );
  return pages ?? [];
}

/* ---------------------------------------------------------------- posts */

export async function getLatestPosts(count = 6): Promise<WPPost[]> {
  const posts = await wpFetch<WPPost[]>(api(`/posts?per_page=${count}&_embed`));
  return posts ?? [];
}

/* ---------------------------------------------------------------- media */

export async function getMedia(id: number): Promise<WPMedia | null> {
  return wpFetch<WPMedia>(api(`/media/${id}`));
}

export async function getMediaByIds(ids: number[]): Promise<Map<number, WPMedia>> {
  if (ids.length === 0) return new Map();
  const media = await wpFetch<WPMedia[]>(
    api(`/media?include=${ids.join(",")}&per_page=${ids.length}`),
  );
  return new Map((media ?? []).map((m) => [m.id, m]));
}

/* --------------------------------------------------- custom post types */

const BUILT_IN_TYPES = new Set([
  "post",
  "page",
  "attachment",
  "nav_menu_item",
  "wp_block",
  "wp_template",
  "wp_template_part",
  "wp_global_styles",
  "wp_navigation",
  "wp_font_family",
  "wp_font_face",
]);

export async function getPostTypes(): Promise<WPPostType[]> {
  const types = await wpFetch<Record<string, WPPostType>>(api(`/types`));
  return types ? Object.values(types) : [];
}

export interface CustomTypeMap {
  doctors?: string;
  testimonials?: string;
  services?: string;
}

/**
 * Looks for custom post types that hold doctors / testimonials / services
 * and returns their REST bases. Today the site has none (they live inside
 * Elementor pages), but if one is added later it is picked up automatically.
 */
export async function discoverCustomTypes(): Promise<CustomTypeMap> {
  const found: CustomTypeMap = {};
  for (const t of await getPostTypes()) {
    if (BUILT_IN_TYPES.has(t.slug) || t.rest_namespace !== "wp/v2") continue;
    const key = `${t.slug} ${t.name}`.toLowerCase();
    if (!found.doctors && /doctor|physician|specialist|team/.test(key)) found.doctors = t.rest_base;
    else if (!found.testimonials && /testimonial|review|stor(y|ies)/.test(key))
      found.testimonials = t.rest_base;
    else if (!found.services && /service|treatment|speciali[sz]/.test(key))
      found.services = t.rest_base;
  }
  return found;
}

export async function getCustomItems(restBase: string, perPage = 50): Promise<WPCustomItem[]> {
  const items = await wpFetch<WPCustomItem[]>(api(`/${restBase}?per_page=${perPage}&_embed`));
  return items ?? [];
}

/* ------------------------------------------------------- rendered HTML */

/**
 * Public, fully rendered HTML of a page on the WP site (for content that
 * plugins render server-side but don't expose in REST, e.g. the Trustindex
 * Google-reviews widget). The homepage is ~420 KB, under the 2 MB cache cap.
 */
export async function getSiteHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error(`[wordpress] ${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error(`[wordpress] request failed — ${url}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/* ------------------------------------------------------------- site/SEO */

export async function getSiteInfo(): Promise<WPSiteInfo | null> {
  return wpFetch<WPSiteInfo>(`${API_ROOT}/?_fields=name,description,url,home`);
}

/**
 * SEO head for a URL. Uses Yoast's `yoast_head_json` when the page has it,
 * otherwise Rank Math's headless endpoint (only available when "Headless
 * CMS support" is enabled in Rank Math → General Settings → Others).
 */
export async function getSeoHead(page: WPPage | null, url: string): Promise<WPSeoHead | null> {
  if (page?.yoast_head_json?.title) return page.yoast_head_json;

  const rm = await wpFetch<{ success: boolean; head: string }>(
    `${API_ROOT}/rankmath/v1/getHead?url=${encodeURIComponent(url)}`,
    { optional: true },
  );
  if (!rm?.success || !rm.head) return null;

  const meta = (attr: string, name: string) =>
    rm.head.match(new RegExp(`<meta[^>]+${attr}="${name}"[^>]+content="([^"]*)"`, "i"))?.[1];
  const ogImage = meta("property", "og:image");
  return {
    title: rm.head.match(/<title>([^<]*)<\/title>/i)?.[1],
    description: meta("name", "description"),
    og_image: ogImage ? [{ url: ogImage }] : undefined,
  };
}
