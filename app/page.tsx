import type { Metadata } from "next";
import { getLandingContent } from "@/lib/content";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Treatments } from "@/components/sections/treatments";
import { Specialists } from "@/components/sections/specialists";
import { WhyAmicare } from "@/components/sections/why-amicare";
import { PatientStories } from "@/components/sections/patient-stories";
import { Technology } from "@/components/sections/technology";
import { LatestArticles } from "@/components/sections/latest-articles";
import { TrustStrip } from "@/components/sections/trust-strip";
import { BottomCta } from "@/components/sections/bottom-cta";
import { Footer, KeywordTags } from "@/components/sections/footer";
import { FloatingActions } from "@/components/sections/floating-actions";
import { HospitalJsonLd } from "@/components/ui/json-ld";

// ISR: rebuild the page from WordPress at most once an hour.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { seo, site } = await getLandingContent();
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  };
}

export default async function Home() {
  const content = await getLandingContent();
  const { hero, contact, site } = content;

  // Don't repeat a counter that a hero badge already covers (e.g. robotic cases).
  const badgeTopics = hero.badges.map((b) => b.label.toLowerCase().split(" ")[0]);
  const stats = content.stats.filter((s) => !badgeTopics.some((t) => s.label.toLowerCase().includes(t)));

  return (
    <>
      <HospitalJsonLd content={content} />
      <Header phone={contact.primaryPhone} siteName={site.name} />
      <main>
        <Hero
          hero={hero}
          teamImage={content.why.teamImage}
          treatmentOptions={content.treatments.map((t) => t.title)}
        />
        <Treatments treatments={content.treatments} phone={contact.primaryPhone} />
        <Specialists doctors={content.doctors} />
        <WhyAmicare why={content.why} stats={stats} />
        <PatientStories stories={content.stories} />
        <Technology tabs={content.technology} videos={{ robotic: content.roboticVideo }} />
        <LatestArticles articles={content.articles} blogUrl={`${site.url}/our-blogs/`} />
        <TrustStrip trust={content.trust} />
        <BottomCta phone={contact.primaryPhone} teamImage={content.why.teamImage} />
        <KeywordTags keywords={content.keywords} />
      </main>
      <Footer contact={contact} siteName={site.name} />
      <FloatingActions
        phone={contact.primaryPhone}
        whatsapp={contact.whatsapp}
        treatments={content.treatments.map((t) => t.title)}
      />
    </>
  );
}
