# Paraphernalia

A reading room for new science, built on [Valyu](https://valyu.ai). Research from **arXiv, PubMed, bioRxiv and chemRxiv**, laid out like an archive: deckle-edged sheets, rubber stamps, a card catalogue, and notes handwritten in the margins.

## Features

| | |
|---|---|
| **Paper of the day** | One paper, the same for every reader, drawn each morning from a rotating catalogue drawer. The Valyu Brief is written into its margins. |
| **Trending** ("On the desk") | Papers from the last 45 days across all four archives, ranked by Valyu relevance × recency × early citations, interleaved so no archive dominates. |
| **Most cited** ("The canon") | The most-cited papers across the catalogue, printed on a library reference slip. |
| **Most relevant** | Search ordered by Valyu relevance, with archive filters, date windows, and sorting by citations or recency. |
| **Card catalogue** | 14 fields with call numbers, each with Trending / Most cited / Most relevant tabs. |
| **Archives** | One page per archive. |
| **Valyu Brief** | TL;DR, plain-language explanation, contributions, method, results, caveats and keywords, read from the paper's full text (Contents API with a structured summary; falls back to the Answer API when a publisher blocks fetching, e.g. chemRxiv). |
| **Ask this paper** | Questions answered from the paper's own text. |
| **Related work in other archives** | The same idea searched in all four archives, so a method links to where it's being applied. |
| **Ask the stacks** | Streaming answers from Valyu across all four archives, with numbered references that open in the app. |
| **Shelf** | A bookmark list kept in the browser, with BibTeX export. |
| **⌘K** | Call-slip search palette from any page. |

## Paper-feel design system

Everything is CSS or inline SVG; no texture images.

1. Fractal-noise fibre grain (`feTurbulence`) over the whole page
2. Foxing spots and a lamplight vignette
3. Laid-paper chain lines
4. Stacked sheets that fan out on hover
5. Dog-eared corners on list rows
6. Letterpress (debossed) display type
7. Ink bleed on headlines via `feDisplacementMap`
8. Deckle (torn) sheet edges via an SVG displacement filter
9. Highlighter sweep across titles
10. Handwritten marginalia (Caveat) for Valyu's notes
11. Rubber stamps and a circular acquisition seal with a noise ink mask
12. Perforated tear-off edge on the reference slip
13. Washi tape holding sheets and figures down
14. Ruled notepaper for every input, with a red margin line
15. Library index cards, brass-labelled catalogue drawers, cloth book spines, a printer's colour bar, and page-turn view transitions

Light is day paper; dark is lamplight. The toggle follows the OS setting until you choose.

## Run it

```bash
cp .env.example .env.local   # add VALYU_API_KEY
pnpm install
pnpm dev
```

Stack: Next.js 16 (App Router), Tailwind CSS 4, `valyu-js`, `zod`, `streamdown` + `remark-gfm`.

## Notes on the data

- Valyu returns passages, so results are de-duplicated by URL.
- Search results are cached for 40 minutes, because figure URLs are signed for an hour. Briefs and paper answers are cached for 7 days. Failures are never cached.
- Valyu calls are capped at 4 concurrent requests, with retry and backoff for transient errors.
