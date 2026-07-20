import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vihangar11.github.io',
  base: '/piletest-web',
  output: 'static',
  compressHTML: true,
  build: {
    format: 'file',
    inlineStylesheets: 'never',
    concurrency: 4
  },
  vite: {
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: 'lightningcss',
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: true
    }
  }
});
