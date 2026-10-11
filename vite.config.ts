import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: '127.0.0.1', strictPort: true, port: 5174 },
  preview: { host: '127.0.0.1', strictPort: true, port: 4173 },
  build: { target: 'safari16.4', sourcemap: false },
});
