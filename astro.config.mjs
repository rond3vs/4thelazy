import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static', // Changed from 'server' to 'static'
  site: 'https://4thelazy.com/',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'github-dark' }
  }
});