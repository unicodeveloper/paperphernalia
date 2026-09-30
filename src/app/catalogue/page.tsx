import type { Metadata } from "next";
import { CatalogueDrawers } from "@/components/catalogue-drawers";
import { SectionHead } from "@/components/section-head";

export const metadata: Metadata = { title: "The catalogue" };

export default function CataloguePage() {
  return (
    <div className="mx-auto max-w-[88rem] 2xl:max-w-[104rem] px-4 pt-14 sm:px-8">
      <SectionHead
        no="IV"
        kicker="Browse by field"
        title={
          <>
            The card <em className="text-ink-2">catalogue</em>
          </>
        }
        dek="Fourteen drawers across physics, computing, the life sciences and chemistry. Every drawer is filled live by Valyu from the archives listed on its front."
      />
      <CatalogueDrawers />
    </div>
  );
}
