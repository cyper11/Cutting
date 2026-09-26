// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest"
import {
  createNewProject,
  getSavedProjects,
  saveProject,
  deleteProject,
  duplicateProject,
  toggleFavorite,
  generateWaveform,
  INITIAL_PROJECTS,
} from "../lib/studio-store"

describe("C1P Studio Store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("should generate normalized waveform bars", () => {
    const waveform = generateWaveform(20, 123)
    expect(waveform).toHaveLength(20)
    waveform.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0.1)
      expect(val).toBeLessThanOrEqual(1.0)
    })
  })

  it("should return initial projects when storage is empty", () => {
    const projects = getSavedProjects()
    expect(projects.length).toBeGreaterThan(0)
    expect(projects[0].title).toBe("C1P — Kinetic Studio Anthem")
  })

  it("should create a new project with correct dimensions", () => {
    const proj169 = createNewProject("Test Landscape", "16:9", 60)
    expect(proj169.width).toBe(1920)
    expect(proj169.height).toBe(1080)
    expect(proj169.fps).toBe(60)
    expect(proj169.aspectRatio).toBe("16:9")

    const proj916 = createNewProject("Test Vertical", "9:16", 30)
    expect(proj916.width).toBe(1080)
    expect(proj916.height).toBe(1920)
    expect(proj916.aspectRatio).toBe("9:16")
  })

  it("should duplicate project with (Copy) title and new id", () => {
    const projects = getSavedProjects()
    const first = projects[0]
    const cloned = duplicateProject(first.id)
    expect(cloned).not.toBeNull()
    expect(cloned?.id).not.toBe(first.id)
    expect(cloned?.title).toBe(`${first.title} (Copy)`)
  })

  it("should toggle favorite status correctly", () => {
    const projects = getSavedProjects()
    const first = projects[0]
    const initialFav = first.isFavorite
    const updatedFav = toggleFavorite(first.id)
    expect(updatedFav).toBe(!initialFav)
  })

  it("should delete a project", () => {
    const proj = createNewProject("To Delete", "1:1", 30)
    const countBefore = getSavedProjects().length
    deleteProject(proj.id)
    const countAfter = getSavedProjects().length
    expect(countAfter).toBe(countBefore - 1)
  })
})
