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
const PAGES = ['index.html', 'search.html', 'reservation.html', 'driver-info.html', 'payment.html', 'antalya-havalimani-arac-kiralama.html', 'antalya-arac-kiralama.html', 'antalya-kemer-arac-kiralama.html', 'antalya-belek-arac-kiralama.html', 'antalya-side-arac-kiralama.html', 'blog/index.html', 'hakkimizda.html', 'iletisim.html'];
// KVKK, gizlilik, kullanım koşulları — yalnızca Türkçe yayımlanır (Türk hukuku), prerender'a dahil değil.

// Lokasyon sayfaları için breadcrumb son madde adının kaynağı (page → i18n key)
const BREADCRUMB_PAGE_TITLE = {
  'antalya-havalimani-arac-kiralama.html': 'ayt.h1',
  'antalya-arac-kiralama.html': 'ant.h1',
  'antalya-kemer-arac-kiralama.html': 'kemer.h1',
  'antalya-belek-arac-kiralama.html': 'belek.h1',
  'antalya-side-arac-kiralama.html':  'side.h1',
};

// FAQ JSON-LD'lerini dile çevirmek için: script id → { count, qPrefix, aPrefix }
const FAQ_REBUILD = {
  'faq-jsonld':       { count: 5, qPrefix: 'faq.q',      aPrefix: 'faq.a' },     // anasayfa
  'faq-ayt-jsonld':   { count: 4, qPrefix: 'ayt.faqQ',   aPrefix: 'ayt.faqA' },
  'faq-ant-jsonld':   { count: 4, qPrefix: 'ant.faqQ',   aPrefix: 'ant.faqA' },
  'faq-kemer-jsonld': { count: 3, qPrefix: 'kemer.faqQ', aPrefix: 'kemer.faqA' },
  'faq-belek-jsonld': { count: 3, qPrefix: 'belek.faqQ', aPrefix: 'belek.faqA' },
  'faq-side-jsonld':  { count: 3, qPrefix: 'side.faqQ',  aPrefix: 'side.faqA' },
};
const HOME_LABEL = { en: 'Home', ru: 'Главная', de: 'Startseite', ar: 'الرئيسية' };
const BLOG_LABEL = { en: 'Blog', ru: 'Блог', de: 'Blog', ar: 'المدونة' };

// Makale slug haritası: blog index'ten makale linklerini dile göre yeniden yazmak için
const ARTICLE_SLUGS = {
  article1: {
    tr: 'yabancilar-icin-arac-kiralama-rehberi.html',
    en: 'car-rental-turkey-foreign-tourist-guide.html',
    ru: 'arenda-avto-turtsiya-dlya-inostrantsev.html',
    de: 'mietwagen-tuerkei-fuer-auslaender.html',
    ar: 'car-rental-turkey-foreign-tourist-guide.html',
  },
  article2: {
    tr: 'filo-yonetimi-rehberi.html',
    en: 'fleet-management-guide.html',
    ru: 'gid-po-upravleniyu-avtoparkom.html',
    de: 'flottenmanagement-leitfaden.html',
    ar: 'fleet-management-guide.html',
  },
  article3: {
    tr: 'arac-kiralama-hizmetleri-rehberi.html',
    en: 'car-rental-services-guide.html',
    ru: 'gid-po-uslugam-arendy-avto.html',
    de: 'mietwagen-leistungen-uebersicht.html',
    ar: 'car-rental-services-guide.html',
  },
};
const OG_LOCALE = { en: 'en_US', ru: 'ru_RU', de: 'de_DE', ar: 'ar_AR' };

const i18nSrc = fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8');

let count = 0;
for (const lang of LANGS) {
  for (const page of PAGES) {
    const srcHtml = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const isIndex = page === 'index.html';
    const isDirIndex = page.endsWith('/index.html');                 // örn. blog/index.html
    const urlPath = isIndex
      ? `/${lang}/`
      : isDirIndex
        ? `/${lang}/${page.replace(/index\.html$/, '')}`              // /lang/blog/
        : `/${lang}/${page}`;
    const selfUrl = BASE + urlPath;
    // Sayfa derinliği → kök varlıklara kaç ".." gerekli ("blog/index.html" = 2 seviye)
    const depth = page.split('/').length;
    const upPrefix = '../'.repeat(depth);

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

    // Kök-göreceli varlık yollarını derinliğe göre düzelt (sayfa derinliği × "../")
    document.querySelectorAll('link[href], script[src], img[src]').forEach(el => {
      const attr = el.hasAttribute('href') ? 'href' : 'src';
      const v = el.getAttribute(attr);
      if (v && /^(?:\.\/)?(?:styles|js|assets)\//.test(v)) {
        el.setAttribute(attr, upPrefix + v.replace(/^\.\//, ''));
      }
    });
    // Makale slug'larını dile göre yeniden yaz (blog index'i için)
    document.querySelectorAll('a[data-slug-key]').forEach(a => {
      const key = a.getAttribute('data-slug-key');
      const slug = ARTICLE_SLUGS[key]?.[lang];
      if (slug) a.setAttribute('href', slug);
    });

    // canonical + og:url + og:locale → bu sayfaya özel
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', selfUrl);
    document.querySelectorAll('meta[property="og:url"]').forEach(m => m.setAttribute('content', selfUrl));
    document.querySelectorAll('meta[property="og:locale"]').forEach(m => m.setAttribute('content', OG_LOCALE[lang]));

    // FAQ JSON-LD'lerini dile çevir (anasayfa + lokasyon sayfaları — generic)
    if (typeof window.t === 'function') {
      for (const [scriptId, cfg] of Object.entries(FAQ_REBUILD)) {
        const el = document.getElementById(scriptId);
        if (!el) continue;
        const data = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [] };
        for (let i = 1; i <= cfg.count; i++) {
          data.mainEntity.push({
            '@type': 'Question',
            name: window.t(cfg.qPrefix + i),
            acceptedAnswer: { '@type': 'Answer', text: window.t(cfg.aPrefix + i) },
          });
        }
        el.textContent = '\n' + JSON.stringify(data, null, 2) + '\n';
      }
    }

    // Lokasyon sayfası breadcrumb'unu dile çevir
    const bc = document.getElementById('breadcrumb-jsonld');
    if (bc && typeof window.t === 'function' && BREADCRUMB_PAGE_TITLE[page]) {
      const homeUrl = (lang === 'tr') ? `${BASE}/` : `${BASE}/${lang}/`;
      const data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: HOME_LABEL[lang] || 'Anasayfa', item: homeUrl },
          { '@type': 'ListItem', position: 2, name: window.t(BREADCRUMB_PAGE_TITLE[page]), item: selfUrl },
        ],
      };
      bc.textContent = '\n' + JSON.stringify(data, null, 2) + '\n';
    }

    const outFile = path.join(ROOT, lang, page);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, dom.serialize(), 'utf8');
    count++;
    console.log('  ✓', urlPath + (isIndex ? '' : ''));
  }
}
console.log(`\n✅ ${count} sayfa ön-render edildi (${LANGS.length} dil × ${PAGES.length} sayfa).`);
