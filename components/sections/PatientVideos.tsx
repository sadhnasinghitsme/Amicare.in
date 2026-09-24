import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Slider } from "@/components/ui/Slider";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import { PATIENT_SHORT_IDS } from "@/lib/constants";
import { toVideoItems } from "@/lib/youtube";

/** Server Component: patient-story Shorts; titles from YouTube oEmbed (cached 24h). */
export async function PatientVideos() {
  const videos = await toVideoItems(PATIENT_SHORT_IDS);
  if (videos.length === 0) return null;

  return (
    <Section id="patient-videos" aria-labelledby="patient-videos-title">
      <Container>
        <SectionHeading
          id="patient-videos-title"
          eyebrow="Patient Stories"
          title="Real Patients, Real Stories"
          description="Hear directly from patients about their treatment and recovery at AmiCare."
        />
        <div className="mt-10">
          <Slider
            label="Patient video stories"
            itemClassName="w-[62%] sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)]"
          >
            {videos.map((v) => (
              <div key={v.id}>
                <LiteYouTube
                  id={v.id}
                  title={v.title}
                  portrait
                  showTitle={false}
                  playButton="youtube"
                  sizes="(max-width: 640px) 62vw, (max-width: 1024px) 33vw, 300px"
                  className="rounded-2xl shadow-md"
                />
                <h3 className="mt-3 line-clamp-2 text-base leading-snug font-bold text-brand-800">{v.title}</h3>
              </div>
            ))}
          </Slider>
        </div>
      </Container>
    </Section>
  );
}
