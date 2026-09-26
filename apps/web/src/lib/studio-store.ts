import * as React from "react"

export interface StudioFilterSettings {
  brightness: number
  contrast: number
  saturate: number
  blur: number
}

export interface StudioClip {
  id: string
  trackId: string
  name: string
  type: "video" | "audio" | "image" | "text" | "shape"
  start: number // in seconds
  duration: number // in seconds
  src?: string
  color?: string
  volume: number // 0-200
  speed: number // 0.25-4
  x: number // px or %
  y: number // px or %
  scale: number // 0.1 - 5
  rotation: number // -180 to 180
  opacity: number // 0 - 100
  text?: string
  fontFamily?: string
  fontSize?: number
  textColor?: string
  textBg?: string
  filters: StudioFilterSettings
  waveform?: number[]
}

export interface StudioTrack {
  id: string
  name: string
  type: "overlay" | "video" | "audio"
  muted: boolean
  locked: boolean
  visible: boolean
  clips: StudioClip[]
}

export interface Project {
  id: string
  title: string
  description?: string
  width: number
  height: number
  fps: number
  duration: number // project duration in seconds
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5" | "21:9"
  backgroundColor: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  tags: string[]
  tracks: StudioTrack[]
  thumbnail?: string
}

export interface ActivityLog {
  id: string
  projectId?: string
  projectTitle: string
  action: string
  timestamp: string
  type: "create" | "edit" | "export" | "delete"
}

const STORAGE_KEY_PROJECTS = "c1p_studio_projects_v1"
const STORAGE_KEY_ACTIVITIES = "c1p_studio_activities_v1"
const STORAGE_KEY_EXPORTS = "c1p_studio_export_count_v1"

// Generate synthetic audio waveform bar heights (0.1 to 1.0)
export function generateWaveform(count: number = 32, seed: number = 42): number[] {
  const result: number[] = []
  let prev = 0.5
  for (let i = 0; i < count; i++) {
    const r = Math.sin(i * 0.4 + seed) * 0.35 + 0.55
    const smoothed = prev * 0.3 + r * 0.7
    prev = smoothed
    result.push(Math.max(0.12, Math.min(0.98, smoothed)))
  }
  return result
}

// Built-in Seed Projects showcasing C1P capabilities
export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-c1p-launch",
    title: "C1P — Kinetic Studio Anthem",
    description: "High-tempo creative studio launch sequence with text reveals and audio drops.",
    width: 1920,
    height: 1080,
    fps: 60,
    duration: 16,
    aspectRatio: "16:9",
    backgroundColor: "#09090b",
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tags: ["Anthem", "Kinetic", "1080p60", "Brand"],
    tracks: [
      {
        id: "track-overlay-1",
        name: "Overlay & Typography",
        type: "overlay",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-txt-1",
            trackId: "track-overlay-1",
            name: "C1P Headline",
            type: "text",
            start: 0.5,
            duration: 4.5,
            text: "C1P — CREATE. INNOVATE. PROGRESS.",
            fontFamily: "Inter Variable",
            fontSize: 48,
            textColor: "#ffffff",
            textBg: "rgba(0,0,0,0.6)",
            volume: 100,
            speed: 1,
            x: 0,
            y: -15,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
          },
          {
            id: "clip-txt-2",
            trackId: "track-overlay-1",
            name: "Sub-Title Drop",
            type: "text",
            start: 5.5,
            duration: 5.0,
            text: "A Precision Studio Built For Modern Creators",
            fontFamily: "Playfair Display",
            fontSize: 36,
            textColor: "#e4e4e7",
            volume: 100,
            speed: 1,
            x: 0,
            y: 20,
            scale: 1,
            rotation: 0,
            opacity: 95,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
          },
          {
            id: "clip-txt-3",
            trackId: "track-overlay-1",
            name: "Outro CTA",
            type: "text",
            start: 11.0,
            duration: 4.5,
            text: "PROGRESS FORWARD",
            fontFamily: "Inter Variable",
            fontSize: 54,
            textColor: "#fafafa",
            volume: 100,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1.1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
          },
        ],
      },
      {
        id: "track-video-1",
        name: "Main Video Track",
        type: "video",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-vid-1",
            trackId: "track-video-1",
            name: "Architectural Studio Intro",
            type: "video",
            start: 0,
            duration: 6.0,
            color: "#18181b",
            volume: 80,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 105, contrast: 110, saturate: 95, blur: 0 },
          },
          {
            id: "clip-vid-2",
            trackId: "track-video-1",
            name: "Industrial Design Macro",
            type: "video",
            start: 6.0,
            duration: 5.5,
            color: "#27272a",
            volume: 90,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 115, saturate: 110, blur: 0 },
          },
          {
            id: "clip-vid-3",
            trackId: "track-video-1",
            name: "Gradient Ambient Outro",
            type: "video",
            start: 11.5,
            duration: 4.5,
            color: "#09090b",
            volume: 80,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 90, contrast: 105, saturate: 100, blur: 0 },
          },
        ],
      },
      {
        id: "track-audio-1",
        name: "Soundtrack (BGM)",
        type: "audio",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-aud-1",
            trackId: "track-audio-1",
            name: "Midnight Synthesizer - 128 BPM",
            type: "audio",
            start: 0,
            duration: 16,
            volume: 85,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
            waveform: generateWaveform(48, 12),
          },
        ],
      },
      {
        id: "track-audio-2",
        name: "Sound Effects (SFX)",
        type: "audio",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-sfx-1",
            trackId: "track-audio-2",
            name: "Heavy Cinematic Riser",
            type: "audio",
            start: 4.5,
            duration: 1.5,
            volume: 95,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
            waveform: generateWaveform(16, 99),
          },
          {
            id: "clip-sfx-2",
            trackId: "track-audio-2",
            name: "Sub Bass Impact",
            type: "audio",
            start: 6.0,
            duration: 2.0,
            volume: 100,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
            waveform: generateWaveform(16, 88),
          },
        ],
      },
    ],
  },
  {
    id: "proj-vertical-reel",
    title: "Vertical Social Story",
    description: "9:16 mobile format engineered for TikTok, Instagram Reels, and YouTube Shorts.",
    width: 1080,
    height: 1920,
    fps: 30,
    duration: 12,
    aspectRatio: "9:16",
    backgroundColor: "#18181b",
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    tags: ["9:16", "Reels", "Shorts", "Social"],
    tracks: [
      {
        id: "track-vert-overlay",
        name: "Hook & Captions",
        type: "overlay",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-vhook-1",
            trackId: "track-vert-overlay",
            name: "Hook Card",
            type: "text",
            start: 0.2,
            duration: 3.5,
            text: "3 WAYS TO 10X YOUR WORKFLOW",
            fontFamily: "Inter Variable",
            fontSize: 42,
            textColor: "#ffffff",
            volume: 100,
            speed: 1,
            x: 0,
            y: -25,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
          },
        ],
      },
      {
        id: "track-vert-video",
        name: "Vertical Video",
        type: "video",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-vvid-1",
            trackId: "track-vert-video",
            name: "Studio Camera Setup",
            type: "video",
            start: 0,
            duration: 12,
            color: "#27272a",
            volume: 80,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 105, saturate: 105, blur: 0 },
          },
        ],
      },
      {
        id: "track-vert-audio",
        name: "Trending Beat",
        type: "audio",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-vaud-1",
            trackId: "track-vert-audio",
            name: "Lo-Fi Instrumental",
            type: "audio",
            start: 0,
            duration: 12,
            volume: 90,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
            waveform: generateWaveform(36, 44),
          },
        ],
      },
    ],
  },
  {
    id: "proj-product-teaser",
    title: "Square Product Teaser",
    description: "1:1 modern minimalist product showcase with smooth fade animations.",
    width: 1080,
    height: 1080,
    fps: 30,
    duration: 10,
    aspectRatio: "1:1",
    backgroundColor: "#111114",
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    tags: ["1:1", "Commercial", "Product"],
    tracks: [
      {
        id: "track-sq-1",
        name: "Badge & Logo",
        type: "overlay",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-sqtxt-1",
            trackId: "track-sq-1",
            name: "Badge",
            type: "text",
            start: 1.0,
            duration: 8.0,
            text: "C1P HARDWARE LABS",
            fontFamily: "Inter Variable",
            fontSize: 28,
            textColor: "#a1a1aa",
            volume: 100,
            speed: 1,
            x: 0,
            y: 35,
            scale: 1,
            rotation: 0,
            opacity: 90,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
          },
        ],
      },
      {
        id: "track-sq-2",
        name: "Product Reel",
        type: "video",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-sqvid-1",
            trackId: "track-sq-2",
            name: "Machined Aluminum 360",
            type: "video",
            start: 0,
            duration: 10,
            color: "#18181b",
            volume: 100,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 120, saturate: 90, blur: 0 },
          },
        ],
      },
      {
        id: "track-sq-3",
        name: "Ambient Soundscape",
        type: "audio",
        muted: false,
        locked: false,
        visible: true,
        clips: [
          {
            id: "clip-sqaud-1",
            trackId: "track-sq-3",
            name: "Atmospheric Pulse",
            type: "audio",
            start: 0,
            duration: 10,
            volume: 75,
            speed: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
            waveform: generateWaveform(28, 55),
          },
        ],
      },
    ],
  },
]

function sanitizeProject(p: Project): Project {
  return {
    ...p,
    tracks: (p.tracks || []).map((t) => ({
      ...t,
      clips: (t.clips || []).map((c) => {
        if (c.src && c.src.includes("commondatastorage.googleapis.com")) {
          const { src, ...rest } = c
          return rest
        }
        return c
      }),
    })),
  }
}

// Storage Layer
export function getSavedProjects(): Project[] {
  if (typeof window === "undefined") return INITIAL_PROJECTS.map(sanitizeProject)
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(INITIAL_PROJECTS))
      return INITIAL_PROJECTS.map(sanitizeProject)
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(sanitizeProject)
    }
    return INITIAL_PROJECTS.map(sanitizeProject)
  } catch (e) {
    console.error("Error reading projects from storage", e)
    return INITIAL_PROJECTS.map(sanitizeProject)
  }
}

export function saveProject(project: Project): void {
  if (typeof window === "undefined") return
  try {
    const projects = getSavedProjects()
    const index = projects.findIndex((p) => p.id === project.id)
    const updated = { ...project, updatedAt: new Date().toISOString() }

    let nextProjects: Project[]
    if (index >= 0) {
      nextProjects = [...projects]
      nextProjects[index] = updated
    } else {
      nextProjects = [updated, ...projects]
    }

    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(nextProjects))
    logActivity({
      projectTitle: project.title,
      projectId: project.id,
      action: index >= 0 ? "Saved changes to project" : "Created new project",
      type: index >= 0 ? "edit" : "create",
    })
    window.dispatchEvent(new Event("c1p_projects_changed"))
  } catch (e) {
    console.error("Error saving project", e)
  }
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return
  try {
    const projects = getSavedProjects()
    const target = projects.find((p) => p.id === id)
    const next = projects.filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(next))
    if (target) {
      logActivity({
        projectTitle: target.title,
        projectId: id,
        action: "Deleted project",
        type: "delete",
      })
    }
    window.dispatchEvent(new Event("c1p_projects_changed"))
  } catch (e) {
    console.error("Error deleting project", e)
  }
}

export function duplicateProject(id: string): Project | null {
  const projects = getSavedProjects()
  const original = projects.find((p) => p.id === id)
  if (!original) return null

  const newId = `proj-${Date.now()}`
  const clone: Project = {
    ...JSON.parse(JSON.stringify(original)),
    id: newId,
    title: `${original.title} (Copy)`,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  saveProject(clone)
  return clone
}

export function toggleFavorite(id: string): boolean {
  const projects = getSavedProjects()
  const target = projects.find((p) => p.id === id)
  if (!target) return false

  target.isFavorite = !target.isFavorite
  saveProject(target)
  return target.isFavorite
}

export function getProjectById(id: string): Project | null {
  const projects = getSavedProjects()
  return projects.find((p) => p.id === id) || null
}

export function createNewProject(
  title: string = "Untitled Studio Sequence",
  aspectRatio: Project["aspectRatio"] = "16:9",
  fps: number = 30
): Project {
  let width = 1920
  let height = 1080
  if (aspectRatio === "9:16") {
    width = 1080
    height = 1920
  } else if (aspectRatio === "1:1") {
    width = 1080
    height = 1080
  } else if (aspectRatio === "4:5") {
    width = 1080
    height = 1350
  } else if (aspectRatio === "21:9") {
    width = 2560
    height = 1080
  }

  const newProj: Project = {
    id: `proj-${Date.now()}`,
    title,
    width,
    height,
    fps,
    duration: 15,
    aspectRatio,
    backgroundColor: "#09090b",
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [aspectRatio, `${fps}fps`],
    tracks: [
      {
        id: `track-overlay-${Date.now()}`,
        name: "Overlay & Graphics",
        type: "overlay",
        muted: false,
        locked: false,
        visible: true,
        clips: [],
      },
      {
        id: `track-video-${Date.now()}`,
        name: "Main Video Track",
        type: "video",
        muted: false,
        locked: false,
        visible: true,
        clips: [],
      },
      {
        id: `track-audio-${Date.now()}`,
        name: "Audio Track 1",
        type: "audio",
        muted: false,
        locked: false,
        visible: true,
        clips: [],
      },
    ],
  }

  saveProject(newProj)
  return newProj
}

// Activity Logging
export function logActivity(item: {
  projectTitle: string
  projectId?: string
  action: string
  type: ActivityLog["type"]
}): void {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES)
    const logs: ActivityLog[] = raw ? JSON.parse(raw) : []
    const newEntry: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...item,
    }
    const updated = [newEntry, ...logs].slice(0, 30)
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(updated))
    window.dispatchEvent(new Event("c1p_activities_changed"))
  } catch (e) {
    console.error("Error logging activity", e)
  }
}

export function getSavedActivities(): ActivityLog[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES)
    if (!raw) {
      const defaults: ActivityLog[] = [
        {
          id: "act-1",
          projectTitle: "C1P — Kinetic Studio Anthem",
          action: "Loaded project timeline with 7 clips",
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          type: "edit",
        },
        {
          id: "act-2",
          projectTitle: "Vertical Social Story",
          action: "Rendered 1080x1920 MP4 30fps export",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          type: "export",
        },
        {
          id: "act-3",
          projectTitle: "C1P Studio System",
          action: "Initialized local WebAssembly audio graph",
          timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
          type: "create",
        },
      ]
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(defaults))
      return defaults
    }
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function recordExport(): number {
  if (typeof window === "undefined") return 1
  try {
    const count = parseInt(localStorage.getItem(STORAGE_KEY_EXPORTS) || "4", 10) + 1
    localStorage.setItem(STORAGE_KEY_EXPORTS, count.toString())
    return count
  } catch {
    return 1
  }
}

export function getExportCount(): number {
  if (typeof window === "undefined") return 4
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY_EXPORTS) || "4", 10)
  } catch {
    return 4
  }
}

// React Hooks for live reactivity
export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)

  const reload = React.useCallback(() => {
    setProjects(getSavedProjects())
    setLoading(false)
  }, [])

  React.useEffect(() => {
    reload()
    const handle = () => reload()
    window.addEventListener("c1p_projects_changed", handle)
    window.addEventListener("storage", handle)
    return () => {
      window.removeEventListener("c1p_projects_changed", handle)
      window.removeEventListener("storage", handle)
    }
  }, [reload])

  return { projects, loading, reload }
}

export function useActivities() {
  const [activities, setActivities] = React.useState<ActivityLog[]>([])

  const reload = React.useCallback(() => {
    setActivities(getSavedActivities())
  }, [])

  React.useEffect(() => {
    reload()
    const handle = () => reload()
    window.addEventListener("c1p_activities_changed", handle)
    return () => window.removeEventListener("c1p_activities_changed", handle)
  }, [reload])

  return activities
}
