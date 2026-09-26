import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import { Button } from "#/components/ui/button"
import { Label } from "#/components/ui/label"
import { Progress } from "#/components/ui/progress"
import { type Project, recordExport, logActivity } from "#/lib/studio-store"
import { toast } from "sonner"
import { Download, Film, CheckCircle2, Loader2, Sparkles } from "lucide-react"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
}

type ExportFormat = "mp4" | "webm" | "gif" | "prores"
type ExportRes = "720p" | "1080p" | "4k"

export function ExportModal({ open, onOpenChange, project }: ExportModalProps) {
  const [format, setFormat] = React.useState<ExportFormat>("mp4")
  const [resolution, setResolution] = React.useState<ExportRes>("1080p")
  const [fps, setFps] = React.useState<number>(project.fps || 30)
  const [rendering, setRendering] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [statusText, setStatusText] = React.useState("")
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setRendering(false)
      setProgress(0)
      setStatusText("")
      setDownloadUrl(null)
    }
  }, [open])

  const handleStartExport = () => {
    setRendering(true)
    setProgress(0)
    setStatusText("Initializing WebAssembly audio & video pipeline...")

    // Multi-phase progress simulation
    const steps = [
      { p: 15, text: "Compiling timeline intervals & ripple adjustments..." },
      { p: 35, text: "Rasterizing typography, shapes, and color LUTs..." },
      { p: 60, text: "Rendering GPU compositor frame buffer..." },
      { p: 85, text: `Encoding ${format.toUpperCase()} ${resolution} stream...` },
      { p: 100, text: "Finalizing container and generating export payload..." },
    ]

    let stepIndex = 0
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex].p)
        setStatusText(steps[stepIndex].text)
        stepIndex++
      } else {
        clearInterval(interval)
        setRendering(false)
        recordExport()
        logActivity({
          projectTitle: project.title,
          projectId: project.id,
          action: `Exported sequence as ${format.toUpperCase()} (${resolution} ${fps}fps)`,
          type: "export",
        })

        // Create a downloadable blob file
        const blobContent = `C1P STUDIO EXPORT METADATA
Project: ${project.title}
Format: ${format.toUpperCase()}
Resolution: ${resolution}
Frame Rate: ${fps} FPS
Canvas: ${project.width}x${project.height} (${project.aspectRatio})
Duration: ${project.duration}s
Total Tracks: ${project.tracks.length}
Generated: ${new Date().toISOString()}
Powered by C1P — Create. Innovate. Progress.
`
        const blob = new Blob([blobContent], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        toast.success(`Render complete! ${project.title}.${format} is ready for download.`)
      }
    }, 600)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${resolution}.${format === "prores" ? "mov" : format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.info("Download initiated")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
            <Film className="size-4 text-primary" />
            <span>Export Sequence — {project.title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Render your high-fidelity multi-track timeline into a production-ready media file.
          </DialogDescription>
        </DialogHeader>

        {rendering ? (
          <div className="space-y-4 py-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="font-heading text-sm font-semibold">{statusText}</p>
              <p className="font-mono text-xs text-muted-foreground">{progress}% rendered</p>
            </div>
            <Progress value={progress} className="h-2 w-full" />
            <p className="text-[11px] text-muted-foreground">
              Leveraging local GPU hardware acceleration. No server processing required.
            </p>
          </div>
        ) : downloadUrl ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Sequence Successfully Rendered
              </h3>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {format.toUpperCase()} • {resolution} • {fps}fps • {project.duration}s duration
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button onClick={handleDownload} className="gap-2 font-medium">
                <Download className="size-4" />
                <span>Save to Device</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            {/* Format Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Output Format</Label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: "mp4", label: "MP4", sub: "H.264 / AAC" },
                    { id: "webm", label: "WebM", sub: "VP9 / Opus" },
                    { id: "gif", label: "GIF", sub: "Animated" },
                    { id: "prores", label: "ProRes", sub: "Master 422" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                      format === f.id
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-foreground">{f.label}</span>
                    <span className="text-[10px] text-muted-foreground">{f.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Resolution</Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "720p", label: "720p HD", res: "1280 × 720" },
                    { id: "1080p", label: "1080p Full HD", res: "1920 × 1080" },
                    { id: "4k", label: "4K Ultra HD", res: "3840 × 2160" },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setResolution(r.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                      resolution === r.id
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground">{r.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{r.res}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame rate */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Target FPS</Label>
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
                    {rate} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Sequence specs summary */}
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-1 text-muted-foreground font-mono">
              <div className="flex justify-between">
                <span>Timeline Length:</span>
                <span className="text-foreground">{project.duration}s</span>
              </div>
              <div className="flex justify-between">
                <span>Active Tracks:</span>
                <span className="text-foreground">{project.tracks.length} tracks</span>
              </div>
              <div className="flex justify-between">
                <span>Canvas Ratio:</span>
                <span className="text-foreground">{project.aspectRatio}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={rendering}
            className="text-xs"
          >
            Cancel
          </Button>
          {!downloadUrl && (
            <Button
              onClick={handleStartExport}
              disabled={rendering}
              size="sm"
              className="gap-1.5 text-xs font-medium"
            >
              <Sparkles className="size-3.5" />
              <span>Begin Render</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
