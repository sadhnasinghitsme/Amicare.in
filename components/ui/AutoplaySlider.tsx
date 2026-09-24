"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 4000;
/** Copies of the first slides appended for a seamless loop (= max slides per view). */
const LOOP_CLONES = 3;

/**
 * Auto-playing, swipeable slider: 1 slide on mobile, 2 on tablet, 3 on desktop.
 *
 * - Native scroll-snap for swiping; auto-advances every 4s with a smooth scroll.
 * - Infinite loop: copies of the first slides follow the last one; after
 *   sliding onto a copy we jump (without animation) to the real slide, so the
 *   loop never visibly rewinds.
 * - Pauses while hovered (mouse), touched, keyboard-focused, or while a slide
 *   has something expanded (any [aria-expanded="true"], e.g. "Read more").
 * - No autoplay (and no smooth scrolling) with prefers-reduced-motion.
 */
export function AutoplaySlider({
  label,
  itemLabel = "slide",
  children,
}: {
  /** Accessible name of the carousel. */
  label: string;
  /** Used in the dot labels: "Go to {itemLabel} 3". */
  itemLabel?: string;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  const n = items.length;
  const loop = n > 1;
  const slides = loop ? [...items, ...items.slice(0, Math.min(LOOP_CLONES, n))] : items;

  const track = useRef<HTMLDivElement>(null);
  const settleTimer = useRef(0);
  const [active, setActive] = useState(0); // real index, 0…n-1
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const reducedMotion = useReducedMotion();
  const paused = hovered || touching || keyboardFocus;

  /** Distance between slide starts (slide width + gap). */
  const step = useCallback(() => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 1;
    return first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
  }, []);

  const goTo = useCallback(
    (i: number, animate = !reducedMotion) =>
      track.current?.scrollTo({ left: i * step(), behavior: animate ? "smooth" : "instant" }),
    [step, reducedMotion],
  );

  // Keep the dots in sync while scrolling; once scrolling settles on a loop
  // copy, jump to the matching real slide.
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / step()) % n);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const settled = Math.round(el.scrollLeft / step());
      if (loop && settled >= n) goTo(settled - n, false);
    }, 150);
  };

  // Re-align to the current slide when the layout changes (1 ↔ 2 ↔ 3 per view).
  useEffect(() => {
    const onResize = () => goTo(active, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, goTo]);

  // Auto-play. Restarts the 4s countdown after every slide change and after a pause ends.
  useEffect(() => {
    if (!loop || paused || reducedMotion) return;
    const id = window.setInterval(() => {
      const expanded = track.current?.querySelector('[aria-expanded="true"]');
      if (!document.hidden && !expanded) goTo(active + 1); // active + 1 === n lands on the first copy
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [active, paused, reducedMotion, loop, goTo]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}
      onFocus={(e) => setKeyboardFocus(e.target.matches(":focus-visible"))}
      onBlur={() => setKeyboardFocus(false)}
    >
      <div
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 py-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {slides.map((slide, i) => {
          const isCopy = i >= n;
          return (
            <div
              key={isCopy ? `copy-${i}` : i}
              role={isCopy ? undefined : "group"}
              aria-roledescription={isCopy ? undefined : "slide"}
              aria-label={isCopy ? undefined : `${i + 1} of ${n}`}
              aria-hidden={isCopy || undefined}
              inert={isCopy}
              className="w-full shrink-0 snap-start md:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)]"
            >
              {slide}
            </div>
          );
        })}
      </div>

      {loop && (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${itemLabel} ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className="grid size-6 place-items-center"
            >
              <span
                className={cn(
                  "block h-2.5 rounded-full transition-all",
                  i === active ? "w-7 bg-brand-700" : "w-2.5 bg-brand-200 hover:bg-brand-500",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
