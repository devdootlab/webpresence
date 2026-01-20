import { Hunter, FishData } from './types';

// The specific comic burst polygon path requested
export const COMIC_BURST_POLYGON = `polygon(
92.5% 50%, 66.86% 52.97%, 89.9% 66.86%, 64.87% 57.46%, 85.11% 80.06%,
60.63% 60.63%, 80.06% 85.11%, 57.46% 64.87%, 66.86% 89.9%, 52.97% 66.86%,
50% 92.5%, 47.03% 66.86%, 33.14% 89.9%, 42.54% 64.87%, 19.94% 85.11%,
39.37% 60.63%, 14.9% 80.06%, 35.13% 57.46%, 10.1% 66.86%, 33.14% 52.97%,
7.5% 50%, 33.14% 47.03%, 10.1% 33.14%, 35.13% 42.54%, 14.9% 19.94%,
39.37% 39.37%, 19.94% 14.9%, 42.54% 35.13%, 33.14% 10.1%, 47.03% 33.14%,
50% 7.5%, 52.97% 33.14%, 66.86% 10.1%, 57.46% 35.13%, 85.11% 14.9%,
60.63% 39.37%
)`;

// Default Media
export const DEFAULT_IMAGE_SRC = "https://images.unsplash.com/photo-1533552024785-5db438e6e582?q=80&w=2670&auto=format&fit=crop"; 
export const DEFAULT_VIDEO_SRC = "https://cdn.midjourney.com/video/0d51ccad-768a-472f-b02b-322f96b04d65/0.mp4";
export const DEFAULT_FINALE_VIDEO_SRC = "https://cdn.midjourney.com/video/77107015-92ec-43ec-bf3c-855d4dea4bb4/2.mp4";

// Initial Hunter Configuration
export const INITIAL_HUNTERS: Hunter[] = [
  {
    id: 1,
    hitbox: { t: 18, l: 24, w: 13, h: 16 },
    muzzle: { t: 31.5, l: 42 },
    angle: 52,
    bannerHeadline: "RESEARCH!",
    bannerColor: "#F4C430", // Saffron Yellow
    textColor: "#FAF8F0", // Cream/White
    burstColor: "#000000",
    burstShadow: "2px 2px 0 rgba(0,0,0,0.5)",
    burstScale: "scale(1.4)",
    useSpecificPath: true,
    isLink: true,
  },
  {
    id: 2,
    hitbox: { t: 38, l: 21, w: 13, h: 16 },
    muzzle: { t: 42.5, l: 37.5 },
    angle: 38,
    bannerHeadline: "PEOPLE!",
    bannerColor: "#1565C0", // Bold Cobalt
    textColor: "#FAF8F0",
    burstColor: "#000000",
    burstShadow: "2px 2px 0 rgba(0,0,0,0.5)",
    burstScale: "scale(1.4)",
    useSpecificPath: true,
    isLink: false,
  },
  {
    id: 3,
    hitbox: { t: 58, l: 18, w: 14, h: 18 },
    muzzle: { t: 63.5, l: 34.5 },
    angle: 1,
    bannerHeadline: "NEWS!",
    bannerColor: "#C62828", // Deep Crimson
    textColor: "#FAF8F0",
    burstColor: "#000000",
    burstShadow: "4px 4px 0 rgba(0,0,0,0.3)",
    burstScale: "scale(1.4)",
    useSpecificPath: true,
    isLink: true,
  },
];

// Fish Data Configuration
export const FISH_DATA: FishData[] = [
  {
    id: '12-clock',
    // Big Central Fish (Facing Right)
    position: { t: 28, l: 18, w: 65, h: 42 }, 
    clipPath: "polygon(5% 50%, 25% 15%, 70% 5%, 95% 45%, 90% 75%, 70% 95%, 25% 85%)",
    content: {
      title: "RNA in B cells",
      body: "B cells undergo a complex process of differentiation and selection to produce high-affinity antibodies. Recent studies utilizing single-cell RNA sequencing have revealed distinct transcriptional states during germinal center reactions. Understanding the mRNA dynamics within these cells is crucial for designing better vaccines and therapeutic interventions against autoimmune diseases.",
      tickerItems: ["🧬", "💉", "🧫", "B-Cell Dev", "RAG1/2", "CD19+", "IgH"],
      highlightTerms: ["B cells", "RNA sequencing", "germinal center", "vaccines"]
    }
  },
  {
    id: '3-clock',
    // X-Ray Fish (Right Middle)
    position: { t: 56, l: 72, w: 32, h: 22 },
    // Head is at far right (~95% of fish width).
    focus: { x: 100, y: 75 }, 
    clipPath: "polygon(95% 50%, 75% 20%, 20% 25%, 5% 50%, 20% 80%, 75% 80%)",
    content: {
      title: "Lipid Nanoparticles and Immunogenicity",
      body: "Lipid Nanoparticles (LNPs) are the vehicle of choice for mRNA delivery, yet their intrinsic immunogenicity remains a double-edged sword. While they can act as self-adjuvants, excessive inflammation can lead to adverse effects. Optimizing the lipid composition—specifically ionizable lipids—is key to balancing potency with safety in next-generation genetic medicines.",
      tickerItems: ["💊", "⚗️", "PEG-Lipid", "Endosome", "Escape", "mRNA Load", "Adjuvant"],
      highlightTerms: ["Lipid Nanoparticles", "mRNA delivery", "immunogenicity", "ionizable lipids"]
    }
  },
  {
    id: '4-clock',
    // Small Colorful (Bottom Right)
    position: { t: 72, l: 62, w: 22, h: 18 }, 
    // Head is at right (~80% of fish width).
    focus: { x: 80, y: 80 },
    clipPath: "polygon(100% 50%, 80% 20%, 20% 25%, 0% 50%, 20% 80%, 80% 80%)",
    content: {
      title: "RNA Sensing and Coronaviruses",
      body: "Coronaviruses like OC43 and SARS-CoV-2 have evolved sophisticated mechanisms to evade host innate immunity. Cytosolic RNA sensors such as RIG-I and MDA5 play a pivotal role in detecting viral replication intermediates. However, viral proteins often antagonize these pathways, dampening the interferon response and allowing unchecked viral propagation.",
      tickerItems: ["🦠", "🛡️", "OC43", "SARS-CoV-2", "RIG-I", "MDA5", "Interferon"],
      highlightTerms: ["Coronaviruses", "OC43", "RIG-I", "MDA5", "interferon"]
    }
  },
  {
    id: '7-clock',
    // Geometric Fish (Bottom Left)
    position: { t: 72, l: 25, w: 28, h: 24 }, 
    clipPath: "polygon(95% 50%, 70% 10%, 20% 15%, 0% 50%, 20% 90%, 70% 90%)",
    content: {
      title: "Machine Learning to Understand Splicing",
      body: "The human spliceosome is a molecular machine of staggering complexity. Deep learning foundational models are now being trained on vast genomic datasets to predict splicing outcomes from sequence alone. These models can identify cryptic splice sites and predict the pathogenicity of non-coding variants with unprecedented accuracy.",
      tickerItems: ["💻", "🧠", "Spliceosome", "Exon", "Intron", "Deep Learning", "Transformer"],
      highlightTerms: ["spliceosome", "Deep learning", "genomic datasets", "cryptic splice sites"]
    }
  },
  {
    id: '9-clock',
    // Bowler Hat Fish (Left Middle)
    position: { t: 48, l: 2, w: 32, h: 25 }, 
    clipPath: "polygon(10% 55%, 30% 15%, 80% 20%, 100% 55%, 80% 90%, 30% 85%)",
    content: {
      title: "Understanding B Cell Epitopes",
      body: "High-throughput methods like PhIP-Seq and VirScan allow for the comprehensive profiling of antibody repertoires against the entire human virome. By mapping B cell epitopes at scale, researchers can identify correlates of protection and discover novel biomarkers for infection history and autoimmune susceptibility.",
      tickerItems: ["🔍", "🩸", "PhIP-Seq", "VirScan", "Epitope", "Antibody", "Virome"],
      highlightTerms: ["PhIP-Seq", "VirScan", "antibody repertoires", "biomarkers"]
    }
  }
];