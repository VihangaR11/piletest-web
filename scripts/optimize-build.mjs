import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { PurgeCSS } from 'purgecss';

const projectRoot = process.cwd();
const distRoot = join(projectRoot, 'dist');

if (!existsSync(distRoot)) {
  console.error('Optimization failed: dist/ does not exist. Run the Astro build first.');
  process.exit(1);
}

const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const absolute = join(directory, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});

const beforeFiles = walk(distRoot);
const cssFiles = beforeFiles.filter(file => extname(file) === '.css');
const selectorSources = beforeFiles.filter(file => ['.html', '.js'].includes(extname(file)));
let cssBytesBefore = 0;
let cssBytesAfter = 0;

for (const cssFile of cssFiles) {
  const original = readFileSync(cssFile, 'utf8');
  cssBytesBefore += Buffer.byteLength(original);
  const [result] = await new PurgeCSS().purge({
    content: selectorSources,
    css: [{ raw: original }],
    fontFace: true,
    keyframes: true,
    safelist: {
      greedy: [
        /^active$/,
        /^enhanced$/,
        /^form-result--/,
        /^is-/,
        /^nav-open$/,
        /^open$/,
        /^visible$/
      ]
    }
  });
  const optimized = result.css.trim();
  if (!optimized) {
    console.error(`Optimization failed: PurgeCSS emptied ${relative(distRoot, cssFile)}.`);
    process.exit(1);
  }
  writeFileSync(cssFile, optimized);
  cssBytesAfter += Buffer.byteLength(optimized);
}

const optimizedCss = cssFiles.map(file => readFileSync(file, 'utf8')).join('\n');
const requiredSelectors = [
  '.nav-links', '.dropdown-content', '.home-hero', '.about-2026',
  '.services-2026', '.equipment-2026', '.projects-2026', '.resources-2026',
  '.news-2026', '.careers-2026', '.contact-2026', '.footer-grid',
  '.is-active', '.nav-links.active', '.dropdown.open', '.back-to-top.visible'
];
const missingSelectors = requiredSelectors.filter(selector => !optimizedCss.includes(selector));
if (missingSelectors.length) {
  console.error(`Optimization failed: critical selectors were removed: ${missingSelectors.join(', ')}`);
  process.exit(1);
}

const textExtensions = new Set(['.css', '.html', '.js', '.json', '.txt', '.webmanifest', '.xml']);
const textCorpus = walk(distRoot)
  .filter(file => textExtensions.has(extname(file)))
  .map(file => readFileSync(file, 'utf8'))
  .join('\n');
const imageRoot = join(distRoot, 'assets', 'images');
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);
const removedImages = [];

if (existsSync(imageRoot)) {
  for (const image of walk(imageRoot)) {
    if (!imageExtensions.has(extname(image).toLowerCase())) continue;
    const publicPath = relative(distRoot, image).replaceAll('\\', '/');
    if (!textCorpus.includes(publicPath)) {
      removedImages.push({ path: publicPath, bytes: readFileSync(image).byteLength });
      unlinkSync(image);
    }
  }
}

const removedImageBytes = removedImages.reduce((total, image) => total + image.bytes, 0);
const cssSaved = cssBytesBefore - cssBytesAfter;
const totalSaved = cssSaved + removedImageBytes;
const percent = cssBytesBefore ? ((cssSaved / cssBytesBefore) * 100).toFixed(1) : '0.0';

console.log(`Production optimization complete:`);
console.log(`- CSS: ${cssBytesBefore.toLocaleString()} -> ${cssBytesAfter.toLocaleString()} bytes (${percent}% smaller)`);
console.log(`- Unreferenced images removed: ${removedImages.length} (${removedImageBytes.toLocaleString()} bytes)`);
console.log(`- Total output reduction: ${totalSaved.toLocaleString()} bytes`);
