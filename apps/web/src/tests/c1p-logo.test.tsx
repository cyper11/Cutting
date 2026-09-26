// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { C1PLogo } from "../components/brand/c1p-logo"

afterEach(() => {
  cleanup()
})

describe("C1P Logo Component", () => {
  it("renders mark variant with aria label", () => {
    render(<C1PLogo variant="mark" size={32} />)
    const svg = screen.getByRole("img", { name: "C1P Symbol" })
    expect(svg).toBeDefined()
    expect(svg.getAttribute("width")).toBe("32")
  })

  it("renders compact variant with C1P typography", () => {
    render(<C1PLogo variant="compact" size={24} />)
    expect(screen.getByText("C1P")).toBeDefined()
  })

  it("renders full variant with Studio badge and optional tagline", () => {
    render(<C1PLogo variant="full" showTagline={true} size={32} />)
    expect(screen.getByText("C1P")).toBeDefined()
    expect(screen.getByText("Studio")).toBeDefined()
    expect(screen.getByText("Create. Innovate. Progress.")).toBeDefined()
  })
})
