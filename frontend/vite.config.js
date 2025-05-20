import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // Add this server configuration
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:3001', // Your backend server address
        changeOrigin: true, // Recommended for most cases
        // secure: false, // If your backend is not HTTPS (which is true for localhost)
      }
    }
  }
})