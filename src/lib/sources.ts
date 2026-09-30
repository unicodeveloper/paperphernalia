/**
 * The four archives Paraphernalia reads from, and how to move between a Valyu
 * result URL and the short, human-readable paper route we use internally.
 */
export const SOURCE_IDS = ["arxiv", "pubmed", "biorxiv", "chemrxiv"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

export interface SourceMeta {
  id: SourceId;
  name: string;
  dataset: string;
  field: string;
  /** Shelf mark printed on the archive's book spine. */
  mark: string;
  founded: string;
  blurb: string;
}

export const SOURCES: Record<SourceId, SourceMeta> = {
  arxiv: {
    id: "arxiv",
    name: "arXiv",
    dataset: "valyu/valyu-arxiv",
    field: "Physics · Maths · Computer Science",
    mark: "A",
    founded: "1991",
    blurb: "The preprint server that rewired how physics, maths and machine learning are published.",
  },
  pubmed: {
    id: "pubmed",
    name: "PubMed",
    dataset: "valyu/valyu-pubmed",
    field: "Biomedicine · Life Sciences",
    mark: "P",
    founded: "1996",
    blurb: "Full-text biomedical literature from PubMed Central, from clinical trials to cell biology.",
  },
  biorxiv: {
    id: "biorxiv",
    name: "bioRxiv",
    dataset: "valyu/valyu-biorxiv",
    field: "Biology Preprints",
    mark: "B",
    founded: "2013",
    blurb: "Biology before peer review: genomics, neuroscience and ecology as the work happens.",
  },
  chemrxiv: {
    id: "chemrxiv",
    name: "chemRxiv",
    dataset: "valyu/valyu-chemrxiv",
    field: "Chemistry Preprints",
    mark: "C",
    founded: "2017",
    blurb: "Chemistry and materials science preprints, figures and all.",
  },
};

export const ALL_DATASETS = SOURCE_IDS.map((s) => SOURCES[s].dataset);

export function isSourceId(v: unknown): v is SourceId {
  return typeof v === "string" && (SOURCE_IDS as readonly string[]).includes(v);
}

export function sourceFromDataset(dataset: string): SourceId | null {
  const id = dataset.replace("valyu/valyu-", "");
  return isSourceId(id) ? id : null;
}

/** Extract the archive-native identifier from a result URL. */
export function idFromUrl(source: SourceId, url: string): string {
  const u = url.replace(/[?#].*$/, "").replace(/\/+$/, "");
  switch (source) {
    case "arxiv":
      return u.replace(/^https?:\/\/(www\.)?arxiv\.org\/(abs|pdf)\//, "").replace(/v\d+$/, "");
    case "pubmed":
      return u.replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//, "");
    case "biorxiv":
      return u
        .replace(/^https?:\/\/(www\.)?biorxiv\.org\/content\//, "")
        .replace(/^https?:\/\/doi\.org\//, "")
        .replace(/v\d+(\.full)?$/, "");
    case "chemrxiv":
      return u.replace(/^https?:\/\/chemrxiv\.org\/doi\/(full\/|abs\/)?/, "");
  }
}

/** Best-effort inverse of idFromUrl, used when a shared link arrives cold. */
export function urlFromId(source: SourceId, id: string): string {
  switch (source) {
    case "arxiv":
      return `https://arxiv.org/abs/${id}`;
    case "pubmed":
      return `https://pubmed.ncbi.nlm.nih.gov/${id}`;
    case "biorxiv":
      return id.startsWith("10.1101/")
        ? `https://www.biorxiv.org/content/${id}`
        : `https://doi.org/${id}`;
    case "chemrxiv":
      return `https://chemrxiv.org/doi/full/${id}`;
  }
}

export function pdfUrl(source: SourceId, id: string): string | null {
  if (source === "arxiv") return `https://arxiv.org/pdf/${id}`;
  if (source === "pubmed" && id.startsWith("PMC"))
    return `https://www.ncbi.nlm.nih.gov/pmc/articles/${id}/pdf/`;
  if (source === "biorxiv" && id.startsWith("10.1101/"))
    return `https://www.biorxiv.org/content/${id}.full.pdf`;
  return null;
}
