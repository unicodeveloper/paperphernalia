import Link from "next/link";
import { getMostCited } from "@/lib/feeds";
import { authorLine, compact, paperHref, year } from "@/lib/format";
import { SOURCES } from "@/lib/sources";

/**
 * The most-cited papers, printed on a library loan slip: ruled columns,
 * a perforated top edge, and citation counts rubber-stamped in the margin.
 */
export async function Canon() {
  const papers = await getMostCited(10);
  return (
    <div className="relative">
      <div className="tape -top-3 left-10 rotate-[-4deg]" />
      <div className="tape -top-3 right-12 rotate-[5deg]" />
      <div className="sheet perforated px-2 pb-4 pt-8 sm:px-8" style={{ background: "var(--sheet)" }}>
        <div className="flex items-baseline justify-between border-b-2 border-ink px-2 pb-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink">Reference slip · most cited</p>
          <p className="label">Please do not remove</p>
        </div>
        <div className="grid grid-cols-[2rem_1fr_4.5rem] gap-3 border-b border-ink/60 px-2 py-2 sm:grid-cols-[2.5rem_1fr_6rem_5.5rem]">
          <span className="label">No.</span>
          <span className="label">Title · Authors</span>
          <span className="label hidden sm:block">Archive</span>
          <span className="label text-right">Cited</span>
        </div>
        <ol>
          {papers.map((p, i) => (
            <li key={p.url} className="border-b border-rule last:border-0">
              <Link href={paperHref(p)} className="group grid grid-cols-[2rem_1fr_4.5rem] items-center gap-3 px-2 py-3.5 transition hover:bg-paper-2/60 sm:grid-cols-[2.5rem_1fr_6rem_5.5rem]">
                <span className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block font-display text-[1.06rem] leading-snug text-ink">
                    <span className="hl">{p.title}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs italic text-ink-3">
                    {authorLine(p.authors, 2)} · {year(p)}
                  </span>
                </span>
                <span className={`src-${p.source} hidden font-mono text-[0.68rem] uppercase tracking-wider sm:block`} style={{ color: "var(--src)" }}>
                  {SOURCES[p.source].name}
                </span>
                <span className="text-right">
                  <span className="stamp !text-[0.8rem] !tracking-[0.06em]" style={{ transform: `rotate(${(i % 3) - 2.5}deg)` }}>
                    {compact(p.citations)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        {!papers.length && <p className="px-2 py-10 text-center text-ink-3">The ledger is being updated.</p>}
      </div>
    </div>
  );
}

export function CanonSkeleton() {
  return (
    <div className="sheet space-y-4 px-8 py-10">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-3 w-6" />
          <div className="skeleton h-4 flex-1" />
          <div className="skeleton h-6 w-14" />
        </div>
      ))}
    </div>
  );
}
