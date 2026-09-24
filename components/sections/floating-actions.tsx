"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarCheck, Phone, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { LeadForm } from "@/components/ui/lead-form";
import { POPUP_SEEN_KEY } from "@/lib/lead-schema";
import { cn, telHref, whatsappHref } from "@/lib/utils";

type CtaType = "call" | "whatsapp" | "book";
type CtaLocation = "floating_desktop" | "sticky_mobile";

/** GTM: create a Custom Event trigger on `cta_click`, filter by cta_type / cta_location. */
function trackCta(type: CtaType, location: CtaLocation) {
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  (w.dataLayer ??= []).push({ event: "cta_click", cta_type: type, cta_location: location });
}

const WHATSAPP_BG = "bg-[#1f9d55] hover:bg-[#17864a]";

/** Fraction of the page scrolled before the lead popup opens by itself. */
const AUTO_OPEN_SCROLL_DEPTH = 0.5;

// Once the popup has been shown (by scroll or by "Book"), or a lead was
// submitted, it never opens by itself again in this browser session.
function popupSeen(): boolean {
  try {
    return sessionStorage.getItem(POPUP_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function markPopupSeen() {
  try {
    sessionStorage.setItem(POPUP_SEEN_KEY, "1");
  } catch {
    /* storage blocked — popup may show again on reload, which is acceptable */
  }
}

/** Round icon button with a tooltip on hover / keyboard focus (desktop). */
function DesktopCta({
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

/**
 * Floating CTAs: a stacked icon column at the bottom-right on desktop and a
 * 3-button sticky bar on mobile. "Book" opens the lead form in a popup; all
 * CTAs hide while the popup is open.
 */
export function FloatingActions({
  phone,
  whatsapp,
  treatments,
}: {
  phone: string;
  whatsapp: string;
  treatments: string[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const openPopup = (location: CtaLocation) => {
    trackCta("book", location);
    markPopupSeen();
    setOpen(true);
  };

  // Auto-open once per session after the visitor scrolls past 50% of the page.
  useEffect(() => {
    if (popupSeen()) return;
    let frame = 0;

    const check = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0 || window.scrollY / scrollable < AUTO_OPEN_SCROLL_DEPTH) return;
      // Don't interrupt someone typing in the hero form; re-check on the next scroll.
      if (document.activeElement?.closest("form")) return;
      if (popupSeen()) return stop();
      stop();
      markPopupSeen();
      const w = window as Window & { dataLayer?: Record<string, unknown>[] };
      (w.dataLayer ??= []).push({ event: "lead_popup_auto_open", trigger: "scroll_50" });
      setOpen(true);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const stop = () => window.removeEventListener("scroll", onScroll);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stop();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const tel = telHref(phone);
  const wa = whatsappHref(whatsapp);

  return (
    <>
      {/* Desktop: stacked icon buttons (not rendered while the popup is open) */}
      {!open && (
        <ul aria-label="Quick contact" className="fixed right-6 bottom-6 z-40 hidden flex-col gap-3 md:flex">
          <DesktopCta
            href={wa}
            label="Chat on WhatsApp"
            className={WHATSAPP_BG}
            onClick={() => trackCta("whatsapp", "floating_desktop")}
          >
            <WhatsAppIcon className="size-7" />
          </DesktopCta>
          <DesktopCta
            href={tel}
            label={`Call ${phone}`}
            className="bg-brand-700 hover:bg-brand-800"
            onClick={() => trackCta("call", "floating_desktop")}
          >
            <Phone className="size-6" aria-hidden />
          </DesktopCta>
          <DesktopCta
            label="Book Appointment"
            className="bg-accent-600 hover:bg-accent-700"
            onClick={() => openPopup("floating_desktop")}
          >
            <CalendarCheck className="size-6" aria-hidden />
          </DesktopCta>
        </ul>
      )}

      {/* Mobile: sticky bottom bar */}
      {!open && (
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
            onClick={() => openPopup("sticky_mobile")}
            className="flex min-h-14 items-center justify-center gap-1.5 bg-accent-600 text-sm font-semibold text-white active:bg-accent-700"
          >
            <CalendarCheck className="size-5" aria-hidden /> Book
          </button>
        </nav>
      )}

      {/* Lead popup (native <dialog>: focus trap + Esc handled by the browser) */}
      <dialog
        ref={dialogRef}
        aria-label="Book an appointment"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false); // backdrop click
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md overflow-visible bg-transparent p-0 backdrop:bg-brand-950/70 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-10 grid size-10 place-items-center rounded-full bg-white text-brand-950 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="size-5" aria-hidden />
            </button>
            <LeadForm treatments={treatments} title="Book an Appointment" />
          </div>
        )}
      </dialog>
    </>
  );
}
