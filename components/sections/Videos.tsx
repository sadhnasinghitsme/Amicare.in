import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import type { StoriesContent } from "@/types/wordpress";

export function Videos({ stories }: { stories: StoriesContent }) {
  const videos = stories.videos.slice(0, 4);
  if (videos.length === 0) return null;

  // Only call these "patient stories" when real testimonial videos are configured.
  const heading = stories.isPatientTestimonials
    ? { eyebrow: "Patient Stories", title: "Real Patients, Real Stories" }
    : { eyebrow: "Watch & Learn", title: "Hear From Our Specialists" };

  return (
    <Section id="stories" aria-labelledby="stories-title">
      <Container>
        <SectionHeading id="stories-title" {...heading} />
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((v) => (
            <li key={v.id}>
              <LiteYouTube
                id={v.id}
                title={v.title}
                showTitle={false}
                playButton="youtube"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="rounded-lg"
              />
              <h3 className="mt-4 line-clamp-3 text-lg leading-snug font-bold text-brand-800">{v.title}</h3>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
