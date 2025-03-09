import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build' ,// Cambia la carpeta de salida a 'build'
  },
  server:{
  port: 3000,
},
});
