import { z } from "zod";

/** Shared by the client form and the /api/lead route handler. */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(80, "Name is too long")
    .regex(/^[\p{L} .'-]+$/u, "Please use letters only"),
  phone: z
    .string()
    .trim()
    // accept "+91 98182 48928", "098182-48928", … and keep the 10 digits
    .transform((v) => v.replace(/[\s()-]/g, "").replace(/^(?:\+?91|0)(?=\d{10}$)/, ""))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  treatment: z.string().trim().min(1, "Please select a treatment").max(120),
  /** Honeypot — real users never see or fill this. */
  website: z.string().max(0).optional(),
  /** UTM / gclid parameters captured from the landing URL. */
  tracking: z.record(z.string(), z.string().max(300)).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;
