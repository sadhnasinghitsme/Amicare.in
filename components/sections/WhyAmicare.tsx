import {
  Activity,
  Ambulance,
  BadgeCheck,
  CircleCheck,
  FlaskConical,
  HeartPulse,
  MonitorCog,
  Pill,
  ScanLine,
  Siren,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import { FACILITIES, type FacilityIcon } from "@/lib/constants";
import type { Stat, WhyContent } from "@/types/wordpress";

const FACILITY_ICONS: Record<FacilityIcon, LucideIcon> = {
  emergency: Siren,
  icu: HeartPulse,
  ot: MonitorCog,
  xray: ScanLine,
  lab: FlaskConical,
  pharmacy: Pill,
  ambulance: Ambulance,
  physio: Activity,
  cghs: BadgeCheck,
};

export function WhyAmicare({ why, stats }: { why: WhyContent; stats: Stat[] }) {
  return (
    <Section id="why-amicare" aria-labelledby="why-title" className="bg-surface">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <SectionHeading id="why-title" eyebrow="Why AmiCare" title={why.heading} />
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
              {why.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </div>

          {why.video && (
            <LiteYouTube
              id={why.video.id}
              title={why.video.title}
              highRes
              sizes="(max-width: 1024px) 100vw, 600px"
              className="rounded-2xl shadow-xl"
            />
          )}
        </div>

        {why.reasons.length > 0 && (
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {why.reasons.map((r) => (
              <li key={r.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-line">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-50 text-accent-600">
                  <CircleCheck className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-ink">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {stats.length > 0 && (
          <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col rounded-2xl bg-white p-5 text-center ring-1 ring-line">
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="order-first text-3xl font-extrabold text-brand-700">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <h3 className="mt-14 text-xl font-bold text-ink">Facilities under one roof</h3>
        <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-5 lg:grid-cols-9">
          {FACILITIES.map((f) => {
            const Icon = FACILITY_ICONS[f.icon];
            return (
              <li
                key={f.label}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-line"
              >
                <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="text-xs leading-tight font-semibold text-ink sm:text-sm">{f.label}</span>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
