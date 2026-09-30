import Link from "next/link";
import { SOURCE_IDS, SOURCES } from "@/lib/sources";

/** Colophon, with the printer's colour bar along the foot of the page. */
export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-ink">
      <div className="flex h-2">
        {["var(--arxiv)", "var(--pubmed)", "var(--biorxiv)", "var(--chemrxiv)", "var(--ink)", "var(--highlight)", "var(--iron)", "var(--paper-3)"].map((c) => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="mx-auto grid max-w-[88rem] grid-cols-[minmax(0,1fr)] gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] 2xl:max-w-[104rem]">
        <div>
          <p className="font-display text-4xl tracking-tight text-ink">Paraphernalia</p>
          <p className="mt-3 max-w-sm text-ink-2">
            A reading room for new science. Every shelf, brief and answer here is pulled live from four archives by{" "}
            <a href="https://valyu.ai" className="link-ink">Valyu</a>’s search API.
          </p>
          <p className="hand mt-5 -rotate-1 text-2xl">read widely, annotate freely.</p>
        </div>
        <div>
          <p className="label mb-4">The archives</p>
          <ul className="space-y-2">
            {SOURCE_IDS.map((s) => (
              <li key={s}>
                <Link href={`/archive/${s}`} className={`src-${s} group flex items-baseline gap-3`}>
                  <span className="font-mono text-xs" style={{ color: "var(--src)" }}>{SOURCES[s].mark}</span>
                  <span className="text-ink-2 group-hover:text-ink">{SOURCES[s].name}</span>
                  <span className="text-xs text-ink-3">{SOURCES[s].field}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-4">Colophon</p>
          <p className="text-sm leading-relaxed text-ink-2">
            Set in Fraunces, Source Serif and IBM Plex Mono, with marginal notes in Caveat. Paper grain, deckle edges and
            ink bleed are drawn with SVG filters, with no images involved.
          </p>
          <p className="label mt-6">Powered by Valyu Search · Contents · Answer</p>
        </div>
      </div>
    </footer>
  );
}
