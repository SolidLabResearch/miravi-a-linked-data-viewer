import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for crypto lib to work
    global: 'globalThis'
  },
  // leading dot needed to run from any path
  base: './'
})
