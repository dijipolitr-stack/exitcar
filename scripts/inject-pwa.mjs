// ExitCar — PWA <head> etiketlerini tüm HTML sayfalarına enjekte eder (marker korumalı).
// Mutlak yollar kullanır; prerender bunları yeniden yazmaz, /en /ar altında da çalışır.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'scripts', 'styles', 'js', 'assets']);
const SKIP_FILES = new Set(['offline.html']); // kendi PWA başlığı var, hedef değil

const BLOCK = `
  <!-- PWA -->
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#F30006">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="ExitCar">
  <script src="/js/pwa.js" defer></script>
`;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), acc);
    } else if (e.name.endsWith('.html') && !SKIP_FILES.has(e.name)) {
      acc.push(path.join(dir, e.name));
    }
  }
  return acc;
}

let injected = 0, skipped = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('<!-- PWA -->')) { skipped++; continue; }
  const idx = html.indexOf('</head>');
  if (idx === -1) { console.log('  ⚠ </head> yok, atlandı:', path.relative(ROOT, file)); continue; }
  html = html.slice(0, idx) + BLOCK + html.slice(idx);
  fs.writeFileSync(file, html, 'utf8');
  injected++;
  console.log('  ✓', path.relative(ROOT, file));
}
console.log(`\n✅ ${injected} sayfaya PWA başlığı eklendi, ${skipped} zaten vardı.`);
