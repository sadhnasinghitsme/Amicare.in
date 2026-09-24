import type { VideoItem } from "@/types/wordpress";

/** Video title via YouTube oEmbed (no API key needed). Cached for a day. */
async function getYouTubeTitle(id: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
      { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(8_000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title ?? null;
  } catch (err) {
    console.error(`[youtube] oEmbed failed for ${id}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function toVideoItems(ids: string[]): Promise<VideoItem[]> {
  const titles = await Promise.all(ids.map(getYouTubeTitle));
  return ids.map((id, i) => ({ id, title: titles[i] ?? "AmiCare Hospital video" }));
}
