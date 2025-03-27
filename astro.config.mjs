import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static', // Changed from 'server' to 'static'
  site: 'https://rond3vs.github.io',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'github-dark' }
  }
});