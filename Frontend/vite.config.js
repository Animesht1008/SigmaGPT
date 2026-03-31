import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations for production
  build: {
    // Minify JS and CSS
    minify: 'terser',
    
    // Generate source maps for production debugging (optional)
    // sourcemap: true,
    
    // Chunk size warnings threshold (in kb)
    chunkSizeWarningLimit: 600,
    
    // Rollup options
    rollupOptions: {
      output: {
        // Split vendor libraries into separate chunks for better caching
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown', 'rehype-highlight'],
          'utils': ['uuid', 'react-spinners']
        }
      }
    }
  },
  
  // Server config for local development
  server: {
    port: 5173,
    strictPort: false,
  }
})

