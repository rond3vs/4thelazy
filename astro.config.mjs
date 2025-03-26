import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://rond3vs.github.io',
  base: '/4thelazy',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'github-dark' }
  }
});