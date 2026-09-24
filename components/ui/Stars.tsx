import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

/** 5-star rating (supports halves). Brand orange stars on a neutral track. */
export function Stars({ value, className, size = "size-4" }: { value: number; className?: string; size?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const full = value >= i;
        const half = !full && value >= i - 0.5;
        return (
          <span key={i} className={cn("relative inline-block", size)} aria-hidden>
            <Star className={cn("absolute inset-0 size-full", full ? "fill-accent-500 text-accent-500" : "fill-line text-line")} />
            {half && <StarHalf className="absolute inset-0 size-full fill-accent-500 text-accent-500" />}
          </span>
        );
      })}
    </span>
  );
}
