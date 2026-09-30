import type { Paper } from "./types";

export function paperHref(p: Pick<Paper, "source" | "id" | "title">): string {
  return `/paper/${p.source}/${p.id}?t=${encodeURIComponent(p.title.slice(0, 160))}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function formatDate(p: Pick<Paper, "date" | "yearOnly">): string {
  if (!p.date) return "Undated";
  const [y, m, d] = p.date.slice(0, 10).split("-").map(Number);
  if (p.yearOnly || !m) return String(y);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Archival date stamp style: 30 · IX · 2026 */
export function stampDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} · ${ROMAN[m - 1]} · ${y}`;
}

export function longDate(d = new Date()): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function authorLine(authors: string[], max = 3): string {
  if (!authors.length) return "Authors not listed";
  if (authors.length <= max) return authors.join(", ");
  return `${authors.slice(0, max).join(", ")} + ${authors.length - max} more`;
}

export function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

export function year(p: Pick<Paper, "date">): string {
  return p.date?.slice(0, 4) ?? "n.d.";
}

export function bibtex(p: Paper): string {
  const key = `${lastName(p.authors[0] ?? "anon").toLowerCase().replace(/[^a-z]/g, "")}${year(p)}${
    p.title.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? ""
  }`;
  const lines = [
    `@article{${key},`,
    `  title   = {${p.title}},`,
    `  author  = {${p.authors.join(" and ") || "Anonymous"}},`,
    `  year    = {${year(p)}},`,
    p.doi ? `  doi     = {${p.doi}},` : null,
    `  url     = {${p.url}},`,
    `  note    = {${p.source}}`,
    `}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function apa(p: Paper): string {
  const names = p.authors.length
    ? p.authors.length > 3
      ? `${p.authors[0]} et al.`
      : p.authors.join(", ")
    : "Anonymous";
  return `${names} (${year(p)}). ${p.title}. ${p.doi ? `https://doi.org/${p.doi}` : p.url}`;
}

export function compact(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

/** A short excerpt for cards: the abstract when we have it, otherwise the matched passage. */
export function blurb(p: Pick<Paper, "abstract" | "excerpt">, max = 260): string {
  const s = p.abstract || p.excerpt;
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(" ", max)).replace(/[,;:]$/, "") + "…";
}
