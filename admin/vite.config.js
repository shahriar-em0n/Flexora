import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Admin panel — accessible via proxy at localhost:3000/admin
// This makes both frontend and admin share the same origin for localStorage
export default defineConfig({
  plugins: [react()],
  base: '/admin',
  server: {
    port: 5173,
  },
})

