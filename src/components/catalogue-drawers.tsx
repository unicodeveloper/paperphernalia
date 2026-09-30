import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { SOURCES } from "@/lib/sources";

/** The card catalogue: oak-and-brass drawers, one per field. */
export function CatalogueDrawers({ limit }: { limit?: number }) {
  const list = limit ? CATEGORIES.slice(0, limit) : CATEGORIES;
  return (
    <div className="rounded-[3px] bg-paper-3 p-2.5 shadow-[inset_0_2px_6px_rgb(var(--shadow)/0.25)] sm:p-3.5">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4">
        {list.map((c, i) => (
          <Link key={c.slug} href={`/catalogue/${c.slug}`} className="drawer group relative flex min-h-[9.5rem] flex-col items-center justify-between rounded-[2px] px-4 pb-4 pt-5">
            <span className="brass relative w-[86%] rounded-[2px] p-[3px]">
              <span className="block rounded-[1px] bg-sheet px-2 py-2 text-center">
                <span className="block font-mono text-[0.62rem] tracking-[0.16em] text-ink-3">{c.call}</span>
                <span className="block font-display text-[1.02rem] leading-tight text-ink">{c.name}</span>
              </span>
              <span className="brass absolute -left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" />
              <span className="brass absolute -right-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" />
            </span>
            <span className="mt-3 flex w-full items-end justify-between">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-3">
                {c.sources.map((s) => SOURCES[s].name).join(" · ")}
              </span>
              <span className="font-mono text-[0.6rem] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
            </span>
            <span className="brass absolute bottom-[2.1rem] left-1/2 h-3 w-10 -translate-x-1/2 rounded-b-full opacity-90 transition group-hover:h-3.5" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
