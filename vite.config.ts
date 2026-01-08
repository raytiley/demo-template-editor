import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'http'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Base path for GitHub Pages deployment
  // Will be served at https://<username>.github.io/demo-template-editor/
  base: '/demo-template-editor/',

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Development server settings
  server: {
    port: 5173,

    // Proxy all API requests through /api-proxy/ to avoid CORS issues
    // Format: /api-proxy/{protocol}/{host}/{path}
    // Example: /api-proxy/https/rays-house.cablecast.tv/v1/zones
    proxy: {
      '/api-proxy': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => {
          // /api-proxy/https/host/path -> /path
          const match = path.match(/^\/api-proxy\/https?\/[^/]+(\/.*)/);
          return match ? match[1] : path;
        },
        // Dynamic routing based on URL - router is valid http-proxy option
        router: (req: IncomingMessage) => {
          // Extract target: /api-proxy/https/host/path -> https://host
          const match = req.url?.match(/^\/api-proxy\/(https?)\/([^/]+)/);
          if (match) {
            return `${match[1]}://${match[2]}`;
          }
          return 'http://localhost';
        },
      } as Record<string, unknown>,
    },
  },
})
