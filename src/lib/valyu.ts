import "server-only";
import { Valyu } from "valyu-js";
import { unstable_cache } from "next/cache";
import type { Paper } from "./types";
import { ALL_DATASETS, SOURCES, idFromUrl, sourceFromDataset, type SourceId } from "./sources";

let client: Valyu | null = null;

export function valyu(): Valyu {
  if (!process.env.VALYU_API_KEY) {
    throw new Error("VALYU_API_KEY is not set. Add it to .env.local.");
  }
  client ??= new Valyu(process.env.VALYU_API_KEY);
  return client;
}

type RawResult = Awaited<ReturnType<Valyu["search"]>>["results"][number] & {
  pmid?: string;
  pmcid?: string;
};

/** Strip parser markup: tags, markdown links, page anchors, citation brackets. */
function stripMarkup(s: string): string {
  return s
    .replace(/<\/?(?:SEC|AB|REF|F|FG|Front|sup|sub)[^>]*>/gi, " ")
    .replace(/<[^>]{1,80}>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\((?:#|https?:)[^)]*\)/g, "$1")
    .replace(/\(#page-[^)]*\)/g, "")
    .replace(/\\([()[\]])/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2")
    .replace(/^#+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Valyu's abstract field is usually clean, but for some fresh arXiv papers it
 * holds the parsed front matter. Pull out the real abstract when that happens.
 */
function cleanAbstract(raw: string | undefined): string {
  if (!raw) return "";
  let s = raw.replace(/^Title:[^\n]*\n+/, "").replace(/^Authors:[^\n]*\n+/, "");
  const tagged = s.match(/<AB>([\s\S]*?)(?:<\/AB>|$)/i);
  if (tagged) s = tagged[1];
  else if (/<SEC|<REF|<Front/i.test(s)) {
    const after = s.split(/#+\s*abstract\b/i)[1];
    s = after ? after.split(/<\/SEC>|#+\s*\d*\s*introduction/i)[0] : "";
  }
  s = stripMarkup(s).replace(/^(title:\s*)?abstract\b[:.\s]*/i, "");
  if (s.length > 2200) s = s.slice(0, s.lastIndexOf(". ", 2200) + 1);
  return s;
}

/** Page-one images are usually logos; prefer a real figure from later pages. */
function pickFigure(images: Record<string, string> | undefined): string | null {
  const entries = Object.entries(images ?? {});
  if (!entries.length) return null;
  const page = (k: string) => Number(k.match(/page_(\d+)/)?.[1] ?? 99);
  const figures = entries.filter(([k]) => /figure|picture/i.test(k));
  const pool = figures.length ? figures : entries;
  const later = pool.filter(([k]) => page(k) >= 2).sort((a, b) => page(a[0]) - page(b[0]));
  return later[0]?.[1] ?? null;
}

function cleanExcerpt(content: unknown): string {
  const s = typeof content === "string" ? content : "";
  return stripMarkup(s.replace(/^#+[^\n]*\n+/gm, "").replace(/\[(\d+(?:[,–-]\s*\d+)*)\]/g, "")).slice(0, 600);
}

function cleanAuthors(a: unknown): string[] {
  if (!Array.isArray(a)) return [];
  return a.map((x) => String(x).trim()).filter((x) => x && x.toLowerCase() !== "anonymous");
}

function normalize(r: RawResult): Paper | null {
  const source = sourceFromDataset(r.source);
  if (!source || !r.url || !r.title) return null;
  const date = r.publication_date || r.date || null;
  const doi = r.doi ? r.doi.replace(/^https?:\/\/doi\.org\//, "") : null;
  return {
    id: idFromUrl(source, r.url),
    source,
    url: r.url,
    title: r.title.replace(/\s+/g, " ").trim(),
    authors: cleanAuthors(r.authors),
    abstract: cleanAbstract(r.abstract),
    excerpt: cleanExcerpt(r.content),
    date,
    yearOnly: !!date && /-01-01$/.test(date) && source === "arxiv",
    doi,
    citations: typeof r.citation_count === "number" ? r.citation_count : 0,
    relevance: r.relevance_score ?? 0,
    figure: pickFigure(r.image_url),
    citation: r.citation ?? null,
  };
}

/**
 * Valyu returns passages, so one paper can appear several times. Collapse
 * by URL, keeping the best relevance and the richest abstract and figure.
 */
export function dedupe(papers: Paper[]): Paper[] {
  const byUrl = new Map<string, Paper>();
  for (const p of papers) {
    const prev = byUrl.get(p.url);
    if (!prev) {
      byUrl.set(p.url, p);
      continue;
    }
    byUrl.set(p.url, {
      ...prev,
      relevance: Math.max(prev.relevance, p.relevance),
      abstract: prev.abstract.length >= p.abstract.length ? prev.abstract : p.abstract,
      figure: prev.figure ?? p.figure,
      citations: Math.max(prev.citations, p.citations),
      authors: prev.authors.length ? prev.authors : p.authors,
    });
  }
  return [...byUrl.values()];
}

export interface SearchArgs {
  query: string;
  sources?: SourceId[];
  startDate?: string;
  endDate?: string;
  max?: number;
}

/**
 * Valyu answers bursts of parallel calls with transient 403s, and a home page
 * render fans out to ~20 searches. Cap concurrency and retry transient errors.
 */
const MAX_CONCURRENT = 4;
let running = 0;
const queue: Array<() => void> = [];

async function limited<T>(fn: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT) await new Promise<void>((r) => queue.push(r));
  running++;
  try {
    return await fn();
  } finally {
    running--;
    queue.shift()?.();
  }
}

const TRANSIENT = /forbidden|temporarily|rate|timeout|too many|502|503|504/i;

export async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await limited(fn);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (i >= attempts - 1 || !TRANSIENT.test(msg)) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i + Math.random() * 300));
    }
  }
}

async function rawSearch({ query, sources, startDate, endDate, max = 20 }: SearchArgs): Promise<Paper[]> {
  return withRetry(async () => {
    const res = await valyu().search(query, {
      searchType: "proprietary",
      includedSources: sources?.length ? sources.map((s) => SOURCES[s].dataset) : ALL_DATASETS,
      maxNumResults: Math.min(20, Math.max(1, max)),
      startDate,
      endDate,
      responseLength: "short",
    });
    if (!res.success) {
      if (res.error?.toLowerCase().includes("no results")) return [];
      throw new Error(res.error || "Valyu search failed");
    }
    return dedupe((res.results as RawResult[]).map(normalize).filter((p): p is Paper => p !== null));
  });
}

/**
 * Cached search. Figure URLs are signed for an hour, so entries live for 40
 * minutes to keep thumbnails valid while still sparing repeat API calls.
 * Failures throw inside the cache so they are never stored as empty shelves.
 */
const cachedSearch = unstable_cache(rawSearch, ["valyu-search-v6"], { revalidate: 60 * 40 });

export async function searchPapers(args: SearchArgs): Promise<Paper[]> {
  try {
    return await cachedSearch(args);
  } catch (err) {
    console.error("[valyu] search failed", args.query, err instanceof Error ? err.message : err);
    return [];
  }
}

type ContentsOpts = Parameters<Valyu["contents"]>[1];
type AnswerOpts = Parameters<Valyu["answer"]>[1];

/** Contents with retries; transient API errors come back as success:false, so rethrow them. */
export function contents(urls: string[], opts: ContentsOpts) {
  return withRetry(async () => {
    const res = await valyu().contents(urls, opts);
    if (!res.success && "error" in res && res.error) throw new Error(String(res.error));
    return res;
  });
}

/** Non-streaming Answer with retries. */
export function answer(query: string, opts: AnswerOpts) {
  return withRetry(async () => {
    const res = await valyu().answer(query, { ...opts, streaming: false });
    if (Symbol.asyncIterator in res) throw new Error("Unexpected stream");
    if (!res.success) throw new Error(res.error || "Answer failed");
    return res;
  });
}
