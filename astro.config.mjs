import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Enable SSR for dynamic functionality
  output: 'static',
  
  // Site config
  site: 'https://lazy-life-hacks.com',
  
  // Build settings
  build: {
    assets: 'assets'
  }
});