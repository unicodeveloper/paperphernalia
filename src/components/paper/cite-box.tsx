"use client";

import { useState } from "react";
import { apa, bibtex } from "@/lib/format";
import type { Paper } from "@/lib/types";

export function CiteBox({ paper }: { paper: Paper }) {
  const [fmt, setFmt] = useState<"apa" | "bibtex">("apa");
  const [copied, setCopied] = useState(false);
  const text = fmt === "apa" ? apa(paper) : bibtex(paper);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div className="index-card sheet relative px-5 pb-5 pt-2.5">
      <div className="flex h-8 items-center justify-between">
        <p className="label">Cite this</p>
        <div className="flex gap-3">
          {(["apa", "bibtex"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFmt(f)} className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${fmt === f ? "text-oxblood underline underline-offset-4" : "text-ink-3 hover:text-ink"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <pre className="mt-4 whitespace-pre-wrap break-words font-mono text-[0.72rem] leading-[1.6rem] text-ink-2">{text}</pre>
      <button type="button" onClick={copy} className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink hover:text-oxblood">
        {copied ? "Copied ✓" : "Copy to clipboard"}
      </button>
    </div>
  );
}
