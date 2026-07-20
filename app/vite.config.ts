import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: { port: Number(process.env.PORT) || 5173 },
  plugins: [react(), tailwindcss()],
})
