import type { LandingContent } from "@/types/wordpress";
import { SITE_URL } from "@/lib/utils";

/** schema.org Hospital (a MedicalOrganization subtype) for rich results. */
export function HospitalJsonLd({ content }: { content: LandingContent }) {
  const { contact, site, hero, doctors } = content;
  // "Plot No. 15/16 Nyay Khand-1, Indrapuram, Ghaziabad, Uttar Pradesh 201014"
  const parts = contact.address.split(",").map((s) => s.trim());
  const regionPostal = parts.at(-1) ?? "";
  const postalCode = regionPostal.match(/\d{6}/)?.[0];

  const data = {
    "@context": "https://schema.org",
    "@type": ["Hospital", "MedicalOrganization"],
    "@id": `${SITE_URL}/#hospital`,
    name: site.name,
    url: SITE_URL,
    sameAs: [site.url],
    logo: `${SITE_URL}/amicare-logo.png`,
    image: hero.image?.src,
    description: hero.description,
    telephone: contact.primaryPhone.replace(/\s/g, ""),
    email: contact.emails[0],
    medicalSpecialty: ["Orthopedic", "Surgical"],
    address: {
      "@type": "PostalAddress",
      streetAddress: parts.slice(0, -2).join(", "),
      addressLocality: parts.at(-2) ?? "Ghaziabad",
      addressRegion: regionPostal.replace(/\s*\d{6}$/, "") || "Uttar Pradesh",
      postalCode,
      addressCountry: "IN",
    },
    contactPoint: contact.phones.map((p) => ({
      "@type": "ContactPoint",
      telephone: p.replace(/\s/g, ""),
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    })),
    employee: doctors.slice(0, 12).map((d) => ({
      "@type": "Physician",
      name: d.name,
      ...(d.designation ? { description: d.designation } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped is safe to inline
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
