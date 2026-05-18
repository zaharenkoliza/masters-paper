import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/~eozakharenko/voicecanvas/',
  build: {
    outDir: 'dist',
    // ONNX runtime + transformers ~820KB — ожидаемо для ML в браузере
    chunkSizeWarningLimit: 1000,
  },
  // @xenova/transformers использует dynamic imports + WASM — не трогаем pre-bundler
  optimizeDeps: {
    exclude: ['@xenova/transformers'],
  },
})
