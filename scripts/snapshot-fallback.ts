/**
 * Refreshes data/fallback.json and data/testimonials.json from the live
 * WordPress site.
 *
 *   npm run snapshot
 *
 * Sections that can't be loaded keep their current fallback value (that's
 * how the loaders work), so a partial outage never wipes the files.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getLandingContent } from "../lib/content";
import { getTestimonials } from "../lib/testimonials";

const write = (name: string, data: unknown) => {
  const file = join(process.cwd(), "data", name);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${file}`);
};

async function main() {
  const [content, testimonials] = await Promise.all([getLandingContent(), getTestimonials()]);

  write("fallback.json", content);
  console.log(
    `  treatments=${content.treatments.length} doctors=${content.doctors.length} ` +
      `articles=${content.articles.length} videos=${content.stories.videos.length} ` +
      `tabs=${content.technology.length} keywords=${content.keywords.length}`,
  );

  write("testimonials.json", testimonials);
  console.log(`  testimonials=${testimonials.items.length} google=${JSON.stringify(testimonials.google)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
