import { generateWaveform } from "./studio-store"

export interface StockAsset {
  id: string
  title: string
  category: "video" | "audio" | "sfx" | "text" | "sticker" | "lut"
  subcategory: string
  duration?: number // in seconds
  src?: string
  previewThumbnail?: string
  color?: string
  waveform?: number[]
  tags: string[]
}

export interface StudioTemplate {
  id: string
  title: string
  category: "Social" | "Showcase" | "Editorial" | "Commercial" | "Podcast"
  aspectRatio: "16:9" | "9:16" | "1:1" | "21:9"
  duration: number
  fps: number
  description: string
  tags: string[]
  clipsCount: number
  previewColor: string
}

export const STOCK_ASSETS: StockAsset[] = [
  // Audio BGM
  {
    id: "aud-stock-1",
    title: "Neon Horizon (Synthwave)",
    category: "audio",
    subcategory: "Electronic",
    duration: 24,
    waveform: generateWaveform(32, 101),
    tags: ["Synth", "BPM 124", "Driving", "Modern"],
  },
  {
    id: "aud-stock-2",
    title: "Acoustic Reflection",
    category: "audio",
    subcategory: "Lo-Fi",
    duration: 18,
    waveform: generateWaveform(32, 202),
    tags: ["Chill", "Ambient", "Warm", "Study"],
  },
  {
    id: "aud-stock-3",
    title: "Kinetic Pulse",
    category: "audio",
    subcategory: "Trailer",
    duration: 15,
    waveform: generateWaveform(32, 303),
    tags: ["Impact", "Tension", "Dark", "Cinema"],
  },
  {
    id: "aud-stock-4",
    title: "Silicon Dawn",
    category: "audio",
    subcategory: "Corporate",
    duration: 30,
    waveform: generateWaveform(32, 404),
    tags: ["Optimistic", "Clean", "Tech", "Product"],
  },

  // SFX
  {
    id: "sfx-stock-1",
    title: "Deep Sub Boom",
    category: "sfx",
    subcategory: "Hits",
    duration: 2.5,
    waveform: generateWaveform(16, 505),
    tags: ["Boom", "Bass", "Drop"],
  },
  {
    id: "sfx-stock-2",
    title: "Fast Cinematic Whoosh",
    category: "sfx",
    subcategory: "Transitions",
    duration: 1.2,
    waveform: generateWaveform(16, 606),
    tags: ["Whoosh", "Swipe", "Air"],
  },
  {
    id: "sfx-stock-3",
    title: "Analog Shutter Click",
    category: "sfx",
    subcategory: "Foley",
    duration: 0.8,
    waveform: generateWaveform(16, 707),
    tags: ["Camera", "Snap", "Mechanical"],
  },
  {
    id: "sfx-stock-4",
    title: "Glitch Static Burst",
    category: "sfx",
    subcategory: "Cyber",
    duration: 1.5,
    waveform: generateWaveform(16, 808),
    tags: ["Glitch", "Noise", "Distort"],
  },

  // Text Presets
  {
    id: "txt-stock-1",
    title: "Kinetic Bold Title",
    category: "text",
    subcategory: "Headlines",
    duration: 4,
    tags: ["Bold", "Uppercase", "Minimal"],
  },
  {
    id: "txt-stock-2",
    title: "Modern Lower Third",
    category: "text",
    subcategory: "Badges",
    duration: 5,
    tags: ["Presenter", "Title", "Corner"],
  },
  {
    id: "txt-stock-3",
    title: "Editorial Serif Quote",
    category: "text",
    subcategory: "Editorial",
    duration: 6,
    tags: ["Quote", "Playfair", "Story"],
  },
  {
    id: "txt-stock-4",
    title: "Cyber Monospace Badge",
    category: "text",
    subcategory: "Technical",
    duration: 4,
    tags: ["Code", "Mono", "HUD"],
  },
]

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "tmpl-kinetic-manifesto",
    title: "C1P Kinetic Manifesto",
    category: "Showcase",
    aspectRatio: "16:9",
    duration: 16,
    fps: 60,
    description: "Architectural brand launch with dynamic typography cuts, audio risers, and high-contrast color treatment.",
    tags: ["Showcase", "Typography", "1080p60", "Brand"],
    clipsCount: 8,
    previewColor: "#09090b",
  },
  {
    id: "tmpl-tiktok-hook",
    title: "Viral TikTok / Reel Hook",
    category: "Social",
    aspectRatio: "9:16",
    duration: 12,
    fps: 30,
    description: "High-retention mobile format featuring centered punchy captions, jump cuts, and pulsing lo-fi rhythm.",
    tags: ["TikTok", "Shorts", "Viral", "Captions"],
    clipsCount: 6,
    previewColor: "#18181b",
  },
  {
    id: "tmpl-product-commercial",
    title: "Modern Hardware Spotlight",
    category: "Commercial",
    aspectRatio: "1:1",
    duration: 10,
    fps: 30,
    description: "Sleek square format tailored for product launches, Instagram feeds, and interactive ads.",
    tags: ["Product", "Hardware", "Clean", "Feed"],
    clipsCount: 5,
    previewColor: "#111113",
  },
  {
    id: "tmpl-podcast-audiogram",
    title: "Podcast Waveform Teaser",
    category: "Podcast",
    aspectRatio: "16:9",
    duration: 20,
    fps: 30,
    description: "Audio-first sequence with active visualizer waveform, episode title cards, and guest lower thirds.",
    tags: ["Audio", "Waveform", "Interview", "Talk"],
    clipsCount: 7,
    previewColor: "#0f172a",
  },
  {
    id: "tmpl-cinematic-vlog",
    title: "Cinematic Travel Vignette",
    category: "Editorial",
    aspectRatio: "21:9",
    duration: 24,
    fps: 24,
    description: "Ultrawide 21:9 widescreen film look with subtle letterboxing, film grain aesthetic, and atmospheric soundtrack.",
    tags: ["21:9", "Film", "Widescreen", "24fps"],
    clipsCount: 9,
    previewColor: "#1c1917",
  },
]
