"use client";

import { Modal } from "@/components/ui/Modal";
import { LeadForm } from "./LeadForm";
import { closeLeadPopup, popupSeen, showLeadPopup, useLeadPopupOpen } from "@/hooks/useLeadPopup";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";
import { AUTO_OPEN_SCROLL_DEPTH } from "@/lib/constants";
import { pushDataLayer } from "@/lib/utils";

/**
 * The site-wide lead popup. Opened by "Book" buttons (see useLeadPopup) and
 * automatically once per session after the visitor scrolls past 50% —
 * unless they already saw it, sent a lead, or are typing in a form.
 */
export function LeadPopup({ treatments }: { treatments: string[] }) {
  const open = useLeadPopupOpen();

  useScrollTrigger({
    threshold: AUTO_OPEN_SCROLL_DEPTH,
    skip: popupSeen,
    // Don't interrupt someone typing in the hero form.
    defer: () => !!document.activeElement?.closest("form"),
    onTrigger: () => {
      pushDataLayer({ event: "lead_popup_auto_open", trigger: "scroll_50" });
      showLeadPopup();
    },
  });

  return (
    <Modal open={open} onClose={closeLeadPopup} label="Book an appointment">
      <LeadForm treatments={treatments} title="Book an Appointment" />
    </Modal>
  );
}
