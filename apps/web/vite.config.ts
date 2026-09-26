import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { nitro } from 'nitro/vite'

const isTest = Boolean(process.env.VITEST)
const isVercel = Boolean(process.env.VERCEL)

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    !isTest && devtools(),
    !isTest && (isVercel ? nitro() : cloudflare({ viteEnvironment: { name: 'ssr' } })),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ].filter(Boolean),
})

export default config
