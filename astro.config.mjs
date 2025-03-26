import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Enable SSR for dynamic functionality
  output: 'static',
  
  site: 'https://rond3vs.github.io',
  base: '/4thelazy',
  
  // Build settings
  build: {
    assets: 'assets'
  }
});