import { CalendarCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OpenPopupButton } from "@/components/forms/OpenPopupButton";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { Stars } from "@/components/ui/Stars";
import { AutoplaySlider } from "@/components/ui/AutoplaySlider";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { getTestimonials } from "@/lib/testimonials";

/** Server Component: loads reviews from WordPress (ISR, 1h) with a JSON fallback. */
export async function Testimonials() {
  const { items, google } = await getTestimonials();
  if (items.length === 0) return null;

  return (
    <Section id="testimonials" aria-labelledby="testimonials-title" className="bg-brand-50">
      <Container>
        <SectionHeading
          id="testimonials-title"
          eyebrow="Patient Testimonials"
          title="What Our Patients Say"
          align="center"
        />

        <div className="mt-10">
          <AutoplaySlider label="Patient testimonials" itemLabel="testimonial">
            {items.map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} t={t} />
            ))}
          </AutoplaySlider>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6">
          {google && (
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-line">
              <GoogleIcon className="size-9 shrink-0" />
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">Google Rating</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Stars value={google.stars} size="size-[18px]" />
                  <span className="text-sm font-semibold text-ink">
                    {google.reviewCount.toLocaleString("en-IN")} reviews
                  </span>
                </div>
              </div>
            </div>
          )}
          <OpenPopupButton location="testimonials" className="px-6 text-base">
            <CalendarCheck className="size-5" aria-hidden />
            Book Consultation
          </OpenPopupButton>
        </div>
      </Container>
    </Section>
  );
}
