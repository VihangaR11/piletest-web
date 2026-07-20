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
npm run validate:build
npm run preview
```

The production site is generated in `dist/` and deployed to GitHub Pages by
`.github/workflows/deploy.yml` whenever `main` is updated. The production build
uses Astro/Vite minification, removes unused CSS, and excludes unreferenced image
variants from the deployable output.

Deployment is blocked when internal resources are missing, unsafe new-tab links
or duplicate IDs are present, the private admin page is exposed, or the CSS and
JavaScript performance budgets are exceeded. The scheduled production health
check runs every six hours and can also be started manually from GitHub Actions.

## Contact form email delivery

When configured, the contact form submits every field to Formspree and delivers
enquiries to the recipient configured for that form. Without an endpoint, the
validated form opens a prepared message in the visitor's email application.

1. Create a free Formspree form and set its recipient to `piletestcon@gmail.com`.
2. Copy the endpoint shown by Formspree, such as `https://formspree.io/f/abcdwxyz`.
3. In GitHub, create the repository variable `FORMSPREE_ENDPOINT` with that full URL.
4. For local testing, copy `.env.example` to `.env` and replace `YOUR_FORM_ID`.

The endpoint is injected during the GitHub Pages build. Formspree form IDs are
public identifiers and will be visible in the generated website.

## Project structure

- `src/components/` — shared navigation and footer components
- `src/layouts/` — shared page shell and metadata
- `src/data/` — typed company and navigation data
- `src/content/pages/` — migrated page content
- `src/pages/` — Astro routes preserving the existing `.html` URLs
- `src/styles/` — shared responsive visual system
- `scripts/optimize-build.mjs` — production CSS and asset optimization
- `public/assets/` — production images
- `public/` — browser scripts, sitemap, robots file and deployable assets

The original root-level HTML/CSS/JS files remain as a migration reference. The
Astro source under `src/` is now the production implementation.
