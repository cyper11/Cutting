import { describe, it, expect } from "vitest"
import { STOCK_ASSETS, STUDIO_TEMPLATES } from "../lib/studio-assets"

describe("C1P Studio Assets & Templates", () => {
  it("includes valid audio and sound design assets", () => {
    expect(STOCK_ASSETS.length).toBeGreaterThan(0)
    const audios = STOCK_ASSETS.filter((a) => a.category === "audio")
    const sfx = STOCK_ASSETS.filter((a) => a.category === "sfx")
    expect(audios.length).toBeGreaterThan(0)
    expect(sfx.length).toBeGreaterThan(0)
  })

  it("contains curated templates with correct aspect ratios and durations", () => {
    expect(STUDIO_TEMPLATES.length).toBeGreaterThan(0)
    STUDIO_TEMPLATES.forEach((tmpl) => {
      expect(["16:9", "9:16", "1:1", "21:9"]).toContain(tmpl.aspectRatio)
      expect(tmpl.duration).toBeGreaterThan(0)
      expect(tmpl.clipsCount).toBeGreaterThan(0)
    })
  })
})
