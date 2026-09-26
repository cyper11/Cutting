import * as React from "react"
import { createFileRoute, Link, useSearch } from "@tanstack/react-router"
import {
  getSavedProjects,
  saveProject,
  INITIAL_PROJECTS,
  type Project,
  type StudioClip,
  type StudioTrack,
  generateWaveform,
} from "#/lib/studio-store"
import { STOCK_ASSETS } from "#/lib/studio-assets"
import { saveMediaToDB, getMediaFromDB, testMediaUrlPlayable } from "#/lib/studio-media-db"
import { C1PLogo } from "#/components/brand/c1p-logo"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs"
import { ExportModal } from "#/components/modals/export-modal"
import { KeyboardShortcutsModal } from "#/components/modals/keyboard-shortcuts-modal"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Undo2,
  Redo2,
  Scissors,
  Copy,
  Trash2,
  Download,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Grid,
  Magnet,
  Film,
  Type,
  Music,
  Settings2,
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Move,
  ChevronLeft,
  ChevronRight,
  Maximize,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/editor")({
  component: StudioEditor,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      projectId: (search.projectId as string) || undefined,
    }
  },
})

function formatTimecode(seconds: number, fps: number = 30): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const frames = Math.floor((seconds % 1) * fps)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames
    .toString()
    .padStart(2, "0")}`
}

function StudioEditor() {
  const search = useSearch({ from: "/editor" })
  const searchProjectId = search.projectId

  // Active Project State
  const [project, setProject] = React.useState<Project>(() => {
    const all = getSavedProjects()
    if (searchProjectId) {
      const found = all.find((p) => p.id === searchProjectId)
      if (found) return found
    }
    return all[0] || INITIAL_PROJECTS[0]
  })

  // Undo / Redo history
  const [history, setHistory] = React.useState<Project[]>([])
  const [redoStack, setRedoStack] = React.useState<Project[]>([])

  // Playback State
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1)
  const [isLooping, setIsLooping] = React.useState(true)
  const [isMuted, setIsMuted] = React.useState(false)
  const [masterVolume, setMasterVolume] = React.useState(100)

  // View & Tool States
  const [selectedClipId, setSelectedClipId] = React.useState<string | null>("clip-vid-1")
  const [snapping, setSnapping] = React.useState(true)
  const [showSafeGuides, setShowSafeGuides] = React.useState(false)
  const [timelineZoom, setTimelineZoom] = React.useState(45) // pixels per second
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"media" | "text" | "audio" | "settings">("media")
  const [leftPanelCollapsed, setLeftPanelCollapsed] = React.useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = React.useState(false)

  // Modals
  const [exportOpen, setExportOpen] = React.useState(false)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)

  // References
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const timelineRef = React.useRef<HTMLDivElement>(null)
  const tracksContainerRef = React.useRef<HTMLDivElement>(null)
  const videoRefs = React.useRef<{ [clipId: string]: HTMLVideoElement | null }>({})
  const audioRefs = React.useRef<{ [clipId: string]: HTMLAudioElement | null }>({})
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Dynamic Viewport Sizing & Video Decoding State
  const [viewportDims, setViewportDims] = React.useState({ width: 960, height: 540 })
  const [timelineViewportWidth, setTimelineViewportWidth] = React.useState(1600)
  const [videoErrorMap, setVideoErrorMap] = React.useState<{ [clipId: string]: boolean }>({})
  const [isDragOverCanvas, setIsDragOverCanvas] = React.useState(false)
  const [relinkTargetClipId, setRelinkTargetClipId] = React.useState<string | null>(null)
  const [isDraggingDuration, setIsDraggingDuration] = React.useState(false)
  const [dragDurationStart, setDragDurationStart] = React.useState<{ startX: number; initialDuration: number } | null>(null)

  // Measure canvas viewport with ResizeObserver to prevent any 0px collapse
  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 20 && rect.height > 20) {
        setViewportDims({ width: rect.width, height: rect.height })
      }
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(el)
    window.addEventListener("resize", updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateSize)
    }
  }, [])

  // Measure timeline container with ResizeObserver for full-width responsive ruler
  React.useEffect(() => {
    const el = timelineRef.current
    if (!el) return
    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 50) {
        setTimelineViewportWidth(rect.width)
      }
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(el)
    window.addEventListener("resize", updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateSize)
    }
  }, [])

  // Dynamic calculation of total timeline seconds: fills entire screen width + generous workspace buffer
  const totalTimelineSeconds = React.useMemo(() => {
    const minSecsForViewport = Math.ceil((timelineViewportWidth || 1600) / timelineZoom)
    let maxClipEnd = project.duration
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.start + clip.duration > maxClipEnd) {
          maxClipEnd = clip.start + clip.duration
        }
      }
    }
    // Ensures ticks always extend across full width + at least 25 seconds past clips/duration
    return Math.max(minSecsForViewport + 15, Math.ceil(maxClipEnd) + 25)
  }, [timelineViewportWidth, timelineZoom, project.duration, project.tracks])

  const totalTimelineWidthPx = Math.max(
    timelineViewportWidth,
    totalTimelineSeconds * timelineZoom
  )

  // Pixel-accurate canvas sizing calculated from container and project aspect ratio
  const canvasSize = React.useMemo(() => {
    const pad = isFullscreen ? 16 : 36
    const availW = Math.max(220, viewportDims.width - pad)
    const availH = Math.max(140, viewportDims.height - pad)

    let targetRatio = 16 / 9
    if (project.aspectRatio === "9:16") targetRatio = 9 / 16
    else if (project.aspectRatio === "1:1") targetRatio = 1 / 1
    else if (project.aspectRatio === "4:5") targetRatio = 4 / 5
    else if (project.aspectRatio === "21:9") targetRatio = 21 / 9

    let w = availW
    let h = w / targetRatio

    if (h > availH) {
      h = availH
      w = h * targetRatio
    }

    return {
      width: Math.round(w),
      height: Math.round(h),
    }
  }, [viewportDims, project.aspectRatio, isFullscreen])

  // Restore media blob URLs from IndexedDB on component mount
  React.useEffect(() => {
    let isMounted = true
    async function restoreBlobs() {
      let changed = false
      const updatedTracks = await Promise.all(
        project.tracks.map(async (track) => {
          const updatedClips = await Promise.all(
            track.clips.map(async (clip) => {
              // Strip broken legacy remote stock URLs
              if (clip.src && clip.src.includes("commondatastorage.googleapis.com")) {
                changed = true
                const { src, ...cleanClip } = clip
                return cleanClip
              }
              // Restore blob if expired or missing
              if (clip.src && clip.src.startsWith("blob:")) {
                const playable = await testMediaUrlPlayable(clip.src)
                if (!playable) {
                  const cachedBlob = (await getMediaFromDB(clip.id)) || (await getMediaFromDB(clip.name))
                  if (cachedBlob) {
                    const freshUrl = URL.createObjectURL(cachedBlob)
                    changed = true
                    return { ...clip, src: freshUrl }
                  } else {
                    setVideoErrorMap((prev) => ({ ...prev, [clip.id]: true }))
                  }
                }
              } else if (!clip.src && clip.type === "video") {
                const cachedBlob = (await getMediaFromDB(clip.id)) || (await getMediaFromDB(clip.name))
                if (cachedBlob) {
                  const freshUrl = URL.createObjectURL(cachedBlob)
                  changed = true
                  return { ...clip, src: freshUrl }
                }
              }
              return clip
            })
          )
          return { ...track, clips: updatedClips }
        })
      )

      if (changed && isMounted) {
        setProject((prev) => ({ ...prev, tracks: updatedTracks }))
        saveProject({ ...project, tracks: updatedTracks })
        toast.info("Restored local media files from cache")
      }
    }

    restoreBlobs()
    return () => {
      isMounted = false
    }
  }, [project.id])

  // Trigger media relinking for a specific clip
  const handleStartRelink = (clipId: string) => {
    setRelinkTargetClipId(clipId)
    fileInputRef.current?.click()
  }

  // Unique media files available in this project
  const projectMediaBin = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; type: "video" | "audio" | "image"; duration: number; src: string }>()
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.src && (clip.type === "video" || clip.type === "audio" || clip.type === "image")) {
          const key = clip.src
          if (!map.has(key)) {
            map.set(key, {
              id: clip.id,
              name: clip.name,
              type: clip.type,
              duration: clip.duration,
              src: clip.src,
            })
          }
        }
      }
    }
    return Array.from(map.values())
  }, [project.tracks])

  // Insert a media asset from library into the timeline at playhead
  const handleInsertMediaAtPlayhead = (asset: { name: string; type: "video" | "audio" | "image"; duration: number; src: string }) => {
    const trackType = asset.type === "audio" ? "audio" : "video"
    let track = project.tracks.find((t) => t.type === trackType)
    if (!track) track = project.tracks[0]

    const newClip: StudioClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      trackId: track.id,
      name: asset.name,
      type: asset.type,
      start: currentTime,
      duration: asset.duration > 0 ? asset.duration : 5,
      src: asset.src,
      volume: 100,
      speed: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 100,
      filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
      waveform: asset.type === "audio" ? generateWaveform(32) : undefined,
    }

    const neededDuration = Math.max(project.duration, newClip.start + newClip.duration + 2)
    const newTracks = project.tracks.map((t) =>
      t.id === track!.id ? { ...t, clips: [...t.clips, newClip] } : t
    )

    updateProjectWithHistory({
      ...project,
      duration: Math.round(neededDuration),
      tracks: newTracks,
    })
    setSelectedClipId(newClip.id)
    toast.success(`Inserted "${asset.name}" into ${track.name}`)
  }

  const handleAutoSetClipDuration = (clipId: string, duration: number) => {
    const newTracks = project.tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) => (c.id === clipId ? { ...c, duration } : c)),
    }))
    const neededProjectDuration = Math.max(project.duration, duration + 2)
    setProject((prev) => ({
      ...prev,
      duration: Math.max(prev.duration, neededProjectDuration),
      tracks: newTracks,
    }))
    saveProject({
      ...project,
      duration: Math.max(project.duration, neededProjectDuration),
      tracks: newTracks,
    })
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOverCanvas(true)
  }

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOverCanvas(false)
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOverCanvas(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const syntheticEvent = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(syntheticEvent)
    }
  }

  // Dragging States for Timeline
  const [isScrubbing, setIsScrubbing] = React.useState(false)
  const [draggingClip, setDraggingClip] = React.useState<{
    clipId: string
    sourceTrackId: string
    currentTrackId: string
    initialStart: number
    initialDuration: number
    initialMouseX: number
    initialMouseY: number
    mode: "move" | "trim-start" | "trim-end"
  } | null>(null)
  const [isDraggingBelowTracks, setIsDraggingBelowTracks] = React.useState(false)

  // Canvas Element Dragging
  const [isDraggingCanvasElem, setIsDraggingCanvasElem] = React.useState(false)
  const [canvasDragStart, setCanvasDragStart] = React.useState<{
    clipId: string
    startX: number
    startY: number
    initialX: number
    initialY: number
  } | null>(null)

  // Commit changes with undo history
  const updateProjectWithHistory = React.useCallback(
    (newProject: Project) => {
      setHistory((prev) => [...prev.slice(-20), project])
      setRedoStack([])
      setProject(newProject)
      saveProject(newProject)
    },
    [project]
  )

  const handleUndo = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setRedoStack((r) => [...r, project])
    setProject(prev)
    saveProject(prev)
    toast.info("Undo")
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setRedoStack((r) => r.slice(0, -1))
    setHistory((h) => [...h, project])
    setProject(next)
    saveProject(next)
    toast.info("Redo")
  }

  // Selected Clip Lookup
  const selectedClip = React.useMemo(() => {
    if (!selectedClipId) return null
    for (const track of project.tracks) {
      const found = track.clips.find((c) => c.id === selectedClipId)
      if (found) return found
    }
    return null
  }, [project.tracks, selectedClipId])

  // Active Clips at current playhead time
  const activeClips = React.useMemo(() => {
    const list: StudioClip[] = []
    for (const track of project.tracks) {
      if (track.muted || !track.visible) continue
      for (const clip of track.clips) {
        if (currentTime >= clip.start && currentTime <= clip.start + clip.duration) {
          list.push(clip)
        }
      }
    }
    return list
  }, [project.tracks, currentTime])

  // Synchronize Videos & Audios with Playhead & Playback State
  React.useEffect(() => {
    for (const clip of activeClips) {
      if (clip.type === "video") {
        const vid = videoRefs.current[clip.id]
        if (vid) {
          const targetTime = Math.max(0, (currentTime - clip.start) * clip.speed)
          vid.playbackRate = playbackSpeed * clip.speed
          vid.muted = isMuted || masterVolume === 0
          vid.volume = (clip.volume / 100) * (masterVolume / 100)

          if (isPlaying) {
            if (Math.abs(vid.currentTime - targetTime) > 0.35) {
              vid.currentTime = targetTime
            }
            if (vid.paused) {
              vid.play().catch(() => {})
            }
          } else {
            if (Math.abs(vid.currentTime - targetTime) > 0.01) {
              vid.currentTime = targetTime
            }
            if (!vid.paused) {
              vid.pause()
            }
          }
        }
      } else if (clip.type === "audio") {
        const aud = audioRefs.current[clip.id]
        if (aud) {
          const targetTime = Math.max(0, (currentTime - clip.start) * clip.speed)
          aud.playbackRate = playbackSpeed * clip.speed
          aud.muted = isMuted || masterVolume === 0
          aud.volume = (clip.volume / 100) * (masterVolume / 100)

          if (isPlaying) {
            if (Math.abs(aud.currentTime - targetTime) > 0.35) {
              aud.currentTime = targetTime
            }
            if (aud.paused) {
              aud.play().catch(() => {})
            }
          } else {
            if (Math.abs(aud.currentTime - targetTime) > 0.01) {
              aud.currentTime = targetTime
            }
            if (!aud.paused) {
              aud.pause()
            }
          }
        }
      }
    }
  }, [currentTime, isPlaying, playbackSpeed, isMuted, masterVolume, activeClips])

  // Pause any active media elements when playback stops
  React.useEffect(() => {
    if (!isPlaying) {
      Object.values(videoRefs.current).forEach((v) => {
        if (v && !v.paused) v.pause()
      })
      Object.values(audioRefs.current).forEach((a) => {
        if (a && !a.paused) a.pause()
      })
    }
  }, [isPlaying])

  // Main Playback Loop using requestAnimationFrame
  React.useEffect(() => {
    if (!isPlaying) return

    let lastTime = performance.now()
    let frameId: number

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000
      lastTime = now

      setCurrentTime((prev) => {
        const next = prev + delta * playbackSpeed
        if (next >= project.duration) {
          if (isLooping) {
            return 0
          } else {
            setIsPlaying(false)
            return project.duration
          }
        }
        return next
      })

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, playbackSpeed, isLooping, project.duration])

  // Clip Modifications Helper
  const updateClip = (clipId: string, updates: Partial<StudioClip>, pushHistory = true) => {
    const newTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id === clipId) {
          return { ...clip, ...updates }
        }
        return clip
      }),
    }))
    if (pushHistory) {
      updateProjectWithHistory({ ...project, tracks: newTracks })
    } else {
      setProject((p) => ({ ...p, tracks: newTracks }))
      saveProject({ ...project, tracks: newTracks })
    }
  }

  // Unified helper to reposition clips horizontally across time AND vertically across tracks
  const moveClipToTrackAndPosition = (
    clipId: string,
    targetTrackId: string,
    newStart: number,
    pushHistory = false
  ) => {
    let movingClip: StudioClip | null = null
    for (const track of project.tracks) {
      const found = track.clips.find((c) => c.id === clipId)
      if (found) {
        movingClip = found
        break
      }
    }
    if (!movingClip) return

    const updatedClip: StudioClip = {
      ...movingClip,
      trackId: targetTrackId,
      start: newStart,
    }

    const newTracks = project.tracks.map((track) => {
      if (track.id === targetTrackId) {
        const filtered = track.clips.filter((c) => c.id !== clipId)
        let updatedType = track.type
        let updatedName = track.name
        // If track is empty and user moves a video clip to it, harmonize track type
        if (track.clips.length === 0 || (track.clips.length === 1 && track.clips[0].id === clipId)) {
          if (movingClip!.type === "video" && track.type === "audio") {
            updatedType = "video"
            updatedName = `Video Track ${project.tracks.filter((t) => t.type === "video").length + 1}`
          }
        }
        return {
          ...track,
          type: updatedType,
          name: updatedName,
          clips: [...filtered, updatedClip],
        }
      } else {
        return {
          ...track,
          clips: track.clips.filter((c) => c.id !== clipId),
        }
      }
    })

    if (pushHistory) {
      updateProjectWithHistory({ ...project, tracks: newTracks })
    } else {
      setProject((p) => ({ ...p, tracks: newTracks }))
      saveProject({ ...project, tracks: newTracks })
    }
  }

  // Split selected clip at playhead
  const handleSplitAtPlayhead = () => {
    if (!selectedClip) {
      toast.error("Select a clip on the timeline to split")
      return
    }
    const clip = selectedClip
    if (currentTime <= clip.start || currentTime >= clip.start + clip.duration) {
      toast.warning("Playhead is outside the selected clip bounds")
      return
    }

    const firstDuration = currentTime - clip.start
    const secondDuration = clip.duration - firstDuration

    const firstClip: StudioClip = {
      ...clip,
      duration: Math.max(0.1, firstDuration),
    }

    const secondClip: StudioClip = {
      ...clip,
      id: `clip-${Date.now()}`,
      name: `${clip.name} (Part 2)`,
      start: currentTime,
      duration: Math.max(0.1, secondDuration),
    }

    const newTracks = project.tracks.map((track) => {
      if (track.id === clip.trackId) {
        return {
          ...track,
          clips: track.clips.flatMap((c) => (c.id === clip.id ? [firstClip, secondClip] : [c])),
        }
      }
      return track
    })

    updateProjectWithHistory({ ...project, tracks: newTracks })
    setSelectedClipId(secondClip.id)
    toast.success(`Split "${clip.name}" at ${formatTimecode(currentTime, project.fps)}`)
  }

  // Duplicate selected clip
  const handleDuplicateSelectedClip = () => {
    if (!selectedClip) return
    const newClip: StudioClip = {
      ...selectedClip,
      id: `clip-${Date.now()}`,
      name: `${selectedClip.name} (Copy)`,
      start: selectedClip.start + selectedClip.duration + 0.1,
    }
    const newTracks = project.tracks.map((track) => {
      if (track.id === selectedClip.trackId) {
        return {
          ...track,
          clips: [...track.clips, newClip],
        }
      }
      return track
    })
    updateProjectWithHistory({ ...project, tracks: newTracks })
    setSelectedClipId(newClip.id)
    toast.success(`Duplicated "${selectedClip.name}"`)
  }

  // Delete selected clip
  const handleDeleteSelectedClip = () => {
    if (!selectedClipId) return
    const newTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.filter((c) => c.id !== selectedClipId),
    }))
    updateProjectWithHistory({ ...project, tracks: newTracks })
    setSelectedClipId(null)
    toast.info("Deleted clip")
  }

  // Trim Start of selected clip to current playhead
  const handleTrimStartToPlayhead = () => {
    if (!selectedClip) return
    if (currentTime <= selectedClip.start || currentTime >= selectedClip.start + selectedClip.duration) {
      toast.warning("Playhead must be inside the clip to trim start")
      return
    }
    const cutAmount = currentTime - selectedClip.start
    updateClip(selectedClip.id, {
      start: currentTime,
      duration: Math.max(0.2, selectedClip.duration - cutAmount),
    })
    toast.success("Trimmed clip start to playhead")
  }

  // Trim End of selected clip to current playhead
  const handleTrimEndToPlayhead = () => {
    if (!selectedClip) return
    if (currentTime <= selectedClip.start || currentTime >= selectedClip.start + selectedClip.duration) {
      toast.warning("Playhead must be inside the clip to trim end")
      return
    }
    const newDuration = currentTime - selectedClip.start
    updateClip(selectedClip.id, {
      duration: Math.max(0.2, newDuration),
    })
    toast.success("Trimmed clip end to playhead")
  }

  // Add Track
  const handleAddTrack = (type: "video" | "audio" | "overlay") => {
    const trackNumber = project.tracks.filter((t) => t.type === type).length + 1
    const newTrack: StudioTrack = {
      id: `track-${type}-${Date.now()}`,
      name: `${type === "overlay" ? "Overlay" : type === "video" ? "Video Track" : "Audio Track"} ${trackNumber}`,
      type,
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    }
    updateProjectWithHistory({ ...project, tracks: [...project.tracks, newTrack] })
    toast.success(`Added new ${type} track`)
  }

  // Delete Empty Track
  const handleDeleteTrack = (trackId: string) => {
    if (project.tracks.length <= 1) {
      toast.error("Timeline must have at least one track")
      return
    }
    const target = project.tracks.find((t) => t.id === trackId)
    if (target && target.clips.length > 0) {
      if (!confirm(`Track "${target.name}" contains ${target.clips.length} clip(s). Delete anyway?`)) {
        return
      }
    }
    const newTracks = project.tracks.filter((t) => t.id !== trackId)
    updateProjectWithHistory({ ...project, tracks: newTracks })
    toast.info("Removed track")
  }

  // Add stock asset to timeline
  const handleAddStockAsset = (asset: (typeof STOCK_ASSETS)[0]) => {
    let targetTrackType: StudioTrack["type"] = "video"
    if (asset.category === "audio" || asset.category === "sfx") {
      targetTrackType = "audio"
    } else if (asset.category === "text") {
      targetTrackType = "overlay"
    }

    let targetTrack = project.tracks.find((t) => t.type === targetTrackType)
    if (!targetTrack) {
      targetTrack = project.tracks[0]
    }

    const newClip: StudioClip = {
      id: `clip-${Date.now()}`,
      trackId: targetTrack.id,
      name: asset.title,
      type: asset.category === "sfx" ? "audio" : (asset.category as StudioClip["type"]),
      start: currentTime,
      duration: asset.duration || 5,
      src: asset.src,
      color: asset.color,
      waveform: asset.waveform || (asset.category === "audio" ? generateWaveform(24) : undefined),
      volume: 100,
      speed: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 100,
      filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
      text: asset.category === "text" ? "ENTER KINETIC TITLE" : undefined,
      fontSize: 42,
      fontFamily: "Inter Variable",
      textColor: "#ffffff",
    }

    const newTracks = project.tracks.map((t) => {
      if (t.id === targetTrack!.id) {
        return { ...t, clips: [...t.clips, newClip] }
      }
      return t
    })

    updateProjectWithHistory({ ...project, tracks: newTracks })
    setSelectedClipId(newClip.id)
    toast.success(`Added "${asset.title}" to ${targetTrack.name}`)
  }

  // Handle local user file import with IndexedDB caching and probe
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setRelinkTargetClipId(null)
      return
    }

    // Direct relinking flow for a specific clip with error or missing stream
    if (relinkTargetClipId && files.length > 0) {
      const file = files[0]
      const objectUrl = URL.createObjectURL(file)
      const targetId = relinkTargetClipId

      await saveMediaToDB(targetId, file)
      await saveMediaToDB(file.name, file)

      let probedDur: number | null = null
      if (file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name)) {
        try {
          const probeVideo = document.createElement("video")
          probeVideo.preload = "metadata"
          probeVideo.src = objectUrl
          await new Promise<void>((resolve) => {
            probeVideo.onloadedmetadata = () => {
              if (probeVideo.duration && isFinite(probeVideo.duration) && probeVideo.duration > 0) {
                probedDur = Math.round(probeVideo.duration * 10) / 10
              }
              resolve()
            }
            probeVideo.onerror = () => resolve()
            setTimeout(resolve, 800)
          })
        } catch {}
      }

      const newTracks = project.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => {
          if (c.id === targetId) {
            return {
              ...c,
              src: objectUrl,
              name: file.name.replace(/\.[^/.]+$/, ""),
              duration: probedDur ?? c.duration,
            }
          }
          return c
        }),
      }))

      updateProjectWithHistory({ ...project, tracks: newTracks })
      setVideoErrorMap((prev) => {
        const next = { ...prev }
        delete next[targetId]
        return next
      })
      setRelinkTargetClipId(null)
      toast.success(`Relinked "${file.name}" to clip!`)
      if (e.target) e.target.value = ""
      return
    }

    for (const file of Array.from(files)) {
      const objectUrl = URL.createObjectURL(file)
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name)
      const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(file.name)
      const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name)

      let targetType: StudioClip["type"] = "video"
      let trackType: StudioTrack["type"] = "video"

      if (isAudio) {
        targetType = "audio"
        trackType = "audio"
      } else if (isImage) {
        targetType = "image"
        trackType = "video"
      }

      let track = project.tracks.find((t) => t.type === trackType)
      if (!track) track = project.tracks[0]

      const clipId = `clip-imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

      // Persist in IndexedDB for seamless reload recovery
      await saveMediaToDB(clipId, file)
      await saveMediaToDB(file.name, file)

      // Probe actual duration
      let probedDuration = isImage ? 5 : 8
      if (isVideo) {
        try {
          const probeVideo = document.createElement("video")
          probeVideo.preload = "metadata"
          probeVideo.src = objectUrl
          await new Promise<void>((resolve) => {
            probeVideo.onloadedmetadata = () => {
              if (probeVideo.duration && isFinite(probeVideo.duration) && probeVideo.duration > 0) {
                probedDuration = Math.round(probeVideo.duration * 10) / 10
              }
              resolve()
            }
            probeVideo.onerror = () => resolve()
            setTimeout(resolve, 800)
          })
        } catch {
          // ignore
        }
      }

      const newClip: StudioClip = {
        id: clipId,
        trackId: track.id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: targetType,
        start: currentTime,
        duration: probedDuration,
        src: objectUrl,
        volume: 100,
        speed: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 100,
        filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
        waveform: isAudio ? generateWaveform(32) : undefined,
      }

      const neededDuration = Math.max(project.duration, newClip.start + newClip.duration + 2)

      const newTracks = project.tracks.map((t) =>
        t.id === track!.id ? { ...t, clips: [...t.clips, newClip] } : t
      )

      updateProjectWithHistory({
        ...project,
        duration: Math.round(neededDuration),
        tracks: newTracks,
      })

      setSelectedClipId(newClip.id)
      setVideoErrorMap((prev) => {
        const next = { ...prev }
        delete next[clipId]
        return next
      })
      toast.success(`Imported "${file.name}" (${probedDuration}s) to timeline!`)
    }
  }

  // Add custom text title
  const handleAddCustomText = (preset: { label: string; text: string; font: string; size: number }) => {
    let overlayTrack = project.tracks.find((t) => t.type === "overlay")
    if (!overlayTrack) overlayTrack = project.tracks[0]

    const newClip: StudioClip = {
      id: `clip-txt-${Date.now()}`,
      trackId: overlayTrack.id,
      name: preset.label,
      type: "text",
      start: currentTime,
      duration: 4.5,
      text: preset.text,
      fontFamily: preset.font,
      fontSize: preset.size,
      textColor: "#ffffff",
      volume: 100,
      speed: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 100,
      filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
    }

    const newTracks = project.tracks.map((t) => {
      if (t.id === overlayTrack!.id) {
        return { ...t, clips: [...t.clips, newClip] }
      }
      return t
    })

    updateProjectWithHistory({ ...project, tracks: newTracks })
    setSelectedClipId(newClip.id)
    toast.success(`Added "${preset.label}" text layer`)
  }

  // TIMELINE MOUSE INTERACTION (Scrubbing + Clip Dragging / Trimming + Sequence Duration Drag)
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    setIsScrubbing(true)
    const rect = timelineRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left + timelineRef.current.scrollLeft
    const clickedTime = Math.max(0, offsetX / timelineZoom)

    // Auto-extend project duration if clicking past current sequence end
    if (clickedTime > project.duration) {
      const extendedDur = Math.ceil(clickedTime + 2)
      setProject((p) => {
        const next = { ...p, duration: extendedDur }
        saveProject(next)
        return next
      })
      setCurrentTime(clickedTime)
    } else {
      setCurrentTime(clickedTime)
    }
  }

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Handling Playhead Scrubbing
      if (isScrubbing && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect()
        const offsetX = e.clientX - rect.left + timelineRef.current.scrollLeft
        let newTime = Math.max(0, offsetX / timelineZoom)

        // Magnetic Snapping
        if (snapping) {
          for (const track of project.tracks) {
            for (const clip of track.clips) {
              if (Math.abs(newTime - clip.start) < 0.25) newTime = clip.start
              if (Math.abs(newTime - (clip.start + clip.duration)) < 0.25)
                newTime = clip.start + clip.duration
            }
          }
        }

        if (newTime > project.duration) {
          const extended = Math.ceil(newTime + 2)
          setProject((p) => ({ ...p, duration: extended }))
        }
        setCurrentTime(newTime)
      }

      // 2. Handling Clip Repositioning / Trimming on Timeline
      if (draggingClip) {
        const deltaPx = e.clientX - draggingClip.initialMouseX
        const deltaSec = deltaPx / timelineZoom

        if (draggingClip.mode === "move") {
          let newStart = Math.max(0, draggingClip.initialStart + deltaSec)
          if (snapping && Math.abs(newStart - currentTime) < 0.2) {
            newStart = currentTime
          }

          // Detect track under cursor vertically
          let targetTrackId = draggingClip.currentTrackId
          let isBelow = false

          if (tracksContainerRef.current) {
            const trackEls = Array.from(
              tracksContainerRef.current.querySelectorAll<HTMLElement>("[data-track-id]")
            )
            if (trackEls.length > 0) {
              const firstRect = trackEls[0].getBoundingClientRect()
              const lastRect = trackEls[trackEls.length - 1].getBoundingClientRect()

              if (e.clientY > lastRect.bottom + 8) {
                // Dragged below the bottom-most track
                isBelow = true
              } else if (e.clientY < firstRect.top) {
                // Dragged above the top track
                targetTrackId = trackEls[0].getAttribute("data-track-id") || targetTrackId
              } else {
                for (const el of trackEls) {
                  const r = el.getBoundingClientRect()
                  if (e.clientY >= r.top && e.clientY <= r.bottom) {
                    const id = el.getAttribute("data-track-id")
                    if (id) targetTrackId = id
                    break
                  }
                }
              }
            }
          }

          setIsDraggingBelowTracks(isBelow)

          // Live reposition horizontally and vertically
          moveClipToTrackAndPosition(draggingClip.clipId, targetTrackId, newStart, false)
          if (targetTrackId !== draggingClip.currentTrackId) {
            setDraggingClip((prev) => (prev ? { ...prev, currentTrackId: targetTrackId } : null))
          }
        } else if (draggingClip.mode === "trim-start") {
          const maxStart = draggingClip.initialStart + draggingClip.initialDuration - 0.2
          const newStart = Math.min(maxStart, Math.max(0, draggingClip.initialStart + deltaSec))
          const newDuration = draggingClip.initialDuration - (newStart - draggingClip.initialStart)
          updateClip(draggingClip.clipId, {
            start: newStart,
            duration: Math.max(0.2, newDuration),
          }, false)
        } else if (draggingClip.mode === "trim-end") {
          const newDuration = Math.max(0.2, draggingClip.initialDuration + deltaSec)
          updateClip(draggingClip.clipId, { duration: newDuration }, false)
        }
      }

      // 3. Handling Canvas Direct Element Dragging
      if (isDraggingCanvasElem && canvasDragStart) {
        const deltaX = (e.clientX - canvasDragStart.startX) * 0.25
        const deltaY = (e.clientY - canvasDragStart.startY) * 0.25
        updateClip(canvasDragStart.clipId, {
          x: Math.round(canvasDragStart.initialX + deltaX),
          y: Math.round(canvasDragStart.initialY + deltaY),
        }, false)
      }

      // 4. Handling Dragging Sequence End Duration
      if (isDraggingDuration && dragDurationStart) {
        const deltaPx = e.clientX - dragDurationStart.startX
        const deltaSec = deltaPx / timelineZoom
        let minAllowed = 5
        for (const t of project.tracks) {
          for (const c of t.clips) {
            if (c.start + c.duration > minAllowed) {
              minAllowed = Math.ceil(c.start + c.duration)
            }
          }
        }
        const newDur = Math.max(minAllowed, Math.round(dragDurationStart.initialDuration + deltaSec))
        setProject((p) => ({ ...p, duration: newDur }))
      }
    }

    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false)
        saveProject(project)
      }
      if (draggingClip) {
        if (isDraggingBelowTracks) {
          let movingClip: StudioClip | null = null
          for (const track of project.tracks) {
            const found = track.clips.find((c) => c.id === draggingClip.clipId)
            if (found) {
              movingClip = found
              break
            }
          }
          if (movingClip) {
            const targetType = movingClip.type === "audio" ? "audio" : "video"
            const trackNum = project.tracks.filter((t) => t.type === targetType).length + 1
            const newTrackId = `track-${targetType}-${Date.now()}`
            const newTrack: StudioTrack = {
              id: newTrackId,
              name: `${targetType === "video" ? "Video Track" : "Audio Track"} ${trackNum}`,
              type: targetType,
              muted: false,
              locked: false,
              visible: true,
              clips: [{ ...movingClip, trackId: newTrackId }],
            }

            const updatedTracks = project.tracks
              .map((t) => ({
                ...t,
                clips: t.clips.filter((c) => c.id !== draggingClip.clipId),
              }))
              .concat(newTrack)

            updateProjectWithHistory({ ...project, tracks: updatedTracks })
            toast.success(`Created new ${newTrack.name} for clip`)
          }
        } else {
          let maxClipEnd = project.duration
          for (const track of project.tracks) {
            for (const clip of track.clips) {
              if (clip.start + clip.duration > maxClipEnd) {
                maxClipEnd = Math.ceil(clip.start + clip.duration + 2)
              }
            }
          }
          const updatedProj = { ...project, duration: maxClipEnd }
          saveProject(updatedProj)
          updateProjectWithHistory(updatedProj)
          if (maxClipEnd > project.duration) {
            toast.info(`Sequence auto-extended to ${maxClipEnd}s`)
          }
        }

        setDraggingClip(null)
        setIsDraggingBelowTracks(false)
      }
      if (isDraggingCanvasElem) {
        setIsDraggingCanvasElem(false)
        setCanvasDragStart(null)
      }
      if (isDraggingDuration) {
        setIsDraggingDuration(false)
        setDragDurationStart(null)
        saveProject(project)
        toast.success(`Sequence duration updated to ${project.duration}s`)
      }
    }

    if (isScrubbing || draggingClip || isDraggingCanvasElem || isDraggingDuration) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isScrubbing,
    draggingClip,
    isDraggingCanvasElem,
    canvasDragStart,
    isDraggingDuration,
    dragDurationStart,
    isDraggingBelowTracks,
    timelineZoom,
    project.duration,
    currentTime,
    snapping,
    project.tracks,
  ])

  // KEYBOARD SHORTCUTS LISTENER
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return
      }

      if (e.code === "Space") {
        e.preventDefault()
        setIsPlaying((p) => !p)
      } else if (e.code === "ArrowLeft") {
        e.preventDefault()
        const step = e.shiftKey ? 1 : 1 / project.fps
        setCurrentTime((t) => Math.max(0, t - step))
      } else if (e.code === "ArrowRight") {
        e.preventDefault()
        const step = e.shiftKey ? 1 : 1 / project.fps
        setCurrentTime((t) => Math.min(project.duration, t + step))
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault()
        handleSplitAtPlayhead()
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        handleDeleteSelectedClip()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault()
        handleDuplicateSelectedClip()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        handleRedo()
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault()
        setIsMuted((m) => !m)
      } else if (e.key === "g" || e.key === "G") {
        e.preventDefault()
        setShowSafeGuides((g) => !g)
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault()
        setIsFullscreen((f) => !f)
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        setSnapping((s) => !s)
      } else if (e.key === "[") {
        e.preventDefault()
        handleTrimStartToPlayhead()
      } else if (e.key === "]") {
        e.preventDefault()
        handleTrimEndToPlayhead()
      } else if (e.key === "?") {
        e.preventDefault()
        setShortcutsOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground select-none">
      {/* Hidden File Input for Local Media Upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 1. TOP STUDIO BAR */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-border/80 bg-card px-3 text-xs">
        {/* Left: Brand & Sequence Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
            <Button variant="ghost" size="icon-xs" className="size-7" title="Back to Studio Dashboard">
              <ArrowLeft className="size-4" />
            </Button>
            <C1PLogo variant="mark" size={22} />
          </Link>

          <div className="h-4 w-px bg-border" />

          {/* Editable Sequence Title */}
          <input
            value={project.title}
            onChange={(e) => updateProjectWithHistory({ ...project, title: e.target.value })}
            className="w-44 sm:w-60 rounded bg-transparent px-1.5 py-0.5 font-heading text-xs font-semibold text-foreground hover:bg-muted/50 focus:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
            title="Click to rename sequence"
          />

          {/* Canvas Specs */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="rounded bg-muted/60 px-1.5 py-0.5 font-semibold">
              {project.width}×{project.height}
            </span>
            <span className="rounded bg-muted/60 px-1.5 py-0.5">{project.fps} FPS</span>
            <span className="rounded bg-muted/60 px-1.5 py-0.5">{project.aspectRatio}</span>
          </div>
        </div>

        {/* Center: Tools, Undo/Redo, Snapping, Guides */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="size-3.5" />
          </Button>

          <div className="mx-1 h-3.5 w-px bg-border" />

          {/* Snapping */}
          <Button
            variant={snapping ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => setSnapping((s) => !s)}
            className={`size-7 ${snapping ? "text-primary" : "text-muted-foreground"}`}
            title="Magnet Snapping (N)"
          >
            <Magnet className="size-3.5" />
          </Button>

          {/* Safe Guides */}
          <Button
            variant={showSafeGuides ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => setShowSafeGuides((g) => !g)}
            className={`size-7 ${showSafeGuides ? "text-primary" : "text-muted-foreground"}`}
            title="Safe Guides (G)"
          >
            <Grid className="size-3.5" />
          </Button>

          {/* Fullscreen Preview */}
          <Button
            variant={isFullscreen ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => setIsFullscreen((f) => !f)}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Fullscreen Preview (F)"
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        </div>

        {/* Right: Export & Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Panel toggles */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setLeftPanelCollapsed((c) => !c)}
            className={`size-7 hidden lg:flex ${leftPanelCollapsed ? "text-muted-foreground" : "text-foreground"}`}
            title="Toggle Left Assets Panel"
          >
            <ChevronLeft className={`size-3.5 transition-transform ${leftPanelCollapsed ? "rotate-180" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setRightPanelCollapsed((c) => !c)}
            className={`size-7 hidden lg:flex ${rightPanelCollapsed ? "text-muted-foreground" : "text-foreground"}`}
            title="Toggle Right Inspector"
          >
            <ChevronRight className={`size-3.5 transition-transform ${rightPanelCollapsed ? "rotate-180" : ""}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShortcutsOpen(true)}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Shortcuts (?)"
          >
            <HelpCircle className="size-3.5" />
          </Button>

          <Button
            onClick={() => setExportOpen(true)}
            size="sm"
            className="h-7 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Download className="size-3.5" />
            <span>Export Sequence</span>
          </Button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Left Tools + Center Preview Canvas + Right Inspector) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Media, Text, Audio, Settings */}
        {!leftPanelCollapsed && (
          <aside className="w-72 shrink-0 border-r border-border/80 bg-card/60 flex flex-col justify-between hidden md:flex">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              className="flex flex-col h-full"
            >
              {/* Header Tabs */}
              <TabsList className="grid grid-cols-4 h-9 bg-muted/40 p-0.5 rounded-none border-b border-border">
                <TabsTrigger value="media" className="text-[11px] gap-1 px-1">
                  <Film className="size-3" />
                  <span>Media</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="text-[11px] gap-1 px-1">
                  <Type className="size-3" />
                  <span>Text</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="text-[11px] gap-1 px-1">
                  <Music className="size-3" />
                  <span>Audio</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-[11px] gap-1 px-1">
                  <Settings2 className="size-3" />
                  <span>Canvas</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB: MEDIA (Import File + Project Media Bin) */}
              <TabsContent value="media" className="flex-1 overflow-y-auto p-3 space-y-4 m-0">
                {/* Local Upload Dropzone */}
                <div
                  onClick={() => {
                    setRelinkTargetClipId(null)
                    fileInputRef.current?.click()
                  }}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[rgba(245,245,240,0.15)] bg-[#141714] p-5 text-center cursor-pointer hover:border-[#C8FF3D] hover:bg-[#1A1E1A] transition-all"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#1A1E1A] border border-[rgba(245,245,240,0.10)] text-[#C8FF3D] group-hover:scale-110 transition-transform">
                    <Upload className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#F5F5F0]">Import Media Files</span>
                    <p className="text-[10px] text-[#A7ADA5] mt-0.5">MP4, MOV, WebM, MP3, WAV, PNG, JPG</p>
                  </div>
                  <span className="rounded bg-[#C8FF3D]/10 px-2 py-0.5 text-[9px] font-mono text-[#C8FF3D] font-bold">
                    + Browse or Drop Files
                  </span>
                </div>

                {/* Project Media Bin Header */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="size-3.5 text-[#C8FF3D]" />
                    <span className="font-heading text-xs font-semibold text-[#F5F5F0]">Project Media Bin</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#A7ADA5] rounded bg-[#1A1E1A] px-1.5 py-0.5 border border-[rgba(245,245,240,0.06)]">
                    {projectMediaBin.length} {projectMediaBin.length === 1 ? "asset" : "assets"}
                  </span>
                </div>

                {/* Media Assets List */}
                <div className="space-y-2">
                  {projectMediaBin.length > 0 ? (
                    projectMediaBin.map((asset) => (
                      <div
                        key={asset.id}
                        className="group flex items-center justify-between rounded-lg border border-[rgba(245,245,240,0.10)] bg-[#141714] p-2 hover:border-[#C8FF3D]/50 transition-all"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[150px]">
                          <div className="size-8 rounded bg-[#1A1E1A] border border-[rgba(245,245,240,0.06)] flex items-center justify-center text-[#C8FF3D] shrink-0">
                            {asset.type === "video" && <Film className="size-4" />}
                            {asset.type === "audio" && <Music className="size-4 text-emerald-400" />}
                            {asset.type === "image" && <ImageIcon className="size-4 text-amber-400" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-medium text-[#F5F5F0] truncate">{asset.name}</p>
                            <p className="text-[10px] font-mono text-[#A7ADA5]">
                              {asset.duration > 0 ? `${asset.duration.toFixed(1)}s` : "Static"} • {asset.type.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon-xs"
                            variant="secondary"
                            onClick={() => handleInsertMediaAtPlayhead(asset)}
                            title="Insert at playhead"
                            className="size-6 bg-[#1A1E1A] hover:bg-[#C8FF3D] hover:text-[#0D100E] text-[#F5F5F0]"
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-[rgba(245,245,240,0.06)] bg-[#141714]/40 p-4 text-center text-xs text-[#A7ADA5] space-y-1">
                      <p className="font-medium text-[#F5F5F0]">No media imported yet</p>
                      <p className="text-[11px] leading-snug">
                        Click above or drag your video & audio files directly into the editor.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB: TEXT (Titles, Headlines, Badges) */}
              <TabsContent value="text" className="flex-1 overflow-y-auto p-3 space-y-3 m-0">
                <span className="font-heading text-xs font-semibold text-foreground">
                  Kinetic Typography Presets
                </span>
                <div className="space-y-2">
                  {[
                    { label: "C1P Bold Anthem", text: "CREATE. INNOVATE. PROGRESS.", font: "Inter Variable", size: 48 },
                    { label: "Editorial Serif", text: "Precision Studio for Creators", font: "Playfair Display", size: 38 },
                    { label: "Technical Monospace", text: "TIMECODE // 120,000 TICKS/S", font: "JetBrains Mono", size: 26 },
                    { label: "Minimalist Lower-Third", text: "C1P // ARCHITECTURAL FRAMEWORK", font: "Inter Variable", size: 22 },
                  ].map((preset, i) => (
                    <div
                      key={i}
                      onClick={() => handleAddCustomText(preset)}
                      className="cursor-pointer rounded-md border border-border/70 bg-card p-2.5 hover:border-foreground/30 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{preset.label}</span>
                        <Plus className="size-3 text-muted-foreground" />
                      </div>
                      <p
                        className="mt-1 truncate text-xs text-muted-foreground"
                        style={{ fontFamily: preset.font }}
                      >
                        "{preset.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB: AUDIO */}
              <TabsContent value="audio" className="flex-1 overflow-y-auto p-3 space-y-3 m-0">
                <span className="font-heading text-xs font-semibold text-foreground">
                  Soundtracks & Foley
                </span>
                <div className="space-y-2">
                  {STOCK_ASSETS.filter((a) => a.category === "audio" || a.category === "sfx").map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between rounded-md border border-border/70 bg-card p-2"
                    >
                      <div className="truncate max-w-[140px]">
                        <p className="text-xs font-medium text-foreground truncate">{asset.title}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          {asset.category.toUpperCase()} • {asset.duration}s
                        </p>
                      </div>
                      <Button
                        size="icon-xs"
                        variant="secondary"
                        onClick={() => handleAddStockAsset(asset)}
                        className="size-6 text-foreground"
                        title="Add to audio track"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB: CANVAS SETTINGS */}
              <TabsContent value="settings" className="flex-1 overflow-y-auto p-3 space-y-3.5 m-0 text-xs">
                <span className="font-heading text-xs font-semibold text-foreground">
                  Sequence Configuration
                </span>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Canvas Dimensions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={project.width}
                      onChange={(e) =>
                        updateProjectWithHistory({ ...project, width: parseInt(e.target.value, 10) || 1920 })
                      }
                      className="h-7 text-xs font-mono"
                    />
                    <Input
                      type="number"
                      value={project.height}
                      onChange={(e) =>
                        updateProjectWithHistory({ ...project, height: parseInt(e.target.value, 10) || 1080 })
                      }
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Total Duration (Seconds)</Label>
                  <Input
                    type="number"
                    value={project.duration}
                    onChange={(e) =>
                      updateProjectWithHistory({
                        ...project,
                        duration: Math.max(5, parseInt(e.target.value, 10) || 15),
                      })
                    }
                    className="h-7 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Background Fill</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={project.backgroundColor || "#09090b"}
                      onChange={(e) =>
                        updateProjectWithHistory({ ...project, backgroundColor: e.target.value })
                      }
                      className="size-7 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs">{project.backgroundColor}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        )}

        {/* CENTER PANEL: INTERACTIVE CANVAS VIEWPORT */}
        <section
          ref={canvasRef}
          className="flex-1 flex flex-col justify-between bg-[#0D100E] relative overflow-hidden"
        >
          {/* Canvas Box Container with concrete pixel dimensions from ResizeObserver */}
          <div
            ref={viewportRef}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            className="flex-1 w-full h-full min-h-0 min-w-0 flex items-center justify-center p-3 sm:p-5 overflow-hidden relative bg-[#0D100E]"
          >
            {/* Drag & Drop Visual Hint */}
            {isDragOverCanvas && (
              <div className="absolute inset-4 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-[#C8FF3D] bg-[#0D100E]/90 backdrop-blur-xs pointer-events-none">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="size-8 text-[#C8FF3D] animate-bounce" />
                  <p className="font-heading text-sm font-bold text-[#F5F5F0]">
                    Drop video or media to add to sequence
                  </p>
                  <p className="text-[11px] text-[#A7ADA5]">Supported: MP4, WebM, MOV, MP3, PNG, JPG</p>
                </div>
              </div>
            )}

            {/* Canvas Screen */}
            <div
              className="relative shadow-[0_12px_48px_rgba(0,0,0,0.85)] overflow-hidden rounded-lg border border-[rgba(245,245,240,0.15)] transition-all flex items-center justify-center group/canvas"
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                backgroundColor: project.backgroundColor || "#0D100E",
              }}
            >
              {/* Canvas Resolution Pill in Corner */}
              <div className="absolute top-2 right-2 z-30 pointer-events-none opacity-0 group-hover/canvas:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded font-mono text-[9px] text-[#A7ADA5] border border-white/10">
                {project.width}×{project.height} • {project.aspectRatio}
              </div>

              {/* Active Video & Image Clips Rendering */}
              {activeClips
                .filter((c) => c.type === "video" || c.type === "image")
                .map((clip) => {
                  const isSelected = selectedClipId === clip.id
                  const hasError = videoErrorMap[clip.id]

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedClipId(clip.id)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setSelectedClipId(clip.id)
                        setIsDraggingCanvasElem(true)
                        setCanvasDragStart({
                          clipId: clip.id,
                          startX: e.clientX,
                          startY: e.clientY,
                          initialX: clip.x,
                          initialY: clip.y,
                        })
                      }}
                      className={`absolute inset-0 flex items-center justify-center overflow-hidden cursor-move transition-shadow ${
                        isSelected
                          ? "ring-2 ring-[#C8FF3D] ring-offset-2 ring-offset-[#0D100E] z-10"
                          : ""
                      }`}
                      style={{
                        transform: `translate(${clip.x}%, ${clip.y}%) scale(${clip.scale}) rotate(${clip.rotation}deg)`,
                        opacity: clip.opacity / 100,
                        filter: `brightness(${clip.filters.brightness}%) contrast(${clip.filters.contrast}%) saturate(${clip.filters.saturate}%) blur(${clip.filters.blur}px)`,
                      }}
                    >
                      {clip.src && !hasError ? (
                        clip.type === "video" ? (
                          <video
                            ref={(el) => {
                              videoRefs.current[clip.id] = el
                            }}
                            src={clip.src}
                            className="size-full object-contain pointer-events-none bg-black"
                            playsInline
                            preload="auto"
                            muted={isMuted || masterVolume === 0}
                            onLoadedMetadata={(e) => {
                              const v = e.currentTarget
                              const target = Math.max(0, (currentTime - clip.start) * clip.speed)
                              v.currentTime = target
                              if (isPlaying) {
                                v.play().catch(() => {})
                              }
                              if (
                                v.duration &&
                                isFinite(v.duration) &&
                                v.duration > 0 &&
                                Math.abs(clip.duration - 8) < 0.1
                              ) {
                                const realDur = Math.round(v.duration * 10) / 10
                                if (realDur > 0) {
                                  handleAutoSetClipDuration(clip.id, realDur)
                                }
                              }
                            }}
                            onCanPlay={(e) => {
                              const v = e.currentTarget
                              const target = Math.max(0, (currentTime - clip.start) * clip.speed)
                              if (!isPlaying && Math.abs(v.currentTime - target) > 0.01) {
                                v.currentTime = target
                              }
                            }}
                            onError={(e) => {
                              console.warn("Video failed to decode or load for clip:", clip.id, clip.src, e)
                              setVideoErrorMap((prev) => ({ ...prev, [clip.id]: true }))
                            }}
                          />
                        ) : (
                          <img
                            src={clip.src}
                            alt={clip.name}
                            className="size-full object-contain pointer-events-none select-none"
                          />
                        )
                      ) : hasError ? (
                        <div className="size-full flex flex-col items-center justify-center bg-[#141714] text-[#F5F5F0] p-6 text-center border border-red-500/30">
                          <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                            <Film className="size-5 text-red-400" />
                          </div>
                          <p className="font-semibold text-xs text-[#F5F5F0]">{clip.name}</p>
                          <p className="text-[11px] text-[#A7ADA5] mt-1 max-w-sm">
                            Video stream requires relinking (session link expired or codec unsupported).
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartRelink(clip.id)
                              }}
                              className="gap-1 bg-[#C8FF3D] hover:bg-[#91B82A] text-[#0D100E] font-bold"
                            >
                              <Upload className="size-3" />
                              <span>Relink Video File</span>
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSelectedClip()
                              }}
                              className="gap-1 border-[rgba(245,245,240,0.15)] bg-[#1A1E1A] hover:bg-[#141714] text-[#F5F5F0]"
                            >
                              <Trash2 className="size-3" />
                              <span>Remove Clip</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="size-full flex flex-col items-center justify-center text-[#F5F5F0]/60 font-mono text-xs gap-2 p-6"
                          style={{ backgroundColor: clip.color || "#141714" }}
                        >
                          <div className="size-10 rounded-full bg-[#1A1E1A] border border-[rgba(245,245,240,0.10)] flex items-center justify-center mb-1">
                            <Film className="size-5 text-[#C8FF3D]" />
                          </div>
                          <span className="font-semibold text-xs text-[#F5F5F0]">{clip.name}</span>
                          <span className="text-[10px] text-[#A7ADA5]">No media source linked</span>
                          <Button
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartRelink(clip.id)
                            }}
                            className="mt-2 gap-1 text-[11px] bg-[#C8FF3D] hover:bg-[#91B82A] text-[#0D100E] font-bold"
                          >
                            <Upload className="size-3" />
                            <span>Choose Video File</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* Hidden Audio Elements for Synchronized Audio Clips */}
              {activeClips
                .filter((c) => c.type === "audio" && c.src)
                .map((clip) => (
                  <audio
                    key={clip.id}
                    ref={(el) => {
                      audioRefs.current[clip.id] = el
                    }}
                    src={clip.src}
                    preload="auto"
                    className="hidden"
                  />
                ))}

              {/* Active Text Overlays Rendering */}
              {activeClips
                .filter((c) => c.type === "text")
                .map((clip) => {
                  const isSelected = selectedClipId === clip.id
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedClipId(clip.id)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setSelectedClipId(clip.id)
                        setIsDraggingCanvasElem(true)
                        setCanvasDragStart({
                          clipId: clip.id,
                          startX: e.clientX,
                          startY: e.clientY,
                          initialX: clip.x,
                          initialY: clip.y,
                        })
                      }}
                      className={`absolute z-20 px-4 py-2 text-center cursor-move select-none transition-shadow ${
                        isSelected
                          ? "ring-2 ring-[#C8FF3D] ring-offset-2 ring-offset-[#0D100E] rounded"
                          : ""
                      }`}
                      style={{
                        transform: `translate(${clip.x}%, ${clip.y}%) scale(${clip.scale}) rotate(${clip.rotation}deg)`,
                        opacity: clip.opacity / 100,
                        filter: `brightness(${clip.filters.brightness}%) contrast(${clip.filters.contrast}%) saturate(${clip.filters.saturate}%) blur(${clip.filters.blur}px)`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: clip.fontFamily || "Inter Variable",
                          fontSize: `${(clip.fontSize || 36) * 0.75}px`,
                          color: clip.textColor || "#ffffff",
                          backgroundColor: clip.textBg || "transparent",
                        }}
                        className="font-bold tracking-tight drop-shadow-md rounded px-2"
                      >
                        {clip.text}
                      </span>
                    </div>
                  )
                })}

              {/* Empty timeline placeholder */}
              {activeClips.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground/60">
                  <Film className="size-8 mb-2 opacity-50" />
                  <p className="font-heading text-xs font-medium">No clips at current playhead</p>
                  <p className="font-mono text-[10px] mt-0.5">{formatTimecode(currentTime, project.fps)}</p>
                </div>
              )}

              {/* Safe Guides Overlay (Rule of Thirds) */}
              {showSafeGuides && (
                <div className="pointer-events-none absolute inset-0 z-30 grid grid-cols-3 grid-rows-3 border border-[#C8FF3D]/25">
                  <div className="border-r border-b border-[#C8FF3D]/25" />
                  <div className="border-r border-b border-[#C8FF3D]/25" />
                  <div className="border-b border-[#C8FF3D]/25" />
                  <div className="border-r border-b border-[#C8FF3D]/25" />
                  <div className="border-r border-b border-[#C8FF3D]/25" />
                  <div className="border-b border-[#C8FF3D]/25" />
                  <div className="border-r border-b border-[#C8FF3D]/25" />
                  <div className="border-r border-b border-[#C8FF3D]/25" />
                  <div className="" />
                </div>
              )}
            </div>
          </div>

          {/* Transport Bar Controls */}
          <div className="flex h-11 w-full shrink-0 items-center justify-between border-t border-border/80 bg-card px-4 text-xs">
            {/* Timecode display */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-foreground">{formatTimecode(currentTime, project.fps)}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{formatTimecode(project.duration, project.fps)}</span>
            </div>

            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setCurrentTime(0)}
                className="size-7"
                title="Restart (Home)"
              >
                <SkipBack className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setCurrentTime((t) => Math.max(0, t - 1 / project.fps))}
                className="size-7"
                title="Previous Frame (←)"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                variant="default"
                size="icon-sm"
                onClick={() => setIsPlaying((p) => !p)}
                className="size-8 rounded-full shadow-xs"
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5 fill-current" />}
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setCurrentTime((t) => Math.min(project.duration, t + 1 / project.fps))}
                className="size-7"
                title="Next Frame (→)"
              >
                <RotateCcw className="size-3.5 scale-x-[-1]" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setCurrentTime(project.duration)}
                className="size-7"
                title="Jump to End (End)"
              >
                <SkipForward className="size-3.5" />
              </Button>
            </div>

            {/* Audio & Speed Controls */}
            <div className="flex items-center gap-3">
              {/* Playback Speed */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-transparent font-mono text-[11px] font-medium text-foreground cursor-pointer outline-none"
              >
                <option value={0.5}>0.5×</option>
                <option value={1}>1.0×</option>
                <option value={1.25}>1.25×</option>
                <option value={1.5}>1.5×</option>
                <option value={2}>2.0×</option>
              </select>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isMuted || masterVolume === 0 ? (
                    <VolumeX className="size-3.5 text-red-500" />
                  ) : (
                    <Volume2 className="size-3.5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : masterVolume}
                  onChange={(e) => {
                    setMasterVolume(parseInt(e.target.value, 10))
                    setIsMuted(false)
                  }}
                  className="w-16 h-1 accent-primary cursor-pointer"
                  aria-label="Master volume"
                />
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: INSPECTOR & PROPERTIES */}
        {!rightPanelCollapsed && (
          <aside className="w-80 shrink-0 border-l border-border/80 bg-card/60 p-3.5 overflow-y-auto hidden lg:flex flex-col text-xs">
            {selectedClip ? (
              <div className="space-y-4">
                {/* Clip Header */}
                <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                  <div>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold text-muted-foreground">
                      {selectedClip.type}
                    </span>
                    <input
                      value={selectedClip.name}
                      onChange={(e) => updateClip(selectedClip.id, { name: e.target.value })}
                      className="font-heading text-xs font-semibold text-foreground mt-1 w-full bg-transparent hover:bg-muted/40 focus:bg-muted px-1 rounded outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={handleDuplicateSelectedClip}
                      className="size-6 text-muted-foreground hover:text-foreground"
                      title="Duplicate Clip (Ctrl+D)"
                    >
                      <Copy className="size-3" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={handleDeleteSelectedClip}
                      className="size-6 text-destructive hover:bg-destructive/10"
                      title="Delete Clip (Del)"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>

                {/* Timing Inputs with Up/Down Steppers */}
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="rounded bg-muted/40 p-2 border border-border/60 space-y-1">
                    <span className="text-muted-foreground text-[10px]">Start Time</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedClip.start}
                      onChange={(e) =>
                        updateClip(selectedClip.id, { start: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      className="h-6 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="rounded bg-muted/40 p-2 border border-border/60 space-y-1">
                    <span className="text-muted-foreground text-[10px]">Duration</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedClip.duration}
                      onChange={(e) =>
                        updateClip(selectedClip.id, { duration: Math.max(0.2, parseFloat(e.target.value) || 1) })
                      }
                      className="h-6 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Media Stream & Source Card */}
                {(selectedClip.type === "video" || selectedClip.type === "audio" || selectedClip.type === "image") && (
                  <div className="rounded-lg bg-[#141714] border border-[rgba(245,245,240,0.10)] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#A7ADA5]">
                        Media Stream
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded ${
                          videoErrorMap[selectedClip.id]
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : selectedClip.src
                              ? "bg-[#C8FF3D]/10 text-[#C8FF3D] border border-[#C8FF3D]/30"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            videoErrorMap[selectedClip.id]
                              ? "bg-red-500"
                              : selectedClip.src
                                ? "bg-[#C8FF3D]"
                                : "bg-muted-foreground"
                          }`}
                        />
                        {videoErrorMap[selectedClip.id]
                          ? "Error / Expired"
                          : selectedClip.src
                            ? "Active"
                            : "No File"}
                      </span>
                    </div>

                    <p className="font-mono text-[10px] text-[#A7ADA5] truncate" title={selectedClip.src || "No source attached"}>
                      {selectedClip.src
                        ? selectedClip.src.startsWith("blob:")
                          ? "Local Video Stream"
                          : selectedClip.src.split("/").pop()
                        : "No stream attached"}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleStartRelink(selectedClip.id)}
                        className="flex-1 gap-1 text-[10px] border-[rgba(245,245,240,0.10)] bg-[#1A1E1A] hover:bg-[#141714] text-[#F5F5F0]"
                      >
                        <Upload className="size-2.5 text-[#C8FF3D]" />
                        <span>Relink File</span>
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          updateClip(selectedClip.id, { src: undefined })
                          setVideoErrorMap((prev) => {
                            const next = { ...prev }
                            delete next[selectedClip.id]
                            return next
                          })
                          toast.info("Detached media stream from clip")
                        }}
                        className="flex-1 gap-1 text-[10px] text-[#A7ADA5] hover:text-red-400"
                      >
                        <Trash2 className="size-2.5" />
                        <span>Detach</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Text Editor if text clip */}
                {selectedClip.type === "text" && (
                  <div className="space-y-2 border-b border-border/60 pb-3">
                    <Label className="text-[11px] font-semibold">Title Content</Label>
                    <textarea
                      value={selectedClip.text || ""}
                      onChange={(e) => updateClip(selectedClip.id, { text: e.target.value })}
                      className="w-full rounded border border-border bg-background p-2 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Font Size</Label>
                        <Input
                          type="number"
                          value={selectedClip.fontSize || 36}
                          onChange={(e) =>
                            updateClip(selectedClip.id, { fontSize: parseInt(e.target.value, 10) })
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Text Color</Label>
                        <input
                          type="color"
                          value={selectedClip.textColor || "#ffffff"}
                          onChange={(e) => updateClip(selectedClip.id, { textColor: e.target.value })}
                          className="h-7 w-full rounded border border-border cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Transform & Placement Section */}
                <div className="space-y-3 border-b border-border/60 pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Position & Transform
                    </h4>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => updateClip(selectedClip.id, { x: 0, y: 0, scale: 1, rotation: 0 })}
                      className="text-[10px] h-5 px-1.5"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Position X / Y Nudges */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Position X (%)</span>
                      <Input
                        type="number"
                        value={selectedClip.x}
                        onChange={(e) => updateClip(selectedClip.id, { x: parseInt(e.target.value, 10) || 0 })}
                        className="h-6 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Position Y (%)</span>
                      <Input
                        type="number"
                        value={selectedClip.y}
                        onChange={(e) => updateClip(selectedClip.id, { y: parseInt(e.target.value, 10) || 0 })}
                        className="h-6 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Scale</span>
                      <span className="font-mono">{selectedClip.scale.toFixed(2)}×</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.05"
                      value={selectedClip.scale}
                      onChange={(e) => updateClip(selectedClip.id, { scale: parseFloat(e.target.value) })}
                      className="w-full h-1 accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Opacity</span>
                      <span className="font-mono">{selectedClip.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedClip.opacity}
                      onChange={(e) => updateClip(selectedClip.id, { opacity: parseInt(e.target.value, 10) })}
                      className="w-full h-1 accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Rotation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Rotation</span>
                      <span className="font-mono">{selectedClip.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedClip.rotation}
                      onChange={(e) => updateClip(selectedClip.id, { rotation: parseInt(e.target.value, 10) })}
                      className="w-full h-1 accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Color Grading & Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Color Grading
                    </h4>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() =>
                        updateClip(selectedClip.id, {
                          filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
                        })
                      }
                      className="text-[10px] h-5 px-1.5"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Brightness</span>
                      <span className="font-mono">{selectedClip.filters.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={selectedClip.filters.brightness}
                      onChange={(e) =>
                        updateClip(selectedClip.id, {
                          filters: { ...selectedClip.filters, brightness: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full h-1 accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Contrast</span>
                      <span className="font-mono">{selectedClip.filters.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={selectedClip.filters.contrast}
                      onChange={(e) =>
                        updateClip(selectedClip.id, {
                          filters: { ...selectedClip.filters, contrast: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full h-1 accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Saturation</span>
                      <span className="font-mono">{selectedClip.filters.saturate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={selectedClip.filters.saturate}
                      onChange={(e) =>
                        updateClip(selectedClip.id, {
                          filters: { ...selectedClip.filters, saturate: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full h-1 accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* No clip selected: Sequence Summary */
              <div className="space-y-4">
                <h3 className="font-heading text-xs font-semibold text-foreground">Sequence Summary</h3>
                <div className="rounded-lg bg-muted/40 p-3 space-y-2 border border-border/60 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="text-foreground truncate max-w-[130px]">{project.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="text-foreground">{project.width} × {project.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frame Rate:</span>
                    <span className="text-foreground">{project.fps} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-foreground">{project.duration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Tracks:</span>
                    <span className="text-foreground">{project.tracks.length}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-border/80 p-3 text-xs space-y-2 text-muted-foreground">
                  <p className="font-semibold text-foreground">Editing Controls:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li><strong>Drag clip body</strong> on timeline to move position in time.</li>
                    <li><strong>Drag left/right edges</strong> of any clip to trim start or end.</li>
                    <li><strong>Click & drag playhead</strong> to scrub smoothly.</li>
                    <li><strong>Click elements in preview</strong> to select and drag position.</li>
                    <li>Press <kbd className="px-1 bg-muted rounded font-mono text-[10px]">S</kbd> to split at playhead.</li>
                    <li>Press <kbd className="px-1 bg-muted rounded font-mono text-[10px]">[</kbd> or <kbd className="px-1 bg-muted rounded font-mono text-[10px]">]</kbd> to trim start/end.</li>
                  </ul>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* 3. BOTTOM PANEL: MULTI-TRACK INTERACTIVE TIMELINE */}
      <footer className="h-68 shrink-0 border-t border-border/80 bg-card flex flex-col">
        {/* Timeline Quick Action Toolbar */}
        <div className="flex h-9 items-center justify-between border-b border-border/80 bg-muted/40 px-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={handleSplitAtPlayhead}
              disabled={!selectedClip}
              className="gap-1 text-[11px]"
              title="Split at Playhead (S)"
            >
              <Scissors className="size-3" />
              <span>Split (S)</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={handleTrimStartToPlayhead}
              disabled={!selectedClip}
              className="gap-1 text-[11px]"
              title="Trim Start to Playhead ([)"
            >
              <span>Trim [</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={handleTrimEndToPlayhead}
              disabled={!selectedClip}
              className="gap-1 text-[11px]"
              title="Trim End to Playhead (])"
            >
              <span>Trim ]</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={handleDuplicateSelectedClip}
              disabled={!selectedClip}
              className="gap-1 text-[11px]"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="size-3" />
              <span>Duplicate</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={handleDeleteSelectedClip}
              disabled={!selectedClip}
              className="gap-1 text-[11px] text-destructive hover:bg-destructive/10"
              title="Delete (Del)"
            >
              <Trash2 className="size-3" />
              <span>Delete</span>
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Add Track Dropdown */}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => handleAddTrack("video")}
              className="gap-1 text-[11px]"
              title="Add Video Track"
            >
              <Plus className="size-3" />
              <span>+ Video</span>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => handleAddTrack("audio")}
              className="gap-1 text-[11px]"
              title="Add Audio Track"
            >
              <Plus className="size-3" />
              <span>+ Audio</span>
            </Button>
          </div>

          {/* Timeline Zoom & Duration Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/80">Duration:</span>
              <div className="flex items-center rounded border border-[rgba(245,245,240,0.12)] bg-[#141714] px-1.5 py-0.5">
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={project.duration}
                  onChange={(e) => {
                    const val = Math.max(5, Math.min(600, parseInt(e.target.value, 10) || 5))
                    setProject((p) => {
                      const next = { ...p, duration: val }
                      saveProject(next)
                      return next
                    })
                  }}
                  className="w-10 bg-transparent text-center font-mono text-[11px] font-semibold text-[#F5F5F0] outline-none"
                  title="Project Sequence Duration (seconds)"
                />
                <span className="text-[10px] text-[#A7ADA5]">s</span>
              </div>
            </div>

            <div className="h-4 w-px bg-border/60" />

            <div className="flex items-center gap-2">
              <ZoomOut className="size-3 text-muted-foreground" />
              <input
                type="range"
                min="20"
                max="120"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(parseInt(e.target.value, 10))}
                className="w-24 h-1 accent-primary cursor-pointer"
                title="Zoom timeline view"
              />
              <ZoomIn className="size-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Tracks Grid Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Track Headers */}
          <div className="w-52 shrink-0 border-r border-border/80 bg-card/60 flex flex-col justify-start divide-y divide-border/60">
            {/* Top Ruler Align Header */}
            <div className="h-6 px-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase font-bold">
              <span>Track Lanes</span>
              <span>{project.tracks.length}</span>
            </div>

            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-12 px-3 flex items-center justify-between text-xs font-medium"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {track.type === "overlay" && <Type className="size-3.5 text-primary" />}
                  {track.type === "video" && <Film className="size-3.5 text-[#C8FF3D]" />}
                  {track.type === "audio" && <Music className="size-3.5 text-[#A7ADA5]" />}
                  {track.type === "overlay" && <Type className="size-3.5 text-[#F5F5F0]" />}
                  <span className="truncate text-[#F5F5F0] text-[11px] font-medium">{track.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Mute Track */}
                  <button
                    onClick={() => {
                      const newTracks = project.tracks.map((t) =>
                        t.id === track.id ? { ...t, muted: !t.muted } : t
                      )
                      updateProjectWithHistory({ ...project, tracks: newTracks })
                    }}
                    className={`size-5 rounded flex items-center justify-center hover:bg-muted ${
                      track.muted ? "text-red-400" : "text-muted-foreground"
                    }`}
                    title={track.muted ? "Unmute track" : "Mute track"}
                  >
                    {track.muted ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                  </button>

                  {/* Remove Track */}
                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="size-5 rounded flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
                    title="Remove Track"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>
              </div>
            ))}

            {isDraggingBelowTracks && draggingClip?.mode === "move" && (
              <div className="h-12 px-3 flex items-center gap-1.5 text-xs font-semibold text-[#C8FF3D] border-t border-dashed border-[#C8FF3D]/50 bg-[#C8FF3D]/10 animate-pulse">
                <Plus className="size-3.5" />
                <span>+ New Track</span>
              </div>
            )}
          </div>

          {/* Timeline Surface (Scrollable, Full-Width Continuous) */}
          <div
            ref={timelineRef}
            onMouseDown={handleTimelineMouseDown}
            className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#0D100E] cursor-pointer select-none"
          >
            {/* Inner Timeline Width Surface: Guaranteed full viewport width + continuous headroom */}
            <div
              className="relative min-w-full h-full"
              style={{ width: `${totalTimelineWidthPx}px` }}
            >
              {/* 1. Time Ruler with continuous seconds tick marks */}
              <div className="h-6 border-b border-[rgba(245,245,240,0.10)] bg-[#141714] flex items-center relative font-mono text-[9px] text-[#A7ADA5] select-none min-w-full">
                {Array.from({ length: totalTimelineSeconds + 1 }).map((_, sec) => {
                  const isMajor = timelineZoom < 30 ? sec % 5 === 0 : timelineZoom < 50 ? sec % 2 === 0 : true
                  const isPastEnd = sec > project.duration

                  return (
                    <div
                      key={sec}
                      className={`absolute top-0 bottom-0 border-l pl-1 flex items-center pointer-events-none ${
                        isPastEnd
                          ? "border-[rgba(245,245,240,0.03)] text-[#A7ADA5]/35"
                          : "border-[rgba(245,245,240,0.08)] text-[#A7ADA5]"
                      }`}
                      style={{ left: `${sec * timelineZoom}px` }}
                    >
                      {isMajor && <span>{sec}s</span>}
                    </div>
                  )
                })}

                {/* Half-second sub-tick marks when zoomed in */}
                {timelineZoom >= 60 &&
                  Array.from({ length: totalTimelineSeconds }).map((_, sec) => (
                    <div
                      key={`sub-${sec}`}
                      className="absolute top-3.5 bottom-0 border-l border-[rgba(245,245,240,0.05)] pointer-events-none"
                      style={{ left: `${(sec + 0.5) * timelineZoom}px` }}
                    />
                  ))}
              </div>

              {/* Active Sequence Out-Point Marker (Draggable) */}
              <div
                className="absolute top-0 bottom-0 z-20 flex flex-col items-center pointer-events-none"
                style={{ left: `${project.duration * timelineZoom}px` }}
              >
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setIsDraggingDuration(true)
                    setDragDurationStart({
                      startX: e.clientX,
                      initialDuration: project.duration,
                    })
                  }}
                  className="bg-[#1A1E1A] hover:bg-[#222822] text-[#C8FF3D] border border-[#C8FF3D]/50 hover:border-[#C8FF3D] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-b shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center gap-1 select-none pointer-events-auto cursor-ew-resize transition-all"
                  title="Drag horizontally to adjust sequence duration"
                >
                  <span className="size-1.5 rounded-full bg-[#C8FF3D] animate-pulse" />
                  <span>END {project.duration.toFixed(0)}s</span>
                  <span className="text-[8px] opacity-70">↔</span>
                </div>
                <div className="w-px flex-1 border-r-2 border-dashed border-[#C8FF3D]/50 shadow-[0_0_6px_rgba(200,255,61,0.2)]" />
              </div>

              {/* 2. Track Rows */}
              <div
                ref={tracksContainerRef}
                className="flex flex-col divide-y divide-[rgba(245,245,240,0.06)] min-w-full"
              >
                {project.tracks.map((track) => {
                  const isTrackActiveDrop = draggingClip?.currentTrackId === track.id && draggingClip.mode === "move"
                  return (
                    <div
                      key={track.id}
                      data-track-id={track.id}
                      className={`h-12 relative min-w-full transition-colors ${
                        isTrackActiveDrop
                          ? "bg-[#C8FF3D]/10 ring-1 ring-inset ring-[#C8FF3D]/40"
                          : "bg-[#141714]/40"
                      }`}
                    >
                      {/* Repeating subtle vertical track lane grid */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          backgroundImage: `linear-gradient(to right, rgba(245, 245, 240, 0.06) 1px, transparent 1px)`,
                          backgroundSize: `${timelineZoom}px 100%`,
                        }}
                      />
                      {/* Subtly dimmed headroom zone past sequence out-point */}
                      <div
                        className="absolute top-0 bottom-0 right-0 pointer-events-none bg-[#090B0A]/40"
                        style={{ left: `${project.duration * timelineZoom}px` }}
                      />
                      {track.clips.map((clip) => {
                        const isSelected = selectedClipId === clip.id
                        return (
                          <div
                            key={clip.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedClipId(clip.id)
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              setSelectedClipId(clip.id)
                              setDraggingClip({
                                clipId: clip.id,
                                sourceTrackId: track.id,
                                currentTrackId: track.id,
                                initialStart: clip.start,
                                initialDuration: clip.duration,
                                initialMouseX: e.clientX,
                                initialMouseY: e.clientY,
                                mode: "move",
                              })
                            }}
                            className={`absolute top-1 bottom-1 rounded border px-2 flex items-center justify-between text-xs overflow-hidden select-none cursor-move transition-shadow ${
                              isSelected
                                ? "ring-2 ring-[#C8FF3D] border-[#C8FF3D] bg-[#C8FF3D]/20 text-[#F5F5F0] font-semibold z-10 shadow-[0_0_12px_rgba(200,255,61,0.25)]"
                                : clip.type === "video"
                                  ? "bg-[#1A1E1A] border-[rgba(245,245,240,0.15)] text-[#F5F5F0] hover:border-[#C8FF3D]/50"
                                  : clip.type === "audio"
                                    ? "bg-[#141714] border-[rgba(245,245,240,0.15)] text-[#A7ADA5] hover:border-[#C8FF3D]/50"
                                    : "bg-[#1A1E1A] border-[#C8FF3D]/30 text-[#F5F5F0] hover:border-[#C8FF3D]"
                            }`}
                            style={{
                              left: `${clip.start * timelineZoom}px`,
                              width: `${Math.max(28, clip.duration * timelineZoom)}px`,
                            }}
                          >
                            {/* LEFT TRIM HANDLE */}
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                setSelectedClipId(clip.id)
                                setDraggingClip({
                                  clipId: clip.id,
                                  sourceTrackId: track.id,
                                  currentTrackId: track.id,
                                  initialStart: clip.start,
                                  initialDuration: clip.duration,
                                  initialMouseX: e.clientX,
                                  initialMouseY: e.clientY,
                                  mode: "trim-start",
                                })
                              }}
                              className="absolute left-0 top-0 bottom-0 w-2.5 bg-foreground/20 hover:bg-[#C8FF3D] cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
                              title="Drag to trim start"
                            />

                            <div className="flex items-center gap-1.5 truncate pointer-events-none pl-1">
                              <span className="truncate text-[11px] font-medium">{clip.name}</span>
                            </div>

                            {/* Waveform Visualization for Audio clips */}
                            {clip.waveform && (
                              <div className="flex items-end gap-0.5 h-4 opacity-75 ml-2 pointer-events-none">
                                {clip.waveform.slice(0, 16).map((h, i) => (
                                  <div
                                    key={i}
                                    className="w-0.5 bg-[#C8FF3D] rounded-full"
                                    style={{ height: `${h * 100}%` }}
                                  />
                                ))}
                              </div>
                            )}

                            <span className="font-mono text-[9px] opacity-70 ml-1 pointer-events-none pr-1">
                              {clip.duration.toFixed(1)}s
                            </span>

                            {/* RIGHT TRIM HANDLE */}
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                setSelectedClipId(clip.id)
                                setDraggingClip({
                                  clipId: clip.id,
                                  sourceTrackId: track.id,
                                  currentTrackId: track.id,
                                  initialStart: clip.start,
                                  initialDuration: clip.duration,
                                  initialMouseX: e.clientX,
                                  initialMouseY: e.clientY,
                                  mode: "trim-end",
                                })
                              }}
                              className="absolute right-0 top-0 bottom-0 w-2.5 bg-foreground/20 hover:bg-[#C8FF3D] cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
                              title="Drag to trim end"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                })}

                {/* Dynamic drop zone when dragging clip below the last track */}
                {isDraggingBelowTracks && draggingClip?.mode === "move" && (
                  <div className="h-12 border-2 border-dashed border-[#C8FF3D] bg-[#C8FF3D]/15 min-w-full flex items-center justify-center font-mono text-[11px] text-[#C8FF3D] font-bold gap-2 animate-pulse">
                    <Plus className="size-3.5" />
                    <span>Drop here to create new {selectedClip?.type === "audio" ? "Audio" : "Video"} Track</span>
                  </div>
                )}
              </div>

              {/* 3. Scrubbing Playhead Indicator Line */}
              <div
                className="pointer-events-none absolute top-0 bottom-0 z-30 flex flex-col items-center select-none"
                style={{
                  left: `${currentTime * timelineZoom}px`,
                  transform: "translateX(-50%)",
                }}
              >
                {/* Playhead Flag Pill */}
                <div className="bg-[#C8FF3D] text-[#0D100E] font-mono text-[9px] font-black px-1.5 py-0.5 rounded-b shadow-[0_2px_8px_rgba(200,255,61,0.5)]">
                  {currentTime.toFixed(1)}s
                </div>
                {/* Playhead Needle Line */}
                <div className="w-[2px] flex-1 bg-[#C8FF3D] shadow-[0_0_8px_rgba(200,255,61,0.7)]" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} project={project} />
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  )
}
