"use client";

import type { ReactNode } from "react";
import { buttonClass, type ButtonVariant } from "@/components/ui/Button";
import { openLeadPopup } from "@/hooks/useLeadPopup";

/** Button that opens the site-wide <LeadPopup />. */
export function OpenPopupButton({
  location,
  variant = "primary",
  className,
  children,
}: {
  /** Sent to GTM as cta_location. */
  location: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => openLeadPopup(location)}
      className={buttonClass(variant, className)}
    >
      {children}
    </button>
  );
}
