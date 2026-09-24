import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  id?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cn("text-sm font-semibold tracking-wider uppercase", dark ? "text-brand-200" : "text-brand-700")}>
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          "mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-pretty sm:text-lg",
            dark ? "text-brand-100" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
