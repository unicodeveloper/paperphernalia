import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Ledger, LedgerSkeleton } from "@/components/ledger";
import { ShelfTabs, parseOrder, type Order } from "@/components/shelf-tabs";
import { SourceTag } from "@/components/source-tag";
import { CATEGORIES, getCategory, type Category } from "@/lib/categories";
import { getCategoryShelf } from "@/lib/feeds";

export const dynamic = "force-dynamic";

type Props = PageProps<"/catalogue/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  return { title: c ? `${c.name} · ${c.call}` : "Drawer not found", description: c?.blurb };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const order = parseOrder((await searchParams).order);
  const idx = CATEGORIES.indexOf(category);
  const prev = CATEGORIES[(idx - 1 + CATEGORIES.length) % CATEGORIES.length];
  const next = CATEGORIES[(idx + 1) % CATEGORIES.length];

  return (
    <div className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pt-12 sm:px-8">
      <nav className="label mb-10 flex gap-2" aria-label="Breadcrumb">
        <Link href="/catalogue" className="hover:text-ink">Catalogue</Link>
        <span>/</span>
        <span className="text-ink-2">{category.call}</span>
      </nav>

      <header className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-mono text-sm tracking-[0.2em] text-oxblood">{category.call}</p>
          <h1 className="letterpress ink-bleed mt-2 font-display text-[clamp(2.8rem,7vw,6rem)] font-[360] leading-[0.92] tracking-[-0.04em] [font-variation-settings:'SOFT'_100,'opsz'_144]">
            {category.name}
          </h1>
          <p className="mt-5 max-w-xl text-[1.1rem] text-ink-2">{category.blurb}</p>
        </div>
        <div className="index-card sheet w-full max-w-xs rotate-[1.2deg] px-5 pb-4 pt-2.5 md:w-72">
          <p className="label flex h-8 items-center">Drawer contents</p>
          <p className="mt-4 text-sm leading-[1.6rem] text-ink-2">Filled from</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 leading-[1.6rem]">
            {category.sources.map((s) => (
              <SourceTag key={s} source={s} />
            ))}
          </div>
          <p className="text-sm leading-[1.6rem] text-ink-2">Search threads</p>
          {category.seeds.map((s) => (
            <p key={s} className="hand text-lg leading-[1.6rem]">{s}</p>
          ))}
        </div>
      </header>

      <div className="mt-14">
        <ShelfTabs base={`/catalogue/${category.slug}`} active={order} />
        <div className="mt-2">
          <Suspense key={order} fallback={<LedgerSkeleton />}>
            <Shelf category={category} order={order} />
          </Suspense>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-between border-t border-rule pt-6">
        <Link href={`/catalogue/${prev.slug}`} className="group">
          <span className="label">← Previous drawer</span>
          <span className="block font-display text-xl text-ink group-hover:text-oxblood">{prev.name}</span>
        </Link>
        <Link href={`/catalogue/${next.slug}`} className="group text-right">
          <span className="label">Next drawer →</span>
          <span className="block font-display text-xl text-ink group-hover:text-oxblood">{next.name}</span>
        </Link>
      </div>
    </div>
  );
}

async function Shelf({ category, order }: { category: Category; order: Order }) {
  const papers = await getCategoryShelf(category, order);
  return <Ledger papers={papers.slice(0, 24)} emphasis={order === "cited" ? "citations" : order === "relevant" ? "relevance" : "date"} />;
}
