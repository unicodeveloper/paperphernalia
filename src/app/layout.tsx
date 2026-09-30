import type { Metadata } from "next";
import { Caveat, Fraunces, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import { CommandPalette } from "@/components/command-palette";
import { PaperFilters } from "@/components/paper-filters";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { themeScript } from "@/components/theme-toggle";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Paraphernalia · The reading room for new science",
    template: "%s · Paraphernalia",
  },
  description:
    "Paper of the day, trending and most-cited research from arXiv, PubMed, bioRxiv and chemRxiv, with briefs and answers from Valyu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${sourceSerif.variable} ${plexMono.variable} ${caveat.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <PaperFilters />
        <SiteHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <SiteFooter />
        <CommandPalette />
      </body>
    </html>
  );
}
