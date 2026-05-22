import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Assets en carpeta propia para no pisar la carpeta assets/ existente en public_html
    assetsDir: '_pe',
    // Nunca generar source maps en producción (expone código fuente)
    sourcemap: false,
    // Evita el polyfill inline de modulepreload (permite CSP sin unsafe-inline)
    modulePreload: { polyfill: false },
    // Chunk splitting — Three.js y Framer Motion son pesados, van en chunks separados
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three'))         return 'vendor-three'
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion'
          if (id.includes('node_modules/lenis'))         return 'vendor-lenis'
          if (id.includes('node_modules/react'))         return 'vendor-react'
        },
      },
    },
    // Avisar si algún chunk supera 600kb
    chunkSizeWarningLimit: 600,
  },

  // Optimizar dependencias pesadas en dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: ['three'], // Three.js se carga dinámicamente en DotMap
  },
})
