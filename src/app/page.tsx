import Link from "next/link";
import { Suspense } from "react";
import { ArchiveSpines } from "@/components/archive-spines";
import { CatalogueDrawers } from "@/components/catalogue-drawers";
import { Canon, CanonSkeleton } from "@/components/home/canon";
import { DeskSkeleton, TrendingDesk } from "@/components/home/desk";
import { PaperOfTheDay, PaperOfTheDaySkeleton } from "@/components/home/paper-of-the-day";
import { SearchSlip } from "@/components/search-slip";
import { SectionHead } from "@/components/section-head";
import { SOURCE_IDS, SOURCES } from "@/lib/sources";

export const dynamic = "force-dynamic";

const SUGGESTIONS = ["mixture-of-experts scaling", "gut microbiome & depression", "lithium-sulfur cathodes", "protein design with diffusion"];

export default function Home() {
  return (
    <>
      {/* Masthead */}
      <section className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pb-16 pt-14 sm:px-8 sm:pt-20">
        <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="label mb-6">
              <span className="text-oxblood">Est. {new Date().getUTCFullYear()}</span> · A reading room by Valyu
            </p>
            <h1 className="letterpress ink-bleed font-display text-[clamp(3.2rem,9vw,8.4rem)] font-[340] leading-[0.86] tracking-[-0.045em] [font-variation-settings:'SOFT'_100,'WONK'_1,'opsz'_144]">
              New science,
              <br />
              <span className="italic text-ink-2">with notes in</span>
              <br />
              the margins.
            </h1>
          </div>
          <div className="lg:pb-3">
            <p className="max-w-md text-[1.12rem] leading-relaxed text-ink-2">
              One paper chosen every morning, the work everyone is reading this month, and the canon it builds on. Pulled live
              from four archives and annotated as you go.
            </p>
            <div className="mt-7">
              <SearchSlip />
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="hand text-lg">try →</span>
              {SUGGESTIONS.map((s) => (
                <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="link-ink text-sm italic text-ink-2">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 border-y border-ink sm:grid-cols-4">
          {SOURCE_IDS.map((s, i) => (
            <Link key={s} href={`/archive/${s}`} className={`src-${s} group flex items-center gap-3 px-3 py-4 transition hover:bg-sheet/60 ${i ? "sm:border-l sm:border-rule" : ""} ${i % 2 ? "border-l border-rule" : ""} ${i > 1 ? "border-t border-rule sm:border-t-0" : ""}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center font-display text-lg text-sheet" style={{ background: "var(--src)" }}>
                {SOURCES[s].mark}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-lg leading-none text-ink">{SOURCES[s].name}</span>
                <span className="mt-1 block truncate text-xs text-ink-3">{SOURCES[s].field}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Paper of the day */}
      <section id="today" className="scroll-mt-28 mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pb-24 sm:px-8">
        <Suspense fallback={<PaperOfTheDaySkeleton />}>
          <PaperOfTheDay />
        </Suspense>
      </section>

      {/* Trending */}
      <section id="desk" className="scroll-mt-28 mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pb-20 sm:px-8">
        <SectionHead
          no="II"
          kicker="Trending · last 45 days"
          title={
            <>
              On the desk <em className="text-ink-2">this month</em>
            </>
          }
          dek="New papers from all four archives, ranked by how strongly Valyu matches them to the month’s busiest topics, how recent they are, and how quickly they are being cited."
          aside={<p className="hand hidden max-w-[14rem] rotate-2 text-xl md:block">scroll sideways, the pile goes on →</p>}
        />
        <Suspense fallback={<DeskSkeleton />}>
          <TrendingDesk />
        </Suspense>
      </section>

      {/* Most cited */}
      <section id="canon" className="scroll-mt-28 mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pb-24 sm:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHead
              no="III"
              kicker="Most cited"
              title={
                <>
                  The canon,
                  <br />
                  <em className="text-ink-2">by citation</em>
                </>
              }
              dek="The papers the rest of the literature keeps coming back to, gathered from across the catalogue and ranked by citation count."
            />
            <div className="index-card sheet hidden max-w-sm rotate-[-1.5deg] px-6 pb-6 pt-3 lg:block">
              <p className="label pt-1">Reader’s note</p>
              <p className="hand mt-6 text-[1.35rem]">Citations lag. The canon shows what a field was built on; the desk shows where it is heading.</p>
            </div>
          </div>
          <Suspense fallback={<CanonSkeleton />}>
            <Canon />
          </Suspense>
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="scroll-mt-28 mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pb-24 sm:px-8">
        <SectionHead
          no="IV"
          kicker="Browse by field"
          title={
            <>
              The card <em className="text-ink-2">catalogue</em>
            </>
          }
          dek="Fourteen drawers, each with a call number. Open one to find its trending, most-cited and most relevant papers."
          aside={
            <Link href="/catalogue" className="label link-ink !text-ink">
              Full catalogue →
            </Link>
          }
        />
        <CatalogueDrawers limit={8} />
      </section>

      {/* Archives + Ask */}
      <section className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 sm:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHead no="V" kicker="The archives" title={<>Four volumes, <em className="text-ink-2">one shelf</em></>} dek="Pull a volume to browse one archive on its own." />
            <ArchiveSpines />
          </div>
          <div>
            <SectionHead
              no="VI"
              kicker="Ask the stacks"
              title={
                <>
                  Ask a question, <em className="text-ink-2">get a cited answer</em>
                </>
              }
              dek="Valyu searches all four archives at once and writes back a short answer with numbered references you can open."
            />
            <SearchSlip action="/ask" placeholder="What do we know about…" />
            <ul className="mt-6 space-y-3">
              {[
                "Does intermittent fasting change the gut microbiome?",
                "What limits sodium-ion batteries today?",
                "How are LLMs evaluated for scientific reasoning?",
              ].map((q, i) => (
                <li key={q}>
                  <Link href={`/ask?q=${encodeURIComponent(q)}`} className="hand block text-[1.4rem] transition hover:translate-x-1 hover:text-oxblood" style={{ transform: `rotate(${i % 2 ? 0.6 : -0.8}deg)` }}>
                    “{q}”
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
