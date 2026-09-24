import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * One collapsible item built on native <details>/<summary>: no JS, and the
 * body stays in the HTML for SEO. Items sharing a `name` open one at a time.
 */
export function Accordion({
  title,
  name,
  defaultOpen = false,
  children,
}: {
  title: ReactNode;
  name?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      name={name}
      open={defaultOpen}
      className="group rounded-2xl bg-white ring-1 ring-line transition-shadow open:shadow-lg open:shadow-brand-900/5"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink sm:px-6 sm:text-lg [&::-webkit-details-marker]:hidden">
        <h3>{title}</h3>
        <ChevronDown
          className="size-5 shrink-0 text-brand-700 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-line px-5 pt-4 pb-6 sm:px-6">{children}</div>
    </details>
  );
}
