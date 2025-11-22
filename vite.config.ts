import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  define: {
    // Safely expose only the specific key we need
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Fallback for other process.env access to prevent crashes
    'process.env': {}
  }
})