// ============================================================
// ExitCar — Dil Başına Statik Ön-Render (SEO)
// ------------------------------------------------------------
// Kaynak sayfaları (Türkçe) okur, js/i18n.js'i jsdom içinde çalıştırıp
// EN/RU/DE/AR çevirilerini uygular ve /en, /ru, /de, /ar altına
// statik, taranabilir HTML üretir. hreflang + canonical + og dil başına ayarlanır.
//
// Çalıştırma:  npm run build:i18n   (içerik değişince yeniden çalıştır)
// ============================================================
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BASE = 'https://exitcar.com';            // alan adı belli olunca burayı güncelle
const LANGS = ['en', 'ru', 'de', 'ar'];        // tr = kök, ön-render gerekmez
const PAGES = ['index.html', 'search.html', 'reservation.html', 'driver-info.html', 'payment.html'];
const OG_LOCALE = { en: 'en_US', ru: 'ru_RU', de: 'de_DE', ar: 'ar_AR' };

const i18nSrc = fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8');

let count = 0;
for (const lang of LANGS) {
  for (const page of PAGES) {
    const srcHtml = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const isIndex = page === 'index.html';
    const urlPath = isIndex ? `/${lang}/` : `/${lang}/${page}`;
    const selfUrl = BASE + urlPath;

    const dom = new JSDOM(srcHtml, {
      url: selfUrl,
      runScripts: 'outside-only',
      virtualConsole: new VirtualConsole(),   // jsdom CSS/JS uyarılarını sustur
      pretendToBeVisual: true,
    });
    const { window } = dom;
    const { document } = window;

    // i18n.js'i çalıştır → URL yolundan dili algılar, t()/fmtPrice()/ecApply() tanımlanır
    window.eval(i18nSrc);
    window.ecApply(document);                  // statik metin + fiyatları çevir
    if (typeof window.ecRenderSwitcher === 'function') window.ecRenderSwitcher();

    // <html lang/dir> garantile
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    // Kök-göreceli varlık yollarını ../ ile düzelt (alt klasördeyiz)
    document.querySelectorAll('link[href], script[src], img[src]').forEach(el => {
      const attr = el.hasAttribute('href') ? 'href' : 'src';
      const v = el.getAttribute(attr);
      if (v && /^(?:\.\/)?(?:styles|js|assets)\//.test(v)) {
        el.setAttribute(attr, '../' + v.replace(/^\.\//, ''));
      }
    });

    // canonical + og:url + og:locale → bu sayfaya özel
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', selfUrl);
    document.querySelectorAll('meta[property="og:url"]').forEach(m => m.setAttribute('content', selfUrl));
    document.querySelectorAll('meta[property="og:locale"]').forEach(m => m.setAttribute('content', OG_LOCALE[lang]));

    // FAQ JSON-LD'yi dile çevir (yalnızca index)
    const faq = document.getElementById('faq-jsonld');
    if (faq && typeof window.t === 'function') {
      const data = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [] };
      for (let i = 1; i <= 5; i++) {
        data.mainEntity.push({
          '@type': 'Question',
          name: window.t('faq.q' + i),
          acceptedAnswer: { '@type': 'Answer', text: window.t('faq.a' + i) },
        });
      }
      faq.textContent = '\n' + JSON.stringify(data, null, 2) + '\n';
    }

    const outDir = path.join(ROOT, lang);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, page), dom.serialize(), 'utf8');
    count++;
    console.log('  ✓', urlPath + (isIndex ? '' : ''));
  }
}
console.log(`\n✅ ${count} sayfa ön-render edildi (${LANGS.length} dil × ${PAGES.length} sayfa).`);
