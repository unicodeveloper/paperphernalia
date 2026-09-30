"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/categories";

const PROMPTS = [
  "sparse autoencoders interpretability",
  "GLP-1 agonists and neurodegeneration",
  "solid-state battery electrolytes",
  "CRISPR base editing in vivo",
  "room-temperature superconductivity claims",
];

/** ⌘K: a slip of ruled paper that drops onto the desk. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !/input|textarea/i.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("paraphernalia:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paraphernalia:search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    const drawers = CATEGORIES.filter((c) => !term || c.name.toLowerCase().includes(term) || c.call.startsWith(term))
      .slice(0, term ? 4 : 5)
      .map((c) => ({ kind: "Drawer", label: c.name, meta: c.call, href: `/catalogue/${c.slug}` }));
    const searches = term
      ? [
          { kind: "Search", label: `“${q.trim()}”`, meta: "all four archives", href: `/search?q=${encodeURIComponent(q.trim())}` },
          { kind: "Ask", label: `Ask the stacks: ${q.trim()}`, meta: "Valyu answer", href: `/ask?q=${encodeURIComponent(q.trim())}` },
        ]
      : PROMPTS.slice(0, 3).map((p) => ({ kind: "Try", label: p, meta: "search", href: `/search?q=${encodeURIComponent(p)}` }));
    return [...searches, ...drawers];
  }, [q]);

  function go(href: string) {
    setOpen(false);
    setQ("");
    setActive(0);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search the stacks">
      <button className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" aria-label="Close" onClick={() => setOpen(false)} />
      <div className="settle sheet relative w-full max-w-xl" style={{ ["--r" as string]: "-0.6deg" }}>
        <div className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-3deg]" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const item = items[active];
            if (item) go(item.href);
          }}
          className="ruled px-5 pb-2 pt-6"
        >
          <label className="label mb-1 block pl-[2.6rem]">Call slip · request a paper</label>
          <div className="flex items-center gap-3">
            <span className="w-8 text-right font-hand text-2xl text-oxblood">Q.</span>
            <input
              ref={input}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(items.length - 1, a + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                }
              }}
              placeholder="A topic, a method, a question…"
              className="h-12 w-full bg-transparent font-display text-2xl text-ink outline-none placeholder:text-ink-3/70"
            />
          </div>
        </form>
        <ul className="max-h-[50vh] overflow-auto border-t border-rule px-2 py-2">
          {items.map((it, i) => (
            <li key={it.href}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(it.href)}
                className={`flex w-full items-baseline gap-3 px-3 py-2.5 text-left transition ${i === active ? "bg-paper-2" : ""}`}
              >
                <span className="label w-14 shrink-0">{it.kind}</span>
                <span className="flex-1 truncate font-display text-[1.05rem] text-ink">{it.label}</span>
                <span className="font-mono text-[0.7rem] text-ink-3">{it.meta}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-rule px-5 py-2.5">
          <span className="label">↑↓ to choose · ↵ to fetch · esc to close</span>
          <span className="label">Searched by Valyu</span>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("paraphernalia:search"))}
      aria-label="Search the stacks"
      className={`group inline-flex items-center gap-2.5 border border-rule bg-sheet/60 text-ink-3 transition hover:border-ink-3 hover:text-ink ${compact ? "p-2" : "py-1.5 pl-3 pr-1.5"}`}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="m13 13 4.5 4.5" strokeLinecap="round" />
      </svg>
      {!compact && (
        <>
          <span className="font-serif text-sm italic">Search the stacks</span>
          <kbd className="ml-3 border border-rule bg-paper px-1.5 py-0.5 font-mono text-[0.65rem] not-italic">⌘K</kbd>
        </>
      )}
    </button>
  );
}
