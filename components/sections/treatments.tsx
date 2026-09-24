import { ArrowUpRight, ChevronDown, CircleCheck, Phone } from "lucide-react";
import { Container, Section, SectionHeading, ButtonLink } from "@/components/ui/primitives";
import { WpHtml } from "@/components/ui/wp-html";
import type { Treatment } from "@/types/wordpress";
import { telHref } from "@/lib/utils";

export function Treatments({ treatments, phone }: { treatments: Treatment[]; phone: string }) {
  return (
    <Section id="treatments" aria-labelledby="treatments-title" className="bg-surface">
      <Container>
        <SectionHeading
          id="treatments-title"
          eyebrow="Treatments Available"
          title="Orthopaedic & Joint Replacement Treatments"
          description="Tap a treatment to see how our specialists can help."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-3">
            {treatments.map((t, i) => (
              <details
                key={t.slug}
                name="treatments"
                open={i === 0}
                className="group rounded-2xl bg-white ring-1 ring-line transition-shadow open:shadow-lg open:shadow-brand-900/5"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink sm:px-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                  <h3>{t.title}</h3>
                  <ChevronDown
                    className="size-5 shrink-0 text-brand-700 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="border-t border-line px-5 pt-4 pb-6 sm:px-6">
                  <WpHtml html={t.summaryHtml} className="text-[15px]" />
                  {t.highlights.length > 0 && (
                    <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {t.highlights.map((h) => (
                        <li key={h} className="flex gap-2 text-sm text-ink">
                          <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <ButtonLink href="#enquire">Enquire Now</ButtonLink>
                    <ButtonLink href={t.url} variant="outline" target="_blank" rel="noopener">
                      Read more
                      <ArrowUpRight className="size-4" aria-hidden />
                      <span className="sr-only">about {t.title} (opens in a new tab)</span>
                    </ButtonLink>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <aside className="rounded-3xl bg-brand-800 p-6 text-white sm:p-8 lg:sticky lg:top-24">
            <h3 className="text-xl font-bold">Not sure which treatment you need?</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-100">
              Speak to our orthopaedic care team. We&apos;ll help you understand your options and book the right
              specialist.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink href={telHref(phone)} variant="white">
                <Phone className="size-4" aria-hidden /> {phone}
              </ButtonLink>
              <ButtonLink href="#enquire" variant="ghostWhite">
                Request a Call Back
              </ButtonLink>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
