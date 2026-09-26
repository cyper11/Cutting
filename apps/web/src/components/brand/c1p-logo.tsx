import * as React from "react"
import { cn } from "#/lib/utils.ts"

export interface C1PLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | "sm" | "md" | "lg" | "xl"
  className?: string
  showTagline?: boolean
  showBadge?: boolean
  variant?: "full" | "compact" | "small" | "mark" | "arrow"
  arrowClassName?: string
}

export function C1PLogo({
  size = "md",
  className,
  showTagline = false,
  showBadge,
  variant = "compact",
  arrowClassName,
  ...props
}: C1PLogoProps) {
  // Height scale mappings
  const height =
    typeof size === "number"
      ? size
      : size === "sm"
        ? 20
        : size === "md"
          ? 28
          : size === "lg"
            ? 38
            : 54

  // Width is proportional: 320x100 viewBox
  const width = Math.round(height * 3.2)

  // If mark variant is requested, render the symbol
  if (variant === "mark") {
    return (
      <C1PIcon
        size={typeof size === "number" ? size : height * 1.5}
        className={className}
        {...props}
      />
    )
  }

  const shouldShowBadge = showBadge ?? (variant === "full")

  return (
    <div
      className={cn("inline-flex flex-col select-none group/c1p", className)}
      role="img"
      aria-label="C1P — Create. Innovate. Progress."
      {...props}
    >
      <div className="inline-flex items-center gap-2">
        <svg
          width={width}
          height={height}
          viewBox="0 0 320 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 overflow-visible transition-transform duration-200"
          aria-hidden="true"
        >
          {/* C1P LETTERFORMS (#F5F5F0 / Primary text) */}
          <g fill="currentColor">
            {/* 'C' */}
            <path d="M 85 22 C 74 13 60 9 44 9 C 19 9 0 28 0 50 C 0 72 19 91 44 91 C 60 91 74 87 85 78 L 73 59 C 66 64 56 67 45 67 C 33 67 24 59 24 50 C 24 41 33 33 45 33 C 56 33 66 36 73 41 Z" />

            {/* '1' with angled head */}
            <path d="M 97 45 L 119 25 L 119 91 L 140 91 L 140 10 L 117 10 L 97 32 Z" />

            {/* 'P' */}
            <path d="M 152 10 L 195 10 C 218 10 234 24 234 44 C 234 64 218 78 195 78 L 173 78 L 173 91 L 152 91 Z M 173 31 L 173 57 L 194 57 C 205 57 212 51 212 44 C 212 37 205 31 194 31 Z" />
          </g>

          {/* C1P LIME ACCENT ARROW (↗) Representing Create -> Innovate -> Progress */}
          <g
            className={cn(
              "transition-transform duration-200 group-hover/c1p:translate-x-1 group-hover/c1p:-translate-y-1",
              arrowClassName
            )}
          >
            {/* Arrow Stem */}
            <line
              x1="248"
              y1="82"
              x2="296"
              y2="34"
              stroke="#C8FF3D"
              strokeWidth="15"
              strokeLinecap="square"
            />
            {/* Arrow Head */}
            <path
              d="M 252 34 L 297 34 L 297 79"
              fill="none"
              stroke="#C8FF3D"
              strokeWidth="15"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </g>
        </svg>

        {/* Screen-reader accessible label */}
        <span className="sr-only">C1P</span>

        {/* Studio Badge for full variant */}
        {shouldShowBadge && (
          <span className="inline-flex items-center rounded border border-[#C8FF3D]/30 bg-[#C8FF3D]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-[#C8FF3D] uppercase">
            Studio
          </span>
        )}
      </div>

      {showTagline && (
        <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.22em] uppercase text-[#727870] transition-colors group-hover/c1p:text-[#A7ADA5]">
          <span>Create</span>
          <span className="text-[#C8FF3D]">.</span>
          <span>Innovate</span>
          <span className="text-[#C8FF3D]">.</span>
          <span>Progress</span>
          <span className="sr-only">Create. Innovate. Progress.</span>
        </div>
      )}
    </div>
  )
}

// Icon-only badge representation (for favicon, mobile drawer badges)
export function C1PIcon({
  size = 32,
  className,
  ...props
}: {
  size?: number
  className?: string
} & React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="C1P Symbol"
      className={cn(
        "rounded-md bg-[#141714] border border-[#F5F5F0]/10 overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Monogram C1P */}
      <text
        x="6"
        y="72"
        fontFamily="system-ui, sans-serif"
        fontSize="48"
        fontWeight="900"
        letterSpacing="-2"
        fill="#F5F5F0"
      >
        C1P
      </text>
      {/* Tiny Lime Arrow in upper right */}
      <line x1="72" y1="36" x2="92" y2="16" stroke="#C8FF3D" strokeWidth="6" />
      <polyline points="76,16 92,16 92,32" fill="none" stroke="#C8FF3D" strokeWidth="6" />
    </svg>
  )
}
