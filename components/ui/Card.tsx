import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/utils";

type CardProps<T extends ElementType> = { as?: T } & Omit<ComponentProps<T>, "as">;

/** White rounded surface shared by doctor, article, testimonial and technology cards. */
export function Card<T extends ElementType = "div">({ as, className, ...props }: CardProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={cn("rounded-3xl bg-white ring-1 ring-line", className)} {...props} />;
}
