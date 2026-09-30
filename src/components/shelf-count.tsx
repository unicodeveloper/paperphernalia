"use client";

import { useShelf } from "@/lib/shelf";

export function ShelfCount() {
  const n = useShelf().length;
  if (!n) return null;
  return (
    <span className="ml-1.5 inline-grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-oxblood px-1 font-mono text-[0.6rem] text-sheet">
      {n}
    </span>
  );
}
