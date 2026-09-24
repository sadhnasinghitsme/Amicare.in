import Image from "next/image";
import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BRAND } from "@/lib/constants";
import { telHref } from "@/lib/utils";

/** Dark header that blends into the hero: logo left, click-to-call right. */
export function Header({ phone, siteName }: { phone: string; siteName: string }) {
  const tel = telHref(phone); // "+91 9818248928" → tel:+919818248928
  // Indian mobile grouping for readability: "+91 98182 48928"
  const display = phone.replace(/^(\+91)\s*(\d{5})\s*(\d{5})$/, "$1 $2 $3");
  return (
    <header className="sticky top-0 z-40 bg-brand-900">
      <Container className="flex h-16 items-center justify-between gap-3 md:h-20">
        <a
          href="#top"
          className="flex shrink-0 items-center rounded-lg bg-white px-2 py-1"
          aria-label={`${siteName} — back to top`}
        >
          <Image
            src={BRAND.logo}
            alt={siteName}
            width={BRAND.logoWidth}
            height={BRAND.logoHeight}
            loading="eager"
            className="h-9 w-auto md:h-12"
            sizes="(max-width: 768px) 100px, 132px"
          />
        </a>

        <a
          href={tel}
          aria-label={`Call ${display}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-white [word-spacing:0.18em] hover:text-brand-100 md:gap-2 md:text-lg md:font-bold"
        >
          <Phone className="size-4 md:size-5" aria-hidden />
          {display}
        </a>
      </Container>
    </header>
  );
}
