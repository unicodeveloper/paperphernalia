"use client";

import Link from "next/link";
import { useState } from "react";
import { bibtex } from "@/lib/format";
import { clearShelf, useShelf } from "@/lib/shelf";
import { EmptyShelf, LedgerRow } from "./paper-card";

export function ShelfView() {
  const shelf = useShelf();
  const [copied, setCopied] = useState(false);

  if (!shelf.length) {
    return (
      <div className="py-6">
        <EmptyShelf note="Your shelf is empty." />
        <p className="mt-6 text-center">
          <Link href="/" className="link-ink">Back to the reading room</Link>
        </p>
      </div>
    );
  }

  function download() {
    const blob = new Blob([shelf.map(bibtex).join("\n\n")], { type: "application/x-bibtex" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "paraphernalia-shelf.bib";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shelf.map(bibtex).join("\n\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="label mr-auto">{shelf.length} {shelf.length === 1 ? "paper" : "papers"}</span>
        <button type="button" onClick={copy} className="border border-ink/70 px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink hover:bg-ink hover:text-sheet">
          {copied ? "Copied ✓" : "Copy BibTeX"}
        </button>
        <button type="button" onClick={download} className="bg-ink px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-sheet hover:bg-oxblood">
          Download .bib
        </button>
        <button type="button" onClick={() => clearShelf()} className="px-2 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-3 hover:text-oxblood">
          Clear
        </button>
      </div>
      <ol className="border-t-2 border-ink">
        {shelf.map((p, i) => (
          <LedgerRow key={p.url} paper={p} n={i + 1} />
        ))}
      </ol>
    </div>
  );
}
