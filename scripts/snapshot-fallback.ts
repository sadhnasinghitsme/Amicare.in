/**
 * Refreshes data/fallback.json from the live WordPress site.
 *
 *   npm run snapshot
 *
 * Sections that can't be loaded keep their current fallback value (that's
 * how getLandingContent works), so a partial outage never wipes the file.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getLandingContent } from "../lib/content";

async function main() {
  const content = await getLandingContent();
  const file = join(process.cwd(), "data", "fallback.json");
  writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`);

  console.log(`Wrote ${file}`);
  console.log(
    `  treatments=${content.treatments.length} doctors=${content.doctors.length} ` +
      `articles=${content.articles.length} videos=${content.stories.videos.length} ` +
      `tabs=${content.technology.length} keywords=${content.keywords.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
