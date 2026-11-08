import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const data = JSON.parse(
  readFileSync(new URL("../public/data/github.json", import.meta.url)),
);
for (const [period, calendar] of Object.entries({
  rolling: data.calendar,
  ...data.calendars,
})) {
  test(`${period}: all real dates are unique, contiguous and reconcile to GitHub total`, () => {
    const days = calendar.weeks.flatMap((w) => w.contributionDays);
    assert.ok(days.length > 0);
    assert.equal(new Set(days.map((d) => d.date)).size, days.length);
    assert.equal(
      days.reduce((s, d) => s + d.contributionCount, 0),
      calendar.totalContributions,
    );
    days.forEach((d, i) => {
      assert.ok(
        Number.isInteger(d.contributionCount) && d.contributionCount >= 0,
      );
      if (i)
        assert.equal(
          Date.parse(d.date) - Date.parse(days[i - 1].date),
          86400000,
        );
    });
  });
}
test("repository links belong to the requested public account", () => {
  assert.equal(data.user.login, "pali2410");
  assert.ok(data.repos.some((r) => r.name === "custom"));
  for (const r of data.repos)
    assert.equal(r.url, `https://github.com/pali2410/${r.name}`);
});
