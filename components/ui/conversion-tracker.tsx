"use client";

import { useEffect } from "react";
import { LEAD_SUBMITTED_KEY } from "@/lib/lead-schema";

type TrackingWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
};

/**
 * Fires lead-conversion events once per real form submission. The form sets
 * a sessionStorage flag before redirecting here, so reloading /thank-you or
 * visiting it directly doesn't count as a second conversion.
 */
export function ConversionTracker() {
  useEffect(() => {
    let treatment: string | null = null;
    try {
      treatment = sessionStorage.getItem(LEAD_SUBMITTED_KEY);
      sessionStorage.removeItem(LEAD_SUBMITTED_KEY);
    } catch {
      return;
    }
    if (!treatment) return;

    const w = window as TrackingWindow;
    // GTM: trigger your Google Ads conversion tag on this custom event.
    (w.dataLayer ??= []).push({ event: "lead_submitted", treatment });
    w.fbq?.("track", "Lead", { content_name: treatment });

    const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO;
    if (sendTo) w.gtag?.("event", "conversion", { send_to: sendTo });
  }, []);

  return null;
}
