"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * YouTube facade: shows the thumbnail and only loads the (heavy) player
 * iframe when clicked. Keeps Lighthouse performance high.
 */
export function LiteYouTube({
  id,
  title,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  highRes = false,
  showTitle = true,
  playButton = "round",
}: {
  /** "youtube" = red rounded-rectangle button, like YouTube's own player. */
  playButton?: "round" | "youtube";
  id: string;
  title: string;
  className?: string;
  sizes?: string;
  highRes?: boolean;
  showTitle?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/${highRes ? "maxresdefault" : "hqdefault"}.jpg`);

  return (
    <div className={cn("relative aspect-video overflow-hidden bg-brand-950", className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 size-full text-left focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-accent-500"
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={thumb}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
          />
          {showTitle && (
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          )}
          {playButton === "youtube" ? (
            <span className="absolute top-1/2 left-1/2 grid h-12 w-17 -translate-1/2 place-items-center rounded-xl bg-[#e00] text-white shadow-lg transition-transform group-hover:scale-110">
              <Play className="size-6 fill-current" aria-hidden />
            </span>
          ) : (
            <span className="absolute top-1/2 left-1/2 grid size-16 -translate-1/2 place-items-center rounded-full bg-accent-600 text-white shadow-lg ring-4 ring-white/30 transition-transform group-hover:scale-110">
              <Play className="ml-1 size-7 fill-current" aria-hidden />
            </span>
          )}
          {showTitle && (
            <span className="absolute inset-x-0 bottom-0 p-4">
              <span className="line-clamp-2 text-sm font-semibold text-white">{title}</span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
