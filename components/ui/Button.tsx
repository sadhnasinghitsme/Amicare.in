import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 focus-visible:outline-accent-600",
  secondary: "bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700",
  outline: "border border-brand-700 text-brand-700 hover:bg-brand-50 focus-visible:outline-brand-700",
  white: "bg-white text-brand-800 hover:bg-brand-50 focus-visible:outline-white",
  ghostWhite: "border border-white/60 text-white hover:bg-white/10 focus-visible:outline-white",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

/** Class string for button-styled elements (links, <button>s). */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    buttonVariants[variant],
    className,
  );
}

/** Link styled as a button (every CTA on the page navigates: anchors, tel:, wa.me). */
export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: ButtonVariant }) {
  return <a className={buttonClass(variant, className)} {...props} />;
}
