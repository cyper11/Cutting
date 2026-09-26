import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { StudioNavbar } from "#/components/layout/studio-navbar"
import { StudioFooter } from "#/components/layout/studio-footer"
import { STUDIO_TEMPLATES, type StudioTemplate } from "#/lib/studio-assets"
import { createNewProject, saveProject, generateWaveform } from "#/lib/studio-store"
import { Button } from "#/components/ui/button"
import { Badge } from "#/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import { Sparkles, ArrowRight, Play, CheckCircle2, Film, Layers } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
})

function TemplatesPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = React.useState<string>("All")
  const [selectedTemplate, setSelectedTemplate] = React.useState<StudioTemplate | null>(null)

  const categories = ["All", "Showcase", "Social", "Commercial", "Podcast", "Editorial"]

  const filteredTemplates = React.useMemo(() => {
    if (activeCategory === "All") return STUDIO_TEMPLATES
    return STUDIO_TEMPLATES.filter((t) => t.category === activeCategory)
  }, [activeCategory])

  const handleLaunchTemplate = (tmpl: StudioTemplate) => {
    // Instantiate project from template
    const newProj = createNewProject(tmpl.title, tmpl.aspectRatio, tmpl.fps)
    newProj.description = tmpl.description
    newProj.duration = tmpl.duration

    // Populate with template tracks & clips
    if (tmpl.aspectRatio === "9:16") {
      newProj.tracks = [
        {
          id: `track-overlay-${Date.now()}`,
          name: "Viral Captions",
          type: "overlay",
          muted: false,
          locked: false,
          visible: true,
          clips: [
            {
              id: `clip-txt-v1`,
              trackId: `track-overlay-${Date.now()}`,
              name: "Punchy Hook",
              type: "text",
              start: 0.5,
              duration: 4,
              text: "3 SECRETS TOP CREATORS USE",
              fontFamily: "Inter Variable",
              fontSize: 40,
              textColor: "#ffffff",
              volume: 100,
              speed: 1,
              x: 0,
              y: -20,
              scale: 1,
              rotation: 0,
              opacity: 100,
              filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
            },
          ],
        },
        {
          id: `track-video-${Date.now()}`,
          name: "Vertical Video",
          type: "video",
          muted: false,
          locked: false,
          visible: true,
          clips: [
            {
              id: `clip-vid-v1`,
              trackId: `track-video-${Date.now()}`,
              name: "A-Roll Camera",
              type: "video",
              start: 0,
              duration: tmpl.duration,
              color: "#18181b",
              volume: 85,
              speed: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 100,
              filters: { brightness: 100, contrast: 110, saturate: 105, blur: 0 },
            },
          ],
        },
        {
          id: `track-audio-${Date.now()}`,
          name: "Upbeat Track",
          type: "audio",
          muted: false,
          locked: false,
          visible: true,
          clips: [
            {
              id: `clip-aud-v1`,
              trackId: `track-audio-${Date.now()}`,
              name: "Lo-Fi Energy 120 BPM",
              type: "audio",
              start: 0,
              duration: tmpl.duration,
              volume: 90,
              speed: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 100,
              filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
              waveform: generateWaveform(36, 17),
            },
          ],
        },
      ]
    }

    saveProject(newProj)
    toast.success(`Loaded "${tmpl.title}" into C1P Studio!`)
    setSelectedTemplate(null)
    navigate({ to: "/editor", search: { projectId: newProj.id } })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StudioNavbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border/80 bg-gradient-to-b from-card/80 to-background py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-mono font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>PRODUCTION PRESETS // PRE-TIMED TIMELINES</span>
              </div>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
                Studio Templates
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Kickstart your next production sequence with pre-timed tracks, kinetic text overlays,
                audio ducking curves, and calibrated canvas aspect ratios.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-md px-3.5 py-1.5 font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card transition-all hover:border-foreground/30 hover:shadow-md"
              >
                {/* Visual Aspect Ratio Preview Area */}
                <div
                  onClick={() => setSelectedTemplate(tmpl)}
                  className="relative flex aspect-video w-full cursor-pointer items-center justify-center bg-muted/40 p-4 transition-colors group-hover:bg-muted/60"
                >
                  <div
                    className="relative flex items-center justify-center rounded border border-border/80 shadow-sm transition-transform duration-300 group-hover:scale-105"
                    style={{
                      aspectRatio:
                        tmpl.aspectRatio === "9:16"
                          ? "9/16"
                          : tmpl.aspectRatio === "1:1"
                            ? "1/1"
                            : tmpl.aspectRatio === "21:9"
                              ? "21/9"
                              : "16/9",
                      height: tmpl.aspectRatio === "9:16" ? "88%" : "70%",
                      backgroundColor: tmpl.previewColor,
                    }}
                  >
                    <div className="flex flex-col gap-1 w-[75%] opacity-60">
                      <div className="h-1 rounded-full bg-primary/80 w-[60%] mx-auto" />
                      <div className="h-1.5 rounded-full bg-white/70 w-[80%] mx-auto" />
                      <div className="h-1 rounded-full bg-emerald-500/80 w-[70%] mx-auto" />
                    </div>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {tmpl.aspectRatio}
                    </Badge>
                    <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
                      {tmpl.duration}s • {tmpl.fps}fps
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="flex flex-col justify-between p-4 flex-1">
                  <div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {tmpl.category}
                    </span>
                    <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors mt-0.5">
                      {tmpl.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {tmpl.clipsCount} layers
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleLaunchTemplate(tmpl)}
                      className="gap-1.5 text-xs font-medium"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span>{selectedTemplate.category.toUpperCase()}</span>
                <span>•</span>
                <span>{selectedTemplate.aspectRatio}</span>
                <span>•</span>
                <span>{selectedTemplate.fps} FPS</span>
              </div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                {selectedTemplate.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {selectedTemplate.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/80 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground font-semibold">{selectedTemplate.duration} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Included Tracks:</span>
                  <span className="text-foreground">Overlay, Video & Stereo Audio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pre-timed Layers:</span>
                  <span className="text-foreground">{selectedTemplate.clipsCount} elements</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => handleLaunchTemplate(selectedTemplate)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Sparkles className="size-3.5" />
                <span>Initialize Sequence</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <StudioFooter />
    </div>
  )
}
