import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { createNewProject, type Project } from "#/lib/studio-store"
import { toast } from "sonner"
import { Film, Smartphone, Square, Monitor, Sparkles } from "lucide-react"

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PRESETS: {
  id: Project["aspectRatio"]
  label: string
  sub: string
  res: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: "16:9",
    label: "Landscape",
    sub: "YouTube, Cinema, Desktop",
    res: "1920 × 1080",
    icon: Film,
  },
  {
    id: "9:16",
    label: "Vertical",
    sub: "Reels, TikTok, Shorts",
    res: "1080 × 1920",
    icon: Smartphone,
  },
  {
    id: "1:1",
    label: "Square",
    sub: "Instagram, Feed, Ads",
    res: "1080 × 1080",
    icon: Square,
  },
  {
    id: "21:9",
    label: "Ultrawide",
    sub: "Cinematic Anamorphic",
    res: "2560 × 1080",
    icon: Monitor,
  },
]

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const navigate = useNavigate()
  const [title, setTitle] = React.useState("New Studio Sequence")
  const [aspectRatio, setAspectRatio] = React.useState<Project["aspectRatio"]>("16:9")
  const [fps, setFps] = React.useState<number>(30)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Please enter a project title")
      return
    }

    const project = createNewProject(title.trim(), aspectRatio, fps)
    toast.success(`Project "${project.title}" created successfully!`)
    onOpenChange(false)
    navigate({ to: "/editor", search: { projectId: project.id } })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">
              Create New Studio Project
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure canvas dimensions, aspect ratio, and frame rate for your timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title Input */}
            <div className="space-y-1.5">
              <Label htmlFor="proj-title" className="text-xs font-medium">
                Project Name
              </Label>
              <Input
                id="proj-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kinetic Brand Teaser"
                className="h-8 text-xs font-medium"
                autoFocus
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Canvas Preset</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRESETS.map((preset) => {
                  const Icon = preset.icon
                  const selected = aspectRatio === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAspectRatio(preset.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-left transition-all outline-none ${
                        selected
                          ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                          : "border-border hover:border-foreground/30 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Icon className={`size-5 mb-1.5 ${selected ? "text-primary" : ""}`} />
                      <span className="text-xs font-semibold text-foreground">{preset.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {preset.id}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Frame Rate */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Frame Rate (FPS)</Label>
              <div className="flex gap-2">
                {[24, 30, 60].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setFps(rate)}
                    className={`flex-1 py-1.5 rounded-md border text-xs font-mono font-medium transition-all ${
                      fps === rate
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {rate} fps {rate === 24 ? "(Film)" : rate === 60 ? "(Smooth)" : "(Standard)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 text-xs font-medium">
              <Sparkles className="size-3.5" />
              <span>Initialize Studio</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
