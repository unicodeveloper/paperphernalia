"use client";

import { toggleShelf, useShelf } from "@/lib/shelf";
import type { Paper } from "@/lib/types";

/** A ribbon bookmark: tuck the paper onto your shelf. */
export function ShelfButton({ paper, variant = "icon" }: { paper: Paper; variant?: "icon" | "full" }) {
  const shelf = useShelf();
  const saved = shelf.some((p) => p.url === paper.url);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggleShelf(paper)}
        aria-pressed={saved}
        className={`inline-flex items-center gap-2 border px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition ${
          saved ? "border-oxblood bg-oxblood text-sheet" : "border-ink/70 text-ink hover:bg-ink hover:text-sheet"
        }`}
      >
        <Ribbon filled={saved} />
        {saved ? "On your shelf" : "Add to shelf"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleShelf(paper);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from your shelf" : "Save to your shelf"}
      title={saved ? "On your shelf" : "Save to shelf"}
      className={`relative z-10 grid h-8 w-8 place-items-center transition ${saved ? "text-oxblood" : "text-ink-3 hover:text-ink"}`}
    >
      <Ribbon filled={saved} />
    </button>
  );
}

function Ribbon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 20" className="h-[15px] w-[12px]" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.3">
      <path d="M2 1.5h12v17l-6-4.5-6 4.5z" strokeLinejoin="round" />
    </svg>
  );
}
