import { Container } from "@/components/ui/Container";
import type { KeywordLink } from "@/types/wordpress";

/** "Popular searches" pills linking to the WP treatment/location pages (SEO). */
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
