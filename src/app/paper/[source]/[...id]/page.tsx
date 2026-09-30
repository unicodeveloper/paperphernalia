import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AskPaper } from "@/components/paper/ask-paper";
import { CiteBox } from "@/components/paper/cite-box";
import { Seal } from "@/components/seal";
import { ShelfButton } from "@/components/shelf-button";
import { SourceTag } from "@/components/source-tag";
import { compact, formatDate, paperHref } from "@/lib/format";
import { getBrief, getRelated, resolvePaper } from "@/lib/paper";
import { SOURCE_IDS, SOURCES, isSourceId, pdfUrl } from "@/lib/sources";
import type { Paper } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = PageProps<"/paper/[source]/[...id]">;

async function load({ params, searchParams }: Props) {
  const { source, id } = await params;
  const { t } = await searchParams;
  if (!isSourceId(source)) return null;
  const paperId = id.map(decodeURIComponent).join("/");
  return resolvePaper(source, paperId, typeof t === "string" ? t : undefined);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const paper = await load(props);
  return paper ? { title: paper.title, description: paper.abstract.slice(0, 200) } : { title: "Paper not found" };
}

export default async function PaperPage(props: Props) {
  const paper = await load(props);
  if (!paper) notFound();
  const pdf = pdfUrl(paper.source, paper.id);
  const abstract = paper.abstract || paper.excerpt;

  return (
    <div className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pb-10 pt-10 sm:px-8">
      <nav className="label mb-10 flex flex-wrap gap-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Reading room</Link>
        <span>/</span>
        <Link href={`/archive/${paper.source}`} className="hover:text-ink">{SOURCES[paper.source].name}</Link>
        <span>/</span>
        <span className="text-ink-2">{paper.id}</span>
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-16">
        <div className="min-w-0">
          <header className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <SourceTag source={paper.source} size="md" />
              <span className="label">{formatDate(paper)}</span>
              {paper.citations > 0 && <span className="stamp">Cited {compact(paper.citations)}×</span>}
            </div>
            <h1 className="ink-bleed mt-6 font-display text-[clamp(2.1rem,4.6vw,3.9rem)] font-[400] leading-[1.02] tracking-[-0.028em] text-ink [font-variation-settings:'SOFT'_40,'opsz'_144] [text-wrap:balance]">
              {paper.title}
            </h1>
            <p className="mt-5 max-w-3xl text-[0.98rem] italic leading-relaxed text-ink-2">
              {paper.authors.length ? paper.authors.join(", ") : "Authors not listed by the archive"}
            </p>
          </header>

          <section className="relative mt-12">
            <div className="deckle-bg" />
            <div className="relative z-10 px-6 py-9 sm:px-12 sm:py-12">
              <p className="label mb-5">Abstract</p>
              <p className="max-w-[68ch] text-[1.1rem] leading-[1.8] text-ink-2 first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[4.4rem] first-letter:leading-[0.8] first-letter:text-oxblood">
                {abstract || "The archive did not supply an abstract for this paper."}
              </p>
              {paper.figure && (
                <figure className="relative mx-auto mt-10 max-w-xl rotate-[0.6deg]">
                  <div className="tape -top-3 left-8 rotate-[-6deg]" />
                  <div className="tape -top-3 right-8 rotate-[5deg]" />
                  <div className="sheet border border-rule bg-white/70 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={paper.figure} alt={`A figure from ${paper.title}`} className="max-h-[26rem] w-full object-contain mix-blend-multiply" />
                  </div>
                  <figcaption className="hand mt-2 text-center text-lg">fig. from the paper</figcaption>
                </figure>
              )}
            </div>
          </section>

          <Suspense fallback={<BriefLoading />}>
            <ValyuBrief paper={paper} />
          </Suspense>

          <section className="mt-20 max-w-3xl">
            <div className="rule-double mb-4" />
            <p className="label mb-2"><span className="text-oxblood">§</span> Ask this paper</p>
            <h2 className="font-display text-[2.2rem] leading-tight tracking-tight text-ink">
              Ask a question <em className="text-ink-2">about this paper</em>
            </h2>
            <p className="mb-7 mt-3 text-ink-2">Valyu reads the full text and answers from what the paper actually says.</p>
            <AskPaper url={paper.url} title={paper.title} source={paper.source} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <ShelfButton paper={paper} variant="full" />
              <a href={paper.url} target="_blank" rel="noreferrer" className="inline-flex items-center border border-ink/70 px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-sheet">
                Source ↗
              </a>
              {pdf && (
                <a href={pdf} target="_blank" rel="noreferrer" className="inline-flex items-center border border-ink/70 px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-sheet">
                  PDF ↗
                </a>
              )}
            </div>
            <dl className="index-card sheet px-5 pb-4 pt-2.5 text-sm">
              <dt className="label flex h-8 items-center">Catalogue card</dt>
              <div className="mt-4 grid grid-cols-[6rem_1fr] gap-y-[0.6rem] leading-[1rem]">
                <dt className="label self-center">Archive</dt>
                <dd className="text-ink">{SOURCES[paper.source].name}</dd>
                <dt className="label self-center">Identifier</dt>
                <dd className="break-all font-mono text-[0.75rem] text-ink">{paper.id}</dd>
                <dt className="label self-center">Published</dt>
                <dd className="text-ink">{formatDate(paper)}</dd>
                <dt className="label self-center">Citations</dt>
                <dd className="text-ink">{paper.citations ? paper.citations.toLocaleString() : "None yet"}</dd>
                {paper.doi && (
                  <>
                    <dt className="label self-center">DOI</dt>
                    <dd className="break-all">
                      <a href={`https://doi.org/${paper.doi}`} className="link-ink font-mono text-[0.75rem]" target="_blank" rel="noreferrer">{paper.doi}</a>
                    </dd>
                  </>
                )}
                <dt className="label self-center">Authors</dt>
                <dd className="text-ink">{paper.authors.length || "n/a"}</dd>
              </div>
            </dl>
            <CiteBox paper={paper} />
          </div>
        </aside>
      </div>

      <Suspense fallback={<RelatedLoading />}>
        <AcrossArchives paper={paper} />
      </Suspense>
    </div>
  );
}

async function ValyuBrief({ paper }: { paper: Paper }) {
  const res = await getBrief(paper.url, paper.title, paper.source);
  if (!res) {
    return (
      <section className="mt-16 max-w-3xl">
        <p className="hand text-2xl">Valyu couldn’t annotate this one just now. The abstract above is all we have.</p>
      </section>
    );
  }
  const { brief } = res;
  return (
    <section className="ink-dry mt-20">
      <div className="rule-double mb-4" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label mb-2"><span className="text-oxblood">§</span> The Valyu brief</p>
          <h2 className="font-display text-[2.2rem] leading-tight tracking-tight text-ink">
            The paper, <em className="text-ink-2">in five minutes</em>
          </h2>
        </div>
        <p className="label">Read from the full text via Valyu {res.via === "contents" ? "Contents" : "Answer"}</p>
      </div>

      <p className="mt-8 max-w-4xl font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.3] text-ink [text-wrap:pretty]">
        <span className="hl on">{brief.tldr}</span>
      </p>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-10">
          <div>
            <p className="label mb-4">What’s new</p>
            <ol className="space-y-4">
              {brief.contributions.map((c, i) => (
                <li key={i} className="grid grid-cols-[2.2rem_1fr] gap-2">
                  <span className="font-display text-2xl leading-none text-oxblood">{["i", "ii", "iii", "iv", "v", "vi"][i] ?? i + 1}.</span>
                  <span className="text-[1.02rem] leading-relaxed text-ink-2">{c}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="label mb-3">How they did it</p>
            <p className="max-w-[65ch] text-[1.02rem] leading-relaxed text-ink-2">{brief.method}</p>
          </div>
          {brief.results.length > 0 && (
            <div>
              <p className="label mb-4">What they found</p>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
                {brief.results.map((r, i) => (
                  <li key={i} className="sheet laid relative p-4 text-[0.95rem] leading-relaxed text-ink" style={{ transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)` }}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {brief.limitations.length > 0 && (
          <div>
            <p className="label mb-3">Caveats</p>
            <ul className="space-y-2">
              {brief.limitations.map((l, i) => (
                <li key={i} className="flex gap-3 text-[0.98rem] text-ink-2">
                  <span className="text-oxblood">✕</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
          )}
        </div>
        <aside className="space-y-8 md:border-l md:border-dashed md:border-rule md:pl-8">
          <div>
            <p className="hand text-base uppercase tracking-wider opacity-70">in plain words</p>
            <p className="hand text-[1.4rem]">{brief.eli5}</p>
          </div>
          <div>
            <p className="hand text-base uppercase tracking-wider text-oxblood opacity-80">why it matters</p>
            <p className="hand text-[1.4rem] text-oxblood">{brief.why_it_matters}</p>
          </div>
          <div>
            <p className="label mb-3">Follow the thread</p>
            <div className="flex flex-wrap gap-2">
              {brief.keywords.map((k) => (
                <Link key={k} href={`/search?q=${encodeURIComponent(k)}`} className="border border-rule bg-sheet px-2 py-1 font-mono text-[0.68rem] text-ink-2 transition hover:border-ink hover:text-ink">
                  {k}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function BriefLoading() {
  return (
    <section className="mt-20 max-w-4xl">
      <div className="rule-double mb-4" />
      <p className="label mb-2"><span className="text-oxblood">§</span> The Valyu brief</p>
      <div className="mt-4 flex items-center gap-6">
        <Seal ring="· READING · VALYU · READING · VALYU " center="…" className="h-20 w-20 animate-[spin_12s_linear_infinite]" />
        <p className="hand text-2xl">Reading the full paper and taking notes. This takes a few seconds…</p>
      </div>
      <div className="mt-8 space-y-3">
        <div className="skeleton h-6 w-11/12" />
        <div className="skeleton h-6 w-8/12" />
      </div>
    </section>
  );
}

async function AcrossArchives({ paper }: { paper: Paper }) {
  const related = await getRelated(paper);
  const total = SOURCE_IDS.reduce((n, s) => n + related[s].length, 0);
  if (!total) return null;
  return (
    <section className="mt-24">
      <div className="rule-double mb-4" />
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label mb-2"><span className="text-oxblood">§</span> Related work in other archives</p>
          <h2 className="font-display text-[2.2rem] leading-tight tracking-tight text-ink">
            Similar papers <em className="text-ink-2">in all four archives</em>
          </h2>
          <p className="mt-3 max-w-2xl text-ink-2">
            The same idea searched in arXiv, PubMed, bioRxiv and chemRxiv at once, so a method can lead you to where it is being applied.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {SOURCE_IDS.map((s) => (
          <div key={s} className={`src-${s} sheet relative pt-1`} style={{ borderTop: "4px solid var(--src)" }}>
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <SourceTag source={s} />
              <span className="label">{related[s].length} found</span>
            </div>
            <ul>
              {related[s].length ? (
                related[s].map((p) => (
                  <li key={p.url} className="border-t border-rule-soft">
                    <Link href={paperHref(p)} className="block px-5 py-3.5 transition hover:bg-paper-2/60">
                      <span className="block font-display text-[1rem] leading-snug text-ink">
                        <span className="hl">{p.title}</span>
                      </span>
                      <span className="label mt-1 block">{formatDate(p)}{p.citations ? ` · cited ${compact(p.citations)}×` : ""}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="hand border-t border-rule-soft px-5 py-6 text-lg">nothing close on this shelf.</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedLoading() {
  return (
    <section className="mt-24">
      <div className="rule-double mb-4" />
      <p className="label mb-6">Searching the other archives…</p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {SOURCE_IDS.map((s) => (
          <div key={s} className="sheet space-y-3 p-5">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-10/12" />
            <div className="skeleton h-4 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
