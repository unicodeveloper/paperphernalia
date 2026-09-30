import type { Metadata } from "next";
import { ShelfView } from "@/components/shelf-view";

export const metadata: Metadata = { title: "Your shelf" };

export default function ShelfPage() {
  return (
    <div className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pt-14 sm:px-8">
      <p className="label mb-4">Reading list</p>
      <h1 className="letterpress font-display text-[clamp(2.6rem,6.5vw,5.4rem)] font-[360] leading-[0.94] tracking-[-0.04em] [font-variation-settings:'SOFT'_100,'opsz'_144]">
        Your <em className="text-ink-2">shelf</em>
      </h1>
      <p className="mb-10 mt-4 max-w-xl text-ink-2">Papers you’ve bookmarked, kept in this browser. Export the lot as BibTeX when you start writing.</p>
      <ShelfView />
    </div>
  );
}
