import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vihangar11.github.io',
  base: '/piletest-web',
  output: 'static',
  build: {
    format: 'file'
  }
});
