import type { Paper } from "@/lib/types";
import { EmptyShelf, LedgerRow } from "./paper-card";

export function Ledger({ papers, emphasis, empty }: { papers: Paper[]; emphasis?: "date" | "citations" | "relevance"; empty?: string }) {
  if (!papers.length) return <EmptyShelf note={empty} />;
  return (
    <ol className="border-t-2 border-ink">
      {papers.map((p, i) => (
        <LedgerRow key={p.url} paper={p} n={i + 1} emphasis={emphasis} />
      ))}
    </ol>
  );
}

export function LedgerSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="border-t-2 border-ink">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-[3rem_1fr_7rem] gap-4 border-b border-rule px-3 py-6">
          <div className="skeleton h-3 w-6" />
          <div className="space-y-2.5">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-5 w-10/12" />
            <div className="skeleton h-3 w-full" />
          </div>
          <div className="skeleton ml-auto h-8 w-12" />
        </div>
      ))}
    </div>
  );
}
