import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';

const projectRoot = process.cwd();
const distRoot = join(projectRoot, 'dist');
const errors = [];

if (!existsSync(distRoot)) {
  console.error('Validation failed: dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const absolute = join(directory, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});

const files = walk(distRoot);
const relativeFiles = new Set(files.map(file => relative(distRoot, file).replaceAll('\\', '/')));
const htmlFiles = files.filter(file => file.endsWith('.html'));
const cssFiles = files.filter(file => file.endsWith('.css'));
const jsFiles = files.filter(file => file.endsWith('.js'));
const htmlDocuments = new Map(htmlFiles.map(file => {
  const page = relative(distRoot, file).replaceAll('\\', '/');
  return [page, readFileSync(file, 'utf8')];
}));
const idsByPage = new Map([...htmlDocuments].map(([page, html]) => [
  page,
  new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]))
]));
const attributePattern = /(?:href|src|data-src)=["']([^"']+)["']/g;

const cssBytes = cssFiles.reduce((total, file) => total + readFileSync(file).byteLength, 0);
const jsBytes = jsFiles.reduce((total, file) => total + readFileSync(file).byteLength, 0);
if (cssBytes > 150_000) errors.push(`CSS performance budget exceeded: ${cssBytes.toLocaleString()} bytes`);
if (jsBytes > 30_000) errors.push(`JavaScript performance budget exceeded: ${jsBytes.toLocaleString()} bytes`);
if (files.some(file => file.endsWith('.map'))) errors.push('production output contains source maps');

const resolveTarget = (page, reference) => {
  if (!reference) return page;
  if (reference === '/piletest-web' || reference === '/piletest-web/') return 'index.html';
  if (reference.startsWith('/piletest-web/')) return reference.slice('/piletest-web/'.length);
  if (reference.startsWith('/')) return reference.slice(1);
  return posix.normalize(posix.join(dirname(page).replaceAll('\\', '/'), reference));
};

for (const file of htmlFiles) {
  const page = relative(distRoot, file).replaceAll('\\', '/');
  const html = htmlDocuments.get(page);

  if (html.includes('http://localhost') || html.includes('http://127.0.0.1')) {
    errors.push(`${page}: contains a localhost production dependency`);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
  for (const id of new Set(ids.filter((id, index) => ids.indexOf(id) !== index))) {
    errors.push(`${page}: contains duplicate id "${id}"`);
  }

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const mainCount = (html.match(/<main\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${page}: expected exactly one h1, found ${h1Count}`);
  if (mainCount !== 1) errors.push(`${page}: expected exactly one main landmark, found ${mainCount}`);
  if (!idsByPage.get(page).has('content-start')) errors.push(`${page}: main content has no content-start target`);
  if (!/<html\b[^>]*\blang=["']en["']/i.test(html)) errors.push(`${page}: document language is missing or incorrect`);
  if (!/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["'][^"']+["']/i.test(html)) errors.push(`${page}: meta description is missing`);
  if (!/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']https:\/\/[^"']+["']/i.test(html)) errors.push(`${page}: absolute canonical URL is missing`);

  for (const match of html.matchAll(/<button\b[^>]*>/gi)) {
    if (!/\btype=["'](?:button|submit|reset)["']/i.test(match[0])) errors.push(`${page}: button is missing an explicit type`);
  }

  for (const match of html.matchAll(/<iframe\b[^>]*>/gi)) {
    if (!/\btitle=["'][^"']+["']/i.test(match[0])) errors.push(`${page}: iframe is missing a title`);
  }

  for (const match of html.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)) {
    if (!/\brel=["'][^"']*\bnoopener\b[^"']*["']/i.test(match[0])) {
      errors.push(`${page}: target="_blank" link is missing rel="noopener"`);
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[0])) errors.push(`${page}: image is missing alt text`);
  }

  for (const match of html.matchAll(attributePattern)) {
    const rawReference = match[1];
    if (/^javascript:/i.test(rawReference)) {
      errors.push(`${page}: contains an unsafe javascript URL`);
      continue;
    }
    if (/^(?:https?:|mailto:|tel:|data:)/i.test(rawReference)) continue;

    const [rawPath, rawFragment = ''] = rawReference.split('#', 2);
    let reference = rawPath.split('?')[0];
    try { reference = decodeURIComponent(reference); } catch { /* Report the unresolved value below. */ }
    let target = resolveTarget(page, reference);

    if (target.endsWith('/')) target += 'index.html';
    if (!relativeFiles.has(target)) errors.push(`${page}: missing internal resource ${rawReference}`);

    if (rawFragment && idsByPage.has(target)) {
      let fragment = rawFragment;
      try { fragment = decodeURIComponent(rawFragment); } catch { /* Report the unresolved value below. */ }
      if (!idsByPage.get(target).has(fragment)) errors.push(`${page}: missing fragment target ${rawReference}`);
    }
  }
}

if (relativeFiles.has('admin.html')) {
  errors.push('admin.html must not be present in the public deployment');
}

const contactHtml = readFileSync(join(distRoot, 'contact.html'), 'utf8');
const hasFormspreeEndpoint = /data-formspree-endpoint="https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+"/.test(contactHtml);
const contactScript = readFileSync(join(distRoot, 'contact.js'), 'utf8');
const hasEmailFallback = contactScript.includes('mailto:info@piletest.lk?subject=');
const notFoundHtml = htmlDocuments.get('404.html');
if (!/<meta\b[^>]*name="robots"[^>]*content="noindex, follow"/i.test(notFoundHtml)) {
  errors.push('404.html: missing noindex directive');
}

const sitemapPath = join(distRoot, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  errors.push('sitemap.xml is missing');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  for (const page of htmlDocuments.keys()) {
    if (page === '404.html') continue;
    const expectedUrl = `https://vihangar11.github.io/piletest-web/${page}`;
    if (!sitemap.includes(`<loc>${expectedUrl}</loc>`)) errors.push(`sitemap.xml: missing ${page}`);
  }
}

if (!hasFormspreeEndpoint && !hasEmailFallback) {
  errors.push('contact form has neither Formspree delivery nor an email fallback');
}

if (errors.length) {
  console.error(`Build validation failed with ${errors.length} issue(s):`);
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  process.exit(1);
}

if (!hasFormspreeEndpoint) console.log('Contact form: email-client fallback active (Formspree endpoint not configured).');

console.log(`Build validation passed: ${htmlFiles.length} HTML pages and ${relativeFiles.size} files checked.`);
console.log(`Performance budgets passed: ${cssBytes.toLocaleString()} CSS bytes, ${jsBytes.toLocaleString()} JavaScript bytes.`);
