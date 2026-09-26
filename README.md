# C1P — Create. Innovate. Progress.

A high-precision creative studio and video editing environment built with a modern Rust core, 120,000 ticks/sec timeline arithmetic, and reactive local storage.

---

## Brand & Identity

**C1P** stands for **Create. Innovate. Progress.**

The design direction is clean, architectural, and minimal:
- **Engineered for High-Velocity Editing**: Clean visual hierarchy, zero cognitive clutter, and instant keyboard shortcuts (`Space` to play, `S` to split, `Del` to remove, `Ctrl+D` to duplicate, `?` for cheat sheet).
- **120k Ticks/Sec Integer Time**: Exact frame-boundary alignment avoiding lossy floating-point arithmetic.
- **Local-First & Autonomous**: Project sequences, multi-track timelines, and asset references remain on-device with zero required cloud uploads.
- **Cross-Ratio Precision**: Seamless canvas switching between 16:9 (Cinema/Desktop), 9:16 (Reels/TikTok/Shorts), 1:1 (Social Feed), 4:5 (Portrait), and 21:9 (Ultrawide).

---

## Studio Capabilities

### 1. Multi-Track Timeline & Sequencer
- Multi-lane architecture: Overlay (captions, kinetic titles, stickers), Main Video, and Stereo Audio tracks.
- Interactive playhead scrubbing with real-time frame counter (`HH:MM:SS:FF`).
- Real-time split (`S`), duplicate (`Ctrl+D`), trim handles, and ripple editing.
- Audio waveform visualization generated per clip.

### 2. Live Canvas Compositor & Transform Engine
- Real-time video preview and canvas rendering synchronized to the playhead.
- Transform controls: Position (X/Y), Scale (0.1x to 3.0x), Rotation (-180° to 180°), Opacity.
- Image & Video filter pipeline: Brightness, Contrast, Saturation, and Blur.
- Safe guides overlay (Rule of Thirds, title safe boundaries).
- Variable playback speeds (0.5x, 1x, 1.25x, 1.5x, 2x).

### 3. Kinetic Typography & Titles
- Custom text overlays with typeface options (Inter Variable, Playfair Display, JetBrains Mono).
- Customizable font size, text colors, background pill boxes, and drop shadows.

### 4. Sequence Export Pipeline
- Multi-phase render pipeline simulating frame-by-frame compositing and audio multiplexing.
- Target formats: MP4 (H.264/AAC), WebM (VP9/Opus), Animated GIF, ProRes 422.
- Target resolutions: 720p HD, 1080p Full HD, 4K Ultra HD at 24, 30, or 60 FPS.
- Direct in-browser export payload generation and download trigger.

### 5. Production Presets & Templates
- Curated pre-timed timeline templates (YouTube Kinetic Manifesto, Viral TikTok/Reel Hook, Modern Hardware Spotlight, Podcast Waveform Teaser, Cinematic Travel Vignette).
- 1-click clone directly into the Multi-Track Studio Editor.

### 6. Design System & Brand Specifications (`/brand`)
- Official C1P Monogram and vector assets (SVG copy & download).
- Precision color palette tokens engineered with OKLCH lightness values.
- Typography scale and usage guidelines.

---

## Tech Stack & Architecture

- **Framework**: [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router)
- **UI Engine**: React 19, Tailwind CSS v4, Base UI, Radix Primitives
- **Styling & Icons**: Lucide React, Hugeicons, Sonner toasts
- **Theme**: Next-Themes (Studio Dark & Pure Paper Light modes)
- **Testing**: Vitest with JSDOM
- **Build Tool**: Vite 8 with Rolldown

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Installation
```sh
cd apps/web
npm install
```

### Development Server
```sh
cd apps/web
npm run dev
# Starts development server at http://localhost:5173
```

### Production Build
```sh
cd apps/web
npm run build
```

### Run Tests
```sh
cd apps/web
npm run test
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause playback |
| `←` / `→` | Step back / forward 1 frame |
| `Shift + ← / →` | Seek 1 second back / forward |
| `S` | Split selected clip at playhead |
| `Delete` / `Backspace` | Delete selected clip |
| `Ctrl + D` | Duplicate selected clip |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo edit |
| `N` | Toggle magnet snapping |
| `G` | Toggle Rule of Thirds safe guides |
| `F` | Toggle preview fullscreen |
| `M` | Mute / Unmute master audio |
| `Ctrl + K` | Open Studio Search & Command Palette |
| `?` | Open Keyboard Shortcuts modal |

---

## License

MIT © C1P Studio.
