import Link from "next/link";
import { SearchTrigger } from "./command-palette";
import { NavLink } from "./nav-link";
import { ShelfCount } from "./shelf-count";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/#today", label: "Today", short: "Today" },
  { href: "/#desk", label: "Trending", short: "Trending" },
  { href: "/#canon", label: "Most cited", short: "Cited" },
  { href: "/catalogue", label: "Catalogue", short: "Catalogue" },
  { href: "/ask", label: "Ask the stacks", short: "Ask" },
];

export function SiteHeader() {
  return (
    <header className="relative z-40 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[88rem] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8 2xl:max-w-[104rem]">
        <Link href="/" className="group flex shrink-0 items-baseline gap-2" aria-label="Paraphernalia home">
          <span className="font-display text-[1.55rem] leading-none tracking-[-0.02em] text-ink [font-variation-settings:'SOFT'_100,'WONK'_1] sm:text-[1.7rem]">
            Paraphernalia
          </span>
          <span className="hand hidden -rotate-3 text-lg sm:inline">by Valyu</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-5 lg:flex xl:gap-6" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink key={l.href} href={l.href}>
              <span className="xl:hidden">{l.short}</span>
              <span className="hidden xl:inline">{l.label}</span>
            </NavLink>
          ))}
          <NavLink href="/shelf">
            Shelf
            <ShelfCount />
          </NavLink>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
          <span className="hidden sm:block lg:hidden xl:block">
            <SearchTrigger />
          </span>
          <span className="sm:hidden lg:block xl:hidden">
            <SearchTrigger compact />
          </span>
          <ThemeToggle />
        </div>
      </div>
      <nav
        className="scroll-shelf flex gap-5 overflow-x-auto border-t border-rule-soft px-4 py-2 [mask-image:linear-gradient(90deg,#000_85%,transparent)] sm:justify-center sm:gap-8 sm:[mask-image:none] lg:hidden"
        aria-label="Sections"
      >
        {LINKS.map((l) => (
          <NavLink key={l.href} href={l.href}>
            {l.short}
          </NavLink>
        ))}
        <NavLink href="/shelf">
          Shelf
          <ShelfCount />
        </NavLink>
        <span className="w-4 shrink-0 sm:hidden" aria-hidden />
      </nav>
    </header>
  );
}
