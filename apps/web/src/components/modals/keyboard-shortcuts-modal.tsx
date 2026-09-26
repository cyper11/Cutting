import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import { Kbd } from "#/components/ui/kbd"

interface KeyboardShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutItem {
  keys: string[]
  label: string
}

interface ShortcutSection {
  title: string
  shortcuts: ShortcutItem[]
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: "Playback & Transport",
    shortcuts: [
      { keys: ["Space"], label: "Play / Pause playback" },
      { keys: ["←", "→"], label: "Step back / forward 1 frame" },
      { keys: ["Shift", "← / →"], label: "Seek 1 second back / forward" },
      { keys: ["Home", "End"], label: "Jump to timeline start / end" },
      { keys: ["L"], label: "Toggle timeline loop" },
      { keys: ["M"], label: "Mute / Unmute audio" },
    ],
  },
  {
    title: "Clip & Timeline Editing",
    shortcuts: [
      { keys: ["S"], label: "Split clip at current playhead" },
      { keys: ["Del"], label: "Delete selected clip" },
      { keys: ["Ctrl", "D"], label: "Duplicate selected clip" },
      { keys: ["Ctrl", "Z"], label: "Undo last edit" },
      { keys: ["Ctrl", "Y"], label: "Redo last edit" },
      { keys: ["N"], label: "Toggle magnet snapping" },
      { keys: ["R"], label: "Toggle ripple editing" },
    ],
  },
  {
    title: "Canvas & Viewport",
    shortcuts: [
      { keys: ["F"], label: "Toggle preview fullscreen" },
      { keys: ["G"], label: "Toggle safe guides (Rule of Thirds)" },
      { keys: ["0"], label: "Fit canvas to preview window" },
      { keys: ["+", "-"], label: "Zoom timeline in / out" },
    ],
  },
  {
    title: "Studio & General",
    shortcuts: [
      { keys: ["Ctrl", "K"], label: "Open Studio Command / Search" },
      { keys: ["Ctrl", "E"], label: "Open Export Sequence dialog" },
      { keys: ["?"], label: "Open Keyboard Shortcuts guide" },
      { keys: ["Esc"], label: "Close modal / deselect clip" },
    ],
  },
]

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">
            Studio Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Precision hotkeys designed for high-velocity timeline navigation and editing.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="border-b border-border/80 pb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <div className="space-y-2">
                {section.shortcuts.map((sc, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-foreground/90">{sc.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k, j) => (
                        <Kbd key={j} className="h-5 px-1.5 text-[10px] font-mono font-medium">
                          {k}
                        </Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
