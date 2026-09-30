"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import remarkGfm from "remark-gfm";
import { Streamdown } from "streamdown";

/** Internal links stay in the reading room; everything else opens in a new tab. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function A({ href = "", children, node, ...rest }: ComponentProps<"a"> & { node?: unknown }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="cite-ref">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" {...rest}>
      {children}
    </a>
  );
}

export function Markdown({ children, streaming = false }: { children: string; streaming?: boolean }) {
  return (
    <div className="prose-paper">
      <Streamdown
        remarkPlugins={[remarkGfm]}
        mode={streaming ? "streaming" : "static"}
        isAnimating={streaming}
        controls={false}
        linkSafety={{ enabled: false }}
        components={{ a: A }}
      >
        {children}
      </Streamdown>
    </div>
  );
}
