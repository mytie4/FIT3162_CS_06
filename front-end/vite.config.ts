import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Where the backend is reachable from the *Vite dev server process*. In a
  // Codespace / dev container this is `http://localhost:5000` because both
  // services share the container's network namespace. Override with
  // `VITE_API_PROXY_TARGET` if you run the backend elsewhere.
  const proxyTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      // Bind to all interfaces so the Codespaces port forwarder can reach us.
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
