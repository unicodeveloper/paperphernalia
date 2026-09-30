import Form from "next/form";

/** A search box written onto ruled notepaper, margin line and all. */
export function SearchSlip({ defaultValue = "", action = "/search", placeholder = "Search 4 archives: a topic, a method, a molecule…", autoFocus = false, hidden }: {
  defaultValue?: string;
  action?: string;
  placeholder?: string;
  autoFocus?: boolean;
  hidden?: Record<string, string>;
}) {
  return (
    <Form action={action} className="ruled sheet group relative flex items-center gap-3 py-2 pl-4 pr-2">
      <span className="w-7 text-right font-hand text-2xl text-oxblood" aria-hidden>
        ✎
      </span>
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-label="Search papers"
        className="h-12 min-w-0 flex-1 bg-transparent pl-3 font-display text-xl text-ink outline-none placeholder:italic placeholder:text-ink-3/70 sm:text-[1.35rem]"
      />
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button type="submit" className="shrink-0 bg-ink px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-sheet transition hover:bg-oxblood">
        Fetch
      </button>
    </Form>
  );
}
