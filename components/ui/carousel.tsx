"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dependency-free carousel: native scroll-snap (swipe on touch devices)
 * plus prev/next buttons. Slides are server-rendered children.
 */
export function Carousel({
  children,
  label,
  itemClassName,
  tone = "light",
}: {
  children: ReactNode;
  label: string;
  itemClassName?: string;
  tone?: "light" | "dark";
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const slides = Children.toArray(children);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const btn = cn(
    "grid size-11 place-items-center rounded-full border transition-colors disabled:opacity-40",
    tone === "dark"
      ? "border-white/40 text-white hover:bg-white/10"
      : "border-line bg-white text-brand-800 hover:bg-brand-50",
  );

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        onScroll={update}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {slide}
          </div>
        ))}
      </div>
      {!(edges.start && edges.end) && (
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className={btn} onClick={() => scroll(-1)} disabled={edges.start} aria-label="Previous">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" className={btn} onClick={() => scroll(1)} disabled={edges.end} aria-label="Next">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
