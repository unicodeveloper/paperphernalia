import Link from "next/link";

export type Order = "trending" | "cited" | "relevant";

const TABS: Array<{ id: Order; label: string; note: string }> = [
  { id: "trending", label: "Trending", note: "new & noticed" },
  { id: "cited", label: "Most cited", note: "the canon" },
  { id: "relevant", label: "Most relevant", note: "closest match" },
];

/** Folder tabs, like the dividers in a filing drawer. */
export function ShelfTabs({ base, active }: { base: string; active: Order }) {
  return (
    <div className="scroll-shelf flex items-end gap-1 overflow-x-auto border-b-2 border-ink pl-1 sm:pl-2" role="tablist">
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.id === "trending" ? base : `${base}?order=${t.id}`}
            role="tab"
            aria-selected={on}
            scroll={false}
            className={`relative -mb-[2px] shrink-0 rounded-t-[6px] border-2 border-b-0 px-3 pb-2 pt-2.5 transition sm:px-5 sm:pb-2.5 sm:pt-3 ${
              on ? "border-ink bg-paper" : "border-transparent bg-paper-2 text-ink-3 hover:bg-paper-3 hover:text-ink"
            }`}
          >
            <span className="block whitespace-nowrap font-display text-base leading-none sm:text-lg">{t.label}</span>
            <span className="hand hidden text-sm leading-none min-[400px]:block">{t.note}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function parseOrder(v: unknown): Order {
  return v === "cited" || v === "relevant" ? v : "trending";
}
