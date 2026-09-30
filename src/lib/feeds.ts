import "server-only";
import { CATEGORIES, type Category } from "./categories";
import { SOURCES, type SourceId } from "./sources";
import type { Paper } from "./types";
import { dedupe, searchPapers } from "./valyu";

const DAY = 86_400_000;

export function isoDaysAgo(days: number, from = new Date()): string {
  return new Date(from.getTime() - days * DAY).toISOString().slice(0, 10);
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function ageDays(p: Paper): number {
  if (!p.date) return 365;
  return Math.max(0, (Date.now() - new Date(p.date).getTime()) / DAY);
}

/**
 * Trending = what Valyu judges most relevant to a live topic, decayed by age
 * and nudged by early citations. There is no social signal in the archives,
 * so this favours fresh, on-topic, already-noticed work.
 */
export function trendScore(p: Paper): number {
  const recency = Math.exp(-ageDays(p) / 30);
  return (0.35 + p.relevance) * (0.25 + recency) * (1 + 0.2 * Math.log1p(p.citations));
}

/** Round-robin by archive so one source never floods a shelf. */
function interleave(papers: Paper[]): Paper[] {
  const buckets = new Map<SourceId, Paper[]>();
  for (const p of papers) {
    const list = buckets.get(p.source) ?? [];
    list.push(p);
    buckets.set(p.source, list);
  }
  const out: Paper[] = [];
  const lists = [...buckets.values()];
  for (let i = 0; out.length < papers.length; i++) {
    for (const l of lists) if (l[i]) out.push(l[i]);
  }
  return out;
}

async function recentFor(query: string, sources: SourceId[], days: number, max = 12): Promise<Paper[]> {
  const found = await searchPapers({ query, sources, startDate: isoDaysAgo(days), max });
  if (found.length >= 3) return found;
  // Some archives are indexed less often; widen the window rather than show an empty shelf.
  return searchPapers({ query, sources, startDate: isoDaysAgo(days * 4), max });
}

const HOME_TRENDING: Array<{ query: string; sources: SourceId[] }> = [
  { query: "large language model reasoning agents", sources: ["arxiv"] },
  { query: "neural circuits behavior", sources: ["biorxiv"] },
  { query: "cancer immunotherapy clinical outcomes", sources: ["pubmed"] },
  { query: "catalysis materials discovery", sources: ["chemrxiv"] },
  { query: "quantum computing error correction", sources: ["arxiv"] },
  { query: "single-cell genomics atlas", sources: ["biorxiv", "pubmed"] },
];

export async function getTrending(limit = 12): Promise<Paper[]> {
  const batches = await Promise.all(HOME_TRENDING.map((t) => recentFor(t.query, t.sources, 45, 10)));
  const ranked = dedupe(batches.flat())
    .filter((p) => p.abstract.length > 120 || p.excerpt.length > 120)
    .sort((a, b) => trendScore(b) - trendScore(a));
  return interleave(ranked).slice(0, limit);
}

export async function getMostCited(limit = 10): Promise<Paper[]> {
  const picks = CATEGORIES.filter((_, i) => i % 2 === 0);
  const batches = await Promise.all(
    picks.map((c) => searchPapers({ query: c.seeds[0], sources: c.sources, max: 20 })),
  );
  return dedupe(batches.flat())
    .filter((p) => p.citations > 0)
    .sort((a, b) => b.citations - a.citations)
    .slice(0, limit);
}

/**
 * One paper a day, stable for everyone: the date picks a catalogue drawer,
 * then the date again picks among that drawer's strongest recent papers.
 */
export async function getPaperOfTheDay(): Promise<{ paper: Paper; category: Category } | null> {
  const day = todayKey();
  const h = hash(day);
  for (let attempt = 0; attempt < 3; attempt++) {
    const category = CATEGORIES[(h + attempt * 5) % CATEGORIES.length];
    const seed = category.seeds[(h >> 3) % category.seeds.length];
    const found = await recentFor(seed, category.sources, 30, 15);
    const pool = found
      .filter((p) => p.abstract.length > 200 && p.authors.length > 0)
      .sort((a, b) => trendScore(b) - trendScore(a))
      .slice(0, 4);
    if (pool.length) return { paper: pool[(h >> 7) % pool.length], category };
  }
  return null;
}

export type ShelfOrder = "trending" | "cited" | "relevant";

export async function getCategoryShelf(category: Category, order: ShelfOrder): Promise<Paper[]> {
  if (order === "trending") {
    const batches = await Promise.all(category.seeds.map((s) => recentFor(s, category.sources, 60, 15)));
    return interleave(dedupe(batches.flat()).sort((a, b) => trendScore(b) - trendScore(a)));
  }
  const batches = await Promise.all(
    category.seeds.map((s) => searchPapers({ query: s, sources: category.sources, max: 20 })),
  );
  const all = dedupe(batches.flat());
  return order === "cited"
    ? all.sort((a, b) => b.citations - a.citations || b.relevance - a.relevance)
    : all.sort((a, b) => b.relevance - a.relevance);
}

/** Per-archive front page: the newest strong work across that archive's drawers. */
export async function getArchiveShelf(source: SourceId): Promise<Paper[]> {
  const drawers = CATEGORIES.filter((c) => c.sources.includes(source)).slice(0, 4);
  const batches = await Promise.all(drawers.map((c) => recentFor(c.seeds[0], [source], 45, 10)));
  return dedupe(batches.flat()).sort((a, b) => trendScore(b) - trendScore(a));
}

export function sourceName(id: SourceId): string {
  return SOURCES[id].name;
}
