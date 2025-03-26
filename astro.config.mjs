import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://rond3vs.github.io',
  base: '/4thelazy',
  build: {
    assets: 'assets',
    // Ensure assets are inlined or properly referenced
    inlineStylesheets: 'auto', // Optional: Reduces HTTP requests
  },
  // Add this if you use markdown files with front matter
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'github-dark' }
  }
});