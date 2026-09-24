import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Round icon button with a label tooltip on hover / keyboard focus, as an
 * <li> for a vertical stack. Renders a link when `href` is set, else a
 * button that opens a dialog.
 */
export function TooltipIconButton({
  label,
  href,
  onClick,
  className,
  children,
}: {
  label: string;
  href?: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  const cls = cn(
    "grid size-14 place-items-center rounded-full text-white shadow-lg shadow-black/25 transition-transform",
    "hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700",
    className,
  );
  const external = href?.startsWith("http");
  return (
    <li className="group relative">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 translate-x-1 rounded-md bg-brand-950 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-md transition group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100"
      >
        {label}
      </span>
      {href ? (
        <a
          href={href}
          onClick={onClick}
          aria-label={label}
          className={cls}
          {...(external ? { target: "_blank", rel: "noopener" } : {})}
        >
          {children}
        </a>
      ) : (
        <button type="button" onClick={onClick} aria-label={label} aria-haspopup="dialog" className={cls}>
          {children}
        </button>
      )}
    </li>
  );
}
