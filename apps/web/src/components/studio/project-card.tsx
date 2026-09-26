import { Link } from "@tanstack/react-router"
import { type Project, toggleFavorite } from "#/lib/studio-store"
import { Button } from "#/components/ui/button"
import { Badge } from "#/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import {
  Star,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  Download,
  Share2,
  Film,
} from "lucide-react"
import { toast } from "sonner"

interface ProjectCardProps {
  project: Project
  onDuplicate: (id: string) => void
  onDeleteRequest: (project: Project) => void
  onExportRequest: (project: Project) => void
}

export function ProjectCard({
  project,
  onDuplicate,
  onDeleteRequest,
  onExportRequest,
}: ProjectCardProps) {
  const handleToggleStar = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const fav = toggleFavorite(project.id)
    toast(fav ? "Added to Starred Projects" : "Removed from Starred Projects")
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/editor?projectId=${project.id}`
    navigator.clipboard.writeText(url)
    toast.success("Studio project link copied to clipboard!")
  }

  // Calculate total clips
  const totalClips = project.tracks.reduce((acc, t) => acc + t.clips.length, 0)

  // Format relative timestamp
  const formatTimeAgo = (iso: string) => {
    try {
      const diff = Date.now() - new Date(iso).getTime()
      const mins = Math.floor(diff / (1000 * 60))
      if (mins < 1) return "Just now"
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    } catch {
      return "Recently"
    }
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] transition-all hover:border-[#C8FF3D]/40 hover:shadow-lg">
      {/* Top Preview Canvas Area */}
      <Link
        to="/editor"
        search={{ projectId: project.id }}
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-[#0D100E] p-4 transition-colors group-hover:bg-[#141714]"
        aria-label={`Open project ${project.title}`}
      >
        {/* Aspect Ratio Miniature Canvas Box */}
        <div
          className="relative flex items-center justify-center rounded border border-[rgba(245,245,240,0.10)] shadow-xs transition-transform duration-300 group-hover:scale-[1.02]"
          style={{
            aspectRatio:
              project.aspectRatio === "9:16"
                ? "9/16"
                : project.aspectRatio === "1:1"
                  ? "1/1"
                  : project.aspectRatio === "4:5"
                    ? "4/5"
                    : project.aspectRatio === "21:9"
                      ? "21/9"
                      : "16/9",
            height: project.aspectRatio === "9:16" ? "88%" : "72%",
            backgroundColor: project.backgroundColor || "#0D100E",
          }}
        >
          {/* Simulated Miniature Track Clips */}
          <div className="flex flex-col gap-1 w-[80%] opacity-80">
            <div className="h-1 rounded-full bg-[#C8FF3D] w-[60%] mx-auto" />
            <div className="h-1.5 rounded-full bg-[#F5F5F0]/70 w-[85%] mx-auto" />
            <div className="h-1 rounded-full bg-[#C8FF3D]/60 w-[70%] mx-auto" />
          </div>

          {/* Hover Play Indicator */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#C8FF3D] text-[#0D100E] shadow-[0_0_12px_rgba(200,255,61,0.5)]">
              <Play className="size-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleStar}
          aria-label={project.isFavorite ? "Remove favorite" : "Mark as favorite"}
          className={`absolute top-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-md backdrop-blur-md transition-all ${
            project.isFavorite
              ? "bg-amber-500/10 text-amber-500"
              : "bg-background/60 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
          }`}
        >
          <Star className={`size-3.5 ${project.isFavorite ? "fill-amber-500" : ""}`} />
        </button>

        {/* Aspect Ratio Badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5 font-medium">
            {project.aspectRatio}
          </Badge>
          <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
            {project.duration}s
          </span>
        </div>
      </Link>

      {/* Card Info & Meta */}
      <div className="flex flex-col justify-between p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/editor"
            search={{ projectId: project.id }}
            className="flex-1 truncate"
          >
            <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary">
              {project.title}
            </h3>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {project.width}×{project.height} • {project.fps}fps • {totalClips} clips
            </p>
          </Link>

          {/* Dropdown Options */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  aria-label="Project actions"
                >
                  <MoreVertical className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <Link to="/editor" search={{ projectId: project.id }}>
                <DropdownMenuItem className="gap-2">
                  <Film className="size-3.5 text-primary" />
                  <span>Open in Studio</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => onDuplicate(project.id)} className="gap-2">
                <Copy className="size-3.5" />
                <span>Duplicate Sequence</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportRequest(project)} className="gap-2">
                <Download className="size-3.5" />
                <span>Export Media...</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
                <Share2 className="size-3.5" />
                <span>Copy Share Link</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteRequest(project)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer timestamp & tags */}
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
          <span>Edited {formatTimeAgo(project.updatedAt)}</span>
          <div className="flex gap-1">
            {project.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
