import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-16 sm:py-20", className)} {...props} />;
}

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
        className={cn("mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl", dark ? "text-white" : "text-ink")}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base leading-relaxed text-pretty sm:text-lg", dark ? "text-brand-100" : "text-muted")}>
          {description}
        </p>
      )}
    </div>
  );
}

const buttonVariants = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 focus-visible:outline-accent-600",
  secondary: "bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700",
  outline: "border border-brand-700 text-brand-700 hover:bg-brand-50 focus-visible:outline-brand-700",
  white: "bg-white text-brand-800 hover:bg-brand-50 focus-visible:outline-white",
  ghostWhite: "border border-white/60 text-white hover:bg-white/10 focus-visible:outline-white",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    buttonVariants[variant],
    className,
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: ButtonVariant }) {
  return <a className={buttonClass(variant, className)} {...props} />;
}
