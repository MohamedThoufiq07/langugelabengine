import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // @xenova/transformers loads its ONNX-runtime WASM binaries dynamically
  // at runtime — exclude it from pre-bundling so those assets resolve
  // correctly instead of being inlined/rewritten by esbuild's optimizer.
  optimizeDeps: {
    exclude: ['@xenova/transformers'],
  },
})
