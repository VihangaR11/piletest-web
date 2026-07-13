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
const attributePattern = /(?:href|src|data-src)=["']([^"']+)["']/g;

for (const file of htmlFiles) {
  const page = relative(distRoot, file).replaceAll('\\', '/');
  const html = readFileSync(file, 'utf8');

  if (html.includes('http://localhost') || html.includes('http://127.0.0.1')) {
    errors.push(`${page}: contains a localhost production dependency`);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
  for (const id of new Set(ids.filter((id, index) => ids.indexOf(id) !== index))) {
    errors.push(`${page}: contains duplicate id "${id}"`);
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
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(rawReference)) continue;

    let reference = rawReference.split('#')[0].split('?')[0];
    try { reference = decodeURIComponent(reference); } catch { /* Report the unresolved value below. */ }

    let target;
    if (reference === '/piletest-web' || reference === '/piletest-web/') {
      target = 'index.html';
    } else if (reference.startsWith('/piletest-web/')) {
      target = reference.slice('/piletest-web/'.length);
    } else if (reference.startsWith('/')) {
      target = reference.slice(1);
    } else {
      target = posix.normalize(posix.join(dirname(page).replaceAll('\\', '/'), reference));
    }

    if (target.endsWith('/')) target += 'index.html';
    if (!relativeFiles.has(target)) errors.push(`${page}: missing internal resource ${rawReference}`);
  }
}

if (relativeFiles.has('admin.html')) {
  errors.push('admin.html must not be present in the public deployment');
}

if (process.env.CI === 'true') {
  const contactHtml = readFileSync(join(distRoot, 'contact.html'), 'utf8');
  if (!/data-formspree-endpoint="https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+"/.test(contactHtml)) {
    errors.push('contact.html is missing a valid Formspree endpoint; configure FORMSPREE_ENDPOINT');
  }
}

if (errors.length) {
  console.error(`Build validation failed with ${errors.length} issue(s):`);
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Build validation passed: ${htmlFiles.length} HTML pages and ${relativeFiles.size} files checked.`);
