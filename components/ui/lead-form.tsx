"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Info, LoaderCircle } from "lucide-react";
import { LEAD_SUBMITTED_KEY, POPUP_SEEN_KEY, TRACKING_PARAMS, leadSchema, type Lead, type LeadInput } from "@/lib/lead-schema";
import { cn } from "@/lib/utils";

function readTracking(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of TRACKING_PARAMS) {
    const v = params.get(key);
    if (v) out[key] = v.slice(0, 300);
  }
  return out;
}

const field =
  "block w-full min-h-12 rounded-md border bg-white px-4 text-base text-ink placeholder:text-muted " +
  "focus:border-brand-800 focus:ring-2 focus:ring-brand-950/30 focus:outline-none";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 inline-block rounded bg-white px-2 py-0.5 text-xs font-medium text-red-700">
      {message}
    </p>
  );
}

export function LeadForm({
  treatments,
  title = "Get a Call Back from Our Health Advisor",
  className,
}: {
  treatments: string[];
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  // Unique per instance: the form can appear twice (hero + popup).
  const uid = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput, unknown, Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", phone: "", treatment: "", website: "" },
  });

  const onSubmit = async (data: Lead) => {
    setServerError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tracking: readTracking() }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please call us instead.");
      try {
        sessionStorage.setItem(LEAD_SUBMITTED_KEY, data.treatment);
        sessionStorage.setItem(POPUP_SEEN_KEY, "1"); // no auto-popup after a lead
      } catch {
        /* storage blocked — conversion will still be tracked by page view */
      }
      router.push("/thank-you");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className={cn("rounded-xl bg-brand-500 p-6 shadow-2xl shadow-black/30 sm:p-7", className)}>
      <h2 className="text-center text-lg leading-snug font-bold tracking-wide text-brand-950 uppercase sm:text-xl">
        {title}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-3.5">
        <div>
          <label htmlFor={`${uid}-name`} className="sr-only">
            Name
          </label>
          <input
            id={`${uid}-name`}
            type="text"
            autoComplete="name"
            placeholder="Name*"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            className={cn(field, errors.name ? "border-red-600" : "border-white")}
            {...register("name")}
          />
          <FieldError id={`${uid}-name-error`} message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} className="sr-only">
            Mobile number
          </label>
          <div className="flex">
            <span className="inline-flex min-h-12 items-center rounded-l-md border border-r-0 border-white bg-brand-50 px-3 text-base text-muted">
              +91
            </span>
            <input
              id={`${uid}-phone`}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Phone*"
              maxLength={14}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
              className={cn(field, "rounded-l-none", errors.phone ? "border-red-600" : "border-white")}
              {...register("phone")}
            />
          </div>
          <FieldError id={`${uid}-phone-error`} message={errors.phone?.message} />
        </div>

        <div>
          <label htmlFor={`${uid}-treatment`} className="sr-only">
            Treatment
          </label>
          <div className="relative">
            <select
              id={`${uid}-treatment`}
              aria-invalid={!!errors.treatment}
              aria-describedby={errors.treatment ? `${uid}-treatment-error` : undefined}
              className={cn(field, "appearance-none pr-10", errors.treatment ? "border-red-600" : "border-white")}
              {...register("treatment")}
            >
              <option value="" disabled>
                Select treatment*
              </option>
              {treatments.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="Other / Not sure">Other / Not sure</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-muted"
              aria-hidden
            />
          </div>
          <FieldError id={`${uid}-treatment-error`} message={errors.treatment?.message} />
        </div>

        {/* Honeypot: hidden from people and assistive tech */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-website`}>Website</label>
          <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        {serverError && (
          <p role="alert" className="rounded-md bg-white px-3 py-2 text-sm text-red-800">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-950 px-5 text-base font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-950 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            "Submit"
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-brand-950">
          <Info className="size-3.5" aria-hidden />
          We will never share your personal info
        </p>
      </form>
    </div>
  );
}
