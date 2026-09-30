import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Ledger, LedgerSkeleton } from "@/components/ledger";
import { SearchSlip } from "@/components/search-slip";
import { isoDaysAgo } from "@/lib/feeds";
import { SOURCE_IDS, SOURCES, isSourceId, type SourceId } from "@/lib/sources";
import { searchPapers } from "@/lib/valyu";

export const dynamic = "force-dynamic";

const SORTS = { relevant: "Most relevant", cited: "Most cited", newest: "Newest" } as const;
const WINDOWS = { any: ["Any time", null], month: ["Past month", 31], year: ["Past year", 365], five: ["Past 5 years", 365 * 5] } as const;
type Sort = keyof typeof SORTS;
type Window = keyof typeof WINDOWS;

type Props = PageProps<"/search">;

function str(v: string | string[] | undefined) {
  return typeof v === "string" ? v : "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = str((await searchParams).q);
  return { title: q ? `“${q}”` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const sources = str(sp.src).split(",").filter(isSourceId);
  const sort: Sort = str(sp.sort) in SORTS ? (str(sp.sort) as Sort) : "relevant";
  const when: Window = str(sp.when) in WINDOWS ? (str(sp.when) as Window) : "any";

  const href = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    const base = { q, src: sources.join(","), sort, when, ...patch };
    for (const [k, v] of Object.entries(base)) if (v && !(k === "sort" && v === "relevant") && !(k === "when" && v === "any")) next.set(k, v);
    return `/search?${next}`;
  };
  const toggleSource = (s: SourceId) => {
    const set = new Set(sources);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    return href({ src: [...set].join(",") || null });
  };

  return (
    <div className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pb-10 pt-12 sm:px-8">
      <p className="label mb-4">Search · four archives</p>
      <div className="max-w-3xl">
        <SearchSlip defaultValue={q} autoFocus={!q} hidden={{ ...(sources.length ? { src: sources.join(",") } : {}), ...(when !== "any" ? { when } : {}) }} />
      </div>

      {q && (
        <>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] tracking-[-0.025em] text-ink">
              <span className="text-ink-3">Results for </span>
              <em className="hl on">{q}</em>
            </h1>
            <Link href={`/ask?q=${encodeURIComponent(q)}`} className="group inline-flex items-center gap-3 border border-ink bg-sheet px-4 py-3 transition hover:bg-ink hover:text-sheet">
              <span className="hand text-xl text-iron group-hover:text-sheet">or ask it as a question</span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em]">Ask the stacks →</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-4 border-y border-rule py-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label mr-1">Archives</span>
              {SOURCE_IDS.map((s) => {
                const on = sources.length === 0 || sources.includes(s);
                return (
                  <Link key={s} href={toggleSource(s)} className={`src-${s} inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] transition ${on ? "border-current" : "border-rule opacity-50 hover:opacity-100"}`} style={{ color: "var(--src)" }}>
                    {SOURCES[s].name}
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="label">When</span>
              {(Object.keys(WINDOWS) as Window[]).map((w) => (
                <Link key={w} href={href({ when: w })} className={`text-sm ${when === w ? "text-ink underline decoration-oxblood decoration-2 underline-offset-4" : "text-ink-3 hover:text-ink"}`}>
                  {WINDOWS[w][0]}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="label">Order</span>
              {(Object.keys(SORTS) as Sort[]).map((s) => (
                <Link key={s} href={href({ sort: s })} className={`text-sm ${sort === s ? "text-ink underline decoration-oxblood decoration-2 underline-offset-4" : "text-ink-3 hover:text-ink"}`}>
                  {SORTS[s]}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Suspense key={`${q}|${sources}|${sort}|${when}`} fallback={<LedgerSkeleton />}>
              <Results q={q} sources={sources} sort={sort} when={when} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}

async function Results({ q, sources, sort, when }: { q: string; sources: SourceId[]; sort: Sort; when: Window }) {
  const days = WINDOWS[when][1];
  const startDate = days ? isoDaysAgo(days) : undefined;
  const pool = sources.length ? sources : [...SOURCE_IDS];
  // One call per archive keeps every archive represented instead of letting the largest crowd out the rest.
  const lists = await Promise.all(pool.map((s) => searchPapers({ query: q, sources: [s], startDate, max: pool.length === 1 ? 20 : 8 })));
  const papers = lists.flat();
  if (sort === "cited") papers.sort((a, b) => b.citations - a.citations || b.relevance - a.relevance);
  else if (sort === "newest") papers.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  else papers.sort((a, b) => b.relevance - a.relevance);
  return (
    <>
      <p className="label mb-4">
        {papers.length} papers · {sort === "relevant" ? "ranked by Valyu relevance" : SORTS[sort].toLowerCase()}
      </p>
      <Ledger papers={papers} emphasis={sort === "cited" ? "citations" : sort === "relevant" ? "relevance" : "date"} empty="Nothing matched that query." />
    </>
  );
}
