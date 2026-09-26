import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { C1PLogo } from "#/components/brand/c1p-logo"
import { Button } from "#/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "#/components/ui/sheet"
import {
  Sun,
  Moon,
  Laptop,
  Menu,
  Plus,
  Command,
  LayoutGrid,
  Video,
  Sparkles,
  Palette,
  CheckCircle2,
} from "lucide-react"

interface StudioNavbarProps {
  onOpenNewProject?: () => void
  onOpenCommandPalette?: () => void
}

export function StudioNavbar({ onOpenNewProject, onOpenCommandPalette }: StudioNavbarProps) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: "/", label: "Studio Hub", icon: LayoutGrid },
    { href: "/editor", label: "Editor", icon: Video },
    { href: "/templates", label: "Templates", icon: Sparkles },
    { href: "/brand", label: "Brand Specs", icon: Palette },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center transition-opacity hover:opacity-90">
            <C1PLogo variant="full" showTagline={false} size={28} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = currentPath === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#1A1E1A] text-[#F5F5F0] font-semibold border border-[#F5F5F0]/10 shadow-xs"
                      : "text-[#A7ADA5] hover:bg-[#141714] hover:text-[#F5F5F0]"
                  }`}
                >
                  <Icon className={`size-3.5 ${isActive ? "text-[#C8FF3D]" : ""}`} />
                  {link.label}
                  {isActive && <span className="size-1 rounded-full bg-[#C8FF3D]" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Center: System Status Tag */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#A7ADA5] bg-[#141714] px-2.5 py-1 rounded-full border border-[rgba(245,245,240,0.10)]">
          <span className="size-1.5 rounded-full bg-[#C8FF3D] animate-pulse shadow-[0_0_8px_rgba(200,255,61,0.6)]" />
          <span>WASM Core 120k Ticks/s</span>
          <span className="text-[#727870]">|</span>
          <span>GPU Compositor Ready</span>
        </div>

        {/* Right: Actions, Search, Theme, New Project */}
        <div className="flex items-center gap-2">
          {/* Quick Search / Command Button */}
          {onOpenCommandPalette && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCommandPalette}
              className="hidden sm:inline-flex items-center gap-2 text-muted-foreground text-xs h-8 px-2.5 rounded-md border-border/80"
              aria-label="Search and command palette"
            >
              <Command className="size-3.5" />
              <span>Search Studio...</span>
              <kbd className="pointer-events-none hidden h-4 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                Ctrl K
              </kbd>
            </Button>
          )}

          {/* Theme Switcher */}
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle theme"
                  >
                    {theme === "light" ? (
                      <Sun className="size-4" />
                    ) : theme === "dark" ? (
                      <Moon className="size-4" />
                    ) : (
                      <Laptop className="size-4" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sun className="size-3.5" />
                    <span>Light</span>
                  </div>
                  {theme === "light" && <CheckCircle2 className="size-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Moon className="size-3.5" />
                    <span>Dark</span>
                  </div>
                  {theme === "dark" && <CheckCircle2 className="size-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="size-3.5" />
                    <span>System</span>
                  </div>
                  {theme === "system" && <CheckCircle2 className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* New Project CTA */}
          {onOpenNewProject ? (
            <Button
              onClick={onOpenNewProject}
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium shadow-xs"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          ) : (
            <Link to="/editor">
              <Button size="sm" className="h-8 gap-1.5 text-xs font-medium shadow-xs">
                <Video className="size-3.5" />
                <span className="hidden sm:inline">Launch Studio</span>
              </Button>
            </Link>
          )}

          {/* Mobile Navigation Trigger */}
          <div className="flex md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="size-8" aria-label="Open mobile menu">
                    <Menu className="size-4" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <SheetHeader className="text-left">
                    <SheetTitle>
                      <C1PLogo variant="full" showTagline size={24} />
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon
                      const isActive = currentPath === link.href
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-[#1A1E1A] text-[#F5F5F0] font-semibold border border-[#F5F5F0]/10"
                              : "text-[#A7ADA5] hover:bg-[#141714] hover:text-[#F5F5F0]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`size-4 ${isActive ? "text-[#C8FF3D]" : ""}`} />
                            <span>{link.label}</span>
                          </div>
                          {isActive && <span className="size-1.5 rounded-full bg-[#C8FF3D]" />}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-border pt-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">C1P Studio</p>
                  <p className="text-[11px]">Create. Innovate. Progress.</p>
                  <p className="mt-2 text-[10px] font-mono">v0.3.2 • Build 2026.09</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
