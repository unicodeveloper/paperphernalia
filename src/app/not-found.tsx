import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="index-card sheet rotate-[-1deg] px-8 pb-10 pt-3">
        <p className="label pt-1">Library notice</p>
        <p className="stamp mt-10 !text-base">Not on the shelves</p>
        <p className="mt-8 font-display text-3xl text-ink">We couldn’t find that volume.</p>
        <p className="hand mt-4 text-xl">it may be out on loan, or the call number is off.</p>
        <Link href="/" className="mt-8 inline-block bg-ink px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-sheet hover:bg-oxblood">
          Back to the reading room
        </Link>
      </div>
    </div>
  );
}
