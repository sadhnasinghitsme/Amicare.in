"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { trackCta } from "@/lib/utils";

/**
 * Tiny global store for the lead popup: any client component can open it
 * (FloatingCTA, OpenPopupButton, the scroll trigger) and read whether it's
 * open (FloatingCTA hides while it is). Rendered once, by <LeadPopup />.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function setOpen(value: boolean) {
  if (isOpen === value) return;
  isOpen = value;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLeadPopupOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isOpen,
    () => false,
  );
}

/* ------------------------------------------------ "seen" for this session */

/** Popup already shown (or lead sent) this session → never auto-open again. */
export function popupSeen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.popupSeen) === "1";
  } catch {
    return false;
  }
}

export function markPopupSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEYS.popupSeen, "1");
  } catch {
    /* storage blocked — popup may show again on reload, which is acceptable */
  }
}

/* --------------------------------------------------------------- actions */

/** Open without tracking a CTA click (used by the scroll trigger). */
export function showLeadPopup() {
  markPopupSeen();
  setOpen(true);
}

/** "Book" buttons: track the click in GTM, then open. */
export function openLeadPopup(location: string) {
  trackCta("book", location);
  showLeadPopup();
}

export function closeLeadPopup() {
  setOpen(false);
}
