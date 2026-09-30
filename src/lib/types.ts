import { z } from "zod";
import type { SourceId } from "./sources";

export interface Paper {
  /** Archive-native identifier (arXiv id, PMC id, DOI). */
  id: string;
  source: SourceId;
  url: string;
  title: string;
  authors: string[];
  abstract: string;
  /** A passage of full text Valyu matched, useful as a pull-quote. */
  excerpt: string;
  date: string | null;
  /** True when the archive only reports a year. */
  yearOnly: boolean;
  doi: string | null;
  citations: number;
  relevance: number;
  figure: string | null;
  citation: string | null;
}

export const briefSchema = z.object({
  tldr: z.string(),
  eli5: z.string(),
  contributions: z.array(z.string()),
  method: z.string(),
  results: z.array(z.string()),
  limitations: z.array(z.string()),
  why_it_matters: z.string(),
  keywords: z.array(z.string()),
});

export type Brief = z.infer<typeof briefSchema>;

export const BRIEF_JSON_SCHEMA = {
  type: "object",
  properties: {
    tldr: { type: "string", description: "One-sentence takeaway, under 30 words" },
    eli5: { type: "string", description: "Explain to a curious 12-year-old in 2-3 sentences" },
    contributions: { type: "array", items: { type: "string" }, description: "3-5 key contributions" },
    method: { type: "string", description: "How the work was done, 2-3 sentences" },
    results: { type: "array", items: { type: "string" }, description: "Headline results, with numbers where reported" },
    limitations: { type: "array", items: { type: "string" }, description: "2-4 limitations or open questions" },
    why_it_matters: { type: "string", description: "Why this matters beyond the field, 1-2 sentences" },
    keywords: { type: "array", items: { type: "string" }, description: "4-6 short topical keywords" },
  },
  required: ["tldr", "eli5", "contributions", "method", "results", "limitations", "why_it_matters", "keywords"],
} as const;
