import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import type { TrustContent } from "@/types/wordpress";

export function TrustStrip({ trust }: { trust: TrustContent }) {
  return (
    <section aria-labelledby="trust-title" className="border-y border-line bg-white py-12">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-800">
            <BadgeCheck className="size-4" aria-hidden /> Empanelled &amp; Cashless
          </span>
          <h2 id="trust-title" className="max-w-3xl text-lg font-semibold text-balance text-ink sm:text-xl">
            {trust.text}
          </h2>
        </div>
      </Container>

      {trust.logos.length > 0 && (
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          {/* Logos are duplicated for a seamless loop; the copy is hidden from assistive tech. */}
          <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center gap-10" aria-hidden={copy === 1}>
                {trust.logos.map((logo) => (
                  <li key={logo.src} className="relative h-16 w-24 shrink-0">
                    <Image
                      src={logo.src}
                      alt={copy === 0 ? logo.alt || "Empanelled insurer" : ""}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
