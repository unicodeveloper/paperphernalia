import Link from "next/link";
import { Suspense } from "react";
import { getPaperOfTheDay, todayKey } from "@/lib/feeds";
import { authorLine, formatDate, paperHref, stampDate } from "@/lib/format";
import { getBrief } from "@/lib/paper";
import type { Paper } from "@/lib/types";
import { Seal } from "../seal";
import { ShelfButton } from "../shelf-button";
import { SourceTag } from "../source-tag";

export async function PaperOfTheDay() {
  const pick = await getPaperOfTheDay();
  if (!pick) {
    return <p className="py-20 text-center text-ink-3">Today’s paper is still being chosen. Try again in a moment.</p>;
  }
  const { paper, category } = pick;
  const abstract = paper.abstract || paper.excerpt;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12 xl:grid-cols-[minmax(0,14rem)_minmax(0,46rem)_minmax(0,17rem)] 2xl:grid-cols-[minmax(0,16rem)_minmax(0,48rem)_minmax(0,19rem)] 2xl:justify-center">
      <aside className="order-3 lg:col-span-2 xl:order-1 xl:col-span-1 xl:pt-10">
        <p className="label">Paper of the day</p>
        <p className="mt-3 whitespace-nowrap font-display text-[2.6rem] leading-none tracking-tight text-ink">{stampDate(todayKey())}</p>
        <div className="mt-6 space-y-3 border-t border-rule pt-4 text-sm text-ink-2">
          <p>
            Drawn from drawer{" "}
            <Link href={`/catalogue/${category.slug}`} className="link-ink font-mono text-[0.8rem]">
              {category.call}
            </Link>
            , <em>{category.name}</em>.
          </p>
          <p className="text-ink-3">
            One paper, the same for every reader, chosen each morning from the strongest new work Valyu finds in a rotating
            drawer of the catalogue.
          </p>
        </div>
      </aside>

      <article className="relative order-1 xl:order-2">
        <div className="deckle-bg" />
        <div className="laid crease pointer-events-none absolute inset-[6px] z-0 opacity-70" />
        <Seal ring="· PAPER OF THE DAY · PARAPHERNALIA " center={stampDate(todayKey()).split(" · ").slice(0, 2).join(" · ")} sub={todayKey().slice(0, 4)} className="absolute -top-10 right-2 z-20 h-20 w-20 -rotate-12 min-[400px]:h-24 min-[400px]:w-24 sm:-top-10 sm:right-4 sm:h-28 sm:w-28 lg:-right-10 lg:h-32 lg:w-32" />
        <div className="relative z-10 px-6 pb-9 pt-10 sm:px-12 sm:pb-12 sm:pt-12">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <SourceTag source={paper.source} size="md" />
            <span className="label">{formatDate(paper)}</span>
            {paper.doi && <span className="label hidden sm:inline">doi:{paper.doi}</span>}
          </div>
          <h2 className="ink-bleed mt-6 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-[420] leading-[1.04] tracking-[-0.022em] text-ink [font-variation-settings:'SOFT'_30,'opsz'_144] [text-wrap:balance]">
            {paper.title}
          </h2>
          <p className="mt-4 text-[0.95rem] italic text-ink-2">{authorLine(paper.authors, 5)}</p>
          <div className="my-7 flex items-center gap-3 text-ink-3">
            <span className="h-px flex-1 bg-rule" />
            <span className="font-display text-lg">❦</span>
            <span className="h-px flex-1 bg-rule" />
          </div>
          <p className="text-[1.08rem] leading-[1.75] text-ink-2 first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-oxblood">
            {abstract.length > 900 ? abstract.slice(0, abstract.lastIndexOf(" ", 900)) + "…" : abstract}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={paperHref(paper)} className="bg-ink px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-sheet transition hover:bg-oxblood">
              Open the full brief →
            </Link>
            <a href={paper.url} target="_blank" rel="noreferrer" className="border border-ink/70 px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-sheet">
              View at source ↗
            </a>
            <ShelfButton paper={paper} variant="full" />
          </div>
        </div>
      </article>

      <aside className="order-2 lg:pt-24 xl:order-3">
        <Suspense fallback={<NotesLoading />}>
          <MarginNotes paper={paper} />
        </Suspense>
      </aside>
    </div>
  );
}

async function MarginNotes({ paper }: { paper: Paper }) {
  const res = await getBrief(paper.url, paper.title, paper.source);
  if (!res) return <p className="hand text-xl">couldn’t annotate this one; read it yourself ↖</p>;
  const { brief } = res;
  return (
    <div className="ink-dry relative space-y-8">
      <svg className="absolute -left-14 top-2 hidden h-16 w-14 text-iron xl:block" viewBox="0 0 60 70" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
        <path d="M56 6C34 8 14 22 8 58" />
        <path d="M2 48l6 11 8-9" />
      </svg>
      <div>
        <p className="hand text-[1.05rem] uppercase tracking-wider opacity-70">tl;dr</p>
        <p className="hand -rotate-[0.8deg] text-[1.55rem]">{brief.tldr}</p>
      </div>
      <div>
        <p className="hand text-[1.05rem] uppercase tracking-wider opacity-70">in plain words</p>
        <p className="hand rotate-[0.6deg] text-[1.3rem] text-ink-2">{brief.eli5}</p>
      </div>
      <div className="relative">
        <p className="hand text-[1.05rem] uppercase tracking-wider text-oxblood opacity-80">why it matters!</p>
        <p className="hand -rotate-[0.4deg] text-[1.3rem] text-oxblood">{brief.why_it_matters}</p>
      </div>
      <p className="label">Annotated by Valyu {res.via === "contents" ? "Contents" : "Answer"}</p>
    </div>
  );
}

function NotesLoading() {
  return (
    <div className="space-y-3">
      <p className="hand animate-pulse text-2xl">reading it now, notes coming…</p>
      <div className="skeleton h-3 w-11/12" />
      <div className="skeleton h-3 w-9/12" />
      <div className="skeleton h-3 w-10/12" />
    </div>
  );
}

export function PaperOfTheDaySkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[14rem_minmax(0,46rem)_17rem]">
      <div className="hidden space-y-3 pt-10 xl:block">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-12 w-40" />
      </div>
      <div className="sheet laid space-y-5 p-12">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-10 w-11/12" />
        <div className="skeleton h-10 w-8/12" />
        <div className="skeleton h-3 w-1/2" />
        <div className="space-y-2 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-3" style={{ width: `${92 - i * 5}%` }} />
          ))}
        </div>
      </div>
      <NotesLoading />
    </div>
  );
}
