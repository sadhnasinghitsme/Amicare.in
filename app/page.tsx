import type { Metadata } from "next";
import { getLandingContent } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Treatments } from "@/components/sections/Treatments";
import { Specialists } from "@/components/sections/Specialists";
import { WhyAmicare } from "@/components/sections/WhyAmicare";
import { Videos } from "@/components/sections/Videos";
import { Technology } from "@/components/sections/Technology";
import { Testimonials } from "@/components/sections/Testimonials";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/layout/Footer";
import { KeywordTags } from "@/components/sections/KeywordTags";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { LeadPopup } from "@/components/forms/LeadPopup";
import { HospitalJsonLd } from "@/components/layout/HospitalJsonLd";

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
        <Hero hero={hero} teamImage={content.why.teamImage} treatmentOptions={content.treatments.map((t) => t.title)} />
        <Treatments treatments={content.treatments} phone={contact.primaryPhone} />
        <Specialists doctors={content.doctors} />
        <WhyAmicare why={content.why} stats={stats} />
        <Videos stories={content.stories} />
        <Testimonials />
        <Technology tabs={content.technology} videos={{ robotic: content.roboticVideo }} />
        <LatestArticles articles={content.articles} blogUrl={`${site.url}/our-blogs/`} />
        <TrustStrip trust={content.trust} />
        <CTA phone={contact.primaryPhone} teamImage={content.why.teamImage} />
        <KeywordTags keywords={content.keywords} />
      </main>
      <Footer contact={contact} siteName={site.name} />
      <FloatingCTA phone={contact.primaryPhone} whatsapp={contact.whatsapp} />
      <LeadPopup treatments={content.treatments.map((t) => t.title)} />
    </>
  );
}
