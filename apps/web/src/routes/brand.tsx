import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { StudioNavbar } from "#/components/layout/studio-navbar"
import { StudioFooter } from "#/components/layout/studio-footer"
import { C1PLogo, C1PIcon } from "#/components/brand/c1p-logo"
import { Button } from "#/components/ui/button"
import {
  Download,
  Copy,
  Check,
  Palette,
  Sparkles,
  Layers,
  Type,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Cpu,
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/brand")({
  component: BrandPage,
})

const C1P_COLOR_PALETTE = [
  {
    name: "Primary Background",
    hex: "#0D100E",
    token: "--color-c1p-bg",
    role: "Application background, dark cinema canvas",
    badge: "Deep Studio",
    border: "border-white/10",
  },
  {
    name: "Primary Surface",
    hex: "#141714",
    token: "--color-c1p-surface",
    role: "Panels, sidebar, track header containers",
    badge: "Base Surface",
    border: "border-white/10",
  },
  {
    name: "Secondary Surface",
    hex: "#1A1E1A",
    token: "--color-c1p-surface-elevated",
    role: "Cards, active tracks, dropdown menus, modals",
    badge: "Elevated",
    border: "border-white/15",
  },
  {
    name: "C1P Accent Lime",
    hex: "#C8FF3D",
    token: "--color-c1p-lime",
    role: "The ↗ arrow, primary CTAs, active playhead, key indicators",
    badge: "Signature Brand",
    border: "border-black/20",
    darkText: true,
  },
  {
    name: "Dark Lime",
    hex: "#91B82A",
    token: "--color-c1p-lime-dark",
    role: "Hover states for lime CTAs, subtle focus rings, secondary indicators",
    badge: "Accent Shade",
    border: "border-white/10",
    darkText: true,
  },
  {
    name: "Primary Text",
    hex: "#F5F5F0",
    token: "--color-c1p-text",
    role: "C1P letterforms, headings, high-contrast typography",
    badge: "High Contrast",
    border: "border-black/20",
    darkText: true,
  },
  {
    name: "Secondary Text",
    hex: "#A7ADA5",
    token: "--color-c1p-muted",
    role: "Body copy, active secondary labels, metadata captions",
    badge: "Medium Contrast",
    border: "border-white/10",
    darkText: true,
  },
  {
    name: "Muted Text",
    hex: "#727870",
    token: "--color-c1p-subtle",
    role: "Disabled states, hotkey hints, timeline tick marks",
    badge: "Subtle",
    border: "border-white/10",
  },
]

function BrandPage() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const handleCopy = (text: string, label: string, key?: string) => {
    navigator.clipboard.writeText(text)
    if (key) {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    }
    toast.success(`Copied ${label} to clipboard!`)
  }

  const handleDownloadSvg = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success(`Downloaded ${filename}`)
  }

  const rawLogoSvg = `<svg width="320" height="100" viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- C1P Letterforms -->
  <g fill="#F5F5F0">
    <path d="M 85 22 C 74 13 60 9 44 9 C 19 9 0 28 0 50 C 0 72 19 91 44 91 C 60 91 74 87 85 78 L 73 59 C 66 64 56 67 45 67 C 33 67 24 59 24 50 C 24 41 33 33 45 33 C 56 33 66 36 73 41 Z" />
    <path d="M 97 45 L 119 25 L 119 91 L 140 91 L 140 10 L 117 10 L 97 32 Z" />
    <path d="M 152 10 L 195 10 C 218 10 234 24 234 44 C 234 64 218 78 195 78 L 173 78 L 173 91 L 152 91 Z M 173 31 L 173 57 L 194 57 C 205 57 212 51 212 44 C 212 37 205 31 194 31 Z" />
  </g>
  <!-- C1P Lime Arrow ↗ (Create -> Innovate -> Progress) -->
  <line x1="248" y1="82" x2="296" y2="34" stroke="#C8FF3D" stroke-width="15" stroke-linecap="square" />
  <path d="M 252 34 L 297 34 L 297 79" fill="none" stroke="#C8FF3D" stroke-width="15" stroke-linecap="square" stroke-linejoin="miter" />
</svg>`

  const rawSymbolSvg = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="16" fill="#141714" stroke="#F5F5F0" stroke-opacity="0.1" />
  <text x="6" y="72" font-family="system-ui, sans-serif" font-size="48" font-weight="900" letter-spacing="-2" fill="#F5F5F0">C1P</text>
  <line x1="72" y1="36" x2="92" y2="16" stroke="#C8FF3D" stroke-width="6" />
  <polyline points="76,16 92,16 92,32" fill="none" stroke="#C8FF3D" stroke-width="6" />
</svg>`

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StudioNavbar />

      <main className="flex-1">
        {/* Brand Hero */}
        <section className="border-b border-border/80 bg-gradient-to-b from-[#141714] to-[#0D100E] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(245,245,240,0.10)] bg-[#141714] px-3 py-1 text-xs font-mono font-medium text-[#A7ADA5]">
                <Palette className="size-3.5 text-[#C8FF3D]" />
                <span>C1P BRAND SYSTEM // CREATE • INNOVATE • PROGRESS</span>
              </div>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl text-[#F5F5F0]">
                Brand Identity & Design System
              </h1>
              <p className="text-base text-[#A7ADA5] leading-relaxed">
                The visual identity of <strong className="text-[#F5F5F0]">C1P</strong> is rooted in
                architectural precision and functional creative power. From the bold geometric letterforms
                to the signature 45° lime arrow (<strong className="text-[#C8FF3D]">↗</strong>), every element
                reinforces the creative journey: <span className="text-[#F5F5F0]">Create</span>,{" "}
                <span className="text-[#F5F5F0]">Innovate</span>, and{" "}
                <span className="text-[#F5F5F0]">Progress</span>.
              </p>
            </div>
          </div>
        </section>

        {/* 1. The Core Mark & Symbolism */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0]">
              The Core Mark & Symbolism
            </h2>
            <p className="text-xs text-[#A7ADA5]">
              The logo is the foundation of the entire visual system across software, packaging, and digital media.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Primary Logo Canvas */}
            <div className="lg:col-span-2 flex flex-col justify-between rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-8">
              <div className="flex aspect-[21/9] items-center justify-center rounded-lg bg-[#0D100E] p-8 shadow-inner border border-[rgba(245,245,240,0.06)] relative overflow-hidden group">
                <C1PLogo size={64} showTagline={false} />
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#727870] uppercase tracking-wider">
                  #0D100E Background • #F5F5F0 Letters • #C8FF3D Arrow
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#F5F5F0]">
                    C1P Primary Logomark
                  </h3>
                  <p className="text-xs text-[#A7ADA5] mt-1">
                    Off-white geometric letterforms with the signature 45° upward lime arrow.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(rawLogoSvg, "C1P Logo SVG", "logo-svg")}
                    className="gap-1.5 text-xs border-[rgba(245,245,240,0.10)] bg-[#1A1E1A] hover:bg-[#141714] text-[#F5F5F0]"
                  >
                    {copiedKey === "logo-svg" ? <Check className="size-3.5 text-[#C8FF3D]" /> : <Copy className="size-3.5" />}
                    <span>Copy SVG</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadSvg(rawLogoSvg, "c1p-logo.svg")}
                    className="gap-1.5 text-xs bg-[#C8FF3D] hover:bg-[#91B82A] text-[#0D100E] font-bold"
                  >
                    <Download className="size-3.5" />
                    <span>Download SVG</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Symbolism Breakdown */}
            <div className="flex flex-col justify-between rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6 space-y-6">
              <div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C8FF3D] flex items-center gap-2">
                  <ArrowUpRight className="size-4" />
                  Triad Philosophy
                </h3>
                <p className="text-xs text-[#A7ADA5] mt-1.5 leading-relaxed">
                  Every character and angle embodies a stage of creative evolution:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-[#1A1E1A] p-3 border border-[rgba(245,245,240,0.06)]">
                  <span className="font-mono text-xs font-bold text-[#F5F5F0] bg-[#141714] px-2 py-0.5 rounded border border-[rgba(245,245,240,0.10)]">
                    C
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F5F5F0]">Create</h4>
                    <p className="text-[11px] text-[#A7ADA5] leading-snug mt-0.5">
                      The spark, generation, and multi-track assembly of raw media assets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-[#1A1E1A] p-3 border border-[rgba(245,245,240,0.06)]">
                  <span className="font-mono text-xs font-bold text-[#F5F5F0] bg-[#141714] px-2 py-0.5 rounded border border-[rgba(245,245,240,0.10)]">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F5F5F0]">Innovate</h4>
                    <p className="text-[11px] text-[#A7ADA5] leading-snug mt-0.5">
                      Frame-accurate 120k ticks/sec arithmetic and GPU-accelerated compositing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-[#1A1E1A] p-3 border border-[rgba(245,245,240,0.06)]">
                  <span className="font-mono text-xs font-bold text-[#F5F5F0] bg-[#141714] px-2 py-0.5 rounded border border-[rgba(245,245,240,0.10)]">
                    P
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F5F5F0]">Progress</h4>
                    <p className="text-[11px] text-[#A7ADA5] leading-snug mt-0.5">
                      Production delivery, export fidelity, and forward momentum.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-[#C8FF3D]/10 p-3 border border-[#C8FF3D]/30">
                  <ArrowUpRight className="size-5 text-[#C8FF3D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#C8FF3D]">The 45° Lime Arrow (↗)</h4>
                    <p className="text-[11px] text-[#A7ADA5] leading-snug mt-0.5">
                      Points upward and rightward to signify breakthrough and continuous elevation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Marks Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {/* Full Lockup with Tagline */}
            <div className="flex flex-col justify-between rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6">
              <div className="flex aspect-video flex-col items-center justify-center rounded-lg bg-[#0D100E] border border-[rgba(245,245,240,0.06)] p-6">
                <C1PLogo variant="full" showTagline size={36} />
              </div>
              <div className="mt-4">
                <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">
                  Full Studio Lockup with Tagline
                </h3>
                <p className="text-xs text-[#A7ADA5] mt-0.5">
                  Complete lockup including the tagline "Create . Innovate . Progress."
                </p>
              </div>
              <div className="mt-4 flex gap-2 border-t border-[rgba(245,245,240,0.06)] pt-3">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleCopy("C1P — Create. Innovate. Progress.", "Tagline", "tagline")}
                  className="flex-1 gap-1 text-[11px] border-[rgba(245,245,240,0.10)] bg-[#1A1E1A] text-[#F5F5F0]"
                >
                  <Copy className="size-3" />
                  <span>Copy Tagline</span>
                </Button>
                <Button
                  size="xs"
                  onClick={() => handleDownloadSvg(rawLogoSvg, "c1p-full-lockup.svg")}
                  className="flex-1 gap-1 text-[11px] bg-[#C8FF3D] hover:bg-[#91B82A] text-[#0D100E] font-bold"
                >
                  <Download className="size-3" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            {/* Monogram Icon */}
            <div className="flex flex-col justify-between rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6">
              <div className="flex aspect-video items-center justify-center rounded-lg bg-[#0D100E] border border-[rgba(245,245,240,0.06)] p-6">
                <C1PIcon size={72} />
              </div>
              <div className="mt-4">
                <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">
                  C1P App Icon / Favicon
                </h3>
                <p className="text-xs text-[#A7ADA5] mt-0.5">
                  Monogram badge optimized for favicons, browser tabs, and desktop docks.
                </p>
              </div>
              <div className="mt-4 flex gap-2 border-t border-[rgba(245,245,240,0.06)] pt-3">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleCopy(rawSymbolSvg, "C1P Icon SVG", "icon-svg")}
                  className="flex-1 gap-1 text-[11px] border-[rgba(245,245,240,0.10)] bg-[#1A1E1A] text-[#F5F5F0]"
                >
                  <Copy className="size-3" />
                  <span>Copy SVG</span>
                </Button>
                <Button
                  size="xs"
                  onClick={() => handleDownloadSvg(rawSymbolSvg, "c1p-icon.svg")}
                  className="flex-1 gap-1 text-[11px] bg-[#C8FF3D] hover:bg-[#91B82A] text-[#0D100E] font-bold"
                >
                  <Download className="size-3" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            {/* Studio Badge Variant */}
            <div className="flex flex-col justify-between rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6">
              <div className="flex aspect-video items-center justify-center rounded-lg bg-[#0D100E] border border-[rgba(245,245,240,0.06)] p-6">
                <C1PLogo variant="full" showBadge size={32} />
              </div>
              <div className="mt-4">
                <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">
                  C1P Studio Pro Badge
                </h3>
                <p className="text-xs text-[#A7ADA5] mt-0.5">
                  Header lockup featuring the lime "STUDIO" micro-badge.
                </p>
              </div>
              <div className="mt-4 flex gap-2 border-t border-[rgba(245,245,240,0.06)] pt-3">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleCopy("C1P STUDIO", "Badge Text", "badge-text")}
                  className="flex-1 gap-1 text-[11px] border-[rgba(245,245,240,0.10)] bg-[#1A1E1A] text-[#F5F5F0]"
                >
                  <Copy className="size-3" />
                  <span>Copy Text</span>
                </Button>
                <Button
                  size="xs"
                  onClick={() => handleDownloadSvg(rawLogoSvg, "c1p-studio.svg")}
                  className="flex-1 gap-1 text-[11px] bg-[#C8FF3D] hover:bg-[#91B82A] text-[#0D100E] font-bold"
                >
                  <Download className="size-3" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Palette Section */}
        <section className="border-t border-[rgba(245,245,240,0.10)] bg-[#141714]/40 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1 mb-8">
              <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0]">
                Official C1P Color System
              </h2>
              <p className="text-xs text-[#A7ADA5]">
                Exact hex codes, CSS variables, and design tokens specified for the C1P identity.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {C1P_COLOR_PALETTE.map((token) => (
                <div
                  key={token.name}
                  className="flex flex-col justify-between rounded-lg border border-[rgba(245,245,240,0.10)] bg-[#141714] p-4 transition-all hover:border-[#C8FF3D]/40"
                >
                  <div>
                    <div
                      className={`h-16 w-full rounded-md shadow-xs border ${token.border} mb-3 flex items-center justify-end p-2`}
                      style={{ backgroundColor: token.hex }}
                    >
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          token.darkText ? "bg-black/30 text-black" : "bg-white/20 text-white"
                        }`}
                      >
                        {token.badge}
                      </span>
                    </div>
                    <h3 className="font-heading text-xs font-semibold text-[#F5F5F0]">
                      {token.name}
                    </h3>
                    <p className="text-[11px] text-[#A7ADA5] mt-1 leading-snug">
                      {token.role}
                    </p>
                    <p className="font-mono text-[10px] text-[#727870] mt-1">
                      {token.token}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-[rgba(245,245,240,0.06)] pt-2 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#F5F5F0] font-semibold">{token.hex}</span>
                    <button
                      onClick={() => handleCopy(token.hex, token.name, token.hex)}
                      className="text-[#A7ADA5] hover:text-[#C8FF3D] text-[10px] flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === token.hex ? (
                        <Check className="size-2.5 text-[#C8FF3D]" />
                      ) : (
                        <Copy className="size-2.5" />
                      )}
                      <span>{copiedKey === token.hex ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Typography Specs */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0]">
              Typography Architecture
            </h2>
            <p className="text-xs text-[#A7ADA5]">
              Clean geometric sans paired with precision monospace numerals for a technical studio feel.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6 space-y-3">
              <span className="font-mono text-[10px] uppercase font-bold text-[#C8FF3D]">
                Primary & Heading Font
              </span>
              <h3 className="text-2xl font-bold text-[#F5F5F0] font-sans">
                Inter Variable
              </h3>
              <p className="text-xs text-[#A7ADA5] leading-relaxed">
                Applied across all UI controls, toolbars, track labels, modals, and bold hero statements.
                Highly legible at micro sizes (9px - 12px) with crisp letterforms and tight tracking.
              </p>
              <div className="font-mono text-[10px] text-[#727870] pt-2">
                Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold), 900 (Black)
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6 space-y-3">
              <span className="font-mono text-[10px] uppercase font-bold text-[#C8FF3D]">
                Technical Monospace Font
              </span>
              <h3 className="text-2xl font-bold text-[#F5F5F0] font-mono">
                JetBrains Mono
              </h3>
              <p className="text-xs text-[#A7ADA5] leading-relaxed">
                Utilized for 120k ticks/sec timecodes, frame counters, sample rates, scale factors, and
                render percentages to eliminate tabular numerical jitter.
              </p>
              <div className="font-mono text-[10px] text-[#727870] pt-2">
                Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
              </div>
            </div>
          </div>
        </section>

        {/* 4. Brand Principles */}
        <section className="border-t border-[rgba(245,245,240,0.10)] bg-[#141714]/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0] mb-6">
              Core Design Principles
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6 space-y-2.5">
                <span className="font-mono text-xs font-bold text-[#C8FF3D]">01 / CREATE</span>
                <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">
                  Architectural Precision, Zero Clutter
                </h3>
                <p className="text-xs text-[#A7ADA5] leading-relaxed">
                  Avoid excessive rainbow gradients, purple/blue glows, and floating meaningless elements.
                  Surfaces are deep black (#0D100E), cards are sleek dark (#141714), and lime (#C8FF3D) is
                  used with intentional restraint.
                </p>
              </div>

              <div className="rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6 space-y-2.5">
                <span className="font-mono text-xs font-bold text-[#C8FF3D]">02 / INNOVATE</span>
                <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">
                  Frame-Accurate Arithmetic
                </h3>
                <p className="text-xs text-[#A7ADA5] leading-relaxed">
                  Timeline math uses 120,000 ticks/sec integer arithmetic instead of lossy floats.
                  Transitions, cuts, and keyframes snap with mechanical accuracy.
                </p>
              </div>

              <div className="rounded-xl border border-[rgba(245,245,240,0.10)] bg-[#141714] p-6 space-y-2.5">
                <span className="font-mono text-xs font-bold text-[#C8FF3D]">03 / PROGRESS</span>
                <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">
                  Local-First Autonomy
                </h3>
                <p className="text-xs text-[#A7ADA5] leading-relaxed">
                  Media decoding, GPU compositing, and rendering happen on-device. Your project
                  sequences never leave your browser unless you explicitly export them.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StudioFooter />
    </div>
  )
}
