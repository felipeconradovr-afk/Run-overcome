import { defineConfig } from 'vite';

export default defineConfig({
  root: './www', // ou a pasta onde o index.html está localizado
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
});