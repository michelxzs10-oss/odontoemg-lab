import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' permite publicar en GitHub Pages bajo /<nombre-del-repo>/ sin cambiar nada.
export default defineConfig({
  base: './',
  plugins: [svelte()],
  worker: { format: 'es' },
});
