"use client";

import { useState } from "react";
import type { SourceId } from "@/lib/sources";
import { Markdown } from "../markdown";

interface Turn {
  q: string;
  a: string | null;
  error?: string;
}

const STARTERS = ["What data did they use?", "What’s the main result, in numbers?", "What would a sceptic say?", "How could I reproduce this?"];

/** Ask the paper itself: Valyu reads the full text and answers from it. */
export function AskPaper({ url, title, source }: { url: string; title: string; source: SourceId }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState("");
  const busy = turns.some((t) => t.a === null && !t.error);

  async function ask(question: string) {
    const text = question.trim();
    if (text.length < 3 || busy) return;
    setQ("");
    setTurns((t) => [...t, { q: text, a: null }]);
    try {
      const res = await fetch("/api/ask-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, source, question: text }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, a: data.answer ?? null, error: data.error } : x)));
    } catch {
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, error: "The reading room lost its connection." } : x)));
    }
  }

  return (
    <div>
      {turns.length > 0 && (
        <ol className="mb-6 space-y-6">
          {turns.map((t, i) => (
            <li key={i} className="settle">
              <p className="hand text-[1.45rem] text-oxblood">Q. {t.q}</p>
              <div className="mt-2 border-l-2 border-rule pl-4">
                {t.error ? (
                  <p className="text-sm italic text-ink-3">{t.error}</p>
                ) : t.a === null ? (
                  <p className="hand animate-pulse text-xl">turning pages…</p>
                ) : (
                  <div className="ink-dry">
                    <Markdown>{t.a}</Markdown>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="ruled sheet flex items-center gap-2 py-1.5 pl-4 pr-1.5"
      >
        <span className="w-7 text-right font-hand text-2xl text-oxblood">Q.</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask this paper anything…"
          aria-label="Ask a question about this paper"
          className="h-11 min-w-0 flex-1 bg-transparent pl-3 font-display text-lg text-ink outline-none placeholder:italic placeholder:text-ink-3/70"
        />
        <button disabled={busy} className="shrink-0 bg-ink px-4 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-sheet transition hover:bg-oxblood disabled:opacity-50">
          Ask
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button key={s} type="button" disabled={busy} onClick={() => ask(s)} className="border border-dashed border-rule px-2.5 py-1 text-[0.8rem] italic text-ink-2 transition hover:border-ink-3 hover:text-ink disabled:opacity-50">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
