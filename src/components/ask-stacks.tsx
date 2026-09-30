"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { paperHref } from "@/lib/format";
import { SOURCE_IDS, SOURCES, idFromUrl, sourceFromDataset, type SourceId } from "@/lib/sources";
import { Markdown } from "./markdown";
import { SourceTag } from "./source-tag";

interface Ref {
  title: string;
  url: string;
  source: string;
  publication_date?: string;
  date?: string;
}

/**
 * Valyu cites with inline Markdown links. Turn any link that points at one of
 * the references into a numbered footnote that opens the paper in Paraphernalia.
 */
function numberCitations(md: string, refs: Ref[]): string {
  if (!refs.length) return md;
  const norm = (u: string) =>
    u.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/(full|abs)\//, "/").replace(/\/+$/, "");
  const key = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 28);
  const byUrl = new Map(refs.map((r, i) => [norm(r.url), i]));
  const byTitle = new Map(refs.map((r, i) => [key(r.title), i]));
  return md.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (whole, label: string, url: string) => {
    const i = byUrl.get(norm(url)) ?? byTitle.get(key(label));
    if (i === undefined) return whole;
    return `[${i + 1}](${refHref(refs[i])})`;
  });
}

function refHref(r: Ref): string {
  const src = sourceFromDataset(r.source);
  return src ? paperHref({ source: src, id: idFromUrl(src, r.url), title: r.title }) : r.url;
}

type Status = "idle" | "searching" | "writing" | "done" | "error";

/** Streams a cited answer from Valyu, sources first, then the prose. */
export function AskStacks({ initial }: { initial: string }) {
  const [q, setQ] = useState(initial);
  const [asked, setAsked] = useState("");
  const [refs, setRefs] = useState<Ref[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [sources, setSources] = useState<SourceId[]>([...SOURCE_IDS]);
  const abort = useRef<AbortController | null>(null);

  const run = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (text.length < 3) return;
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      setAsked(text);
      setRefs([]);
      setText("");
      setError("");
      setStatus("searching");
      const url = new URL(window.location.href);
      url.searchParams.set("q", text);
      window.history.replaceState(null, "", url);
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text, sources }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? "Request failed");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const msg = JSON.parse(line);
            if (msg.type === "sources") setRefs(msg.sources ?? []);
            else if (msg.type === "content") {
              setStatus("writing");
              setText((t) => t + msg.content);
            } else if (msg.type === "error") {
              setError(msg.error ?? "Something went wrong");
              setStatus("error");
            }
          }
        }
        setStatus((s) => (s === "error" ? s : "done"));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
        setStatus("error");
      }
    },
    [sources],
  );

  useEffect(() => {
    // Deferred a tick so the first render commits before the request starts.
    const t = initial ? setTimeout(() => run(initial), 0) : undefined;
    return () => {
      clearTimeout(t);
      abort.current?.abort();
    };
    // Only auto-run once for the question in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (s: SourceId) =>
    setSources((cur) => (cur.includes(s) ? (cur.length > 1 ? cur.filter((x) => x !== s) : cur) : [...cur, s]));

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        className="ruled sheet relative py-3 pl-4 pr-3"
      >
        <div className="tape -top-3 right-16 rotate-[4deg]" />
        <div className="flex items-start gap-3">
          <span className="w-7 pt-1 text-right font-hand text-3xl text-oxblood">Q.</span>
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                run(q);
              }
            }}
            rows={2}
            placeholder="What would you like to know?"
            aria-label="Your question"
            className="min-h-16 w-full resize-none bg-transparent pl-3 font-display text-[1.6rem] leading-8 text-ink outline-none placeholder:italic placeholder:text-ink-3/70"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pl-[3.2rem]">
          <div className="flex flex-wrap gap-2">
            {SOURCE_IDS.map((s) => (
              <button type="button" key={s} onClick={() => toggle(s)} aria-pressed={sources.includes(s)} className={`src-${s} border px-2.5 py-1 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition ${sources.includes(s) ? "border-current" : "border-rule opacity-45"}`} style={{ color: "var(--src)" }}>
                {SOURCES[s].name}
              </button>
            ))}
          </div>
          <button disabled={status === "searching" || status === "writing"} className="bg-ink px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-sheet transition hover:bg-oxblood disabled:opacity-50">
            {status === "searching" || status === "writing" ? "Consulting…" : "Ask the stacks"}
          </button>
        </div>
      </form>

      {status !== "idle" && (
        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <article className="min-w-0">
            <p className="label mb-3">The librarian’s reply</p>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight tracking-tight text-ink">{asked}</h2>
            <div className="mt-6 border-t border-rule pt-6">
              {status === "searching" && !text && <p className="hand animate-pulse text-2xl">pulling volumes from the shelves…</p>}
              {error && <p className="italic text-oxblood">{error}</p>}
              {text && <Markdown streaming={status === "writing"}>{numberCitations(text, refs)}</Markdown>}
              {status === "done" && text && <p className="label mt-8">Written by Valyu Answer from the references on the right</p>}
            </div>
          </article>
          <aside>
            <p className="label mb-4">References · {refs.length || "…"}</p>
            <ol className="space-y-3">
              {refs.map((r, i) => {
                const src = sourceFromDataset(r.source);
                const inner = (
                  <>
                    <span className="flex items-center justify-between">
                      {src ? <SourceTag source={src} /> : <span className="label">{r.source}</span>}
                      <span className="font-display text-lg text-oxblood">[{i + 1}]</span>
                    </span>
                    <span className="mt-1.5 block font-display text-[0.98rem] leading-snug text-ink">
                      <span className="hl">{r.title}</span>
                    </span>
                    {(r.publication_date || r.date) && <span className="label mt-1 block">{(r.publication_date || r.date)?.slice(0, 10)}</span>}
                  </>
                );
                return (
                  <li key={r.url + i} className="settle" style={{ animationDelay: `${i * 50}ms`, ["--r" as string]: `${i % 2 ? 0.4 : -0.4}deg` }}>
                    {src ? (
                      <Link href={refHref(r)} className="sheet block px-4 py-3 transition hover:-translate-y-0.5">
                        {inner}
                      </Link>
                    ) : (
                      <a href={r.url} target="_blank" rel="noreferrer" className="sheet block px-4 py-3">
                        {inner}
                      </a>
                    )}
                  </li>
                );
              })}
              {!refs.length && status === "searching" &&
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="sheet space-y-2 p-4">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-4 w-full" />
                  </li>
                ))}
            </ol>
          </aside>
        </div>
      )}
    </div>
  );
}
