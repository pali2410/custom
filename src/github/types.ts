export interface Day {
  date: string;
  contributionCount: number;
  color: string;
}
export interface Calendar {
  totalContributions: number;
  weeks: { contributionDays: Day[] }[];
}
export interface GitHubData {
  source: string;
  fetchedAt: string;
  user: { login: string; name: string; url: string };
  calendar: Calendar;
  calendars: Record<string, Calendar>;
  repos: {
    name: string;
    description: string | null;
    language: string | null;
    url: string;
    stars: number;
    updatedAt: string;
  }[];
}
