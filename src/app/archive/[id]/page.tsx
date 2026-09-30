import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Ledger, LedgerSkeleton } from "@/components/ledger";
import { SearchSlip } from "@/components/search-slip";
import { CATEGORIES } from "@/lib/categories";
import { getArchiveShelf } from "@/lib/feeds";
import { SOURCES, isSourceId, type SourceId } from "@/lib/sources";

export const dynamic = "force-dynamic";

type Props = PageProps<"/archive/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: isSourceId(id) ? SOURCES[id].name : "Archive" };
}

export default async function ArchivePage({ params }: Props) {
  const { id } = await params;
  if (!isSourceId(id)) notFound();
  const src = SOURCES[id];
  const drawers = CATEGORIES.filter((c) => c.sources.includes(id));

  return (
    <div className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pt-12 sm:px-8">
      <header className={`src-${id} relative overflow-hidden px-6 py-12 text-sheet sm:px-12`} style={{ background: "linear-gradient(90deg, rgb(0 0 0 / 0.18), transparent 12%, rgb(255 255 255 / 0.08) 22%, transparent 40%), var(--src)" }}>
        <div className="absolute inset-y-0 right-10 hidden w-px bg-current/40 md:block" />
        <div className="absolute inset-y-0 right-14 hidden w-px bg-current/40 md:block" />
        <p className="font-mono text-xs uppercase tracking-[0.24em] opacity-80">Volume {src.mark} · since {src.founded}</p>
        <h1 className="mt-3 font-display text-[clamp(3rem,9vw,7.5rem)] font-[380] leading-[0.9] tracking-[-0.04em]">{src.name}</h1>
        <p className="mt-4 max-w-xl text-lg opacity-90">{src.blurb}</p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] opacity-75">{src.field}</p>
      </header>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="mb-6 max-w-2xl">
            <SearchSlip placeholder={`Search only ${src.name}…`} hidden={{ src: id }} />
          </div>
          <p className="label mb-3">Newest strong work in {src.name}</p>
          <Suspense fallback={<LedgerSkeleton />}>
            <ArchiveShelf id={id} />
          </Suspense>
        </div>
        <aside>
          <p className="label mb-4">Drawers filled from {src.name}</p>
          <ul className="space-y-2">
            {drawers.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogue/${c.slug}`} className="group flex items-baseline gap-3 border-b border-rule-soft py-2">
                  <span className="w-14 font-mono text-[0.7rem] text-ink-3">{c.call}</span>
                  <span className="font-display text-lg text-ink group-hover:text-oxblood">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

async function ArchiveShelf({ id }: { id: SourceId }) {
  const papers = await getArchiveShelf(id);
  return <Ledger papers={papers.slice(0, 20)} />;
}
