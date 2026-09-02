import { defineConfig } from 'vite';

export default defineConfig({
  // Removemos a propriedade root para que ele use a raiz padrão onde o index.html já está
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});