"use client";

import { CalendarCheck, Phone } from "lucide-react";
import { TooltipIconButton } from "@/components/ui/TooltipIconButton";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { openLeadPopup, useLeadPopupOpen } from "@/hooks/useLeadPopup";
import { cn, telHref, trackCta, whatsappHref } from "@/lib/utils";

const WHATSAPP_BG = "bg-[#1f9d55] hover:bg-[#17864a]";

/**
 * Floating CTAs: a stacked icon column at the bottom-right on desktop and a
 * 3-button sticky bar on mobile. "Book" opens <LeadPopup />; everything
 * hides while the popup is open.
 */
export function FloatingCTA({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const popupOpen = useLeadPopupOpen();
  if (popupOpen) return null;

  const tel = telHref(phone);
  const wa = whatsappHref(whatsapp);

  return (
    <>
      {/* Desktop: stacked icon buttons */}
      <ul aria-label="Quick contact" className="fixed right-6 bottom-6 z-40 hidden flex-col gap-3 md:flex">
        <TooltipIconButton
          href={wa}
          label="Chat on WhatsApp"
          className={WHATSAPP_BG}
          onClick={() => trackCta("whatsapp", "floating_desktop")}
        >
          <WhatsAppIcon className="size-7" />
        </TooltipIconButton>
        <TooltipIconButton
          href={tel}
          label={`Call ${phone}`}
          className="bg-brand-700 hover:bg-brand-800"
          onClick={() => trackCta("call", "floating_desktop")}
        >
          <Phone className="size-6" aria-hidden />
        </TooltipIconButton>
        <TooltipIconButton
          label="Book Appointment"
          className="bg-accent-600 hover:bg-accent-700"
          onClick={() => openLeadPopup("floating_desktop")}
        >
          <CalendarCheck className="size-6" aria-hidden />
        </TooltipIconButton>
      </ul>

      {/* Mobile: sticky bottom bar */}
      <nav
        aria-label="Quick contact"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] md:hidden"
      >
        <a
          href={tel}
          onClick={() => trackCta("call", "sticky_mobile")}
          className="flex min-h-14 items-center justify-center gap-1.5 bg-brand-700 text-sm font-semibold text-white active:bg-brand-800"
        >
          <Phone className="size-5" aria-hidden /> Call
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener"
          onClick={() => trackCta("whatsapp", "sticky_mobile")}
          className={cn(
            "flex min-h-14 items-center justify-center gap-1.5 text-sm font-semibold text-white",
            WHATSAPP_BG,
          )}
        >
          <WhatsAppIcon className="size-5" /> WhatsApp
        </a>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => openLeadPopup("sticky_mobile")}
          className="flex min-h-14 items-center justify-center gap-1.5 bg-accent-600 text-sm font-semibold text-white active:bg-accent-700"
        >
          <CalendarCheck className="size-5" aria-hidden /> Book
        </button>
      </nav>
    </>
  );
}
