import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Laberinto-Infernal/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
})
