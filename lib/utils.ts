import { BRAND } from "./constants";

/** Joins class names, skipping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** "+91 9818248928" → "tel:+919818248928" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string, text: string = BRAND.whatsappMessage): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/* ------------------------------------------------------------ analytics */

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/** Push an event to the GTM dataLayer (created if GTM hasn't loaded yet). */
export function pushDataLayer(event: Record<string, unknown>) {
  ((window as DataLayerWindow).dataLayer ??= []).push(event);
}

/**
 * CTA click → GTM. Create a Custom Event trigger on `cta_click` and filter by
 * cta_type (call | whatsapp | book) / cta_location (floating_desktop, sticky_mobile, testimonials…).
 */
export function trackCta(type: "call" | "whatsapp" | "book", location: string) {
  pushDataLayer({ event: "cta_click", cta_type: type, cta_location: location });
}
