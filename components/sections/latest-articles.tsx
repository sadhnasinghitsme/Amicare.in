import Image from "next/image";
import { ArrowRight, Newspaper } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import type { Article } from "@/types/wordpress";
import { formatDate } from "@/lib/utils";

export function LatestArticles({ articles, blogUrl }: { articles: Article[]; blogUrl: string }) {
  if (articles.length === 0) return null;
  return (
    <Section id="articles" aria-labelledby="articles-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="articles-title"
            eyebrow="Latest Articles"
            title="Health Tips from AmiCare Experts"
          />
          <a
            href={blogUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            View all articles <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-line transition-shadow hover:shadow-xl hover:shadow-brand-900/5">
                <div className="relative aspect-[16/10] bg-brand-50">
                  {a.image ? (
                    <Image
                      src={a.image.src}
                      alt={a.image.alt || a.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Newspaper className="absolute inset-0 m-auto size-12 text-brand-200" aria-hidden />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs text-muted">
                    <time dateTime={a.date}>{formatDate(a.date)}</time>
                    {a.author && <> · {a.author}</>}
                  </p>
                  <h3 className="mt-2 text-lg leading-snug font-bold text-ink">
                    <a href={a.url} target="_blank" rel="noopener" className="after:absolute after:inset-0">
                      {a.title}
                    </a>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{a.excerpt}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand-700">
                    Read article <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
