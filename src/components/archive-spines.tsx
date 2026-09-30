import Link from "next/link";
import { SOURCE_IDS, SOURCES } from "@/lib/sources";

/** The four archives as cloth-bound volumes standing on a shelf. */
export function ArchiveSpines() {
  const heights = ["h-[22rem]", "h-[20rem]", "h-[23rem]", "h-[19.5rem]"];
  return (
    <div className="relative">
      <div className="scroll-shelf flex items-end gap-1.5 overflow-x-auto px-1 pt-5 sm:gap-3">
        {SOURCE_IDS.map((s, i) => {
          const src = SOURCES[s];
          return (
            <Link
              key={s}
              href={`/archive/${s}`}
              className={`src-${s} group relative flex ${heights[i]} w-[4.1rem] shrink-0 flex-col min-[400px]:w-[5.2rem] sm:w-24 items-center justify-between rounded-t-[3px] py-5 text-sheet transition duration-500 hover:-translate-y-4 `}
              style={{
                background: "linear-gradient(90deg, rgb(0 0 0 / 0.28), transparent 18%, rgb(255 255 255 / 0.1) 30%, transparent 45%, rgb(0 0 0 / 0.2)), var(--src)",
                boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.2), 4px 0 8px -4px rgb(0 0 0 / 0.4)",
              }}
            >
              <span className="w-full border-y border-current/50 py-1 text-center font-mono text-[0.6rem] tracking-[0.2em] opacity-80">{src.founded}</span>
              <span className="font-display text-[1.45rem] min-[400px]:text-[1.75rem] tracking-[0.04em] [writing-mode:vertical-rl] rotate-180">{src.name}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-current/60 font-display text-lg">{src.mark}</span>
            </Link>
          );
        })}
        <div className="ml-4 hidden h-[16rem] w-10 shrink-0 -rotate-[8deg] origin-bottom-left rounded-t-[3px] bg-paper-3 shadow-[inset_0_0_0_1px_rgb(var(--shadow)/0.15)] sm:block" aria-hidden />
      </div>
      <div className="h-3 rounded-[1px] bg-gradient-to-b from-paper-3 to-rule shadow-[0_8px_14px_-8px_rgb(var(--shadow)/0.6)]" />
    </div>
  );
}
