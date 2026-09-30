import "server-only";
import { unstable_cache } from "next/cache";
import { SOURCES, SOURCE_IDS, urlFromId, type SourceId } from "./sources";
import { BRIEF_JSON_SCHEMA, briefSchema, type Brief, type Paper } from "./types";
import { answer, contents, searchPapers } from "./valyu";

function titleFromContents(title: string): string {
  return title.replace(/^\[[^\]]+\]\s*/, "").replace(/\s*[|–-]\s*(arXiv|bioRxiv|PubMed|PMC|chemRxiv).*$/i, "").trim();
}

/**
 * Resolve a paper from its route. Links inside the app carry a title hint,
 * which lets one cheap search recover full metadata. Cold links fall back to
 * reading the landing page with Valyu Contents to learn the title first.
 */
const resolvePaperCached = unstable_cache(
  async (source: SourceId, id: string, titleHint?: string): Promise<Paper> => {
    const url = urlFromId(source, id);
    const match = (list: Paper[]) =>
      list.find((p) => p.id === id || p.url === url || (p.doi && id.endsWith(p.doi)));

    const queries = [titleHint, id].filter(Boolean) as string[];
    for (const q of queries) {
      const hit = match(await searchPapers({ query: q, sources: [source], max: 5 }));
      if (hit) return hit;
    }

    try {
      const res = await contents([url], { responseLength: "short" });
      const r = "results" in res ? res.results?.[0] : undefined;
      if (r && r.status === "success") {
        const title = titleFromContents(r.title);
        const hit = match(await searchPapers({ query: title, sources: [source], max: 5 }));
        if (hit) return hit;
        return {
          id,
          source,
          url,
          title,
          authors: [],
          abstract: String(r.description ?? "").trim(),
          excerpt: String(r.content ?? "").slice(0, 600),
          date: r.publication_date ?? null,
          yearOnly: false,
          doi: null,
          citations: 0,
          relevance: 0,
          figure: null,
          citation: r.citation ?? null,
        };
      }
    } catch (err) {
      console.error("[valyu] contents resolve failed", url, err);
    }
    throw new Error(`Could not resolve ${source}:${id}`);
  },
  ["resolve-paper-v4"],
  { revalidate: 60 * 40 },
);

function coerceBrief(raw: unknown): Brief | null {
  const obj = typeof raw === "string" ? safeJson(raw) : raw;
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : []);
  const parsed = briefSchema.safeParse({
    tldr: String(o.tldr ?? ""),
    eli5: String(o.eli5 ?? ""),
    contributions: arr(o.contributions),
    method: String(o.method ?? ""),
    results: arr(o.results),
    limitations: arr(o.limitations),
    why_it_matters: String(o.why_it_matters ?? ""),
    keywords: arr(o.keywords),
  });
  return parsed.success && parsed.data.tldr ? parsed.data : null;
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export interface BriefResult {
  brief: Brief;
  via: "contents" | "answer";
}

/**
 * The Valyu Brief. Contents reads the paper itself and returns a structured
 * summary. Some publishers refuse direct fetches (chemRxiv), so we fall back
 * to the Answer API grounded in Valyu's own index of that archive.
 */
const getBriefCached = unstable_cache(
  async (url: string, title: string, source: SourceId): Promise<BriefResult> => {
    try {
      const res = await contents([url], { responseLength: "large", summary: BRIEF_JSON_SCHEMA });
      const r = "results" in res ? res.results?.[0] : undefined;
      if (r && r.status === "success") {
        const brief = coerceBrief(r.summary);
        if (brief) return { brief, via: "contents" };
      }
    } catch (err) {
      console.error("[valyu] brief via contents failed", url, err);
    }

    try {
      const res = await answer(
        `Summarise the ${SOURCES[source].name} paper titled "${title}".`,
        {
          searchType: "proprietary",
          includedSources: [SOURCES[source].dataset],
          systemInstructions: `Only use passages from the paper titled "${title}". Do not describe other papers.`,
          structuredOutput: BRIEF_JSON_SCHEMA,
        },
      );
      if (res.success) {
        const brief = coerceBrief(res.contents);
        if (brief) return { brief, via: "answer" };
      }
    } catch (err) {
      console.error("[valyu] brief via answer failed", url, err);
    }
    throw new Error(`No brief for ${url}`);
  },
  ["valyu-brief-v2"],
  { revalidate: 60 * 60 * 24 * 7 },
);

const askPaperCached = unstable_cache(
  async (url: string, title: string, source: SourceId, question: string): Promise<string> => {
    const instruction = `You are a careful research assistant. Answer the reader's question from this paper. For factual questions, cite specifics (numbers, datasets, sections) and say plainly if the paper does not cover it. For interpretive questions (critiques, implications, how to reproduce), reason from the paper's methods, data and stated results, as an expert reviewer would. Under 170 words, Markdown.\n\nQuestion: ${question}`;
    try {
      const res = await contents([url], { responseLength: "large", summary: instruction });
      const r = "results" in res ? res.results?.[0] : undefined;
      if (r && r.status === "success" && typeof r.summary === "string" && r.summary.trim()) {
        return r.summary.trim();
      }
    } catch (err) {
      console.error("[valyu] ask via contents failed", url, err);
    }
    try {
      const res = await answer(`${question} (about the paper "${title}")`, {
        searchType: "proprietary",
        includedSources: [SOURCES[source].dataset],
        systemInstructions: `Answer only from the paper titled "${title}". Under 150 words. Say so if the paper does not address the question.`,
      });
      if (typeof res.contents === "string") {
        return res.contents.trim();
      }
    } catch (err) {
      console.error("[valyu] ask via answer failed", url, err);
    }
    throw new Error(`No answer for ${url}`);
  },
  ["valyu-ask-paper-v3"],
  { revalidate: 60 * 60 * 24 * 7 },
);

/**
 * Cross-archive neighbours: the same idea searched in every archive at once,
 * so an arXiv method can surface its PubMed application and vice versa.
 */
export async function getRelated(paper: Paper, hint = ""): Promise<Record<SourceId, Paper[]>> {
  const query = `${paper.title}. ${hint || paper.abstract.slice(0, 200)}`.slice(0, 400);
  const lists = await Promise.all(
    SOURCE_IDS.map((s) => searchPapers({ query, sources: [s], max: s === "chemrxiv" ? 4 : 6 })),
  );
  const out = {} as Record<SourceId, Paper[]>;
  SOURCE_IDS.forEach((s, i) => {
    out[s] = lists[i].filter((p) => p.url !== paper.url && p.title !== paper.title).slice(0, 4);
  });
  return out;
}

/** Cached wrappers throw on failure so misses are retried later rather than stored. */
function orNull<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch {
      return null;
    }
  };
}

export const resolvePaper = orNull(resolvePaperCached);
export const getBrief = orNull(getBriefCached);
export const askPaper = orNull(askPaperCached);
