"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/** Day paper or lamplight. Stored per reader; defaults to the OS setting. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);

  function flip() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
    };
    try {
      localStorage.setItem("paraphernalia-theme", next);
    } catch {}
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) doc.startViewTransition(apply);
    else apply();
  }

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={theme === "dark" ? "Switch to daylight paper" : "Switch to lamplight"}
      className="group relative grid h-9 w-9 place-items-center rounded-full text-ink-2 transition hover:bg-paper-2 hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
          </>
        ) : (
          <>
            <path d="M9 3h6l-1 5h-4L9 3Z" />
            <path d="M12 8v9" />
            <path d="M8 21h8M10 17h4" />
            <path d="M6.5 10.5c1.5 1 3.4 1.5 5.5 1.5s4-.5 5.5-1.5" strokeDasharray="1.5 2" />
          </>
        )}
      </svg>
    </button>
  );
}

function readTheme(): Theme {
  const current = document.documentElement.dataset.theme as Theme | undefined;
  return current ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", onChange);
  };
}

/** Inline, render-blocking script so the chosen theme paints on first frame. */
export const themeScript = `try{var t=localStorage.getItem("paraphernalia-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;
