import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
const query = `query { user(login:"pali2410") { login name url contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount color } } } } } }`;
function api(args) {
  return JSON.parse(execFileSync("gh", ["api", ...args], { encoding: "utf8" }));
}
const raw = api(["graphql", "-f", `query=${query}`]);
if (raw.errors || !raw.data?.user)
  throw new Error("GitHub contribution query failed");
const repos = api(["users/pali2410/repos?per_page=100"])
  .filter((r) => !r.fork)
  .map(
    ({
      name,
      description,
      language,
      html_url,
      stargazers_count,
      updated_at,
    }) => ({
      name,
      description,
      language,
      url: html_url,
      stars: stargazers_count,
      updatedAt: updated_at,
    }),
  );
const user = raw.data.user;
const calendars = {};
const currentYear = new Date().getUTCFullYear();
for (const year of [currentYear - 1, currentYear]) {
  const q = `query { user(login:"pali2410") { contributionsCollection(from:"${year}-01-01T00:00:00Z",to:"${year === currentYear ? new Date().toISOString() : `${year}-12-31T23:59:59Z`}") { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount color } } } } } }`;
  const result = api(["graphql", "-f", `query=${q}`]);
  if (result.errors || !result.data?.user)
    throw new Error(`Historical calendar ${year} failed`);
  calendars[year] =
    result.data.user.contributionsCollection.contributionCalendar;
}
const data = {
  source: "GitHub GraphQL API / REST API",
  fetchedAt: new Date().toISOString(),
  user: { login: user.login, name: user.name.trim(), url: user.url },
  calendar: user.contributionsCollection.contributionCalendar,
  calendars,
  repos,
};
await mkdir("public/data", { recursive: true });
await writeFile(
  "public/data/github.json",
  JSON.stringify(data, null, 2) + "\n",
);
console.log(
  `Saved ${data.calendar.weeks.flatMap((w) => w.contributionDays).length} verified days and ${repos.length} repositories.`,
);
