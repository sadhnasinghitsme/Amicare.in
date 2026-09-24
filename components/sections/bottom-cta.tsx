import Image from "next/image";
import { Headset, Phone } from "lucide-react";
import { Container, ButtonLink } from "@/components/ui/primitives";
import type { ImageData } from "@/types/wordpress";
import { telHref } from "@/lib/utils";

export function BottomCta({ phone, teamImage }: { phone: string; teamImage: ImageData | null }) {
  return (
    <section aria-labelledby="cta-title" className="bg-white pt-16 sm:pt-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 to-brand-900 px-6 pt-10 sm:px-12 lg:grid lg:grid-cols-2 lg:items-end lg:gap-8 lg:pt-0">
          <div className="pb-10 lg:py-14">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/15 text-white">
              <Headset className="size-6" aria-hidden />
            </span>
            <h2 id="cta-title" className="mt-5 text-3xl font-bold text-balance text-white sm:text-4xl">
              Get Free Assistance
            </h2>
            <p className="mt-3 max-w-md text-brand-100">
              Talk to our care team about your symptoms, treatment options, CGHS or insurance — at no cost.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#enquire">Request a Call Back</ButtonLink>
              <ButtonLink href={telHref(phone)} variant="ghostWhite">
                <Phone className="size-4" aria-hidden /> {phone}
              </ButtonLink>
            </div>
          </div>
          {teamImage && (
            <Image
              src={teamImage.src}
              alt={teamImage.alt}
              width={teamImage.width}
              height={teamImage.height}
              sizes="(max-width: 1024px) 100vw, 600px"
              className="mx-auto -mb-px h-auto w-full max-w-xl self-end"
            />
          )}
        </div>
      </Container>
    </section>
  );
}
