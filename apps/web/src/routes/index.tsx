import * as React from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  useProjects,
  useActivities,
  deleteProject,
  duplicateProject,
  type Project,
} from "#/lib/studio-store"
import { STOCK_ASSETS, STUDIO_TEMPLATES } from "#/lib/studio-assets"
import { StudioNavbar } from "#/components/layout/studio-navbar"
import { StudioFooter } from "#/components/layout/studio-footer"
import { ProjectCard } from "#/components/studio/project-card"
import { NewProjectModal } from "#/components/modals/new-project-modal"
import { CommandPaletteModal } from "#/components/modals/command-palette-modal"
import { KeyboardShortcutsModal } from "#/components/modals/keyboard-shortcuts-modal"
import { ConfirmDeleteModal } from "#/components/modals/confirm-delete-modal"
import { ExportModal } from "#/components/modals/export-modal"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import {
  Plus,
  Search,
  SlidersHorizontal,
  Video,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Film,
  Activity,
  Play,
  Copy,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  const navigate = useNavigate()
  const { projects, loading } = useProjects()
  const activities = useActivities()

  // Modal States
  const [newProjectOpen, setNewProjectOpen] = React.useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null)
  const [projectToExport, setProjectToExport] = React.useState<Project | null>(null)

  // Filter & Search State
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<"all" | "16:9" | "9:16" | "1:1" | "starred">("all")
  const [sortBy, setSortBy] = React.useState<"updated" | "title" | "duration">("updated")

  // Keyboard shortcut listener (Ctrl+K and ?)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      } else if (e.key === "?" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setShortcutsOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Duplicate handler
  const handleDuplicate = (id: string) => {
    const cloned = duplicateProject(id)
    if (cloned) {
      toast.success(`Duplicated "${cloned.title}"`)
    }
  }

  // Delete confirmed
  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id)
      toast.info(`Deleted "${projectToDelete.title}"`)
      setProjectToDelete(null)
    }
  }

  // Filter & Sort Logic
  const filteredProjects = React.useMemo(() => {
    return projects
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesTitle = p.title.toLowerCase().includes(q)
          const matchesTag = p.tags.some((t) => t.toLowerCase().includes(q))
          if (!matchesTitle && !matchesTag) return false
        }
        // Aspect/Favorite filter
        if (activeFilter === "starred") return p.isFavorite
        if (activeFilter !== "all") return p.aspectRatio === activeFilter
        return true
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title)
        if (sortBy === "duration") return b.duration - a.duration
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [projects, searchQuery, activeFilter, sortBy])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <StudioNavbar
        onOpenNewProject={() => setNewProjectOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <main className="flex-1">
        {/* Studio Hero Section */}
        <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card/80 to-background py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(245,245,240,0.10)] bg-[#141714] px-3 py-1 text-xs font-mono font-medium text-[#A7ADA5]">
                  <span className="size-2 rounded-full bg-[#C8FF3D] animate-pulse shadow-[0_0_8px_rgba(200,255,61,0.6)]" />
                  <span>C1P STUDIO SUITE • CREATE • INNOVATE • PROGRESS</span>
                </div>
                <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-[#F5F5F0]">
                  Create. Innovate. Progress.
                </h1>
                <p className="text-sm sm:text-base text-[#A7ADA5] leading-relaxed">
                  A high-velocity creative workspace designed for filmmakers, digital creators, and
                  technical editors. Edit multi-track video, craft kinetic motion titles, and composite
                  with frame-accurate precision.
                </p>
              </div>

              {/* Quick Launch CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setNewProjectOpen(true)}
                  size="default"
                  className="h-9 gap-2 text-xs font-bold bg-[#C8FF3D] hover:bg-[#91B82A] text-[#0D100E] shadow-sm"
                >
                  <Plus className="size-4" />
                  <span>New Project</span>
                </Button>
                <Link to="/editor">
                  <Button
                    variant="outline"
                    size="default"
                    className="h-9 gap-2 text-xs font-medium border-[rgba(245,245,240,0.10)] bg-[#1A1E1A] hover:bg-[#141714] text-[#F5F5F0]"
                  >
                    <Video className="size-4 text-[#C8FF3D]" />
                    <span>Launch Editor</span>
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button
                    variant="ghost"
                    size="default"
                    className="h-9 gap-2 text-xs font-medium text-[#A7ADA5] hover:text-[#F5F5F0]"
                  >
                    <Sparkles className="size-4 text-[#C8FF3D]" />
                    <span>Explore Presets</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Studio Workspace / Projects Grid */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                Studio Workspace
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage your active timelines, drafts, and exported sequences.
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 sm:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects or tags..."
                  className="h-8 pl-8 text-xs font-medium"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 rounded-md border border-border/80 bg-card px-2 h-8">
                <SlidersHorizontal className="size-3 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
                  aria-label="Sort projects by"
                >
                  <option value="updated">Recently Edited</option>
                  <option value="title">Project Name</option>
                  <option value="duration">Timeline Duration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(
              [
                { id: "all", label: "All Projects" },
                { id: "16:9", label: "16:9 Landscape" },
                { id: "9:16", label: "9:16 Vertical" },
                { id: "1:1", label: "1:1 Square" },
                { id: "starred", label: "★ Starred" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-md px-3 py-1 font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
            <span className="ml-auto hidden font-mono text-[11px] text-muted-foreground sm:inline">
              Showing {filteredProjects.length} of {projects.length}
            </span>
          </div>

          {/* Projects Grid Display */}
          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl border border-border/60 bg-muted/30"
                />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDuplicate={handleDuplicate}
                  onDeleteRequest={setProjectToDelete}
                  onExportRequest={setProjectToExport}
                />
              ))}

              {/* "+ Create Project" Inline Card */}
              <button
                onClick={() => setNewProjectOpen(true)}
                className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-card/40 p-6 text-center transition-all hover:border-primary/60 hover:bg-muted/30"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Plus className="size-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground">
                    Create New Timeline
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Choose from 16:9, 9:16, 1:1, or 21:9
                  </p>
                </div>
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderKanban className="size-6" />
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                No matching projects found
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {searchQuery
                  ? `No sequences matched "${searchQuery}". Try a different search term or clear filters.`
                  : "No projects found in this category. Start your next sequence now."}
              </p>
              <div className="mt-4 flex gap-2">
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setActiveFilter("all")
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setNewProjectOpen(true)}
                  className="gap-1.5 text-xs font-medium"
                >
                  <Plus className="size-3.5" />
                  <span>New Sequence</span>
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Featured Production Presets Shelf */}
        <section className="border-t border-border/80 bg-card/30 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8FF3D]">
                  <Sparkles className="size-3.5 text-[#C8FF3D]" />
                  <span>Production Presets</span>
                </div>
                <h3 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0] mt-0.5">
                  Start with Engineered Templates
                </h3>
              </div>
              <Link to="/templates">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <span>View All Presets</span>
                  <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STUDIO_TEMPLATES.slice(0, 3).map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-foreground/30 hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-muted-foreground">
                        {tmpl.aspectRatio} • {tmpl.category}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {tmpl.duration}s • {tmpl.fps}fps
                      </span>
                    </div>
                    <h4 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {tmpl.clipsCount} pre-timed layers
                    </span>
                    <Button
                      size="xs"
                      onClick={() => {
                        toast.success(`Loading ${tmpl.title} into Studio Editor...`)
                        navigate({ to: "/editor" })
                      }}
                      className="gap-1 font-medium"
                    >
                      <span>Open Template</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Studio Soundscapes & Audio Assets Bin */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-bold tracking-tight text-foreground">
              Built-in Audio & SFX Presets
            </h3>
            <p className="text-xs text-muted-foreground">
              Synthesized ambient soundscapes, cinematic transitions, and dynamic foley ready for instant timeline scoring.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STOCK_ASSETS.slice(0, 4).map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col justify-between rounded-lg border border-border/80 bg-card p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                      {asset.category}
                    </span>
                    {asset.duration && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {asset.duration}s
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading text-xs font-semibold text-foreground mt-2 truncate">
                    {asset.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {asset.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono text-muted-foreground bg-muted/30 px-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Waveform synthesized
                  </span>
                  <Link to="/editor">
                    <Button variant="secondary" size="xs" className="gap-1 text-[11px]">
                      <span>Open in Studio</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Studio Activity Feed */}
        <section className="border-t border-[rgba(245,245,240,0.10)] bg-[#141714]/30 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="size-4 text-[#C8FF3D]" />
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#A7ADA5]">
                Studio Audit Trail & Engine Events
              </h3>
            </div>
            <div className="rounded-lg border border-[rgba(245,245,240,0.10)] bg-[#141714] p-3 font-mono text-xs">
              <div className="divide-y divide-[rgba(245,245,240,0.06)]">
                {activities.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-1.5 rounded-full ${
                          act.type === "export"
                            ? "bg-[#C8FF3D] shadow-[0_0_6px_rgba(200,255,61,0.6)]"
                            : act.type === "create"
                              ? "bg-[#C8FF3D]/70"
                              : act.type === "delete"
                                ? "bg-red-500"
                                : "bg-[#A7ADA5]"
                        }`}
                      />
                      <span className="font-semibold text-[#F5F5F0]">{act.projectTitle}:</span>
                      <span className="text-[#A7ADA5]">{act.action}</span>
                    </div>
                    <span className="text-muted-foreground/60 text-[10px]">
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <StudioFooter onOpenShortcuts={() => setShortcutsOpen(true)} />

      {/* Modals */}
      <NewProjectModal open={newProjectOpen} onOpenChange={setNewProjectOpen} />
      <CommandPaletteModal
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenShortcuts={() => {
          setCommandPaletteOpen(false)
          setShortcutsOpen(true)
        }}
      />
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      {projectToDelete && (
        <ConfirmDeleteModal
          open={!!projectToDelete}
          onOpenChange={(open) => !open && setProjectToDelete(null)}
          title={`Delete "${projectToDelete.title}"?`}
          description="Are you sure you want to delete this sequence? All timeline clips and track configurations will be removed."
          onConfirm={handleConfirmDelete}
        />
      )}
      {projectToExport && (
        <ExportModal
          open={!!projectToExport}
          onOpenChange={(open) => !open && setProjectToExport(null)}
          project={projectToExport}
        />
      )}
    </div>
  )
}
