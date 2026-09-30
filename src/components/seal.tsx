/**
 * A circular rubber stamp with text set around the rim, the kind a library
 * presses onto an acquisition. Ink texture comes from the .stamp mask.
 */
export function Seal({ ring, center, sub, className = "" }: { ring: string; center: string; sub?: string; className?: string }) {
  const id = `ring-${ring.replace(/[^a-z]/gi, "").slice(0, 12)}`;
  return (
    <div className={`stamp stamp-in !block !border-0 !p-0 ${className}`} aria-hidden>
      <svg viewBox="0 0 140 140" className="h-full w-full">
        <defs>
          <path id={id} d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <circle cx="70" cy="70" r="66" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="70" cy="70" r="40" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <text fontFamily="var(--font-plex-mono)" fontSize="10.5" letterSpacing="2.4" fill="currentColor">
          <textPath href={`#${id}`}>{ring}</textPath>
        </text>
        <text x="70" y={sub ? 70 : 76} textAnchor="middle" fontFamily="var(--font-fraunces)" fontSize="19" fill="currentColor">
          {center}
        </text>
        {sub && (
          <text x="70" y="86" textAnchor="middle" fontFamily="var(--font-plex-mono)" fontSize="8" letterSpacing="1.5" fill="currentColor">
            {sub}
          </text>
        )}
      </svg>
    </div>
  );
}
