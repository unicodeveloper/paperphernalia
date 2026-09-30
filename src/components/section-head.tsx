import type { ReactNode } from "react";

/** Section heading set like a journal department: number, rule, title, dek. */
export function SectionHead({ no, kicker, title, dek, aside }: { no: string; kicker: string; title: ReactNode; dek?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-10">
      <div className="rule-double mb-4" />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="label mb-3">
            <span className="text-oxblood">§ {no}</span>
            <span className="mx-2">·</span>
            {kicker}
          </p>
          <h2 className="letterpress font-display text-[clamp(2.2rem,5vw,3.8rem)] font-[380] leading-[0.98] tracking-[-0.025em] [font-variation-settings:'SOFT'_50,'opsz'_144]">
            {title}
          </h2>
          {dek && <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">{dek}</p>}
        </div>
        {aside}
      </div>
    </div>
  );
}
