import Image from "next/image";
import { CalendarCheck, UserRound } from "lucide-react";
import { Container, Section, SectionHeading, ButtonLink } from "@/components/ui/primitives";
import { Carousel } from "@/components/ui/carousel";
import type { Doctor } from "@/types/wordpress";

export function Specialists({ doctors }: { doctors: Doctor[] }) {
  return (
    <Section id="specialists" aria-labelledby="specialists-title">
      <Container>
        <SectionHeading
          id="specialists-title"
          eyebrow="Our Specialists"
          title="Meet the Doctors Behind Your Recovery"
          description="Experienced surgeons and physicians working together under one roof."
        />
        <div className="mt-10">
          <Carousel label="Our specialists" itemClassName="w-[78%] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
            {doctors.map((doc) => (
              <article
                key={doc.name}
                className="flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-line"
              >
                <div className="relative aspect-square bg-brand-50">
                  {doc.photo ? (
                    <Image
                      src={doc.photo.src}
                      alt={doc.photo.alt}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 300px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <UserRound className="absolute inset-0 m-auto size-20 text-brand-200" aria-hidden />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-ink">{doc.name}</h3>
                  <p className="mt-1 text-sm text-brand-700">{doc.designation}</p>
                  {doc.profileUrl && (
                    <a
                      href={doc.profileUrl}
                      target="_blank"
                      rel="noopener"
                      className="mt-1 text-sm font-medium text-muted underline underline-offset-2 hover:text-brand-800"
                    >
                      View profile<span className="sr-only"> of {doc.name} (opens in a new tab)</span>
                    </a>
                  )}
                  <div className="mt-auto pt-5">
                    <ButtonLink href="#enquire" className="w-full">
                      <CalendarCheck className="size-4" aria-hidden />
                      Book Appointment
                    </ButtonLink>
                  </div>
                </div>
              </article>
            ))}
          </Carousel>
        </div>
      </Container>
    </Section>
  );
}
