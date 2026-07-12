# PileTeST Consultants Website

Professional Astro + TypeScript website for PileTeST Consultants (PVT) LTD.

## Development

```bash
npm install
npm run dev
```

## Production validation

```bash
npm run build
npm run preview
```

The production site is generated in `dist/` and deployed to GitHub Pages by
`.github/workflows/deploy.yml` whenever `main` is updated.

## Project structure

- `src/components/` — shared navigation and footer components
- `src/layouts/` — shared page shell, metadata, theme initialization
- `src/data/` — typed company and navigation data
- `src/content/pages/` — migrated page content
- `src/pages/` — Astro routes preserving the existing `.html` URLs
- `src/styles/` — shared responsive light/dark theme
- `public/assets/` — production images
- `public/` — scripts, sitemap, robots file and legacy admin page

The original root-level HTML/CSS/JS files remain as a migration reference. The
Astro source under `src/` is now the production implementation.
