import { Link } from "@tanstack/react-router"
import { C1PLogo } from "#/components/brand/c1p-logo"
import { Button } from "#/components/ui/button"
import { Keyboard, GitBranch, Shield, Cpu, ExternalLink } from "lucide-react"

interface StudioFooterProps {
  onOpenShortcuts?: () => void
}

export function StudioFooter({ onOpenShortcuts }: StudioFooterProps) {
  return (
    <footer className="w-full border-t border-border bg-card/50 text-xs text-muted-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/" className="inline-block">
              <C1PLogo variant="full" showTagline size={24} />
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              A high-precision creative studio and video editing environment built with a modern Rust core,
              120,000 ticks/sec timeline arithmetic, and reactive local storage.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141714] border border-[#F5F5F0]/10 px-2 py-0.5 font-mono text-[10px] font-medium text-[#F5F5F0]">
                <Cpu className="size-3 text-[#C8FF3D]" />
                Local GPU Compositing
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141714] border border-[#F5F5F0]/10 px-2 py-0.5 font-mono text-[10px] font-medium text-[#F5F5F0]">
                <Shield className="size-3 text-[#C8FF3D]" />
                Zero Cloud Uploads Required
              </span>
            </div>
          </div>

          {/* Studio Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
              Studio Suite
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Projects Hub
                </Link>
              </li>
              <li>
                <Link to="/editor" className="hover:text-foreground transition-colors">
                  Multi-Track Editor
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-foreground transition-colors">
                  Production Presets
                </Link>
              </li>
              <li>
                <Link to="/brand" className="hover:text-foreground transition-colors">
                  Brand Guidelines & Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Engine Architecture */}
          <div className="space-y-2.5">
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
              Architecture
            </h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>Rust Core WASM</li>
              <li>120k Ticks MediaTime</li>
              <li>TanStack Start & Router</li>
              <li>Tailwind CSS v4 & Base UI</li>
              <li>WebCodecs Hardware Accel</li>
            </ul>
          </div>

          {/* Productivity & Help */}
          <div className="space-y-2.5">
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
              Quick Tools
            </h4>
            <div className="flex flex-col gap-2 items-start">
              {onOpenShortcuts && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenShortcuts}
                  className="h-7 gap-1.5 text-xs text-foreground"
                >
                  <Keyboard className="size-3" />
                  <span>Keyboard Shortcuts (?)</span>
                </Button>
              )}
              <a
                href="https://github.com/cyper11/Cutting"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
              >
                <GitBranch className="size-3.5" />
                <span>Open Source Repository</span>
                <ExternalLink className="size-2.5 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} C1P — Create. Innovate. Progress. Released under the MIT License.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/brand" className="hover:text-foreground transition-colors">
              Brand Kit
            </Link>
            <span>•</span>
            <Link to="/templates" className="hover:text-foreground transition-colors">
              Templates
            </Link>
            <span>•</span>
            <span className="font-mono text-[10px] text-muted-foreground">v0.3.2 Production</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
