"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/types/wordpress";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { GoogleIcon } from "./GoogleIcon";
import { Stars } from "./Stars";

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts.at(-1)![0] : "")).toUpperCase();
}

/** Review card: stars, quote clamped to 4 lines with "Read more", reviewer. */
export function TestimonialCard({ t }: { t: Testimonial }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  // Only offer "Read more" when the text actually overflows 4 lines.
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => {
      if (!expanded) setClamped(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  return (
    <Card as="figure" className="relative flex h-full flex-col p-6 shadow-sm sm:p-7">
      <Quote className="absolute top-6 right-6 size-10 fill-brand-100 text-brand-100" aria-hidden />
      <Stars value={t.rating} />
      <blockquote className="mt-4 flex-1">
        <p ref={textRef} className={cn("text-[15px] leading-relaxed text-muted", !expanded && "line-clamp-4")}>
          {t.text}
        </p>
        {(clamped || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2 text-sm font-semibold text-brand-700 hover:text-brand-900 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        {t.photo ? (
          <Image
            src={t.photo}
            alt=""
            width={48}
            height={48}
            sizes="48px"
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
          >
            {initials(t.name)}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold text-ink">{t.name}</span>
          <span className="block truncate text-sm text-brand-700">{t.treatment ?? "Patient review"}</span>
        </span>
        {t.source === "google" && (
          <span title="Posted on Google">
            <GoogleIcon className="size-5 shrink-0" />
            <span className="sr-only">Posted on Google</span>
          </span>
        )}
      </figcaption>
    </Card>
  );
}
