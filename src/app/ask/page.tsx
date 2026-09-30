import type { Metadata } from "next";
import { AskStacks } from "@/components/ask-stacks";

export const metadata: Metadata = { title: "Ask the stacks" };

export default async function AskPage({ searchParams }: PageProps<"/ask">) {
  const { q } = await searchParams;
  return (
    <div className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pt-14 sm:px-8">
      <p className="label mb-4"><span className="text-oxblood">§ VI</span> · Ask the stacks</p>
      <h1 className="letterpress ink-bleed max-w-4xl font-display text-[clamp(2.6rem,6.5vw,5.4rem)] font-[360] leading-[0.94] tracking-[-0.04em] [font-variation-settings:'SOFT'_100,'WONK'_1,'opsz'_144]">
        Ask the literature <em className="text-ink-2">a question.</em>
      </h1>
      <p className="mb-10 mt-5 max-w-2xl text-[1.1rem] text-ink-2">
        Valyu searches arXiv, PubMed, bioRxiv and chemRxiv at once, reads the best passages, and writes a short answer with numbered references.
      </p>
      <div className="max-w-4xl">
        <AskStacks initial={typeof q === "string" ? q : ""} />
      </div>
    </div>
  );
}
