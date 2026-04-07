import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In Docker, set DASHBOARD_API_ORIGIN / DASHBOARD_API_WS_ORIGIN to the API service.
const apiHttp =
  process.env.DASHBOARD_API_ORIGIN ?? 'http://127.0.0.1:8000'
const apiWs =
  process.env.DASHBOARD_API_WS_ORIGIN ?? 'ws://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2'],
  },
  server: {
    proxy: {
      '/ws': {
        target: apiWs,
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: apiHttp,
        changeOrigin: true,
      },
    },
  },
})
