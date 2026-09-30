import { getTrending } from "@/lib/feeds";
import { DeskCard, EmptyShelf } from "../paper-card";

export async function TrendingDesk() {
  const papers = await getTrending(12);
  if (!papers.length) return <EmptyShelf note="The desk is clear for the moment." />;
  return (
    <div className="scroll-shelf -mx-4 flex gap-9 overflow-x-auto px-6 pb-10 pt-4 sm:-mx-8 sm:px-10">
      {papers.map((p, i) => (
        <DeskCard key={p.url} paper={p} index={i} />
      ))}
      <div className="w-4 shrink-0" />
    </div>
  );
}

export function DeskSkeleton() {
  return (
    <div className="flex gap-9 overflow-hidden pb-10 pt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="sheet laid h-[25rem] w-[21rem] shrink-0 space-y-4 p-6">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-28 w-full" />
          <div className="skeleton h-6 w-11/12" />
          <div className="skeleton h-6 w-3/4" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-10/12" />
        </div>
      ))}
    </div>
  );
}
