import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            // Proxy /admin requests to the admin Vite dev server
            '/admin': {
                target: 'http://localhost:5173',
                changeOrigin: true,
                ws: true,   // also proxy WebSocket (HMR)
            },
        },
    },
})

