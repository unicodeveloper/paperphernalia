import Link from "next/link";
import { authorLine, blurb, compact, formatDate, paperHref } from "@/lib/format";
import type { Paper } from "@/lib/types";
import { ShelfButton } from "./shelf-button";
import { SourceTag } from "./source-tag";

const TILTS = [-0.9, 0.6, -0.4, 0.9, -0.7, 0.3];

/**
 * A paper left on the desk: a sheet on top of a small stack, tilted a touch,
 * with its first figure taped on when the archive provides one.
 */
export function DeskCard({ paper, index = 0 }: { paper: Paper; index?: number }) {
  const tilt = TILTS[index % TILTS.length];
  return (
    <article className="settle stack group w-[19rem] shrink-0 snap-start sm:w-[21rem]" style={{ ["--r" as string]: `${tilt}deg`, animationDelay: `${index * 60}ms` }}>
      <Link href={paperHref(paper)} className="sheet laid flex h-full min-h-[25rem] flex-col p-6 transition duration-500 group-hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <SourceTag source={paper.source} />
          <span className="label">{formatDate(paper)}</span>
        </div>
        {paper.figure ? (
          <div className="relative mb-4 mt-5 h-32 overflow-hidden border border-rule bg-white/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={paper.figure} alt="" loading="lazy" className="h-full w-full object-contain p-1.5 mix-blend-multiply grayscale-[0.25] sepia-[0.15] transition group-hover:grayscale-0 group-hover:sepia-0" />
            <span className="label absolute bottom-1 right-1.5 bg-sheet/80 px-1">Fig. 1</span>
          </div>
        ) : (
          <div className="mt-5" />
        )}
        <h3 className="font-display text-[1.28rem] leading-[1.18] tracking-[-0.01em] text-ink [text-wrap:balance]">
          <span className="hl">{paper.title}</span>
        </h3>
        <p className="mt-2 text-[0.8rem] italic text-ink-3">{authorLine(paper.authors, 2)}</p>
        <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-ink-2">{blurb(paper, paper.figure ? 150 : 300)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-rule pt-3">
          <span className="label">{paper.citations ? `Cited ${compact(paper.citations)}×` : "Fresh off the press"}</span>
          <span className="label text-ink transition group-hover:text-oxblood">Read →</span>
        </div>
      </Link>
      <div className="absolute right-3 top-12">
        <ShelfButton paper={paper} />
      </div>
    </article>
  );
}

/** A ledger line: for long lists where scanning matters more than browsing. */
export function LedgerRow({ paper, n, emphasis = "date" }: { paper: Paper; n: number; emphasis?: "date" | "citations" | "relevance" }) {
  return (
    <li className="dogear group relative border-b border-rule">
      <Link href={paperHref(paper)} className="grid grid-cols-[2.25rem_1fr] gap-x-4 px-1 py-5 transition hover:bg-sheet/70 sm:grid-cols-[3rem_1fr_7.5rem] sm:px-3">
        <span className="pt-1 font-mono text-xs text-ink-3">{String(n).padStart(2, "0")}</span>
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <SourceTag source={paper.source} />
            <span className="label">{formatDate(paper)}</span>
          </div>
          <h3 className="font-display text-[1.2rem] leading-snug text-ink [text-wrap:pretty]">
            <span className="hl">{paper.title}</span>
          </h3>
          <p className="mt-1 text-[0.8rem] italic text-ink-3">{authorLine(paper.authors, 4)}</p>
          <p className="mt-2 line-clamp-2 max-w-3xl text-[0.92rem] leading-relaxed text-ink-2">{blurb(paper, 320)}</p>
        </div>
        <div className="col-start-2 mt-3 flex items-center gap-4 sm:col-start-3 sm:mt-0 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
          {emphasis === "citations" ? (
            <>
              <span className="font-display text-3xl leading-none text-oxblood">{compact(paper.citations)}</span>
              <span className="label">citations</span>
            </>
          ) : emphasis === "relevance" ? (
            <>
              <span className="font-display text-3xl leading-none text-ink">{Math.round(paper.relevance * 100)}</span>
              <span className="label">relevance</span>
            </>
          ) : (
            <>
              <span className="font-display text-xl leading-none text-ink">{paper.citations ? compact(paper.citations) : "New"}</span>
              <span className="label">{paper.citations ? "citations" : "no cites yet"}</span>
            </>
          )}
        </div>
      </Link>
      <div className="absolute right-2 top-3 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100 sm:right-auto sm:left-[0.2rem] sm:top-12">
        <ShelfButton paper={paper} />
      </div>
    </li>
  );
}

export function EmptyShelf({ note = "Nothing on this shelf just now." }: { note?: string }) {
  return (
    <div className="index-card sheet mx-auto max-w-md px-8 pb-8 pt-3 text-center">
      <p className="label pt-1">Library notice</p>
      <p className="mt-8 font-display text-2xl text-ink">{note}</p>
      <p className="hand mt-4 text-xl">try another drawer, or search the stacks ↗</p>
    </div>
  );
}
