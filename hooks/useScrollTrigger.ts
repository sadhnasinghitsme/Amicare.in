"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `onTrigger` once, the first time the visitor has scrolled past
 * `threshold` (0–1) of the page.
 *
 * - `skip()`  → checked on mount and before firing; true = never fire.
 * - `defer()` → true = not now (e.g. user is typing in a form); re-checked on
 *               the next scroll.
 */
export function useScrollTrigger({
  threshold,
  onTrigger,
  skip = () => false,
  defer = () => false,
}: {
  threshold: number;
  onTrigger: () => void;
  skip?: () => boolean;
  defer?: () => boolean;
}) {
  // Latest callbacks without re-subscribing the scroll listener.
  const callbacks = useRef({ onTrigger, skip, defer });
  useEffect(() => {
    callbacks.current = { onTrigger, skip, defer };
  });

  useEffect(() => {
    if (callbacks.current.skip()) return;
    let frame = 0;

    const check = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0 || window.scrollY / scrollable < threshold) return;
      if (callbacks.current.defer()) return;
      stop();
      if (!callbacks.current.skip()) callbacks.current.onTrigger();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const stop = () => window.removeEventListener("scroll", onScroll);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stop();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);
}
