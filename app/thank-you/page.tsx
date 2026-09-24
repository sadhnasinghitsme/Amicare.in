import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleCheckBig, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ConversionTracker } from "@/components/layout/ConversionTracker";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { getLandingContent } from "@/lib/content";
import { BRAND } from "@/lib/constants";
import { telHref, whatsappHref } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage() {
  const { contact, site } = await getLandingContent();

  return (
    <main className="flex min-h-dvh flex-col bg-surface">
      <ConversionTracker />
      <header className="border-b border-line bg-white">
        <Container className="flex h-16 items-center">
          <Link href="/">
            <Image
              src={BRAND.logo}
              alt={site.name}
              width={BRAND.logoWidth}
              height={BRAND.logoHeight}
              className="h-10 w-auto"
              sizes="140px"
            />
          </Link>
        </Container>
      </header>

      <Container className="flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl shadow-brand-900/5 ring-1 ring-line sm:p-12">
          <CircleCheckBig className="mx-auto size-16 text-brand-600" aria-hidden />
          <h1 className="mt-6 text-3xl font-bold text-ink">Thank you!</h1>
          <p className="mt-3 text-muted">
            We&apos;ve received your request. Our care team will call you back shortly to help you book your
            consultation.
          </p>
          <p className="mt-6 text-sm text-muted">Need help right away?</p>
          <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={telHref(contact.primaryPhone)} variant="secondary">
              <Phone className="size-4" aria-hidden /> {contact.primaryPhone}
            </Button>
            <Button href={whatsappHref(contact.whatsapp)} variant="outline" target="_blank" rel="noopener">
              <WhatsAppIcon className="size-5" /> WhatsApp us
            </Button>
          </div>
          <Link href="/" className="mt-8 inline-block text-sm font-medium text-brand-700 hover:underline">
            ← Back to home
          </Link>
        </div>
      </Container>
    </main>
  );
}
