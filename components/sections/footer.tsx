import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import type { ContactInfo, KeywordLink } from "@/types/wordpress";
import { telHref } from "@/lib/utils";

export function KeywordTags({ keywords }: { keywords: KeywordLink[] }) {
  if (keywords.length === 0) return null;
  return (
    <section aria-labelledby="keywords-title" className="bg-white py-14">
      <Container>
        <h2 id="keywords-title" className="text-sm font-semibold tracking-wider text-muted uppercase">
          Popular searches
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {keywords.map((k) => (
            <li key={k.url}>
              <a
                href={k.url}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-9 items-center rounded-full bg-surface px-3.5 py-1.5 text-sm text-ink ring-1 ring-line transition-colors hover:bg-brand-50 hover:text-brand-800"
              >
                {k.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function Footer({ contact, siteName }: { contact: ContactInfo; siteName: string }) {
  return (
    <footer id="contact" className="bg-brand-950 pb-24 text-brand-100 md:pb-0">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_1fr_1.3fr]">
        <div>
          <div className="inline-block rounded-2xl bg-white p-3">
            <Image src="/amicare-logo.png" alt={siteName} width={480} height={175} className="h-12 w-auto" sizes="140px" />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Orthopaedic &amp; robotic joint replacement care in Indirapuram, Ghaziabad.
          </p>
        </div>

        <address className="space-y-5 text-sm not-italic">
          <h2 className="text-base font-semibold text-white">Contact us</h2>
          <p className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-brand-200" aria-hidden />
            {contact.address}
          </p>
          <div className="flex gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-brand-200" aria-hidden />
            <ul className="space-y-1">
              {contact.phones.map((p) => (
                <li key={p}>
                  <a href={telHref(p)} className="hover:text-white">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-brand-200" aria-hidden />
            <ul className="space-y-1">
              {contact.emails.map((e) => (
                <li key={e}>
                  <a href={`mailto:${e}`} className="break-all hover:text-white">
                    {e}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </address>

        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <iframe
            src={contact.mapEmbedUrl}
            title={`Map: ${contact.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full border-0 lg:h-full lg:min-h-64"
          />
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-6 text-xs text-brand-200">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
