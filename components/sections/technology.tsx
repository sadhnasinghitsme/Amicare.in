import { ArrowUpRight } from "lucide-react";
import { Container, Section, SectionHeading, ButtonLink } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/tabs";
import { WpHtml } from "@/components/ui/wp-html";
import { LiteYouTube } from "@/components/ui/lite-youtube";
import type { TechTab, VideoItem } from "@/types/wordpress";

/** `videos` maps a tab id to a video shown beside that tab's text. */
export function Technology({
  tabs,
  videos = {},
}: {
  tabs: TechTab[];
  videos?: Record<string, VideoItem | null>;
}) {
  return (
    <Section id="technology" aria-labelledby="technology-title" className="bg-surface">
      <Container>
        <SectionHeading
          id="technology-title"
          eyebrow="Our Technology"
          title="Advanced Technology for Precise, Faster Recovery"
        />
        <div className="mt-10">
          <Tabs
            label="Technology"
            tabs={tabs.map((tab) => ({
              id: tab.id,
              label: tab.label,
              content: (() => {
                const video = videos[tab.id];
                return (
                  <div className="grid gap-8 rounded-3xl bg-white p-6 ring-1 ring-line sm:p-10 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-center lg:gap-12">
                    <div>
                      <h3 className="text-2xl font-bold text-ink">{tab.heading}</h3>
                      <WpHtml html={tab.html} className="mt-4 max-w-3xl" />
                      <div className="mt-8 flex flex-wrap gap-3">
                        <ButtonLink href="#enquire">Book a Consultation</ButtonLink>
                        {tab.sourceUrl && (
                          <ButtonLink href={tab.sourceUrl} variant="outline" target="_blank" rel="noopener">
                            Learn more <ArrowUpRight className="size-4" aria-hidden />
                            <span className="sr-only">(opens in a new tab)</span>
                          </ButtonLink>
                        )}
                      </div>
                    </div>
                    {video && (
                      <LiteYouTube
                        id={video.id}
                        title={video.title}
                        highRes
                        sizes="(max-width: 1024px) 100vw, 480px"
                        className="rounded-2xl shadow-xl"
                      />
                    )}
                  </div>
                );
              })(),
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}
