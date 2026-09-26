import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "#/components/ui/command"
import { getSavedProjects, createNewProject } from "#/lib/studio-store"
import { STUDIO_TEMPLATES } from "#/lib/studio-assets"
import {
  Video,
  Sparkles,
  LayoutGrid,
  Palette,
  Moon,
  Sun,
  Keyboard,
  PlusCircle,
  FileVideo,
} from "lucide-react"

interface CommandPaletteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenShortcuts?: () => void
}

export function CommandPaletteModal({
  open,
  onOpenChange,
  onOpenShortcuts,
}: CommandPaletteModalProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const projects = getSavedProjects()

  const handleSelect = (action: () => void) => {
    action()
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command, project, or template..." />
      <CommandList className="max-h-[350px]">
        <CommandEmpty>No matching studio results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Studio Actions">
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                const proj = createNewProject("New 16:9 Sequence", "16:9", 30)
                navigate({ to: "/editor", search: { projectId: proj.id } })
              })
            }
          >
            <PlusCircle className="mr-2 size-4 text-emerald-500" />
            <span>Create New 16:9 Landscape Project</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                const proj = createNewProject("New 9:16 Vertical Reel", "9:16", 30)
                navigate({ to: "/editor", search: { projectId: proj.id } })
              })
            }
          >
            <PlusCircle className="mr-2 size-4 text-emerald-500" />
            <span>Create New 9:16 Vertical Story</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                navigate({ to: "/editor" })
              })
            }
          >
            <Video className="mr-2 size-4 text-primary" />
            <span>Open Multi-Track Timeline Editor</span>
          </CommandItem>
          {onOpenShortcuts && (
            <CommandItem
              onSelect={() =>
                handleSelect(() => {
                  onOpenShortcuts()
                })
              }
            >
              <Keyboard className="mr-2 size-4 text-muted-foreground" />
              <span>View Keyboard Shortcuts Guide (?)</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Existing User Projects */}
        {projects.length > 0 && (
          <CommandGroup heading="Recent Projects">
            {projects.map((proj) => (
              <CommandItem
                key={proj.id}
                onSelect={() =>
                  handleSelect(() => {
                    navigate({ to: "/editor", search: { projectId: proj.id } })
                  })
                }
              >
                <FileVideo className="mr-2 size-4 text-muted-foreground" />
                <div className="flex flex-1 items-center justify-between">
                  <span className="truncate">{proj.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {proj.aspectRatio} • {proj.duration}s
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Templates */}
        <CommandGroup heading="Production Templates">
          {STUDIO_TEMPLATES.map((tmpl) => (
            <CommandItem
              key={tmpl.id}
              onSelect={() =>
                handleSelect(() => {
                  navigate({ to: "/templates" })
                })
              }
            >
              <Sparkles className="mr-2 size-4 text-amber-500" />
              <div className="flex flex-1 items-center justify-between">
                <span>{tmpl.title}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {tmpl.category}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation & Preferences */}
        <CommandGroup heading="Navigation & Appearance">
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                navigate({ to: "/" })
              })
            }
          >
            <LayoutGrid className="mr-2 size-4" />
            <span>Go to Studio Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                navigate({ to: "/brand" })
              })
            }
          >
            <Palette className="mr-2 size-4" />
            <span>Go to Brand Specifications</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                setTheme(theme === "dark" ? "light" : "dark")
              })
            }
          >
            {theme === "dark" ? (
              <Sun className="mr-2 size-4" />
            ) : (
              <Moon className="mr-2 size-4" />
            )}
            <span>Toggle Theme ({theme === "dark" ? "Switch to Light" : "Switch to Dark"})</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
