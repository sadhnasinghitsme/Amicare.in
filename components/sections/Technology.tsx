import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { WpHtml } from "@/components/ui/WpHtml";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import type { TechTab, VideoItem } from "@/types/wordpress";

/** `videos` maps a tab id to a video shown beside that tab's text. */
export function Technology({ tabs, videos = {} }: { tabs: TechTab[]; videos?: Record<string, VideoItem | null> }) {
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
                  <Card className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-center lg:gap-12">
                    <div>
                      <h3 className="text-2xl font-bold text-ink">{tab.heading}</h3>
                      <WpHtml html={tab.html} className="mt-4 max-w-3xl" />
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button href="#enquire">Book a Consultation</Button>
                        {tab.sourceUrl && (
                          <Button href={tab.sourceUrl} variant="outline" target="_blank" rel="noopener">
                            Learn more <ArrowUpRight className="size-4" aria-hidden />
                            <span className="sr-only">(opens in a new tab)</span>
                          </Button>
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
                  </Card>
                );
              })(),
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}
