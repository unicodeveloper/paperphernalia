import { SOURCES, type SourceId } from "@/lib/sources";

/** The archive's shelf mark, like the coloured spine label on a library book. */
export function SourceTag({ source, size = "sm" }: { source: SourceId; size?: "sm" | "md" }) {
  const s = SOURCES[source];
  return (
    <span className={`src-${source} inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.14em] ${size === "sm" ? "text-[0.62rem]" : "text-[0.72rem]"}`} style={{ color: "var(--src)" }}>
      <span
        className={`grid place-items-center font-medium text-sheet ${size === "sm" ? "h-4 w-4 text-[0.58rem]" : "h-5 w-5 text-[0.66rem]"}`}
        style={{ background: "var(--src)", borderRadius: "1px" }}
      >
        {s.mark}
      </span>
      {s.name}
    </span>
  );
}
