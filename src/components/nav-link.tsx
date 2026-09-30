"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const path = usePathname();
  const active = !href.includes("#") && href !== "/" && path.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative whitespace-nowrap py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition ${
        active ? "text-ink" : "text-ink-3 hover:text-ink"
      }`}
    >
      {children}
      {active && <span className="absolute -bottom-[3px] left-0 right-0 h-[2px] bg-oxblood" style={{ filter: "url(#rough-line)" }} />}
    </Link>
  );
}
