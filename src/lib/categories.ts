import type { SourceId } from "./sources";

/**
 * The card catalogue. Each drawer carries a call number (loosely Dewey),
 * the archives it reads from, and seed queries Valyu uses to fill it.
 */
export interface Category {
  slug: string;
  name: string;
  call: string;
  blurb: string;
  sources: SourceId[];
  seeds: string[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "machine-intelligence",
    name: "Machine Intelligence",
    call: "006.3",
    blurb: "Learning systems, from theory to frontier models.",
    sources: ["arxiv"],
    seeds: ["deep learning new architecture results", "reinforcement learning agents"],
  },
  {
    slug: "language-models",
    name: "Language Models",
    call: "006.35",
    blurb: "Reasoning, alignment, agents and the science of LLMs.",
    sources: ["arxiv"],
    seeds: ["large language model reasoning", "LLM alignment and evaluation benchmark"],
  },
  {
    slug: "robotics",
    name: "Robotics & Embodiment",
    call: "629.8",
    blurb: "Machines that sense, move and manipulate.",
    sources: ["arxiv"],
    seeds: ["robot manipulation policy learning", "humanoid robot locomotion"],
  },
  {
    slug: "quantum",
    name: "Quantum Matter",
    call: "530.12",
    blurb: "Qubits, error correction and the quantum many-body problem.",
    sources: ["arxiv"],
    seeds: ["quantum error correction", "quantum computing algorithm hardware"],
  },
  {
    slug: "cosmos",
    name: "The Cosmos",
    call: "523.1",
    blurb: "Cosmology, exoplanets, black holes and gravitational waves.",
    sources: ["arxiv"],
    seeds: ["exoplanet atmosphere observations", "cosmology dark energy survey"],
  },
  {
    slug: "neuroscience",
    name: "Neuroscience",
    call: "612.8",
    blurb: "Circuits, cognition and the brain in health and disease.",
    sources: ["biorxiv", "pubmed"],
    seeds: ["neural circuits behavior", "neurodegeneration mechanism"],
  },
  {
    slug: "genomics",
    name: "Genomics & Gene Editing",
    call: "572.86",
    blurb: "Sequencing, CRISPR and the regulatory genome.",
    sources: ["biorxiv", "pubmed"],
    seeds: ["single-cell sequencing atlas", "CRISPR gene editing"],
  },
  {
    slug: "oncology",
    name: "Oncology",
    call: "616.99",
    blurb: "Tumour biology, immunotherapy and cancer trials.",
    sources: ["pubmed", "biorxiv"],
    seeds: ["cancer immunotherapy response", "tumor microenvironment"],
  },
  {
    slug: "immunology",
    name: "Immunity & Infection",
    call: "616.079",
    blurb: "Pathogens, vaccines and the immune response.",
    sources: ["pubmed", "biorxiv"],
    seeds: ["vaccine immune response", "antimicrobial resistance bacteria"],
  },
  {
    slug: "drug-discovery",
    name: "Drug Discovery",
    call: "615.19",
    blurb: "Targets, molecules and the path to the clinic.",
    sources: ["chemrxiv", "pubmed", "biorxiv"],
    seeds: ["drug discovery small molecule inhibitor", "machine learning drug design"],
  },
  {
    slug: "materials-energy",
    name: "Materials & Energy",
    call: "620.11",
    blurb: "Batteries, catalysts, photovoltaics and new matter.",
    sources: ["chemrxiv", "arxiv"],
    seeds: ["battery electrolyte materials", "perovskite solar cell efficiency"],
  },
  {
    slug: "synthesis",
    name: "Chemical Synthesis",
    call: "547.2",
    blurb: "New reactions, catalysis and the craft of making molecules.",
    sources: ["chemrxiv"],
    seeds: ["catalytic asymmetric synthesis", "photoredox catalysis reaction"],
  },
  {
    slug: "public-health",
    name: "Public Health",
    call: "614",
    blurb: "Epidemiology, populations and health systems.",
    sources: ["pubmed"],
    seeds: ["epidemiology cohort study mortality", "public health intervention trial"],
  },
  {
    slug: "climate",
    name: "Climate & Earth",
    call: "551.6",
    blurb: "A warming planet, measured and modelled.",
    sources: ["arxiv", "pubmed", "biorxiv"],
    seeds: ["climate change modeling extreme weather", "biodiversity ecosystem climate"],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
