import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";
import type { HeroContent, ImageData } from "@/types/wordpress";

export function Hero({
  hero,
  teamImage,
  treatmentOptions,
}: {
  hero: HeroContent;
  teamImage: ImageData | null;
  treatmentOptions: string[];
}) {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-brand-900">
      {/* Soft decorative pattern + glow behind the doctors */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]"
      />
      <Container className="grid gap-10 pt-6 pb-14 lg:grid-cols-[1.05fr_1fr_380px] lg:items-center lg:gap-10 lg:pt-8 lg:pb-20">
        {teamImage && (
          <div className="relative hidden aspect-square self-end lg:block">
            {/* Circle backdrop, like a spotlight behind the doctors */}
            <div aria-hidden className="absolute inset-[6%] rounded-full bg-brand-800" />
            {/* The cut-out has wide transparent margins, so scale it up from the bottom */}
            <Image
              src={teamImage.src}
              alt={teamImage.alt}
              width={teamImage.width}
              height={teamImage.height}
              loading="eager"
              sizes="(max-width: 1280px) 50vw, 640px"
              className="absolute bottom-0 left-1/2 h-auto w-[155%] max-w-none -translate-x-1/2"
            />
          </div>
        )}

        <div className="text-white">
          <h1 className="text-3xl leading-tight font-bold text-balance sm:text-4xl xl:text-[2.6rem]">{hero.title}</h1>
          {hero.subtitle && <p className="mt-3 text-xl font-semibold text-brand-200">{hero.subtitle}</p>}
          {hero.description && (
            <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">{hero.description}</p>
          )}
          {hero.badges.length > 0 && (
            <ul className="mt-6 space-y-3">
              {hero.badges.map((badge) => (
                <li key={badge.label} className="flex items-start gap-3 text-lg sm:text-xl">
                  <CircleCheck className="mt-0.5 size-6 shrink-0 fill-brand-500 text-brand-900" aria-hidden />
                  <span>
                    <strong className="font-bold">{badge.value}</strong> {badge.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id="enquire" className="scroll-mt-28">
          <LeadForm treatments={treatmentOptions} />
        </div>
      </Container>
    </section>
  );
}
