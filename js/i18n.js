// ============================================================
// ExitCar — Çok Dilli Altyapı (i18n) + Para Birimi Dönüşümü
// Diller: TR (varsayılan), EN, RU, DE, AR (RTL)
// ------------------------------------------------------------
// Bu dosya HER sayfada, diğer script'lerden ÖNCE yüklenir.
// Çeviri eklemek/düzeltmek için aşağıdaki T sözlüğünü düzenle.
// ============================================================

// ===== DESTEKLENEN DİLLER =====
const EC_LANGS = ['tr', 'en', 'ru', 'de', 'ar'];

// ===== PARA BİRİMİ AYARI =====
// rate = 1 birim yabancı para kaç TL eder (taban fiyatlar TL'dir).
// >>> Kurları güncel tutmak için buradaki sayıları değiştir. <<<
const EC_CUR = {
  tr: { rate: 1,    loc: 'tr-TR', pre: '',  suf: ' TL' },
  en: { rate: 47,   loc: 'en-US', pre: '€', suf: ''    },
  de: { rate: 47,   loc: 'de-DE', pre: '€', suf: ''    },
  ru: { rate: 0.50, loc: 'ru-RU', pre: '',  suf: ' ₽'  },
  ar: { rate: 42,   loc: 'en-US', pre: '$', suf: ''    },
};

// ===== AKTİF DİL (script yüklenirken senkron belirlenir) =====
// Öncelik: URL yolu (/en/, /ru/, /de/, /ar/) > localStorage > tarayıcı dili > tr
// SEO için her dilin ayrı statik URL'i vardır (ön-render). URL yolu her zaman kazanır;
// böylece /en/ sayfası Google için daima İngilizce, kullanıcı tercihinden bağımsızdır.
function ecPathLang() {
  const m = (location.pathname || '').match(/^\/(en|ru|de|ar)(\/|$)/);
  return m ? m[1] : null;
}
function ecSaved() { try { return localStorage.getItem('ec_lang'); } catch (e) { return null; } }
const EC_SAVED_BEFORE = ecSaved();           // bu yüklemeden ÖNCEki tercih (yönlendirme için)
function ecDetectLang() {
  const path = ecPathLang();
  if (path) return path;                     // /en/ vb. her zaman kazanır (SEO)
  const saved = ecSaved();
  if (saved && EC_LANGS.includes(saved)) return saved;
  return 'tr';                               // kök varsayılanı Türkçe (botlar tutarlı indeksler)
}
let EC_LANG = ecDetectLang();
// Aktif dili sakla — kök (Türkçe) huni sayfaları bu tercihi okuyup aynı dilde kalır.
try { localStorage.setItem('ec_lang', EC_LANG); } catch (e) {}

// Kök yolun temizi (dil ön-eki olmadan), örn. "/en/search.html" -> "/search.html"
function ecBasePath() {
  let p = (location.pathname || '/').replace(/^\/(en|ru|de|ar)(?=\/|$)/, '');
  return p === '' ? '/' : p;
}

// İlk girişte otomatik dil yönlendirmesi (yalnızca İNSANLAR; botlar Türkçe kökte kalır → SEO temiz)
(function ecRootRedirect() {
  if (ecPathLang()) return;                  // zaten bir dil URL'indeyiz
  const ua = navigator.userAgent || '';
  if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|google|yandex|baidu|duckduck|pinterest|slackbot/i.test(ua)) return;
  let target = EC_SAVED_BEFORE;              // önce açıkça kaydedilmiş tercih
  if (!target || !EC_LANGS.includes(target)) {
    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    target = EC_LANGS.includes(nav) ? nav : 'tr';
  }
  if (target && target !== 'tr') {
    const base = ecBasePath();
    location.replace('/' + target + (base === '/' ? '/' : base) + (location.search || ''));
  }
})();

// ===== ÇEVİRİ FONKSİYONU =====
function t(key) {
  const e = EC_T[key];
  if (!e) return key;
  return e[EC_LANG] || e.tr || key;
}

// ===== FİYAT BİÇİMLENDİRME (taban TL → aktif para birimi) =====
function fmtPrice(tryAmount) {
  const c = EC_CUR[EC_LANG] || EC_CUR.tr;
  const n = Math.round(Number(tryAmount) / c.rate);
  return c.pre + n.toLocaleString(c.loc) + c.suf;
}

// ===== DİL DEĞİŞTİR (kaydet + ilgili dilin URL'ine git) =====
// Her dilin ayrı URL'i var: tr -> kök, diğerleri -> /<lang>/... (ön-render edilmiş).
function EC_setLang(lang) {
  if (!EC_LANGS.includes(lang)) return;
  try { localStorage.setItem('ec_lang', lang); } catch (e) {}
  const base = ecBasePath();
  const target = (lang === 'tr') ? base : ('/' + lang + (base === '/' ? '/' : base));
  location.href = target + (location.search || '');
}

// ===== FLATPICKR LOCALE EŞLEMESİ =====
function EC_fpLocale() {
  return { tr: 'tr', de: 'de', ru: 'ru', ar: 'ar' }[EC_LANG] || 'default';
}

// ===== <html> lang + dir (mümkün olan en erken) =====
(function () {
  const html = document.documentElement;
  html.lang = EC_LANG;
  html.dir = (EC_LANG === 'ar') ? 'rtl' : 'ltr';
})();

// ===== DOM'A ÇEVİRİYİ UYGULA =====
function ecApply(root) {
  root = root || document;

  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
  root.querySelectorAll('[data-i18n-content]').forEach(el => {
    el.setAttribute('content', t(el.getAttribute('data-i18n-content')));
  });
  // Sabit fiyatlar: data-price (tam fiyat), data-price-day (+fiyat/gün)
  root.querySelectorAll('[data-price]').forEach(el => {
    el.textContent = fmtPrice(el.getAttribute('data-price'));
  });
  root.querySelectorAll('[data-price-day]').forEach(el => {
    el.textContent = '+' + fmtPrice(el.getAttribute('data-price-day')) + t('common.perDay');
  });
}

// ===== DİL DEĞİŞTİRİCİ ARAYÜZÜ + STİLLER =====
function ecInjectStyles() {
  const css = `
  .ec-lang-switcher{position:relative;display:inline-flex;align-items:center}
  .ec-lang-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:1.5px solid #E5E7EB;
    background:#fff;border-radius:8px;font-size:13px;font-weight:700;color:#374151;cursor:pointer;font-family:inherit}
  .ec-lang-btn:hover{border-color:#F30006}
  .ec-lang-menu{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #E5E7EB;
    border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.12);padding:6px;min-width:150px;z-index:2000;display:none}
  .ec-lang-switcher.open .ec-lang-menu{display:block}
  [dir=rtl] .ec-lang-menu{right:auto;left:0}
  .ec-lang-opt{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:none;background:none;
    border-radius:8px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;text-align:start;font-family:inherit}
  .ec-lang-opt:hover{background:#F9FAFB}
  .ec-lang-opt.active{background:#FEE2E2;color:#F30006}
  .ec-lang-flag{font-size:16px}
  /* --- Genel RTL düzeltmeleri (Arapça) --- */
  [dir=rtl] .nav-links a,[dir=rtl] .footer-col,[dir=rtl] .info-box,[dir=rtl] .ins-feat{text-align:right}
  [dir=rtl] .field-icon{left:auto;right:14px}
  [dir=rtl] .field-input input,[dir=rtl] .field-input select{padding-left:14px;padding-right:38px}
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}

function ecRenderSwitcher() {
  const mount = document.getElementById('ec-lang-mount');
  if (!mount) return;
  const langs = [
    { c: 'tr', flag: '🇹🇷', name: 'Türkçe' },
    { c: 'en', flag: '🇬🇧', name: 'English' },
    { c: 'ru', flag: '🇷🇺', name: 'Русский' },
    { c: 'de', flag: '🇩🇪', name: 'Deutsch' },
    { c: 'ar', flag: '🇸🇦', name: 'العربية' },
  ];
  const cur = langs.find(l => l.c === EC_LANG) || langs[0];
  mount.innerHTML = `
    <div class="ec-lang-switcher" id="ec-lang-sw">
      <button type="button" class="ec-lang-btn" onclick="document.getElementById('ec-lang-sw').classList.toggle('open')">
        <span class="ec-lang-flag">${cur.flag}</span><span>${cur.c.toUpperCase()}</span><span style="font-size:9px">▾</span>
      </button>
      <div class="ec-lang-menu">
        ${langs.map(l => `
          <button type="button" class="ec-lang-opt ${l.c === EC_LANG ? 'active' : ''}" onclick="EC_setLang('${l.c}')">
            <span class="ec-lang-flag">${l.flag}</span><span>${l.name}</span>
          </button>`).join('')}
      </div>
    </div>`;
  document.addEventListener('click', e => {
    const sw = document.getElementById('ec-lang-sw');
    if (sw && !e.target.closest('#ec-lang-sw')) sw.classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  ecInjectStyles();
  ecApply(document);
  ecRenderSwitcher();
});

// Diğer script'lerin kullanması için global erişim
window.t = t;
window.fmtPrice = fmtPrice;
window.EC_LANG = EC_LANG;

// ============================================================
// ÇEVİRİ SÖZLÜĞÜ  (anahtar → { tr, en, ru, de, ar })
// ============================================================
const EC_T = {

  // ---------- ORTAK ----------
  'common.perDay':   { tr: '/gün', en: '/day', ru: '/день', de: '/Tag', ar: '/يوم' },
  'common.days':     { tr: 'Gün', en: 'Days', ru: 'дн.', de: 'Tage', ar: 'يوم' },
  'common.person':   { tr: 'Kişi', en: 'Persons', ru: 'чел.', de: 'Personen', ar: 'أشخاص' },
  'common.ac':       { tr: 'Klima', en: 'A/C', ru: 'Кондиционер', de: 'Klima', ar: 'تكييف' },
  'common.orSimilar':{ tr: 'veya benzeri', en: 'or similar', ru: 'или аналог', de: 'oder ähnlich', ar: 'أو ما شابه' },
  'common.login':    { tr: 'Üye Ol / Giriş', en: 'Sign Up / Login', ru: 'Регистрация / Вход', de: 'Registrieren / Login', ar: 'تسجيل / دخول' },

  // ---------- NAVBAR ----------
  'nav.rental':    { tr: '🚗 Araç Kiralama', en: '🚗 Car Rental', ru: '🚗 Аренда авто', de: '🚗 Autovermietung', ar: '🚗 تأجير السيارات' },
  'nav.transfer':  { tr: '🔄 Transfer', en: '🔄 Transfer', ru: '🔄 Трансфер', de: '🔄 Transfer', ar: '🔄 النقل' },
  'nav.corporate': { tr: '🏢 Kurumsal', en: '🏢 Corporate', ru: '🏢 Бизнес', de: '🏢 Firmenkunden', ar: '🏢 الشركات' },
  'nav.campaigns': { tr: '🎁 Kampanyalar', en: '🎁 Deals', ru: '🎁 Акции', de: '🎁 Angebote', ar: '🎁 العروض' },
  'nav.help':      { tr: '❓ Yardım', en: '❓ Help', ru: '❓ Помощь', de: '❓ Hilfe', ar: '❓ المساعدة' },
  'nav.blog':      { tr: '📘 Blog', en: '📘 Blog', ru: '📘 Блог', de: '📘 Blog', ar: '📘 المدونة' },

  // ---------- HERO ----------
  'hero.title':    { tr: 'Kiralık Araç Fiyatlarını<br><span>Anında Karşılaştır</span>', en: 'Compare Car Rental Prices<br><span>Instantly</span>', ru: 'Сравните цены на аренду<br><span>Мгновенно</span>', de: 'Mietwagenpreise<br><span>Sofort Vergleichen</span>', ar: 'قارن أسعار تأجير السيارات<br><span>فوراً</span>' },
  'hero.subtitle': { tr: 'Türkiye genelinde yüzlerce noktadan, en uygun fiyatlı araçları saniyeler içinde listeleyin.', en: 'List the best-priced cars from hundreds of locations across Türkiye in seconds.', ru: 'Найдите автомобили по лучшим ценам в сотнях точек по всей Турции за секунды.', de: 'Finden Sie in Sekunden die günstigsten Fahrzeuge an Hunderten Standorten in der Türkei.', ar: 'اعرض السيارات بأفضل الأسعار من مئات المواقع في تركيا خلال ثوانٍ.' },

  'search.tabDomestic': { tr: '🇹🇷 Yurt İçi', en: '🇹🇷 Domestic', ru: '🇹🇷 По стране', de: '🇹🇷 Inland', ar: '🇹🇷 داخلي' },
  'search.tabAbroad':   { tr: '🌍 Yurt Dışı', en: '🌍 Abroad', ru: '🌍 За рубежом', de: '🌍 Ausland', ar: '🌍 خارجي' },
  'search.tabTransfer': { tr: '🚐 Transfer', en: '🚐 Transfer', ru: '🚐 Трансфер', de: '🚐 Transfer', ar: '🚐 نقل' },
  'search.diffReturn':  { tr: 'Farklı bir noktaya bırak', en: 'Return to a different location', ru: 'Вернуть в другом месте', de: 'An anderem Ort zurückgeben', ar: 'الإعادة في موقع مختلف' },
  'search.pickupPlace': { tr: '📍 Alış Yeri', en: '📍 Pick-up Location', ru: '📍 Место получения', de: '📍 Abholort', ar: '📍 مكان الاستلام' },
  'search.returnPlace': { tr: '📍 İade Yeri', en: '📍 Return Location', ru: '📍 Место возврата', de: '📍 Rückgabeort', ar: '📍 مكان الإعادة' },
  'search.placeholder': { tr: 'Şehir, havalimanı veya ofis', en: 'City, airport or office', ru: 'Город, аэропорт или офис', de: 'Stadt, Flughafen oder Büro', ar: 'مدينة، مطار أو مكتب' },
  'search.pickupDate':  { tr: '📅 Alış Tarihi', en: '📅 Pick-up Date', ru: '📅 Дата получения', de: '📅 Abholdatum', ar: '📅 تاريخ الاستلام' },
  'search.pickupTime':  { tr: '🕐 Alış Saati', en: '🕐 Pick-up Time', ru: '🕐 Время получения', de: '🕐 Abholzeit', ar: '🕐 وقت الاستلام' },
  'search.returnDate':  { tr: '📅 İade Tarihi', en: '📅 Return Date', ru: '📅 Дата возврата', de: '📅 Rückgabedatum', ar: '📅 تاريخ الإعادة' },
  'search.returnTime':  { tr: '🕐 İade Saati', en: '🕐 Return Time', ru: '🕐 Время возврата', de: '🕐 Rückgabezeit', ar: '🕐 وقت الإعادة' },
  'search.datePh':      { tr: 'Tarih seçin', en: 'Select date', ru: 'Выберите дату', de: 'Datum wählen', ar: 'اختر التاريخ' },
  'search.btn':         { tr: '🔍 Araç Ara', en: '🔍 Search Cars', ru: '🔍 Найти авто', de: '🔍 Auto suchen', ar: '🔍 ابحث عن سيارة' },

  // ---------- STATS ----------
  'stats.cars':         { tr: 'Kiralık Araç', en: 'Rental Cars', ru: 'Автомобилей', de: 'Mietwagen', ar: 'سيارة للإيجار' },
  'stats.cities':       { tr: 'İl Geneli Hizmet', en: 'Provinces Served', ru: 'Провинций', de: 'Provinzen', ar: 'محافظة' },
  'stats.partners':     { tr: 'Ortak Firma', en: 'Partner Companies', ru: 'Компаний-партнёров', de: 'Partnerfirmen', ar: 'شركة شريكة' },
  'stats.support':      { tr: 'Müşteri Desteği', en: 'Customer Support', ru: 'Поддержка', de: 'Kundensupport', ar: 'دعم العملاء' },
  'stats.satisfaction': { tr: 'Müşteri Memnuniyeti', en: 'Customer Satisfaction', ru: 'Довольных клиентов', de: 'Kundenzufriedenheit', ar: 'رضا العملاء' },

  // ---------- KATEGORİLER (ana sayfa) ----------
  'cat.tag':   { tr: 'Araç Tipleri', en: 'Car Types', ru: 'Типы авто', de: 'Fahrzeugtypen', ar: 'أنواع السيارات' },
  'cat.title': { tr: 'İhtiyacınıza Uygun Kiralık Araç', en: 'The Right Rental Car for You', ru: 'Аренда авто под ваши нужды', de: 'Der passende Mietwagen für Sie', ar: 'سيارة الإيجار المناسبة لك' },
  'cat.sub':   { tr: 'Ekonomikten lükse, kompakttan SUV\'a — her bütçeye uygun seçenekler', en: 'From economy to luxury, compact to SUV — options for every budget', ru: 'От эконома до люкса, от компакта до внедорожника — для любого бюджета', de: 'Von Economy bis Luxus, Kompakt bis SUV — für jedes Budget', ar: 'من الاقتصادية إلى الفاخرة، من المدمجة إلى الدفع الرباعي — خيارات لكل ميزانية' },
  'cat.from':  { tr: 'başlayan fiyatlarla', en: 'starting from', ru: 'от', de: 'ab', ar: 'تبدأ من' },
  'cat.rent':  { tr: 'Kirala →', en: 'Rent →', ru: 'Арендовать →', de: 'Mieten →', ar: '← استأجر' },

  'badge.economy': { tr: 'Ekonomi', en: 'Economy', ru: 'Эконом', de: 'Economy', ar: 'اقتصادية' },
  'badge.compact': { tr: 'Kompakt', en: 'Compact', ru: 'Компакт', de: 'Kompakt', ar: 'مدمجة' },
  'badge.suv':     { tr: 'SUV', en: 'SUV', ru: 'Внедорожник', de: 'SUV', ar: 'دفع رباعي' },
  'badge.van':     { tr: 'Van', en: 'Van', ru: 'Минивэн', de: 'Van', ar: 'فان' },
  'badge.premium': { tr: 'Premium', en: 'Premium', ru: 'Премиум', de: 'Premium', ar: 'فاخرة' },

  'spec.economy': { tr: 'Otomatik · Benzin · 5 Kişi', en: 'Automatic · Petrol · 5 Seats', ru: 'Автомат · Бензин · 5 мест', de: 'Automatik · Benzin · 5 Sitze', ar: 'أوتوماتيك · بنزين · 5 مقاعد' },
  'spec.compact': { tr: 'Otomatik · Benzin · 5 Kişi', en: 'Automatic · Petrol · 5 Seats', ru: 'Автомат · Бензин · 5 мест', de: 'Automatik · Benzin · 5 Sitze', ar: 'أوتوماتيك · بنزين · 5 مقاعد' },
  'spec.suv':     { tr: 'Otomatik · Dizel · 5 Kişi', en: 'Automatic · Diesel · 5 Seats', ru: 'Автомат · Дизель · 5 мест', de: 'Automatik · Diesel · 5 Sitze', ar: 'أوتوماتيك · ديزل · 5 مقاعد' },
  'spec.van':     { tr: 'Otomatik · Dizel · 9 Kişi', en: 'Automatic · Diesel · 9 Seats', ru: 'Автомат · Дизель · 9 мест', de: 'Automatik · Diesel · 9 Sitze', ar: 'أوتوماتيك · ديزل · 9 مقاعد' },
  'spec.premium': { tr: 'Otomatik · Benzin · 5 Kişi', en: 'Automatic · Petrol · 5 Seats', ru: 'Автомат · Бензин · 5 мест', de: 'Automatik · Benzin · 5 Sitze', ar: 'أوتوماتيك · بنزين · 5 مقاعد' },

  // ---------- AVANTAJLAR ----------
  'adv.tag':   { tr: 'Neden ExitCar?', en: 'Why ExitCar?', ru: 'Почему ExitCar?', de: 'Warum ExitCar?', ar: 'لماذا ExitCar؟' },
  'adv.title': { tr: 'ExitCar ile Araç Kiralama Avantajları', en: 'The Advantages of Renting with ExitCar', ru: 'Преимущества аренды с ExitCar', de: 'Die Vorteile der Anmietung bei ExitCar', ar: 'مزايا التأجير مع ExitCar' },
  'adv.support.title': { tr: '7/24 Destek', en: '24/7 Support', ru: 'Поддержка 24/7', de: '24/7 Support', ar: 'دعم 24/7' },
  'adv.support.text':  { tr: 'Uzman ekibimiz her an yanınızda. Rezervasyondan teslime kadar kesintisiz destek.', en: 'Our expert team is always with you. Uninterrupted support from booking to handover.', ru: 'Наша команда всегда рядом. Непрерывная поддержка от брони до выдачи.', de: 'Unser Expertenteam ist immer für Sie da. Lückenloser Support von Buchung bis Übergabe.', ar: 'فريقنا المتخصص معك دائماً. دعم متواصل من الحجز حتى التسليم.' },
  'adv.cheap.title': { tr: 'En Ucuz Fiyat', en: 'Lowest Price', ru: 'Лучшая цена', de: 'Bestpreis', ar: 'أرخص سعر' },
  'adv.cheap.text':  { tr: 'Yüzlerce araç seçeneği arasından en uygun fiyatı bulun, anında rezervasyon yapın.', en: 'Find the best price among hundreds of cars and book instantly.', ru: 'Найдите лучшую цену среди сотен авто и забронируйте мгновенно.', de: 'Finden Sie den besten Preis unter Hunderten Fahrzeugen und buchen Sie sofort.', ar: 'اعثر على أفضل سعر بين مئات السيارات واحجز فوراً.' },
  'adv.safe.title': { tr: 'Güvenli Kiralama', en: 'Safe Rental', ru: 'Безопасная аренда', de: 'Sichere Anmietung', ar: 'تأجير آمن' },
  'adv.safe.text':  { tr: 'Tam kasko, trafik sigortası ve her şey dahil paket seçenekleriyle güvenle yola çıkın.', en: 'Hit the road safely with full insurance, traffic insurance and all-inclusive packages.', ru: 'Отправляйтесь в путь безопасно с полным КАСКО и пакетами «всё включено».', de: 'Fahren Sie sicher mit Vollkasko, Haftpflicht und All-inclusive-Paketen.', ar: 'انطلق بأمان مع تأمين شامل وباقات تشمل كل شيء.' },
  'adv.turkey.title': { tr: 'Türkiye Geneli', en: 'Nationwide', ru: 'По всей Турции', de: 'Landesweit', ar: 'في كل تركيا' },
  'adv.turkey.text':  { tr: '81 ilde, tüm büyük havalimanlarında ve şehir merkezlerinde hizmet noktaları.', en: 'Service points in 81 provinces, all major airports and city centers.', ru: 'Точки обслуживания в 81 провинции, всех крупных аэропортах и центрах городов.', de: 'Servicepunkte in 81 Provinzen, allen großen Flughäfen und Stadtzentren.', ar: 'نقاط خدمة في 81 محافظة وجميع المطارات الكبرى ومراكز المدن.' },

  // ---------- PROMO ----------
  'promo.tag':   { tr: '🎉 Özel Kampanya', en: '🎉 Special Offer', ru: '🎉 Спецпредложение', de: '🎉 Sonderangebot', ar: '🎉 عرض خاص' },
  'promo.title': { tr: 'İlk Kiralamanıza %25 İndirim!', en: '25% Off Your First Rental!', ru: 'Скидка 25% на первую аренду!', de: '25% Rabatt auf Ihre erste Anmietung!', ar: 'خصم 25% على أول تأجير لك!' },
  'promo.sub':   { tr: 'ExitCar\'a üye olun, ilk rezervasyonunuzda anında indirim kazanın.', en: 'Sign up for ExitCar and get an instant discount on your first booking.', ru: 'Зарегистрируйтесь в ExitCar и получите мгновенную скидку на первую бронь.', de: 'Registrieren Sie sich bei ExitCar und erhalten Sie sofort Rabatt auf Ihre erste Buchung.', ar: 'سجّل في ExitCar واحصل على خصم فوري على أول حجز.' },
  'promo.btn':   { tr: 'Hemen Üye Ol →', en: 'Sign Up Now →', ru: 'Зарегистрироваться →', de: 'Jetzt registrieren →', ar: '← سجّل الآن' },

  // ---------- LOKASYONLAR ----------
  'loc.tag':        { tr: 'Popüler Destinasyonlar', en: 'Popular Destinations', ru: 'Популярные направления', de: 'Beliebte Reiseziele', ar: 'الوجهات الشائعة' },
  'loc.title':      { tr: 'En Çok Tercih Edilen Lokasyonlar', en: 'Most Preferred Locations', ru: 'Самые популярные локации', de: 'Die beliebtesten Standorte', ar: 'المواقع الأكثر طلباً' },
  'loc.fromSuffix': { tr: '’den başlayan fiyatlarla', en: ' and up', ru: ' и выше', de: ' und mehr', ar: ' فما فوق' },
  'city.istanbul':  { tr: '🏙️ İstanbul', en: '🏙️ Istanbul', ru: '🏙️ Стамбул', de: '🏙️ Istanbul', ar: '🏙️ إسطنبول' },
  'city.ankara':    { tr: '🏛️ Ankara', en: '🏛️ Ankara', ru: '🏛️ Анкара', de: '🏛️ Ankara', ar: '🏛️ أنقرة' },
  'city.izmir':     { tr: '🌊 İzmir', en: '🌊 Izmir', ru: '🌊 Измир', de: '🌊 Izmir', ar: '🌊 إزمير' },
  'city.antalya':   { tr: '🌴 Antalya', en: '🌴 Antalya', ru: '🌴 Анталья', de: '🌴 Antalya', ar: '🌴 أنطاليا' },
  'city.bodrum':    { tr: '⛵ Bodrum', en: '⛵ Bodrum', ru: '⛵ Бодрум', de: '⛵ Bodrum', ar: '⛵ بودروم' },
  'city.trabzon':   { tr: '🏔️ Trabzon', en: '🏔️ Trabzon', ru: '🏔️ Трабзон', de: '🏔️ Trabzon', ar: '🏔️ طرابزون' },

  // ---------- MARKALAR ----------
  'brands.tag':   { tr: 'Araç Markaları', en: 'Car Brands', ru: 'Марки авто', de: 'Automarken', ar: 'ماركات السيارات' },
  'brands.title': { tr: 'En Popüler Kiralık Araç Markaları', en: 'Most Popular Rental Car Brands', ru: 'Самые популярные марки авто', de: 'Beliebteste Mietwagenmarken', ar: 'أشهر ماركات سيارات الإيجار' },

  // ---------- SSS ----------
  'faq.tag':   { tr: 'Sık Sorulan Sorular', en: 'Frequently Asked Questions', ru: 'Частые вопросы', de: 'Häufige Fragen', ar: 'الأسئلة الشائعة' },
  'faq.title': { tr: 'Merak Ettikleriniz', en: 'What You Want to Know', ru: 'Что вас интересует', de: 'Was Sie wissen möchten', ar: 'ما تريد معرفته' },
  'faq.q1': { tr: 'ExitCar\'da araç kiralama nasıl yapılır?', en: 'How do I rent a car on ExitCar?', ru: 'Как арендовать авто на ExitCar?', de: 'Wie miete ich ein Auto bei ExitCar?', ar: 'كيف أستأجر سيارة عبر ExitCar؟' },
  'faq.a1': { tr: 'Web sitemiz üzerinden alış yeri, tarih ve saat bilgilerini girin. "Araç Ara" butonuna tıklayarak uygun araçları listeleyin, istediğiniz aracı seçin ve anında rezervasyon tamamlayın. 7/24 destek hattımızı da arayabilirsiniz.', en: 'Enter the pick-up location, date and time on our website. Click "Search Cars" to list available vehicles, choose your car and complete the booking instantly. You can also call our 24/7 support line.', ru: 'Укажите место получения, дату и время на нашем сайте. Нажмите «Найти авто», выберите автомобиль и завершите бронирование мгновенно. Также можно позвонить в поддержку 24/7.', de: 'Geben Sie Abholort, Datum und Uhrzeit auf unserer Website ein. Klicken Sie auf "Auto suchen", wählen Sie Ihr Fahrzeug und buchen Sie sofort. Sie können auch unsere 24/7-Hotline anrufen.', ar: 'أدخل مكان الاستلام والتاريخ والوقت على موقعنا. اضغط "ابحث عن سيارة" لعرض السيارات المتاحة، اختر سيارتك وأكمل الحجز فوراً. يمكنك أيضاً الاتصال بخط الدعم 24/7.' },
  'faq.q2': { tr: 'Araç kiralamak için hangi belgeler gerekli?', en: 'What documents are required to rent a car?', ru: 'Какие документы нужны для аренды?', de: 'Welche Dokumente sind für die Anmietung nötig?', ar: 'ما المستندات المطلوبة لتأجير سيارة؟' },
  'faq.a2': { tr: 'Geçerli sürücü belgesi, kimlik belgesi (TC kimlik veya pasaport) ve kredi kartı gereklidir. Bazı araç sınıflarında ek belgeler talep edilebilir.', en: 'A valid driver\'s license, an ID document (national ID or passport) and a credit card are required. Some car classes may require additional documents.', ru: 'Нужны действующие водительские права, документ, удостоверяющий личность (паспорт), и кредитная карта. Для некоторых классов авто могут потребоваться доп. документы.', de: 'Erforderlich sind ein gültiger Führerschein, ein Ausweisdokument (Personalausweis oder Reisepass) und eine Kreditkarte. Für einige Fahrzeugklassen können zusätzliche Dokumente nötig sein.', ar: 'يلزم رخصة قيادة سارية ووثيقة هوية (هوية وطنية أو جواز سفر) وبطاقة ائتمان. قد تتطلب بعض فئات السيارات مستندات إضافية.' },
  'faq.q3': { tr: 'Minimum yaş sınırı nedir?', en: 'What is the minimum age limit?', ru: 'Какой минимальный возраст?', de: 'Wie hoch ist das Mindestalter?', ar: 'ما الحد الأدنى للعمر؟' },
  'faq.a3': { tr: 'Çoğu araç için minimum yaş 21, minimum ehliyet süresi 1 yıldır. Bazı premium araçlarda bu şartlar farklılık gösterebilir. Genç sürücü paketi ile 19-21 yaş arasındaki sürücülere de hizmet sunulmaktadır.', en: 'For most cars the minimum age is 21 and the minimum license duration is 1 year. These conditions may differ for some premium cars. With the young driver package, drivers aged 19-21 are also served.', ru: 'Для большинства авто минимальный возраст — 21 год, стаж — 1 год. Для премиум-авто условия могут отличаться. С пакетом «молодой водитель» обслуживаются и водители 19-21 года.', de: 'Für die meisten Fahrzeuge gilt ein Mindestalter von 21 Jahren und mindestens 1 Jahr Führerscheinbesitz. Bei einigen Premium-Fahrzeugen können diese Bedingungen abweichen. Mit dem Jungfahrer-Paket werden auch Fahrer von 19-21 Jahren bedient.', ar: 'الحد الأدنى للعمر 21 عاماً ومدة الرخصة سنة واحدة لمعظم السيارات. قد تختلف هذه الشروط لبعض السيارات الفاخرة. مع باقة السائق الشاب، نخدم أيضاً السائقين من 19 إلى 21 عاماً.' },
  'faq.q4': { tr: 'İptal veya değişiklik yapabilir miyim?', en: 'Can I cancel or make changes?', ru: 'Могу ли я отменить или изменить?', de: 'Kann ich stornieren oder ändern?', ar: 'هل يمكنني الإلغاء أو التعديل؟' },
  'faq.a4': { tr: 'Evet! Rezervasyonunuzu kolayca iptal edebilir veya değiştirebilirsiniz. Esnek iptal politikamız sayesinde birçok rezervasyon ücretsiz iptal edilebilmektedir.', en: 'Yes! You can easily cancel or change your booking. Thanks to our flexible cancellation policy, many bookings can be cancelled free of charge.', ru: 'Да! Вы легко можете отменить или изменить бронь. Благодаря гибкой политике многие брони отменяются бесплатно.', de: 'Ja! Sie können Ihre Buchung leicht stornieren oder ändern. Dank unserer flexiblen Stornierungsrichtlinie sind viele Buchungen kostenlos stornierbar.', ar: 'نعم! يمكنك إلغاء حجزك أو تعديله بسهولة. بفضل سياسة الإلغاء المرنة، يمكن إلغاء العديد من الحجوزات مجاناً.' },
  'faq.q5': { tr: 'Aylık araç kiralama mümkün mü?', en: 'Is monthly car rental possible?', ru: 'Возможна ли аренда на месяц?', de: 'Ist eine monatliche Anmietung möglich?', ar: 'هل التأجير الشهري ممكن؟' },
  'faq.a5': { tr: 'Evet, aylık araç kiralama için alış ve iade tarihlerini 30 gün veya daha fazla seçmeniz yeterlidir. Uzun dönem kiralamalarda özel indirimli fiyatlar uygulanmaktadır.', en: 'Yes, for monthly rental simply select pick-up and return dates 30 days or more apart. Special discounted prices apply for long-term rentals.', ru: 'Да, для аренды на месяц выберите даты получения и возврата с разницей 30 дней и более. Для долгосрочной аренды действуют специальные цены.', de: 'Ja, für die Monatsmiete wählen Sie einfach Abhol- und Rückgabedatum mit 30 Tagen oder mehr Abstand. Für Langzeitmieten gelten spezielle Rabattpreise.', ar: 'نعم، للتأجير الشهري اختر تاريخي الاستلام والإعادة بفارق 30 يوماً أو أكثر. تُطبّق أسعار مخفّضة خاصة للتأجير طويل الأمد.' },

  // ---------- FOOTER ----------
  'footer.desc':      { tr: 'Türkiye\'nin güvenilir araç kiralama platformu. 81 ilde, yüzlerce araç seçeneği ile hizmetinizdeyiz.', en: 'Türkiye\'s trusted car rental platform. At your service in 81 provinces with hundreds of car options.', ru: 'Надёжная платформа аренды авто в Турции. К вашим услугам в 81 провинции с сотнями вариантов.', de: 'Die vertrauenswürdige Mietwagenplattform der Türkei. Für Sie da in 81 Provinzen mit Hunderten Fahrzeugen.', ar: 'منصة تأجير السيارات الموثوقة في تركيا. في خدمتك في 81 محافظة مع مئات الخيارات.' },
  'footer.services':  { tr: 'Hizmetler', en: 'Services', ru: 'Услуги', de: 'Leistungen', ar: 'الخدمات' },
  'footer.svc1': { tr: 'Araç Kiralama', en: 'Car Rental', ru: 'Аренда авто', de: 'Autovermietung', ar: 'تأجير السيارات' },
  'footer.svc2': { tr: 'Havalimanı Araç Kiralama', en: 'Airport Car Rental', ru: 'Аренда в аэропорту', de: 'Flughafen-Autovermietung', ar: 'تأجير في المطار' },
  'footer.svc3': { tr: 'Aylık Araç Kiralama', en: 'Monthly Car Rental', ru: 'Аренда на месяц', de: 'Monatsmiete', ar: 'تأجير شهري' },
  'footer.svc4': { tr: 'Kurumsal Kiralama', en: 'Corporate Rental', ru: 'Корпоративная аренда', de: 'Firmenanmietung', ar: 'تأجير للشركات' },
  'footer.svc5': { tr: 'Transfer Hizmetleri', en: 'Transfer Services', ru: 'Трансферы', de: 'Transferdienste', ar: 'خدمات النقل' },
  'footer.svc6': { tr: 'Lüks Araç Kiralama', en: 'Luxury Car Rental', ru: 'Аренда люкс-авто', de: 'Luxus-Autovermietung', ar: 'تأجير سيارات فاخرة' },
  'footer.locations': { tr: 'Popüler Lokasyonlar', en: 'Popular Locations', ru: 'Популярные локации', de: 'Beliebte Standorte', ar: 'المواقع الشائعة' },
  'footer.loc1': { tr: 'İstanbul Araç Kiralama', en: 'Istanbul Car Rental', ru: 'Аренда авто в Стамбуле', de: 'Autovermietung Istanbul', ar: 'تأجير سيارات إسطنبول' },
  'footer.loc2': { tr: 'Ankara Araç Kiralama', en: 'Ankara Car Rental', ru: 'Аренда авто в Анкаре', de: 'Autovermietung Ankara', ar: 'تأجير سيارات أنقرة' },
  'footer.loc3': { tr: 'İzmir Araç Kiralama', en: 'Izmir Car Rental', ru: 'Аренда авто в Измире', de: 'Autovermietung Izmir', ar: 'تأجير سيارات إزمير' },
  'footer.loc4': { tr: 'Antalya Araç Kiralama', en: 'Antalya Car Rental', ru: 'Аренда авто в Анталье', de: 'Autovermietung Antalya', ar: 'تأجير سيارات أنطاليا' },
  'footer.loc5': { tr: 'Bodrum Araç Kiralama', en: 'Bodrum Car Rental', ru: 'Аренда авто в Бодруме', de: 'Autovermietung Bodrum', ar: 'تأجير سيارات بودروم' },
  'footer.loc6': { tr: 'Antalya Havalimanı Araç Kiralama', en: 'Antalya Airport Car Rental', ru: 'Аренда авто в аэропорту Антальи', de: 'Mietwagen Flughafen Antalya', ar: 'تأجير سيارات مطار أنطاليا' },
  'footer.contact':   { tr: 'İletişim', en: 'Contact', ru: 'Контакты', de: 'Kontakt', ar: 'اتصل بنا' },
  'footer.hours':     { tr: 'Pazartesi – Pazar: 7/24', en: 'Monday – Sunday: 24/7', ru: 'Пн – Вс: круглосуточно', de: 'Montag – Sonntag: 24/7', ar: 'الإثنين – الأحد: 24/7' },
  'footer.rights':    { tr: '© 2026 ExitCar. Tüm hakları saklıdır.', en: '© 2026 ExitCar. All rights reserved.', ru: '© 2026 ExitCar. Все права защищены.', de: '© 2026 ExitCar. Alle Rechte vorbehalten.', ar: '© 2026 ExitCar. جميع الحقوق محفوظة.' },
  'footer.privacy':   { tr: 'Gizlilik Politikası', en: 'Privacy Policy', ru: 'Политика конфиденциальности', de: 'Datenschutz', ar: 'سياسة الخصوصية' },
  'footer.terms':     { tr: 'Kullanım Koşulları', en: 'Terms of Use', ru: 'Условия использования', de: 'Nutzungsbedingungen', ar: 'شروط الاستخدام' },
  'footer.ssl':       { tr: '🔒 SSL Güvenli', en: '🔒 SSL Secure', ru: '🔒 SSL защита', de: '🔒 SSL-sicher', ar: '🔒 SSL آمن' },
  'footer.securePay': { tr: '✅ Güvenli Ödeme', en: '✅ Secure Payment', ru: '✅ Безопасная оплата', de: '✅ Sichere Zahlung', ar: '✅ دفع آمن' },

  // ---------- ARAMA SAYFASI ----------
  'sr.editSearch':  { tr: '✏️ Aramayı Düzenle', en: '✏️ Edit Search', ru: '✏️ Изменить поиск', de: '✏️ Suche bearbeiten', ar: '✏️ تعديل البحث' },
  'sr.campaign':    { tr: '%50\'ye varan indirim kaçmasın! 🎉 Şimdi kirala, iptal etmek istersen %100 iade garantisi var ✅', en: 'Don\'t miss up to 50% off! 🎉 Rent now, with a 100% refund guarantee if you cancel ✅', ru: 'Скидки до 50%! 🎉 Бронируйте сейчас, при отмене — 100% возврат ✅', de: 'Bis zu 50% Rabatt sichern! 🎉 Jetzt mieten, bei Stornierung 100% Rückerstattung ✅', ar: 'لا تفوّت خصماً حتى 50%! 🎉 احجز الآن، مع ضمان استرداد 100% عند الإلغاء ✅' },
  'sr.applyCampaign': { tr: 'Kampanyayı Uygula!', en: 'Apply Deal!', ru: 'Применить акцию!', de: 'Angebot anwenden!', ar: 'طبّق العرض!' },
  'sr.filter':      { tr: '🔧 Filtrele', en: '🔧 Filter', ru: '🔧 Фильтр', de: '🔧 Filtern', ar: '🔧 تصفية' },
  'sr.clear':       { tr: 'Temizle', en: 'Clear', ru: 'Сбросить', de: 'Zurücksetzen', ar: 'مسح' },
  'sr.freeCancel':  { tr: 'Ücretsiz İptal', en: 'Free Cancellation', ru: 'Бесплатная отмена', de: 'Kostenlose Stornierung', ar: 'إلغاء مجاني' },
  'sr.freeCancelCars': { tr: 'Ücretsiz İptal Olan Araçlar', en: 'Cars with Free Cancellation', ru: 'Авто с бесплатной отменой', de: 'Fahrzeuge mit kostenloser Stornierung', ar: 'سيارات بإلغاء مجاني' },
  'sr.company':     { tr: 'Kiralama Şirketi', en: 'Rental Company', ru: 'Компания проката', de: 'Vermietungsfirma', ar: 'شركة التأجير' },
  'sr.transType':   { tr: 'Vites Tipi', en: 'Transmission', ru: 'Коробка передач', de: 'Getriebe', ar: 'ناقل الحركة' },
  'sr.fuelType':    { tr: 'Yakıt Tipi', en: 'Fuel Type', ru: 'Тип топлива', de: 'Kraftstoff', ar: 'نوع الوقود' },
  'sr.deliveryType':{ tr: 'Araç Teslim Şekli', en: 'Delivery Type', ru: 'Способ выдачи', de: 'Übergabeart', ar: 'طريقة التسليم' },
  'sr.priceRange':  { tr: 'Fiyat Aralığı (3 Gün)', en: 'Price Range (3 Days)', ru: 'Диапазон цен (3 дня)', de: 'Preisspanne (3 Tage)', ar: 'نطاق السعر (3 أيام)' },
  'sr.listed':      { tr: 'Araç Listeleniyor', en: 'Cars Listed', ru: 'Авто в списке', de: 'Fahrzeuge gelistet', ar: 'سيارة معروضة' },
  'sr.sort':        { tr: '↕ Sırala:', en: '↕ Sort:', ru: '↕ Сортировка:', de: '↕ Sortieren:', ar: '↕ ترتيب:' },
  'sr.sortRecommended': { tr: 'Önerilen', en: 'Recommended', ru: 'Рекомендуемые', de: 'Empfohlen', ar: 'موصى به' },
  'sr.sortPriceAsc':    { tr: 'En Ucuz Önce', en: 'Cheapest First', ru: 'Сначала дешёвые', de: 'Günstigste zuerst', ar: 'الأرخص أولاً' },
  'sr.sortPriceDesc':   { tr: 'En Pahalı Önce', en: 'Most Expensive First', ru: 'Сначала дорогие', de: 'Teuerste zuerst', ar: 'الأغلى أولاً' },
  'sr.sortScore':       { tr: 'En Yüksek Puan', en: 'Highest Rated', ru: 'Высший рейтинг', de: 'Beste Bewertung', ar: 'الأعلى تقييماً' },
  'sr.deliveryAirport': { tr: '✈️ Havalimanı İçi Ofis', en: '✈️ Office Inside Airport', ru: '✈️ Офис в аэропорту', de: '✈️ Büro im Flughafen', ar: '✈️ مكتب داخل المطار' },
  'sr.deliveryOffice':  { tr: '🏢 Şehir Ofisi', en: '🏢 City Office', ru: '🏢 Городской офис', de: '🏢 Stadtbüro', ar: '🏢 مكتب في المدينة' },
  'sr.kmLimit':     { tr: 'KM Sınırı', en: 'Mileage Limit', ru: 'Лимит пробега', de: 'KM-Limit', ar: 'حد المسافة' },
  'sr.deposit':     { tr: 'Depozito', en: 'Deposit', ru: 'Залог', de: 'Kaution', ar: 'تأمين' },
  'sr.reviews':     { tr: 'Yorum', en: 'Reviews', ru: 'отзывов', de: 'Bewertungen', ar: 'تقييم' },
  'sr.dayLabel':    { tr: 'Günlük', en: 'day rental', ru: 'аренда', de: 'Miete', ar: 'تأجير' },
  'sr.priceForDays':{ tr: 'Günlük Fiyat', en: 'Price for', ru: 'Цена за', de: 'Preis für', ar: 'سعر' },
  'sr.daysWord':    { tr: 'Günlük', en: '-Day', ru: 'дн.', de: '-Tage', ar: 'يوم' },
  'sr.daily':       { tr: 'Günlük', en: 'Daily', ru: 'В день', de: 'Täglich', ar: 'يومياً' },
  'sr.bookNow':     { tr: 'Hemen Kirala ›', en: 'Book Now ›', ru: 'Забронировать ›', de: 'Jetzt buchen ›', ar: '‹ احجز الآن' },
  'sr.showIncl':    { tr: '📋 Dahil Hizmetleri Göster', en: '📋 Show Included Services', ru: '📋 Показать включённые услуги', de: '📋 Inklusivleistungen anzeigen', ar: '📋 عرض الخدمات المشمولة' },
  'sr.hideIncl':    { tr: '📋 Dahil Hizmetleri Gizle', en: '📋 Hide Included Services', ru: '📋 Скрыть включённые услуги', de: '📋 Inklusivleistungen ausblenden', ar: '📋 إخفاء الخدمات المشمولة' },
  'sr.supplier':    { tr: 'Tedarikçi', en: 'Supplier', ru: 'Поставщик', de: 'Anbieter', ar: 'المورّد' },
  'sr.transmission':{ tr: 'Vites', en: 'Transmission', ru: 'КПП', de: 'Getriebe', ar: 'ناقل الحركة' },
  'sr.fuel':        { tr: 'Yakıt', en: 'Fuel', ru: 'Топливо', de: 'Kraftstoff', ar: 'الوقود' },
  'sr.seats':       { tr: 'Koltuk', en: 'Seats', ru: 'Места', de: 'Sitze', ar: 'المقاعد' },
  'sr.inclServices':{ tr: 'Dahil Hizmetler', en: 'Included Services', ru: 'Включённые услуги', de: 'Inklusivleistungen', ar: 'الخدمات المشمولة' },
  'sr.trafficIns':  { tr: 'Zorunlu Trafik Sigortası', en: 'Mandatory Traffic Insurance', ru: 'Обязательное автострахование', de: 'Pflicht-Haftpflichtversicherung', ar: 'تأمين المرور الإلزامي' },
  'sr.vatIncl':     { tr: 'KDV Dahil', en: 'VAT Included', ru: 'НДС включён', de: 'inkl. MwSt.', ar: 'شامل الضريبة' },
  'sr.cascoOpt':    { tr: 'Kasko (Opsiyonel — rezervasyonda seçilebilir)', en: 'Comprehensive insurance (Optional — selectable at booking)', ru: 'КАСКО (опционально — выбирается при бронировании)', de: 'Vollkasko (optional — bei Buchung wählbar)', ar: 'تأمين شامل (اختياري — يُختار عند الحجز)' },
  'sr.promoTitle':  { tr: '🎁 ExitCar Üyelerine Özel', en: '🎁 Exclusive for ExitCar Members', ru: '🎁 Только для участников ExitCar', de: '🎁 Exklusiv für ExitCar-Mitglieder', ar: '🎁 حصري لأعضاء ExitCar' },
  'sr.promoSub':    { tr: 'İlk kiralamanızda %20 indirim — şimdi üye olun!', en: '20% off your first rental — sign up now!', ru: 'Скидка 20% на первую аренду — регистрируйтесь!', de: '20% Rabatt auf Ihre erste Anmietung — jetzt anmelden!', ar: 'خصم 20% على أول تأجير — سجّل الآن!' },
  'sr.promoBtn':    { tr: 'Hemen Üye Ol →', en: 'Sign Up Now →', ru: 'Зарегистрироваться →', de: 'Jetzt anmelden →', ar: '← سجّل الآن' },
  'sr.noResultsTitle': { tr: 'Kriterlere uygun araç bulunamadı', en: 'No cars match your criteria', ru: 'Нет авто по вашим критериям', de: 'Keine passenden Fahrzeuge gefunden', ar: 'لا توجد سيارات تطابق معاييرك' },
  'sr.noResultsSub':   { tr: 'Filtrelerinizi genişletmeyi deneyin.', en: 'Try broadening your filters.', ru: 'Попробуйте расширить фильтры.', de: 'Versuchen Sie, Ihre Filter zu erweitern.', ar: 'حاول توسيع عوامل التصفية.' },
  'sr.fromShort':   { tr: '’den', en: '+', ru: '+', de: '+', ar: '+' },
  'sr.daysPrice':   { tr: '{d} Günlük Fiyat', en: '{d}-Day Price', ru: 'Цена за {d} дн.', de: 'Preis für {d} Tage', ar: 'سعر {d} يوم' },

  // Kategoriler (arama tabları + kart rozetleri) — TR veri değeri → çeviri
  'catName.Ekonomi': { tr: 'Ekonomi', en: 'Economy', ru: 'Эконом', de: 'Economy', ar: 'اقتصادية' },
  'catName.Orta':    { tr: 'Orta', en: 'Mid-size', ru: 'Средний', de: 'Mittelklasse', ar: 'متوسطة' },
  'catName.Ust':     { tr: 'Üst', en: 'Upper', ru: 'Высший', de: 'Oberklasse', ar: 'عليا' },
  'catName.Luks':    { tr: 'Lüks', en: 'Luxury', ru: 'Люкс', de: 'Luxus', ar: 'فاخرة' },
  'catName.SUV':     { tr: 'SUV', en: 'SUV', ru: 'Внедорожник', de: 'SUV', ar: 'دفع رباعي' },
  'catName.Van':     { tr: 'Van', en: 'Van', ru: 'Минивэн', de: 'Van', ar: 'فان' },

  // Vites / Yakıt değerleri
  'val.Otomatik': { tr: 'Otomatik', en: 'Automatic', ru: 'Автомат', de: 'Automatik', ar: 'أوتوماتيك' },
  'val.Manuel':   { tr: 'Manuel', en: 'Manual', ru: 'Механика', de: 'Schaltgetriebe', ar: 'يدوي' },
  'val.Benzin':   { tr: 'Benzin', en: 'Petrol', ru: 'Бензин', de: 'Benzin', ar: 'بنزين' },
  'val.Dizel':    { tr: 'Dizel', en: 'Diesel', ru: 'Дизель', de: 'Diesel', ar: 'ديزل' },
  'val.Hibrit':   { tr: 'Hibrit', en: 'Hybrid', ru: 'Гибрид', de: 'Hybrid', ar: 'هجين' },
  'val.Elektrik': { tr: 'Elektrik', en: 'Electric', ru: 'Электро', de: 'Elektro', ar: 'كهربائي' },

  // Araç ekstraları (TR kaynak metin → çeviri)
  'ex.GPS dahil':                  { tr: 'GPS dahil', en: 'GPS included', ru: 'GPS включён', de: 'GPS inklusive', ar: 'GPS مشمول' },
  'ex.Bebek koltugu eklenebilir':  { tr: 'Bebek koltuğu eklenebilir', en: 'Baby seat can be added', ru: 'Можно добавить детское кресло', de: 'Kindersitz zubuchbar', ar: 'يمكن إضافة مقعد أطفال' },
  'ex.Ucretsiz iptal':             { tr: 'Ücretsiz iptal', en: 'Free cancellation', ru: 'Бесплатная отмена', de: 'Kostenlose Stornierung', ar: 'إلغاء مجاني' },
  'ex.Tam sigorta secenegi':       { tr: 'Tam sigorta seçeneği', en: 'Full insurance option', ru: 'Опция полного страхования', de: 'Vollversicherungsoption', ar: 'خيار تأمين شامل' },
  'ex.Ucuz baslangic fiyati':      { tr: 'Ucuz başlangıç fiyatı', en: 'Low starting price', ru: 'Низкая стартовая цена', de: 'Günstiger Startpreis', ar: 'سعر بداية منخفض' },
  'ex.Hibrit yakit tasarrufu':     { tr: 'Hibrit yakıt tasarrufu', en: 'Hybrid fuel savings', ru: 'Экономия топлива (гибрид)', de: 'Hybrid-Kraftstoffersparnis', ar: 'توفير وقود هجين' },
  'ex.24/7 yol yardimi':           { tr: '24/7 yol yardımı', en: '24/7 roadside assistance', ru: 'Помощь на дороге 24/7', de: '24/7-Pannenhilfe', ar: 'مساعدة على الطريق 24/7' },
  'ex.Kasko dahil':                { tr: 'Kasko dahil', en: 'Comprehensive insurance included', ru: 'КАСКО включено', de: 'Vollkasko inklusive', ar: 'تأمين شامل مضمّن' },
  'ex.Business sinifi':            { tr: 'Business sınıfı', en: 'Business class', ru: 'Бизнес-класс', de: 'Business-Klasse', ar: 'درجة الأعمال' },
  'ex.Navigasyon':                 { tr: 'Navigasyon', en: 'Navigation', ru: 'Навигация', de: 'Navigation', ar: 'ملاحة' },
  'ex.Tam kasko':                  { tr: 'Tam kasko', en: 'Full comprehensive cover', ru: 'Полное КАСКО', de: 'Vollkasko', ar: 'تأمين شامل كامل' },
  'ex.4x4 secenegi':               { tr: '4x4 seçeneği', en: '4x4 option', ru: 'Опция 4x4', de: '4x4-Option', ar: 'خيار دفع رباعي' },
  'ex.Genis bagaj':                { tr: 'Geniş bagaj', en: 'Large trunk', ru: 'Большой багажник', de: 'Großer Kofferraum', ar: 'صندوق واسع' },
  'ex.GPS':                        { tr: 'GPS', en: 'GPS', ru: 'GPS', de: 'GPS', ar: 'GPS' },
  'ex.Genis ic mekan':            { tr: 'Geniş iç mekan', en: 'Spacious interior', ru: 'Просторный салон', de: 'Großzügiger Innenraum', ar: 'مقصورة واسعة' },
  'ex.Apple CarPlay':              { tr: 'Apple CarPlay', en: 'Apple CarPlay', ru: 'Apple CarPlay', de: 'Apple CarPlay', ar: 'Apple CarPlay' },
  'ex.9 kisilik':                  { tr: '9 kişilik', en: '9 seats', ru: 'на 9 мест', de: '9 Sitze', ar: '9 مقاعد' },
  'ex.Genis bagaj bolmesi':        { tr: 'Geniş bagaj bölmesi', en: 'Large luggage compartment', ru: 'Большое багажное отделение', de: 'Großes Gepäckabteil', ar: 'حجرة أمتعة كبيرة' },
  'ex.Premium sinif':              { tr: 'Premium sınıf', en: 'Premium class', ru: 'Премиум-класс', de: 'Premium-Klasse', ar: 'درجة فاخرة' },
  'ex.Sahin gozu kamera':          { tr: 'Şahin gözü kamera', en: '360° camera', ru: 'Камера кругового обзора', de: '360°-Kamera', ar: 'كاميرا 360°' },
  'ex.Kablosuz sarj':              { tr: 'Kablosuz şarj', en: 'Wireless charging', ru: 'Беспроводная зарядка', de: 'Kabelloses Laden', ar: 'شحن لاسلكي' },
  'ex.AMG Line':                   { tr: 'AMG Line', en: 'AMG Line', ru: 'AMG Line', de: 'AMG Line', ar: 'AMG Line' },
  'ex.Panoramik cam tavan':        { tr: 'Panoramik cam tavan', en: 'Panoramic glass roof', ru: 'Панорамная крыша', de: 'Panorama-Glasdach', ar: 'سقف زجاجي بانورامي' },
  'ex.Hibrit':                     { tr: 'Hibrit', en: 'Hybrid', ru: 'Гибрид', de: 'Hybrid', ar: 'هجين' },
  'ex.Dusuk yakit tuketimi':       { tr: 'Düşük yakıt tüketimi', en: 'Low fuel consumption', ru: 'Низкий расход топлива', de: 'Niedriger Verbrauch', ar: 'استهلاك وقود منخفض' },
  'ex.Ekonomik fiyat':             { tr: 'Ekonomik fiyat', en: 'Economical price', ru: 'Экономичная цена', de: 'Günstiger Preis', ar: 'سعر اقتصادي' },
  'ex.Genis SUV':                  { tr: 'Geniş SUV', en: 'Large SUV', ru: 'Большой внедорожник', de: 'Großer SUV', ar: 'دفع رباعي كبير' },
  'ex.24/7 destek':                { tr: '24/7 destek', en: '24/7 support', ru: 'Поддержка 24/7', de: '24/7-Support', ar: 'دعم 24/7' },
  'ex.Ticari arac':                { tr: 'Ticari araç', en: 'Commercial vehicle', ru: 'Коммерческий транспорт', de: 'Nutzfahrzeug', ar: 'مركبة تجارية' },

  // ---------- REZERVASYON ADIMLARI ----------
  'step1.label': { tr: 'Adım 1/3', en: 'Step 1/3', ru: 'Шаг 1/3', de: 'Schritt 1/3', ar: 'الخطوة 1/3' },
  'step2.label': { tr: 'Adım 2/3', en: 'Step 2/3', ru: 'Шаг 2/3', de: 'Schritt 2/3', ar: 'الخطوة 2/3' },
  'step3.label': { tr: 'Adım 3/3', en: 'Step 3/3', ru: 'Шаг 3/3', de: 'Schritt 3/3', ar: 'الخطوة 3/3' },
  'step1.name':  { tr: 'Araç & Sigorta', en: 'Car & Insurance', ru: 'Авто и страховка', de: 'Auto & Versicherung', ar: 'السيارة والتأمين' },
  'step2.name':  { tr: 'Sürücü Bilgileri', en: 'Driver Details', ru: 'Данные водителя', de: 'Fahrerdaten', ar: 'بيانات السائق' },
  'step3.name':  { tr: 'Ödeme', en: 'Payment', ru: 'Оплата', de: 'Zahlung', ar: 'الدفع' },

  // ---------- REZERVASYON (sigorta/ekstra) ----------
  'res.rentalInfo':  { tr: 'Kiralama Bilgileri', en: 'Rental Details', ru: 'Детали аренды', de: 'Mietdetails', ar: 'تفاصيل التأجير' },
  'res.pickup':      { tr: '📍 Alış Yeri', en: '📍 Pick-up Location', ru: '📍 Место получения', de: '📍 Abholort', ar: '📍 مكان الاستلام' },
  'res.return':      { tr: '📍 İade Yeri', en: '📍 Return Location', ru: '📍 Место возврата', de: '📍 Rückgabeort', ar: '📍 مكان الإعادة' },
  'res.selectIns':   { tr: 'Sigorta Paketi Seçin', en: 'Choose an Insurance Package', ru: 'Выберите пакет страхования', de: 'Versicherungspaket wählen', ar: 'اختر باقة التأمين' },
  'res.insInfo':     { tr: 'Tüm araçlarda trafik sigortası ve zorunlu mali sorumluluk sigortası dahildir. Aşağıdaki paketlerle ek güvence sağlayabilirsiniz.', en: 'All cars include traffic and mandatory liability insurance. You can add extra coverage with the packages below.', ru: 'Все авто включают ОСАГО и обязательное страхование ответственности. Ниже можно добавить доп. покрытие.', de: 'Alle Fahrzeuge beinhalten Haftpflicht- und Pflichtversicherung. Mit den Paketen unten können Sie zusätzliche Absicherung hinzufügen.', ar: 'تشمل جميع السيارات تأمين المرور والمسؤولية الإلزامي. يمكنك إضافة تغطية إضافية بالباقات أدناه.' },
  'res.basicName':   { tr: 'Temel Paket', en: 'Basic Package', ru: 'Базовый пакет', de: 'Basis-Paket', ar: 'الباقة الأساسية' },
  'res.free':        { tr: 'Ücretsiz', en: 'Free', ru: 'Бесплатно', de: 'Kostenlos', ar: 'مجاني' },
  'res.trafficIncl': { tr: 'Trafik Sigortası Dahil', en: 'Traffic Insurance Included', ru: 'ОСАГО включено', de: 'Haftpflicht inklusive', ar: 'تأمين المرور مشمول' },
  'res.liability':   { tr: 'Zorunlu Mali Sorumluluk', en: 'Mandatory Liability Cover', ru: 'Обязательное страхование ответственности', de: 'Pflicht-Haftpflicht', ar: 'مسؤولية مالية إلزامية' },
  'res.noCasco':     { tr: 'Kasko Yok', en: 'No Comprehensive Cover', ru: 'Без КАСКО', de: 'Keine Vollkasko', ar: 'بدون تأمين شامل' },
  'res.noMini':      { tr: 'Mini Hasar Güvencesi Yok', en: 'No Minor Damage Cover', ru: 'Без покрытия мелких повреждений', de: 'Kein Mini-Schadenschutz', ar: 'بدون تغطية أضرار طفيفة' },
  'res.mediumName':  { tr: 'Güvenli Paket', en: 'Safe Package', ru: 'Надёжный пакет', de: 'Sicher-Paket', ar: 'الباقة الآمنة' },
  'res.popular':     { tr: 'En Popüler', en: 'Most Popular', ru: 'Популярный', de: 'Beliebt', ar: 'الأكثر شيوعاً' },
  'res.cascoCover':  { tr: 'Kasko Güvencesi', en: 'Comprehensive Cover', ru: 'Покрытие КАСКО', de: 'Vollkasko-Schutz', ar: 'تغطية شاملة' },
  'res.deductible':  { tr: '2.500 TL Muafiyet', en: 'Deductible: 2,500 TL', ru: 'Франшиза 2 500 TL', de: 'Selbstbeteiligung 2.500 TL', ar: 'تحمّل 2,500 ليرة' },
  'res.fullName':    { tr: 'Her Şey Dahil', en: 'All-Inclusive', ru: 'Всё включено', de: 'All-Inclusive', ar: 'شامل كل شيء' },
  'res.fullProtect': { tr: 'Tam Koruma', en: 'Full Protection', ru: 'Полная защита', de: 'Vollschutz', ar: 'حماية كاملة' },
  'res.fullCasco':   { tr: 'Tam Kasko Güvencesi', en: 'Full Comprehensive Cover', ru: 'Полное покрытие КАСКО', de: 'Voller Vollkasko-Schutz', ar: 'تغطية شاملة كاملة' },
  'res.noDeductible':{ tr: 'Muafiyetsiz (0 TL)', en: 'No Deductible (0 TL)', ru: 'Без франшизы (0 TL)', de: 'Ohne Selbstbeteiligung (0 TL)', ar: 'بدون تحمّل (0 ليرة)' },
  'res.miniCover':   { tr: 'Mini Hasar Güvencesi', en: 'Minor Damage Cover', ru: 'Покрытие мелких повреждений', de: 'Mini-Schadenschutz', ar: 'تغطية الأضرار الطفيفة' },
  'res.extras':      { tr: 'Ekstra Hizmetler', en: 'Extra Services', ru: 'Дополнительные услуги', de: 'Zusatzleistungen', ar: 'خدمات إضافية' },
  'res.optional':    { tr: '(İsteğe Bağlı)', en: '(Optional)', ru: '(по желанию)', de: '(Optional)', ar: '(اختياري)' },
  'res.gpsName':     { tr: 'GPS / Navigasyon', en: 'GPS / Navigation', ru: 'GPS / Навигация', de: 'GPS / Navigation', ar: 'GPS / ملاحة' },
  'res.gpsDesc':     { tr: 'Araçta dahili navigasyon sistemi', en: 'Built-in navigation system', ru: 'Встроенная навигация', de: 'Integriertes Navigationssystem', ar: 'نظام ملاحة مدمج' },
  'res.babyName':    { tr: 'Bebek Koltuğu', en: 'Baby Seat', ru: 'Детское кресло', de: 'Kindersitz', ar: 'مقعد أطفال' },
  'res.babyDesc':    { tr: '9-18 kg arası çocuklar için', en: 'For children 9-18 kg', ru: 'Для детей 9-18 кг', de: 'Für Kinder 9-18 kg', ar: 'للأطفال 9-18 كغ' },
  'res.driver2Name': { tr: '2. Sürücü', en: '2nd Driver', ru: 'Второй водитель', de: '2. Fahrer', ar: 'سائق ثانٍ' },
  'res.driver2Desc': { tr: 'Ek bir kişi araç kullanabilir', en: 'An additional person can drive', ru: 'Авто может водить ещё один человек', de: 'Eine weitere Person darf fahren', ar: 'يمكن لشخص إضافي القيادة' },
  'res.wifiName':    { tr: 'Mobil Wi-Fi', en: 'Mobile Wi-Fi', ru: 'Мобильный Wi-Fi', de: 'Mobiles WLAN', ar: 'واي فاي محمول' },
  'res.wifiDesc':    { tr: 'Sınırsız internet erişimi', en: 'Unlimited internet access', ru: 'Безлимитный интернет', de: 'Unbegrenzter Internetzugang', ar: 'إنترنت غير محدود' },
  'res.snowName':    { tr: 'Kış Lastiği Paketi', en: 'Winter Tire Package', ru: 'Пакет зимних шин', de: 'Winterreifen-Paket', ar: 'باقة إطارات شتوية' },
  'res.snowDesc':    { tr: 'Kar ve buz koşullarına uygun', en: 'Suitable for snow and ice', ru: 'Для снега и льда', de: 'Für Schnee und Eis geeignet', ar: 'مناسبة للثلج والجليد' },
  'res.roadsideName':{ tr: 'Yol Yardımı', en: 'Roadside Assistance', ru: 'Помощь на дороге', de: 'Pannenhilfe', ar: 'مساعدة على الطريق' },
  'res.roadsideDesc':{ tr: '7/24 arıza destek hizmeti', en: '24/7 breakdown support', ru: 'Помощь при поломке 24/7', de: '24/7-Pannenservice', ar: 'دعم الأعطال 24/7' },
  'res.continueDriver': { tr: 'Sürücü Bilgilerine Devam Et →', en: 'Continue to Driver Details →', ru: 'Перейти к данным водителя →', de: 'Weiter zu Fahrerdaten →', ar: '← متابعة إلى بيانات السائق' },
  'res.backToList':  { tr: '← Araç Listesine Dön', en: '← Back to Car List', ru: '← Назад к списку авто', de: '← Zurück zur Fahrzeugliste', ar: 'العودة إلى قائمة السيارات →' },
  'res.total':       { tr: 'TOPLAM', en: 'TOTAL', ru: 'ИТОГО', de: 'GESAMT', ar: 'الإجمالي' },
  'res.extrasLine':  { tr: 'Ekstralar', en: 'Extras', ru: 'Доп. услуги', de: 'Extras', ar: 'إضافات' },
  'res.carLine':     { tr: 'Araç', en: 'Car', ru: 'Авто', de: 'Auto', ar: 'السيارة' },
  'res.freeCancelBox': { tr: 'Kiralama başlangıcından 48 saat önce ücretsiz iptal edebilirsiniz.', en: 'You can cancel free of charge up to 48 hours before pick-up.', ru: 'Бесплатная отмена за 48 часов до начала аренды.', de: 'Kostenlose Stornierung bis 48 Stunden vor Abholung.', ar: 'يمكنك الإلغاء مجاناً حتى 48 ساعة قبل الاستلام.' },
  'res.licensed':    { tr: '🛡️ Lisanslı Firma', en: '🛡️ Licensed Company', ru: '🛡️ Лицензированная компания', de: '🛡️ Lizenziertes Unternehmen', ar: '🛡️ شركة مرخّصة' },

  // ---------- SÜRÜCÜ BİLGİLERİ ----------
  'di.title':       { tr: 'Sürücü Bilgileri', en: 'Driver Details', ru: 'Данные водителя', de: 'Fahrerdaten', ar: 'بيانات السائق' },
  'di.info':        { tr: 'Lütfen teslimatta kullanılacak sürücünün bilgilerini girin. Girilen bilgiler kimlik belgesi ile aynı olmalıdır.', en: 'Please enter the details of the driver at handover. The information must match the ID document.', ru: 'Укажите данные водителя при получении. Данные должны совпадать с документом.', de: 'Bitte geben Sie die Daten des Fahrers bei Übergabe ein. Die Angaben müssen mit dem Ausweis übereinstimmen.', ar: 'يرجى إدخال بيانات السائق عند التسليم. يجب أن تطابق وثيقة الهوية.' },
  'di.personal':    { tr: 'Kişisel Bilgiler', en: 'Personal Information', ru: 'Личные данные', de: 'Persönliche Daten', ar: 'المعلومات الشخصية' },
  'di.firstName':   { tr: 'Ad', en: 'First Name', ru: 'Имя', de: 'Vorname', ar: 'الاسم' },
  'di.firstNamePh': { tr: 'Adınız', en: 'Your first name', ru: 'Ваше имя', de: 'Ihr Vorname', ar: 'اسمك' },
  'di.lastName':    { tr: 'Soyad', en: 'Last Name', ru: 'Фамилия', de: 'Nachname', ar: 'اللقب' },
  'di.lastNamePh':  { tr: 'Soyadınız', en: 'Your last name', ru: 'Ваша фамилия', de: 'Ihr Nachname', ar: 'لقبك' },
  'di.email':       { tr: 'E-posta', en: 'Email', ru: 'Эл. почта', de: 'E-Mail', ar: 'البريد الإلكتروني' },
  'di.emailHint':   { tr: 'Rezervasyon onayı bu adrese gönderilecek', en: 'Booking confirmation will be sent here', ru: 'Подтверждение брони придёт сюда', de: 'Die Buchungsbestätigung wird hierher gesendet', ar: 'سيُرسل تأكيد الحجز إلى هذا العنوان' },
  'di.phone':       { tr: 'Telefon', en: 'Phone', ru: 'Телефон', de: 'Telefon', ar: 'الهاتف' },
  'di.birthDate':   { tr: 'Doğum Tarihi', en: 'Date of Birth', ru: 'Дата рождения', de: 'Geburtsdatum', ar: 'تاريخ الميلاد' },
  'di.tcNo':        { tr: 'TC Kimlik No', en: 'ID / Passport No', ru: 'Номер паспорта', de: 'Ausweis-/Passnummer', ar: 'رقم الهوية / الجواز' },
  'di.tcNoPh':      { tr: '11 haneli TC No', en: 'ID or passport number', ru: 'Номер документа', de: 'Ausweis- oder Passnummer', ar: 'رقم الهوية أو الجواز' },
  'di.license':     { tr: 'Ehliyet Bilgileri', en: 'License Information', ru: 'Данные водительских прав', de: 'Führerscheindaten', ar: 'بيانات رخصة القيادة' },
  'di.licenseNo':   { tr: 'Ehliyet Numarası', en: 'License Number', ru: 'Номер прав', de: 'Führerscheinnummer', ar: 'رقم الرخصة' },
  'di.licenseNoPh': { tr: 'Ehliyet numaranız', en: 'Your license number', ru: 'Номер ваших прав', de: 'Ihre Führerscheinnummer', ar: 'رقم رخصتك' },
  'di.licenseDate': { tr: 'Ehliyet Veriliş Tarihi', en: 'License Issue Date', ru: 'Дата выдачи прав', de: 'Ausstellungsdatum', ar: 'تاريخ إصدار الرخصة' },
  'di.licenseClass':{ tr: 'Ehliyet Sınıfı', en: 'License Class', ru: 'Категория прав', de: 'Führerscheinklasse', ar: 'فئة الرخصة' },
  'di.select':      { tr: 'Seçin', en: 'Select', ru: 'Выберите', de: 'Wählen', ar: 'اختر' },
  'di.classB':      { tr: 'B — Otomobil', en: 'B — Car', ru: 'B — Легковой', de: 'B — Pkw', ar: 'B — سيارة' },
  'di.classBE':     { tr: 'B+E — Otomobil + Römork', en: 'B+E — Car + Trailer', ru: 'B+E — Авто + прицеп', de: 'B+E — Pkw + Anhänger', ar: 'B+E — سيارة + مقطورة' },
  'di.classA2':     { tr: 'A2 — Motosiklet', en: 'A2 — Motorcycle', ru: 'A2 — Мотоцикл', de: 'A2 — Motorrad', ar: 'A2 — دراجة نارية' },
  'di.classC':      { tr: 'C — Kamyon', en: 'C — Truck', ru: 'C — Грузовик', de: 'C — Lkw', ar: 'C — شاحنة' },
  'di.nationality': { tr: 'Vatandaşlık', en: 'Nationality', ru: 'Гражданство', de: 'Staatsangehörigkeit', ar: 'الجنسية' },
  'di.natTR': { tr: '🇹🇷 Türkiye', en: '🇹🇷 Türkiye', ru: '🇹🇷 Турция', de: '🇹🇷 Türkei', ar: '🇹🇷 تركيا' },
  'di.natDE': { tr: '🇩🇪 Almanya', en: '🇩🇪 Germany', ru: '🇩🇪 Германия', de: '🇩🇪 Deutschland', ar: '🇩🇪 ألمانيا' },
  'di.natGB': { tr: '🇬🇧 Birleşik Krallık', en: '🇬🇧 United Kingdom', ru: '🇬🇧 Великобритания', de: '🇬🇧 Vereinigtes Königreich', ar: '🇬🇧 المملكة المتحدة' },
  'di.natRU': { tr: '🇷🇺 Rusya', en: '🇷🇺 Russia', ru: '🇷🇺 Россия', de: '🇷🇺 Russland', ar: '🇷🇺 روسيا' },
  'di.natFR': { tr: '🇫🇷 Fransa', en: '🇫🇷 France', ru: '🇫🇷 Франция', de: '🇫🇷 Frankreich', ar: '🇫🇷 فرنسا' },
  'di.natNL': { tr: '🇳🇱 Hollanda', en: '🇳🇱 Netherlands', ru: '🇳🇱 Нидерланды', de: '🇳🇱 Niederlande', ar: '🇳🇱 هولندا' },
  'di.natOther': { tr: 'Diğer', en: 'Other', ru: 'Другое', de: 'Andere', ar: 'أخرى' },
  'di.flight':      { tr: 'Uçuş Bilgileri', en: 'Flight Information', ru: 'Информация о рейсе', de: 'Fluginformationen', ar: 'معلومات الرحلة' },
  'di.flightOpt':   { tr: '(havalimanı teslimleri için — isteğe bağlı)', en: '(for airport deliveries — optional)', ru: '(для выдачи в аэропорту — по желанию)', de: '(für Flughafenübergaben — optional)', ar: '(لتسليم المطار — اختياري)' },
  'di.flightNo':    { tr: 'Uçuş Numarası', en: 'Flight Number', ru: 'Номер рейса', de: 'Flugnummer', ar: 'رقم الرحلة' },
  'di.flightHint':  { tr: 'Gecikmeler durumunda sizi bekliyoruz', en: 'We\'ll wait for you in case of delays', ru: 'При задержках мы вас дождёмся', de: 'Bei Verspätungen warten wir auf Sie', ar: 'سننتظرك في حال التأخير' },
  'di.flightFrom':  { tr: 'Gelen Uçuş Kalkış Noktası', en: 'Departure Point of Arriving Flight', ru: 'Пункт вылета прибывающего рейса', de: 'Abflugort des ankommenden Flugs', ar: 'نقطة مغادرة الرحلة القادمة' },
  'di.flightFromPh':{ tr: 'İzmir, Amsterdam...', en: 'Izmir, Amsterdam...', ru: 'Измир, Амстердам...', de: 'Izmir, Amsterdam...', ar: 'إزمير، أمستردام...' },
  'di.special':     { tr: 'Özel İstekler', en: 'Special Requests', ru: 'Особые пожелания', de: 'Sonderwünsche', ar: 'طلبات خاصة' },
  'di.note':        { tr: 'Not / İstek', en: 'Note / Request', ru: 'Примечание / запрос', de: 'Notiz / Wunsch', ar: 'ملاحظة / طلب' },
  'di.notePh':      { tr: 'Özel isteğiniz varsa buraya yazabilirsiniz...', en: 'Write any special requests here...', ru: 'Напишите особые пожелания здесь...', de: 'Besondere Wünsche hier eintragen...', ar: 'اكتب أي طلبات خاصة هنا...' },
  'di.kvkkLabel':   { tr: 'KVKK Aydınlatma Metni', en: 'Privacy Notice', ru: 'Уведомление о персональных данных', de: 'Datenschutzhinweis', ar: 'إشعار الخصوصية' },
  'di.kvkkText':    { tr: '’ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.', en: ' — I have read it and consent to the processing of my personal data.', ru: ' — я прочитал и согласен на обработку персональных данных.', de: ' — Ich habe es gelesen und stimme der Verarbeitung meiner Daten zu.', ar: ' — قرأته وأوافق على معالجة بياناتي الشخصية.' },
  'di.readText':    { tr: 'Metni oku →', en: 'Read notice →', ru: 'Читать →', de: 'Hinweis lesen →', ar: '← اقرأ' },
  'di.termsLabel':  { tr: 'Kiralama Sözleşmesi', en: 'Rental Agreement', ru: 'Договор аренды', de: 'Mietvertrag', ar: 'عقد التأجير' },
  'di.termsAnd':    { tr: ' ve ', en: ' and ', ru: ' и ', de: ' und ', ar: ' و ' },
  'di.termsGeneral':{ tr: 'Genel Kullanım Koşulları', en: 'General Terms of Use', ru: 'Общие условия', de: 'Allgemeine Nutzungsbedingungen', ar: 'الشروط العامة' },
  'di.termsText':   { tr: '’nı okudum, kabul ediyorum.', en: ' — I have read and accept them.', ru: ' — я прочитал и принимаю.', de: ' — Ich habe sie gelesen und akzeptiere sie.', ar: ' — قرأتها وأوافق عليها.' },
  'di.readTerms':   { tr: 'Koşulları oku →', en: 'Read terms →', ru: 'Читать условия →', de: 'Bedingungen lesen →', ar: '← اقرأ الشروط' },
  'di.continuePay': { tr: 'Ödemeye Devam Et →', en: 'Continue to Payment →', ru: 'Перейти к оплате →', de: 'Weiter zur Zahlung →', ar: '← متابعة إلى الدفع' },
  'di.back':        { tr: '← Geri Dön', en: '← Go Back', ru: '← Назад', de: '← Zurück', ar: 'رجوع →' },
  'di.warnDocs':    { tr: 'Teslimatta sürücü belgesi, kimlik ve rezervasyon belgesi yanınızda olmalıdır.', en: 'At handover you must have your driver\'s license, ID and booking document with you.', ru: 'При получении при себе должны быть права, удостоверение личности и документ брони.', de: 'Bei Übergabe müssen Führerschein, Ausweis und Buchungsbeleg mitgeführt werden.', ar: 'عند التسليم يجب أن تحمل رخصة القيادة والهوية ووثيقة الحجز.' },
  'di.kvkkCompliant': { tr: '🛡️ KVKK Uyumlu', en: '🛡️ GDPR Compliant', ru: '🛡️ Соответствие GDPR', de: '🛡️ DSGVO-konform', ar: '🛡️ متوافق مع حماية البيانات' },

  // Doğrulama mesajları (driver-info.js)
  'di.val.required': { tr: 'zorunludur.', en: 'is required.', ru: 'обязательно.', de: 'ist erforderlich.', ar: 'مطلوب.' },
  'di.val.minLen':   { tr: 'en az {n} karakter olmalıdır.', en: 'must be at least {n} characters.', ru: 'должно содержать не менее {n} символов.', de: 'muss mindestens {n} Zeichen haben.', ar: 'يجب أن يكون {n} أحرف على الأقل.' },
  'di.val.exactLen': { tr: '{n} haneli olmalıdır.', en: 'must be {n} digits.', ru: 'должно содержать {n} цифр.', de: 'muss {n} Ziffern haben.', ar: 'يجب أن يكون {n} أرقام.' },
  'di.val.pattern':  { tr: 'Geçerli bir {label} girin.', en: 'Enter a valid {label}.', ru: 'Введите корректное значение: {label}.', de: 'Geben Sie ein gültiges {label} ein.', ar: 'أدخل {label} صحيحاً.' },
  'di.val.minAge':   { tr: 'Araç kiralama için minimum yaş 21\'dir.', en: 'The minimum age for car rental is 21.', ru: 'Минимальный возраст для аренды — 21 год.', de: 'Das Mindestalter für die Anmietung beträgt 21 Jahre.', ar: 'الحد الأدنى لعمر التأجير هو 21 عاماً.' },
  'di.val.badBirth': { tr: 'Geçersiz doğum tarihi.', en: 'Invalid date of birth.', ru: 'Неверная дата рождения.', de: 'Ungültiges Geburtsdatum.', ar: 'تاريخ ميلاد غير صالح.' },
  'di.val.license1yr': { tr: 'En az 1 yıllık ehliyete sahip olmalısınız.', en: 'You must have held your license for at least 1 year.', ru: 'Стаж вождения должен быть не менее 1 года.', de: 'Sie müssen Ihren Führerschein seit mindestens 1 Jahr besitzen.', ar: 'يجب أن تمتلك رخصتك منذ سنة واحدة على الأقل.' },
  'di.val.acceptKvkk': { tr: 'Lütfen KVKK Aydınlatma Metni\'ni kabul edin.', en: 'Please accept the Privacy Notice.', ru: 'Пожалуйста, примите уведомление о данных.', de: 'Bitte akzeptieren Sie den Datenschutzhinweis.', ar: 'يرجى قبول إشعار الخصوصية.' },
  'di.val.acceptTerms': { tr: 'Lütfen Kiralama Koşulları\'nı kabul edin.', en: 'Please accept the Rental Terms.', ru: 'Пожалуйста, примите условия аренды.', de: 'Bitte akzeptieren Sie die Mietbedingungen.', ar: 'يرجى قبول شروط التأجير.' },
  // Alan etiketleri (doğrulama mesajlarında kullanılır)
  'lbl.firstName':   { tr: 'Ad', en: 'First name', ru: 'Имя', de: 'Vorname', ar: 'الاسم' },
  'lbl.lastName':    { tr: 'Soyad', en: 'Last name', ru: 'Фамилия', de: 'Nachname', ar: 'اللقب' },
  'lbl.email':       { tr: 'E-posta', en: 'Email', ru: 'Эл. почта', de: 'E-Mail', ar: 'البريد الإلكتروني' },
  'lbl.phone':       { tr: 'Telefon', en: 'Phone', ru: 'Телефон', de: 'Telefon', ar: 'الهاتف' },
  'lbl.birthDate':   { tr: 'Doğum Tarihi', en: 'Date of birth', ru: 'Дата рождения', de: 'Geburtsdatum', ar: 'تاريخ الميلاد' },
  'lbl.tcNo':        { tr: 'Kimlik No', en: 'ID number', ru: 'Номер документа', de: 'Ausweisnummer', ar: 'رقم الهوية' },
  'lbl.licenseNo':   { tr: 'Ehliyet Numarası', en: 'License number', ru: 'Номер прав', de: 'Führerscheinnummer', ar: 'رقم الرخصة' },
  'lbl.licenseDate': { tr: 'Ehliyet Veriliş Tarihi', en: 'License issue date', ru: 'Дата выдачи прав', de: 'Ausstellungsdatum', ar: 'تاريخ إصدار الرخصة' },
  'lbl.licenseClass':{ tr: 'Ehliyet Sınıfı', en: 'License class', ru: 'Категория прав', de: 'Führerscheinklasse', ar: 'فئة الرخصة' },

  // ---------- ÖDEME ----------
  'pay.orderSummary':{ tr: 'Sipariş Özeti', en: 'Order Summary', ru: 'Сводка заказа', de: 'Bestellübersicht', ar: 'ملخص الطلب' },
  'pay.method':      { tr: 'Ödeme Yöntemi', en: 'Payment Method', ru: 'Способ оплаты', de: 'Zahlungsart', ar: 'طريقة الدفع' },
  'pay.card':        { tr: 'Kredi / Banka Kartı', en: 'Credit / Debit Card', ru: 'Кредитная / дебетовая карта', de: 'Kredit-/Debitkarte', ar: 'بطاقة ائتمان / خصم' },
  'pay.bkm':         { tr: 'BKM Express', en: 'BKM Express', ru: 'BKM Express', de: 'BKM Express', ar: 'BKM Express' },
  'pay.transfer':    { tr: 'EFT / Havale', en: 'Bank Transfer', ru: 'Банковский перевод', de: 'Überweisung', ar: 'تحويل بنكي' },
  'pay.cardNumber':  { tr: 'Kart Numarası', en: 'Card Number', ru: 'Номер карты', de: 'Kartennummer', ar: 'رقم البطاقة' },
  'pay.cardName':    { tr: 'Kart Üzerindeki Ad Soyad', en: 'Name on Card', ru: 'Имя на карте', de: 'Name auf der Karte', ar: 'الاسم على البطاقة' },
  'pay.cardExp':     { tr: 'Son Kullanma Tarihi', en: 'Expiry Date', ru: 'Срок действия', de: 'Ablaufdatum', ar: 'تاريخ الانتهاء' },
  'pay.cardCvv':     { tr: 'CVV / CVC', en: 'CVV / CVC', ru: 'CVV / CVC', de: 'CVV / CVC', ar: 'CVV / CVC' },
  'pay.cardHolder':  { tr: 'Kart Sahibi', en: 'Card Holder', ru: 'Владелец карты', de: 'Karteninhaber', ar: 'حامل البطاقة' },
  'pay.expShort':    { tr: 'Son Kullanma', en: 'Expires', ru: 'До', de: 'Gültig bis', ar: 'تنتهي' },
  'pay.namePh':      { tr: 'AD SOYAD', en: 'FULL NAME', ru: 'ИМЯ ФАМИЛИЯ', de: 'VOR- NACHNAME', ar: 'الاسم الكامل' },
  'pay.saveCard':    { tr: 'Bu kartı kaydet (gelecek ödemelerde kullan)', en: 'Save this card (use for future payments)', ru: 'Сохранить карту (для будущих платежей)', de: 'Diese Karte speichern (für künftige Zahlungen)', ar: 'احفظ هذه البطاقة (للدفعات المستقبلية)' },
  'pay.installment': { tr: 'Taksit Seçeneği', en: 'Installment Option', ru: 'Рассрочка', de: 'Ratenzahlung', ar: 'خيار التقسيط' },
  'pay.singlePay':   { tr: 'Tek Çekim', en: 'Single Payment', ru: 'Один платёж', de: 'Einmalzahlung', ar: 'دفعة واحدة' },
  'pay.installments':{ tr: 'Taksit', en: 'Installments', ru: 'платежей', de: 'Raten', ar: 'أقساط' },
  'pay.interest':    { tr: 'faiz', en: 'interest', ru: 'проценты', de: 'Zinsen', ar: 'فائدة' },
  'pay.bkmTitle':    { tr: 'BKM Express ile Öde', en: 'Pay with BKM Express', ru: 'Оплата через BKM Express', de: 'Mit BKM Express bezahlen', ar: 'الدفع عبر BKM Express' },
  'pay.bkmDesc':     { tr: 'BKM Express hesabınız ile hızlı ve güvenli ödeme yapın.', en: 'Pay quickly and securely with your BKM Express account.', ru: 'Быстрая и безопасная оплата через BKM Express.', de: 'Schnell und sicher mit Ihrem BKM Express-Konto bezahlen.', ar: 'ادفع بسرعة وأمان عبر حساب BKM Express.' },
  'pay.bkmBtn':      { tr: 'BKM Express\'e Git →', en: 'Go to BKM Express →', ru: 'Перейти в BKM Express →', de: 'Zu BKM Express →', ar: '← الذهاب إلى BKM Express' },
  'pay.bankInfo':    { tr: 'Banka Hesabı Bilgileri', en: 'Bank Account Details', ru: 'Реквизиты счёта', de: 'Bankverbindung', ar: 'تفاصيل الحساب البنكي' },
  'pay.accountHolder': { tr: 'Hesap Sahibi: ExitCar Araç Kiralama A.Ş.', en: 'Account Holder: ExitCar Car Rental Inc.', ru: 'Владелец счёта: ExitCar Araç Kiralama A.Ş.', de: 'Kontoinhaber: ExitCar Araç Kiralama A.Ş.', ar: 'صاحب الحساب: ExitCar Araç Kiralama A.Ş.' },
  'pay.desc':        { tr: 'Açıklama:', en: 'Reference:', ru: 'Назначение:', de: 'Verwendungszweck:', ar: 'الوصف:' },
  'pay.secure3d':    { tr: '3D Secure ile güvende', en: 'Protected by 3D Secure', ru: 'Защищено 3D Secure', de: 'Geschützt durch 3D Secure', ar: 'محمي بـ 3D Secure' },
  'pay.secure3dText':{ tr: 'Ödemeniz bankanızın 3D Secure sistemi ile doğrulanacaktır. Onay sonrasında rezervasyonunuz anında oluşturulur.', en: 'Your payment will be verified by your bank\'s 3D Secure system. Your booking is created instantly after approval.', ru: 'Платёж будет подтверждён системой 3D Secure вашего банка. Бронь создаётся сразу после подтверждения.', de: 'Ihre Zahlung wird über das 3D-Secure-System Ihrer Bank verifiziert. Nach Bestätigung wird Ihre Buchung sofort erstellt.', ar: 'سيتم التحقق من دفعتك عبر نظام 3D Secure لبنكك. يُنشأ حجزك فوراً بعد الموافقة.' },
  'pay.payBtn':      { tr: '🔒 Güvenli Ödeme Yap — ', en: '🔒 Pay Securely — ', ru: '🔒 Оплатить безопасно — ', de: '🔒 Sicher bezahlen — ', ar: '🔒 ادفع بأمان — ' },
  'pay.amountDue':   { tr: 'Ödenecek Tutar', en: 'Amount Due', ru: 'К оплате', de: 'Zu zahlen', ar: 'المبلغ المستحق' },
  'pay.vatIncl':     { tr: 'KDV Dahil · Tüm Vergiler Dahil', en: 'VAT Included · All Taxes Included', ru: 'НДС включён · Все налоги включены', de: 'inkl. MwSt. · Alle Steuern inklusive', ar: 'شامل الضريبة · جميع الرسوم مشمولة' },
  'pay.carRental':   { tr: 'Araç Kirası', en: 'Car Rental', ru: 'Аренда авто', de: 'Mietgebühr', ar: 'إيجار السيارة' },
  'pay.resDetail':   { tr: '📋 Rezervasyon Detayı', en: '📋 Booking Details', ru: '📋 Детали брони', de: '📋 Buchungsdetails', ar: '📋 تفاصيل الحجز' },
  'pay.instantConf': { tr: 'Ödeme sonrası rezervasyon numaranız e-posta ile iletilir.', en: 'Your booking number will be emailed after payment.', ru: 'Номер брони придёт на почту после оплаты.', de: 'Ihre Buchungsnummer wird nach der Zahlung per E-Mail gesendet.', ar: 'سيُرسل رقم حجزك بالبريد بعد الدفع.' },
  'pay.instantConfTitle': { tr: 'Anında Onay', en: 'Instant Confirmation', ru: 'Мгновенное подтверждение', de: 'Sofortige Bestätigung', ar: 'تأكيد فوري' },
  'pay.processing':  { tr: '⏳ Ödeme İşleniyor...', en: '⏳ Processing payment...', ru: '⏳ Обработка платежа...', de: '⏳ Zahlung wird verarbeitet...', ar: '⏳ جارٍ معالجة الدفع...' },
  'pay.approving':   { tr: '✅ Onaylanıyor...', en: '✅ Approving...', ru: '✅ Подтверждение...', de: '✅ Wird bestätigt...', ar: '✅ جارٍ التأكيد...' },
  'pay.successTitle':{ tr: 'Rezervasyon Onaylandı!', en: 'Booking Confirmed!', ru: 'Бронь подтверждена!', de: 'Buchung bestätigt!', ar: 'تم تأكيد الحجز!' },
  'pay.successSub':  { tr: 'Ödemeniz başarıyla alındı. Rezervasyon detayları e-posta adresinize gönderildi.', en: 'Your payment was received successfully. Booking details have been emailed to you.', ru: 'Платёж успешно получен. Детали брони отправлены на почту.', de: 'Ihre Zahlung wurde erfolgreich empfangen. Buchungsdetails wurden per E-Mail gesendet.', ar: 'تم استلام دفعتك بنجاح. أُرسلت تفاصيل الحجز إلى بريدك.' },
  'pay.successNote': { tr: 'Rezervasyon numaranızı aracı teslim alırken yanınızda bulundurun.', en: 'Keep your booking number with you when picking up the car.', ru: 'Имейте номер брони при получении авто.', de: 'Halten Sie Ihre Buchungsnummer bei der Abholung bereit.', ar: 'احتفظ برقم حجزك عند استلام السيارة.' },
  'pay.goHome':      { tr: '🏠 Ana Sayfaya Dön', en: '🏠 Back to Home', ru: '🏠 На главную', de: '🏠 Zur Startseite', ar: '🏠 العودة للرئيسية' },
  'pay.print':       { tr: '🖨️ Rezervasyonu Yazdır', en: '🖨️ Print Booking', ru: '🖨️ Распечатать бронь', de: '🖨️ Buchung drucken', ar: '🖨️ طباعة الحجز' },
  'pay.errCardNum':  { tr: 'Lütfen geçerli bir kart numarası girin.', en: 'Please enter a valid card number.', ru: 'Введите корректный номер карты.', de: 'Bitte gültige Kartennummer eingeben.', ar: 'يرجى إدخال رقم بطاقة صحيح.' },
  'pay.errCardName': { tr: 'Lütfen kart üzerindeki adı girin.', en: 'Please enter the name on the card.', ru: 'Введите имя на карте.', de: 'Bitte Namen auf der Karte eingeben.', ar: 'يرجى إدخال الاسم على البطاقة.' },
  'pay.errExpFmt':   { tr: 'Lütfen son kullanma tarihini AA/YY formatında girin.', en: 'Please enter the expiry date in MM/YY format.', ru: 'Введите срок действия в формате ММ/ГГ.', de: 'Bitte Ablaufdatum im Format MM/JJ eingeben.', ar: 'يرجى إدخال تاريخ الانتهاء بصيغة شش/سس.' },
  'pay.errExpPast':  { tr: 'Kart son kullanma tarihi geçmiş veya geçersiz.', en: 'The card expiry date is past or invalid.', ru: 'Срок действия карты истёк или неверен.', de: 'Das Ablaufdatum der Karte ist abgelaufen oder ungültig.', ar: 'تاريخ انتهاء البطاقة منتهٍ أو غير صالح.' },
  'pay.errCvv':      { tr: 'Lütfen CVV/CVC kodunu girin.', en: 'Please enter the CVV/CVC code.', ru: 'Введите код CVV/CVC.', de: 'Bitte CVV/CVC-Code eingeben.', ar: 'يرجى إدخال رمز CVV/CVC.' },

  // ---------- SAYFA BAŞLIKLARI (title) ----------
  'title.index':       { tr: 'ExitCar — Kiralık Araç Fiyatlarını Karşılaştır | Rent a Car', en: 'ExitCar — Compare Car Rental Prices | Rent a Car', ru: 'ExitCar — Сравните цены на аренду авто | Rent a Car', de: 'ExitCar — Mietwagenpreise vergleichen | Rent a Car', ar: 'ExitCar — قارن أسعار تأجير السيارات | Rent a Car' },
  'title.search':      { tr: 'Araç Listesi | ExitCar', en: 'Car List | ExitCar', ru: 'Список авто | ExitCar', de: 'Fahrzeugliste | ExitCar', ar: 'قائمة السيارات | ExitCar' },
  'title.reservation': { tr: 'Araç Seç & Sigorta | ExitCar Rezervasyon', en: 'Select Car & Insurance | ExitCar Booking', ru: 'Авто и страховка | Бронь ExitCar', de: 'Auto & Versicherung | ExitCar Buchung', ar: 'اختر السيارة والتأمين | حجز ExitCar' },
  'title.driver':      { tr: 'Sürücü Bilgileri | ExitCar Rezervasyon', en: 'Driver Details | ExitCar Booking', ru: 'Данные водителя | Бронь ExitCar', de: 'Fahrerdaten | ExitCar Buchung', ar: 'بيانات السائق | حجز ExitCar' },
  'title.payment':     { tr: 'Ödeme | ExitCar Rezervasyon', en: 'Payment | ExitCar Booking', ru: 'Оплата | Бронь ExitCar', de: 'Zahlung | ExitCar Buchung', ar: 'الدفع | حجز ExitCar' },

  // ---------- META AÇIKLAMALARI (SEO) ----------
  'desc.index':  { tr: 'ExitCar ile Antalya ve Türkiye genelinde en uygun kiralık araç fiyatlarını karşılaştırın. Havalimanı teslim, 7/24 destek, ücretsiz iptal. Hemen rezervasyon yapın.', en: 'Compare the cheapest car rental prices in Antalya and across Türkiye with ExitCar. Airport pick-up, 24/7 support, free cancellation. Book your rent a car now.', ru: 'Сравните самые дешёвые цены на аренду авто в Анталье и по всей Турции с ExitCar. Выдача в аэропорту, поддержка 24/7, бесплатная отмена. Бронируйте сейчас.', de: 'Vergleichen Sie mit ExitCar die günstigsten Mietwagenpreise in Antalya und der ganzen Türkei. Flughafenabholung, 24/7-Support, kostenlose Stornierung. Jetzt buchen.', ar: 'قارن أرخص أسعار تأجير السيارات في أنطاليا وجميع أنحاء تركيا مع ExitCar. استلام من المطار، دعم 24/7، إلغاء مجاني. احجز الآن.' },
  'desc.search': { tr: 'Garenta, Avis, Sixt, Hertz ve 50+ kiralama şirketinin araç fiyatlarını ExitCar ile tek ekranda karşılaştırın ve en uygununu seçin.', en: 'Compare car prices from Garenta, Avis, Sixt, Hertz and 50+ rental companies on one screen with ExitCar and pick the best deal.', ru: 'Сравните цены Garenta, Avis, Sixt, Hertz и 50+ компаний проката на одном экране с ExitCar и выберите лучшее предложение.', de: 'Vergleichen Sie mit ExitCar die Preise von Garenta, Avis, Sixt, Hertz und 50+ Vermietern auf einen Blick und wählen Sie das beste Angebot.', ar: 'قارن أسعار Garenta وAvis وSixt وHertz و50+ شركة تأجير على شاشة واحدة مع ExitCar واختر أفضل عرض.' },

  // ============================================================
  // LOKASYON SAYFASI — ANTALYA HAVALİMANI (AYT)
  // ============================================================
  'title.ayt': { tr: 'Antalya Havalimanı Araç Kiralama (AYT) — 7/24 Teslim | ExitCar', en: 'Antalya Airport Car Rental (AYT) — 24/7 Pickup | ExitCar', ru: 'Аренда авто в аэропорту Антальи (AYT) — выдача 24/7 | ExitCar', de: 'Mietwagen Flughafen Antalya (AYT) — 24/7 Abholung | ExitCar', ar: 'تأجير سيارات في مطار أنطاليا (AYT) — استلام 24/7 | ExitCar' },
  'desc.ayt':  { tr: 'Antalya Havalimanı\'nda 7/24 araç teslimi. 50+ kiralama firması arasından karşılaştır, ücretsiz iptal, uçuş takibi. Lara, Kemer, Side, Belek\'e en uygun araç.', en: 'Pick up your rental car at Antalya Airport 24/7. Compare 50+ companies, free cancellation, flight tracking. The right car to Lara, Kemer, Side and Belek.', ru: 'Получите арендованное авто в аэропорту Антальи 24/7. Сравните 50+ компаний, бесплатная отмена, отслеживание рейса. До Лары, Кемера, Сиде и Белека.', de: 'Mietwagen am Flughafen Antalya rund um die Uhr abholen. 50+ Anbieter vergleichen, kostenlose Stornierung, Flugverfolgung. Direkt nach Lara, Kemer, Side oder Belek.', ar: 'استلم سيارتك المستأجرة في مطار أنطاليا 24/7. قارن 50+ شركة، إلغاء مجاني، متابعة الرحلة. أفضل سيارة إلى لارا، كيمر، سيدي وبيليك.' },

  'ayt.h1':       { tr: 'Antalya Havalimanı (AYT) Araç Kiralama', en: 'Antalya Airport (AYT) Car Rental', ru: 'Аренда авто в аэропорту Антальи (AYT)', de: 'Mietwagen Flughafen Antalya (AYT)', ar: 'تأجير سيارات مطار أنطاليا (AYT)' },
  'ayt.heroSub':  { tr: 'Uçaktan inip dakikalar içinde direksiyonda olun. 50+ kiralama firmasından en uygun fiyatları tek ekranda karşılaştırın — uçuş takibi ile geç gelseniz bile aracınız sizi bekler.', en: 'Be behind the wheel within minutes of landing. Compare the best prices from 50+ rental companies on one screen — flight tracking ensures your car waits for you even if you arrive late.', ru: 'Сесть за руль через несколько минут после посадки. Сравните лучшие цены 50+ компаний на одном экране — благодаря отслеживанию рейса машина дождётся вас даже при задержке.', de: 'Setzen Sie sich innerhalb von Minuten nach der Landung ans Steuer. Vergleichen Sie die besten Preise von 50+ Vermietern auf einen Blick — dank Flugverfolgung wartet Ihr Wagen auch bei Verspätung.', ar: 'كن خلف المقود خلال دقائق من هبوطك. قارن أفضل الأسعار من 50+ شركة تأجير على شاشة واحدة — متابعة الرحلة تضمن انتظار سيارتك حتى إن تأخرت.' },
  'ayt.heroCta':  { tr: 'AYT\'de Müsait Araçları Gör', en: 'See Available Cars at AYT', ru: 'Доступные авто в AYT', de: 'Verfügbare Fahrzeuge am AYT', ar: 'السيارات المتاحة في AYT' },
  'ayt.heroBadge':{ tr: '✈️ Havalimanı içi teslim · 7/24', en: '✈️ In-airport pickup · 24/7', ru: '✈️ Выдача в аэропорту · 24/7', de: '✈️ Übergabe im Flughafen · 24/7', ar: '✈️ تسليم داخل المطار · 24/7' },

  'ayt.s1Title':      { tr: 'Neden AYT\'de ExitCar ile Araç Kiralayın?', en: 'Why Rent at AYT with ExitCar?', ru: 'Почему стоит арендовать в AYT с ExitCar?', de: 'Warum am AYT mit ExitCar mieten?', ar: 'لماذا تستأجر في AYT مع ExitCar؟' },
  'ayt.s1c1Title': { tr: '7/24 Karşılama', en: '24/7 Welcome Desk', ru: 'Встреча 24/7', de: '24/7-Empfang', ar: 'استقبال 24/7' },
  'ayt.s1c1Text':  { tr: 'Gece yarısı veya sabah erken — uçuş saatiniz fark etmez, ofis hep açık.', en: 'Midnight or early morning — whatever your flight time, the desk is always open.', ru: 'Ночью или ранним утром — в любое время вашего рейса стойка работает.', de: 'Mitternacht oder früh am Morgen — Ihre Flugzeit spielt keine Rolle, der Schalter ist immer offen.', ar: 'منتصف الليل أو الصباح الباكر — مهما كان موعد رحلتك، المكتب مفتوح دائماً.' },
  'ayt.s1c2Title': { tr: 'Uçuş Takibi', en: 'Flight Tracking', ru: 'Отслеживание рейса', de: 'Flugverfolgung', ar: 'متابعة الرحلة' },
  'ayt.s1c2Text':  { tr: 'Rezervasyona uçuş numarasını girin; gecikme olursa aracınız sizi bekler, ek ücret yok.', en: 'Add your flight number to the booking; if delayed, your car waits with no extra charge.', ru: 'Укажите номер рейса в бронировании; при задержке авто дождётся вас без доплат.', de: 'Geben Sie Ihre Flugnummer in der Buchung an; bei Verspätung wartet Ihr Wagen ohne Aufpreis.', ar: 'أضف رقم رحلتك إلى الحجز؛ في حال التأخير تنتظرك السيارة دون رسوم إضافية.' },
  'ayt.s1c3Title': { tr: 'Şeffaf Fiyat', en: 'Transparent Price', ru: 'Прозрачная цена', de: 'Transparenter Preis', ar: 'سعر شفّاف' },
  'ayt.s1c3Text':  { tr: 'KDV, trafik sigortası ve havalimanı teslim ücreti dahil. Sürpriz yok.', en: 'VAT, traffic insurance and airport pickup fee included. No surprises.', ru: 'НДС, ОСАГО и сбор за выдачу в аэропорту включены. Без сюрпризов.', de: 'MwSt., Haftpflicht und Flughafengebühr inklusive. Keine Überraschungen.', ar: 'الضريبة وتأمين المرور ورسوم الاستلام من المطار مشمولة. لا مفاجآت.' },

  'ayt.s2Title': { tr: 'AYT\'de Araç Teslim Süreci', en: 'Pickup Process at AYT', ru: 'Процесс получения авто в AYT', de: 'Übergabeablauf am AYT', ar: 'إجراءات استلام السيارة في AYT' },
  'ayt.step1':   { tr: '1. Online rezervasyon — Tarih ve saatleri seçin, aracınızı 60 saniyede ayırtın.', en: '1. Book online — Pick your dates and times, reserve your car in 60 seconds.', ru: '1. Бронируйте онлайн — выберите даты и время, забронируйте авто за 60 секунд.', de: '1. Online buchen — Datum und Uhrzeit wählen, in 60 Sekunden reservieren.', ar: '1. احجز عبر الإنترنت — اختر التواريخ والأوقات، واحجز سيارتك في 60 ثانية.' },
  'ayt.step2':   { tr: '2. Onay e-postası — Rezervasyon numarası ve teslim noktası yönlendirmesi e-postanıza gelir.', en: '2. Confirmation email — Booking number and pickup directions arrive in your inbox.', ru: '2. Письмо-подтверждение — номер брони и схема выдачи приходят на e-mail.', de: '2. Bestätigungs-E-Mail — Buchungsnummer und Wegbeschreibung kommen per E-Mail.', ar: '2. بريد التأكيد — رقم الحجز وتوجيهات الاستلام تصلك على البريد الإلكتروني.' },
  'ayt.step3':   { tr: '3. AYT\'ye iniş — Bagajınızı aldıktan sonra Geliş Salonu\'ndaki "Rent a Car" tabelalarını takip edin.', en: '3. Land at AYT — After baggage claim, follow the "Rent a Car" signs in the Arrivals Hall.', ru: '3. Прилёт в AYT — после получения багажа следуйте указателям "Rent a Car" в зале прилёта.', de: '3. Landung am AYT — Nach der Gepäckausgabe folgen Sie den "Rent a Car"-Schildern in der Ankunftshalle.', ar: '3. الهبوط في AYT — بعد استلام أمتعتك، اتبع لافتات "Rent a Car" في صالة الوصول.' },
  'ayt.step4':   { tr: '4. Belgeler & araç — Ehliyet, kimlik ve kredi kartını ibraz edin; aracın teslim turunu yapın, anahtar sizin.', en: '4. Documents & car — Show your license, ID and credit card; do a quick walk-around and the key is yours.', ru: '4. Документы и авто — предъявите права, паспорт и кредитку; пройдитесь вокруг машины — и ключ ваш.', de: '4. Unterlagen & Fahrzeug — Führerschein, Ausweis und Kreditkarte vorlegen; kurze Fahrzeugübernahme — und der Schlüssel ist Ihrer.', ar: '4. الوثائق والسيارة — قدّم رخصتك وهويتك وبطاقتك الائتمانية؛ افحص السيارة سريعاً، والمفتاح لك.' },

  'ayt.s3Title': { tr: 'AYT\'den Antalya\'nın Popüler Bölgelerine Mesafeler', en: 'Distances from AYT to Antalya\'s Popular Areas', ru: 'Расстояния от AYT до популярных районов Антальи', de: 'Entfernungen vom AYT zu beliebten Regionen Antalyas', ar: 'المسافات من AYT إلى أشهر مناطق أنطاليا' },
  'ayt.s3Intro': { tr: 'Rotanızı baştan biliyorsanız, doğru aracı seçmeniz kolaylaşır. Otomatik bir sedan şehir içinde rahat ederken, Toroslar\'a çıkacaksanız SUV daha mantıklı.', en: 'Knowing your route upfront makes choosing the right car easier. An automatic sedan is comfortable in town, while an SUV makes more sense for the Taurus Mountains.', ru: 'Если вы знаете маршрут заранее, выбрать машину проще. Автоматический седан удобен в городе, а в Таврские горы лучше подойдёт внедорожник.', de: 'Wenn Sie Ihre Route kennen, ist die Fahrzeugwahl einfacher. Eine Automatik-Limousine ist im Stadtgebiet komfortabel; für die Taurusberge eignet sich ein SUV besser.', ar: 'معرفة مسارك مسبقاً تسهّل اختيار السيارة المناسبة. السيدان الأوتوماتيكية مريحة داخل المدينة، أما لجبال طوروس فالدفع الرباعي خيار أفضل.' },
  'ayt.thDest':  { tr: 'Destinasyon', en: 'Destination', ru: 'Направление', de: 'Ziel', ar: 'الوجهة' },
  'ayt.thDist':  { tr: 'Mesafe', en: 'Distance', ru: 'Расстояние', de: 'Entfernung', ar: 'المسافة' },
  'ayt.thTime':  { tr: 'Tahmini Süre', en: 'Drive Time', ru: 'Время в пути', de: 'Fahrzeit', ar: 'وقت القيادة' },
  'ayt.dCity':       { tr: 'Antalya Şehir Merkezi', en: 'Antalya City Center', ru: 'Центр Антальи', de: 'Antalya Stadtzentrum', ar: 'وسط أنطاليا' },
  'ayt.dLara':       { tr: 'Lara Plajı', en: 'Lara Beach', ru: 'Пляж Лара', de: 'Lara Strand', ar: 'شاطئ لارا' },
  'ayt.dKonyaalti':  { tr: 'Konyaaltı', en: 'Konyaaltı', ru: 'Коньяалты', de: 'Konyaaltı', ar: 'كونيا ألتي' },
  'ayt.dKemer':      { tr: 'Kemer', en: 'Kemer', ru: 'Кемер', de: 'Kemer', ar: 'كيمر' },
  'ayt.dBelek':      { tr: 'Belek', en: 'Belek', ru: 'Белек', de: 'Belek', ar: 'بيليك' },
  'ayt.dSide':       { tr: 'Side / Manavgat', en: 'Side / Manavgat', ru: 'Сиде / Манавгат', de: 'Side / Manavgat', ar: 'سيدي / مانافجات' },
  'ayt.dAlanya':     { tr: 'Alanya', en: 'Alanya', ru: 'Алания', de: 'Alanya', ar: 'ألانيا' },
  'ayt.dKas':        { tr: 'Kaş', en: 'Kaş', ru: 'Каш', de: 'Kaş', ar: 'كاش' },
  'ayt.minUnit': { tr: 'dk', en: 'min', ru: 'мин', de: 'Min.', ar: 'د' },

  'ayt.s4Title':   { tr: 'AYT\'den Çıkışta Hangi Aracı Seçmeli?', en: 'Which Car Should You Pick from AYT?', ru: 'Какую машину выбрать в AYT?', de: 'Welches Auto sollten Sie am AYT wählen?', ar: 'أي سيارة تختار من AYT؟' },
  'ayt.s4c1Title': { tr: 'Şehir İçi & Plaj', en: 'City & Beach', ru: 'Город и пляж', de: 'Stadt & Strand', ar: 'المدينة والشاطئ' },
  'ayt.s4c1Text':  { tr: 'Lara, Konyaaltı, Kaleiçi turu için ekonomik veya kompakt sedan ideal. Otomatik, benzinli, düşük yakıt tüketimi.', en: 'For Lara, Konyaaltı and Kaleiçi, an economy or compact sedan is ideal — automatic, petrol, low fuel consumption.', ru: 'Для Лары, Коньяалты и Калеичи подойдёт эконом или компактный седан — автомат, бензин, низкий расход.', de: 'Für Lara, Konyaaltı und Kaleiçi ist eine Economy- oder Kompaktlimousine ideal — Automatik, Benzin, niedriger Verbrauch.', ar: 'لِلارا وكونيا ألتي وكاليتشي، السيدان الاقتصادية أو المدمجة مثالية — أوتوماتيك، بنزين، استهلاك منخفض.' },
  'ayt.s4c2Title': { tr: 'Aile & Resort', en: 'Family & Resort', ru: 'Семья и отель', de: 'Familie & Resort', ar: 'العائلة والمنتجع' },
  'ayt.s4c2Text':  { tr: 'Belek, Side veya Alanya\'daki tatil köyüne 4-5 kişilik aileyle gidiyorsanız orta sınıf bir sedan veya küçük SUV bagajı da rahatlatır.', en: 'Heading to a Belek, Side or Alanya resort with 4-5 people? A mid-size sedan or small SUV gives extra luggage room.', ru: 'Едете в отель в Белеке, Сиде или Алании с семьёй из 4-5 человек? Среднеразмерный седан или небольшой внедорожник дадут место для багажа.', de: 'Mit 4-5 Personen zu einem Resort in Belek, Side oder Alanya? Eine Mittelklasse-Limousine oder ein kleiner SUV bietet extra Kofferraum.', ar: 'متجهٌ إلى منتجع في بيليك أو سيدي أو ألانيا مع 4-5 أشخاص؟ سيدان متوسطة أو دفع رباعي صغير يمنحك مساحة أمتعة إضافية.' },
  'ayt.s4c3Title': { tr: 'Dağ & Uzun Mesafe', en: 'Mountain & Long Distance', ru: 'Горы и дальние поездки', de: 'Berge & Langstrecke', ar: 'الجبال والمسافات الطويلة' },
  'ayt.s4c3Text':  { tr: 'Kaş, Olympos, Kapadokya gibi uzun rotalarda dizel SUV hem yakıt tasarrufu hem yol konforu sağlar.', en: 'For long routes like Kaş, Olympos or Cappadocia, a diesel SUV gives fuel economy and ride comfort.', ru: 'Для дальних маршрутов вроде Каша, Олимпоса или Каппадокии дизельный внедорожник — это экономия топлива и комфорт.', de: 'Für lange Strecken wie Kaş, Olympos oder Kappadokien bietet ein Diesel-SUV Sparsamkeit und Fahrkomfort.', ar: 'للمسارات الطويلة مثل كاش وأوليمبوس وكابادوكيا، الدفع الرباعي بمحرك ديزل يوفّر الوقود وراحة القيادة.' },

  'ayt.faqTitle': { tr: 'Antalya Havalimanı Araç Kiralama — Sık Sorulan Sorular', en: 'Antalya Airport Car Rental — Frequently Asked Questions', ru: 'Аренда авто в аэропорту Антальи — частые вопросы', de: 'Mietwagen Flughafen Antalya — Häufige Fragen', ar: 'تأجير سيارات مطار أنطاليا — الأسئلة الشائعة' },
  'ayt.faqQ1':    { tr: 'AYT\'de aracı tam olarak nereden alıyorum?', en: 'Where exactly do I pick up the car at AYT?', ru: 'Где именно я получаю авто в AYT?', de: 'Wo genau hole ich das Auto am AYT ab?', ar: 'من أين بالضبط أستلم السيارة في AYT؟' },
  'ayt.faqA1':    { tr: 'AYT Geliş Salonu\'ndan çıkışta sağ tarafta "Rent a Car" alanı bulunur. Rezervasyon sırasında size atanan firmanın bankosuna gidersiniz; ofis havalimanı içindedir, shuttle gerekmez.', en: 'In the AYT Arrivals Hall, the "Rent a Car" area is to the right of the exit. Go to the desk of the company assigned to your booking; the office is inside the airport, no shuttle needed.', ru: 'В зале прилёта AYT зона "Rent a Car" находится справа от выхода. Подойдите к стойке компании из вашей брони; офис внутри аэропорта, шаттл не нужен.', de: 'In der AYT-Ankunftshalle befindet sich der "Rent a Car"-Bereich rechts vom Ausgang. Gehen Sie zum Schalter der in Ihrer Buchung zugewiesenen Firma; das Büro ist im Flughafen, kein Shuttle nötig.', ar: 'في صالة الوصول بمطار AYT، تقع منطقة "Rent a Car" يمين المخرج. توجّه إلى مكتب الشركة المخصصة لحجزك؛ المكتب داخل المطار ولا حاجة إلى حافلة.' },
  'ayt.faqQ2':    { tr: 'Gece geç saatte veya sabah çok erken aracımı alabilir miyim?', en: 'Can I pick up my car late at night or very early in the morning?', ru: 'Можно ли забрать машину поздно ночью или очень рано утром?', de: 'Kann ich mein Auto spät abends oder früh morgens abholen?', ar: 'هل يمكنني استلام سيارتي ليلاً متأخراً أو في الصباح الباكر جداً؟' },
  'ayt.faqA2':    { tr: 'Evet, AYT teslim noktası 7/24 açıktır. Saat 02:00 veya 05:00 fark etmez; bankoda dilediğiniz dilde personel sizi karşılar.', en: 'Yes — the AYT desk is open 24/7. Whether it\'s 2 a.m. or 5 a.m., multilingual staff will be there to greet you.', ru: 'Да, стойка AYT работает 24/7. Хоть в 2 ночи, хоть в 5 утра — вас встретит персонал, говорящий на нескольких языках.', de: 'Ja — der AYT-Schalter ist 24/7 geöffnet. Ob 2 oder 5 Uhr morgens — mehrsprachiges Personal empfängt Sie.', ar: 'نعم، مكتب AYT مفتوح 24/7. سواء كانت الساعة 2 صباحاً أو 5 صباحاً، يستقبلك موظفون متعددو اللغات.' },
  'ayt.faqQ3':    { tr: 'Uçuşum gecikirse aracım iptal olur mu?', en: 'If my flight is delayed, is my booking cancelled?', ru: 'Если мой рейс задержится, бронь отменится?', de: 'Wird meine Buchung storniert, wenn mein Flug Verspätung hat?', ar: 'إذا تأخرت رحلتي، هل يُلغى حجزي؟' },
  'ayt.faqA3':    { tr: 'Hayır. Rezervasyona uçuş numarasını eklediyseniz sistemimiz uçuşu canlı takip eder, aracınız tutulur ve ek ücret alınmaz. Yine de gecikme uzun olacaksa info@exitcar.com\'a kısa bir e-posta atın.', en: 'No. If you added your flight number to the booking, we track it live, hold your car and charge no extra fee. For very long delays, drop a quick email to info@exitcar.com.', ru: 'Нет. Если вы добавили номер рейса, мы отслеживаем его в реальном времени, удерживаем авто и не взимаем доплату. При очень долгой задержке напишите на info@exitcar.com.', de: 'Nein. Wenn Sie Ihre Flugnummer eingetragen haben, verfolgen wir den Flug live, halten Ihr Auto bereit und erheben keine Zusatzgebühr. Bei sehr langen Verspätungen schreiben Sie kurz an info@exitcar.com.', ar: 'لا. إذا أضفت رقم رحلتك إلى الحجز، نتابعها مباشرةً ونحتفظ بسيارتك دون رسوم إضافية. للتأخيرات الطويلة جداً، أرسل بريداً إلى info@exitcar.com.' },
  'ayt.faqQ4':    { tr: 'Yabancı uyrukluyum, hangi belgeler gerekli?', en: 'I\'m a foreign national — what documents do I need?', ru: 'Я иностранный гражданин — какие документы нужны?', de: 'Ich bin Ausländer — welche Dokumente benötige ich?', ar: 'أنا مقيم أجنبي — ما الوثائق المطلوبة؟' },
  'ayt.faqA4':    { tr: 'Pasaport, ülkenizde geçerli sürücü belgesi (en az 1 yıllık) ve sürücü adına kayıtlı bir kredi kartı. AB, İngiltere, Rusya ehliyetleri Türkiye\'de geçerlidir; bazı ülkeler için Uluslararası Sürücü Belgesi (IDP) önerilir.', en: 'A passport, a valid driving license from your country (held at least 1 year) and a credit card in the driver\'s name. EU, UK and Russian licenses are valid in Türkiye; for some countries an International Driving Permit (IDP) is recommended.', ru: 'Загранпаспорт, действующее водительское удостоверение из вашей страны (стаж минимум 1 год) и кредитная карта на имя водителя. Права ЕС, Великобритании и России действительны в Турции; для ряда стран рекомендуется международное водительское удостоверение (IDP).', de: 'Reisepass, gültiger Führerschein aus Ihrem Land (mindestens 1 Jahr besessen) und Kreditkarte auf den Namen des Fahrers. EU-, UK- und russische Führerscheine gelten in der Türkei; für einige Länder wird ein Internationaler Führerschein (IDP) empfohlen.', ar: 'جواز السفر، رخصة قيادة سارية من بلدك (لا تقل عن سنة) وبطاقة ائتمان باسم السائق. رخص الاتحاد الأوروبي والمملكة المتحدة وروسيا سارية في تركيا؛ ولبعض الدول يُنصح برخصة القيادة الدولية (IDP).' },

  'ayt.ctaTitle': { tr: 'AYT\'deki Aracınızı Şimdi Ayırtın', en: 'Reserve Your Car at AYT Now', ru: 'Забронируйте машину в AYT сейчас', de: 'Reservieren Sie jetzt Ihr Fahrzeug am AYT', ar: 'احجز سيارتك في AYT الآن' },
  'ayt.ctaSub':   { tr: 'Saniyeler içinde 50+ firmayı karşılaştırın, ücretsiz iptal güvencesiyle ayırtın.', en: 'Compare 50+ companies in seconds, book with free cancellation peace of mind.', ru: 'Сравните 50+ компаний за секунды и забронируйте с бесплатной отменой.', de: 'Vergleichen Sie in Sekunden 50+ Anbieter und buchen Sie mit kostenloser Stornierung.', ar: 'قارن 50+ شركة في ثوانٍ، واحجز مع ضمان الإلغاء المجاني.' },

  // ============================================================
  // BLOG — index sayfası
  // ============================================================
  'title.blog': { tr: 'Blog — Araç Kiralama Rehberleri & İpuçları | ExitCar', en: 'Blog — Car Rental Guides & Tips | ExitCar', ru: 'Блог — гиды и советы по аренде авто | ExitCar', de: 'Blog — Mietwagen-Ratgeber & Tipps | ExitCar', ar: 'المدونة — أدلة ونصائح تأجير السيارات | ExitCar' },
  'desc.blog':  { tr: 'Türkiye\'de araç kiralama, Antalya\'da sürüş, sigorta, ehliyet kuralları — turistler ve yerleşik yabancılar için detaylı rehberler.', en: 'Car rental in Türkiye, driving in Antalya, insurance, license rules — in-depth guides for tourists and residents.', ru: 'Аренда авто в Турции, вождение в Анталье, страховка, правила прав — подробные гиды для туристов и резидентов.', de: 'Mietwagen in der Türkei, Fahren in Antalya, Versicherung, Führerschein-Regeln — ausführliche Ratgeber für Touristen und Residenten.', ar: 'تأجير السيارات في تركيا، القيادة في أنطاليا، التأمين، قواعد الرخص — أدلة معمّقة للسياح والمقيمين.' },
  'blog.h1':       { tr: 'Rehber & Makaleler', en: 'Guides & Articles', ru: 'Гиды и статьи', de: 'Ratgeber & Artikel', ar: 'الأدلة والمقالات' },
  'blog.sub':      { tr: 'Antalya ve Türkiye\'de araç kiralamaya dair bilmeniz gereken her şey — özellikle yabancı turistler ve yerleşik yabancılar için.', en: 'Everything you need to know about renting a car in Antalya and Türkiye — especially for foreign tourists and residents.', ru: 'Всё, что нужно знать об аренде авто в Анталье и Турции — особенно для иностранных туристов и резидентов.', de: 'Alles, was Sie zur Anmietung in Antalya und der Türkei wissen müssen — besonders für ausländische Touristen und Residenten.', ar: 'كل ما تحتاج معرفته عن تأجير السيارات في أنطاليا وتركيا — خاصة للسياح الأجانب والمقيمين.' },
  'blog.readMore': { tr: 'Devamını Oku →', en: 'Read More →', ru: 'Читать дальше →', de: 'Weiterlesen →', ar: '← اقرأ المزيد' },
  'blog.minRead':  { tr: 'dk okuma', en: 'min read', ru: 'мин чтения', de: 'Min. Lesezeit', ar: 'دقائق قراءة' },
  'blog.published':{ tr: 'Yayımlanma:', en: 'Published:', ru: 'Опубликовано:', de: 'Veröffentlicht:', ar: 'تاريخ النشر:' },
  'blog.a1Title':   { tr: 'Türkiye\'de Yabancı Olarak Araç Kiralama Rehberi', en: 'Renting a Car in Türkiye as a Foreign Tourist', ru: 'Аренда авто в Турции для иностранцев', de: 'Mietwagen in der Türkei für Ausländer', ar: 'دليل تأجير السيارات في تركيا للسياح الأجانب' },
  'blog.a1Excerpt': { tr: 'Pasaport, ehliyet geçerliliği, sigorta paketleri ve Antalya\'da sürüş — yabancı turistlerin bilmesi gereken her şey, sade dille.', en: 'Passport, license validity, insurance packages and driving in Antalya — everything a foreign tourist needs to know, in plain language.', ru: 'Загранпаспорт, действие прав, страховые пакеты и вождение в Анталье — всё, что нужно знать иностранному туристу, простым языком.', de: 'Reisepass, Führerschein-Gültigkeit, Versicherungspakete und Fahren in Antalya — alles, was ein ausländischer Tourist wissen muss, in klarer Sprache.', ar: 'جواز السفر، صلاحية الرخصة، باقات التأمين والقيادة في أنطاليا — كل ما يحتاج السائح الأجنبي معرفته بلغة بسيطة.' },
  'blog.a2Title':   { tr: 'Filo Yönetimi Nedir? KOBİ\'ler İçin Kapsamlı Rehber', en: 'What Is Fleet Management? A Practical SME Guide', ru: 'Что такое управление автопарком? Гид для МСБ', de: 'Was ist Flottenmanagement? KMU-Leitfaden', ar: 'ما هي إدارة الأسطول؟ دليل للشركات الصغيرة والمتوسطة' },
  'blog.a2Excerpt': { tr: 'Operasyonel vs finansal kiralama farkı, maliyet analizi, vergi avantajları — KOBİ ölçeğinde doğru kararı veri ile verin.', en: 'Operational vs financial leasing compared, cost analysis, tax advantages — make the right SME-scale decision with data.', ru: 'Операционный vs финансовый лизинг, анализ стоимости и налоговые преимущества — обоснованное решение для МСБ.', de: 'Operating- vs. Finance-Lease im Vergleich, Kostenanalyse, Steuervorteile — die richtige KMU-Entscheidung mit Daten.', ar: 'الإيجار التشغيلي مقابل المالي، تحليل التكلفة والمزايا الضريبية — قرار مبني على البيانات للشركات الصغيرة والمتوسطة.' },
  'blog.a3Title':   { tr: 'Araç Kiralama Hizmetleri Rehberi: Türler ve Fiyatlandırma', en: 'Car Rental Services Guide: Types and Pricing Explained', ru: 'Услуги аренды авто: все виды и цены', de: 'Mietwagen-Leistungen im Überblick: Arten und Preise', ar: 'دليل خدمات تأجير السيارات: الأنواع والأسعار' },
  'blog.a3Excerpt': { tr: 'Saatlik, günlük, aylık, uzun dönem ve transfer hizmetleri — fiyat anatomisi ve sigorta paketleri ile birlikte tam rehber.', en: 'Hourly, daily, monthly, long-term and transfers — the complete guide including pricing anatomy and insurance packages.', ru: 'Почасовая, суточная, месячная, долгосрочная и трансферы — полный гид с анатомией цены и страховыми пакетами.', de: 'Stündlich, täglich, monatlich, langfristig und Transfer — der komplette Ratgeber mit Preisanatomie und Versicherungspaketen.', ar: 'بالساعة واليومي والشهري وطويل الأمد والنقل — الدليل الكامل مع تشريح السعر وباقات التأمين.' },

  // ============================================================
  // KURUMSAL: HAKKIMIZDA
  // ============================================================
  'title.about': { tr: 'Hakkımızda — Antalya\'dan Türkiye\'ye Araç Kiralama | ExitCar', en: 'About Us — Car Rental from Antalya to All Türkiye | ExitCar', ru: 'О нас — аренда авто из Антальи по всей Турции | ExitCar', de: 'Über uns — Autovermietung von Antalya in die ganze Türkei | ExitCar', ar: 'من نحن — تأجير السيارات من أنطاليا لكل تركيا | ExitCar' },
  'desc.about':  { tr: 'ExitCar hakkında: Antalya merkezli, 50+ kiralama firması partneri, 81 il geneli hizmet. Vizyonumuz, ekibimiz ve müşteri vaatlerimiz.', en: 'About ExitCar: based in Antalya, partnered with 50+ rental companies, serving 81 provinces. Our vision, team and customer promises.', ru: 'О ExitCar: офис в Анталье, партнёрство с 50+ компаниями проката, работа в 81 провинции. Наша миссия, команда и обещания.', de: 'Über ExitCar: Sitz in Antalya, Partner von 50+ Vermietern, in 81 Provinzen tätig. Unsere Vision, unser Team und unsere Versprechen.', ar: 'عن ExitCar: مقرّنا أنطاليا، شراكة مع 50+ شركة تأجير، خدمة في 81 محافظة. رؤيتنا وفريقنا ووعودنا للعملاء.' },
  'about.h1':    { tr: 'Antalya\'dan Yola, Türkiye\'nin Her Yerine', en: 'From Antalya to Every Corner of Türkiye', ru: 'Из Антальи на дороги всей Турции', de: 'Von Antalya in die ganze Türkei', ar: 'من أنطاليا إلى كل ركن في تركيا' },
  'about.lead':  { tr: 'ExitCar, 2020\'de Antalya\'da kurulmuş bir araç kiralama karşılaştırma platformudur. Tek bir aramayla 50+ kiralama firmasının fiyatlarını karşılaştırıp Türkiye\'nin 81 ilinde, tüm büyük havalimanlarında ve şehir merkezlerinde araç teslim almanızı sağlıyoruz.', en: 'ExitCar is an Antalya-based car rental comparison platform founded in 2020. With a single search you can compare 50+ rental companies and pick up your car in 81 provinces, every major airport and city center across Türkiye.', ru: 'ExitCar — основанная в 2020 году в Анталье платформа сравнения аренды автомобилей. Один поиск — и вы сравниваете цены 50+ компаний и получаете авто в 81 провинции, во всех крупных аэропортах и городских центрах Турции.', de: 'ExitCar ist eine 2020 in Antalya gegründete Vergleichsplattform für Mietwagen. Mit einer einzigen Suche vergleichen Sie die Preise von 50+ Anbietern und holen Ihr Fahrzeug in 81 Provinzen, an allen großen Flughäfen und in Stadtzentren der Türkei ab.', ar: 'ExitCar منصة مقارنة لتأجير السيارات تأسست عام 2020 في أنطاليا. ببحثٍ واحد تقارن أسعار 50+ شركة تأجير وتستلم سيارتك في 81 محافظة، في جميع المطارات الكبرى ومراكز المدن في تركيا.' },
  'about.s1Title': { tr: 'Biz Kimiz?', en: 'Who We Are', ru: 'Кто мы', de: 'Wer wir sind', ar: 'من نحن' },
  'about.s1Body':  { tr: 'ExitCar, Antalya turizminin yıllık 15 milyondan fazla yabancı ziyaretçi ağırladığı bir gerçeği başlangıç noktası alarak doğdu. Tatilcilerin, iş seyahatindekilerin ve yerleşik yabancı toplulukların ortak ihtiyacı netti: şeffaf, çok dilli ve hızlı bir araç kiralama deneyimi. Ofisimiz havalimanı karşısında, Aksu / Antalya\'dadır.', en: 'ExitCar was born from a simple fact: Antalya welcomes more than 15 million foreign visitors a year. Tourists, business travelers and resident foreign communities all needed the same thing — a transparent, multilingual and fast car rental experience. Our office is in Aksu, Antalya, directly across from the airport.', ru: 'ExitCar появился благодаря простому факту: Анталья принимает более 15 миллионов иностранных гостей в год. Туристам, командировочным и местному иностранному сообществу нужно было одно и то же — прозрачная, многоязычная и быстрая аренда авто. Наш офис находится в Аксу (Анталья), напротив аэропорта.', de: 'ExitCar entstand aus einer einfachen Tatsache: Antalya empfängt jährlich über 15 Millionen ausländische Gäste. Touristen, Geschäftsreisende und ausländische Resident-Communities brauchten alle dasselbe — transparente, mehrsprachige und schnelle Mietwagen. Unser Büro liegt in Aksu, Antalya, direkt gegenüber dem Flughafen.', ar: 'وُلِد ExitCar من حقيقة بسيطة: أنطاليا تستقبل أكثر من 15 مليون زائر أجنبي سنوياً. السياح ورحلات العمل والمقيمون الأجانب يحتاجون الشيء نفسه — تجربة تأجير شفّافة ومتعددة اللغات وسريعة. مكتبنا في أكسو/أنطاليا، مقابل المطار مباشرة.' },
  'about.s2Title': { tr: 'Misyonumuz', en: 'Our Mission', ru: 'Наша миссия', de: 'Unsere Mission', ar: 'مهمتنا' },
  'about.s2Body':  { tr: 'Müşterinin önüne gelen ilk fiyatın "en uygun fiyat" olması. Saklı ücret, son anda eklenen kalemler veya çok dillilik yokluğundan dolayı yaşanan iletişim sıkıntıları olmadan; tek ekranda 50+ firma karşılaştırıp güvenle rezervasyon yapabilmek. ExitCar tedarikçilerden komisyon alır — ek bir ücret müşteriye yansıtılmaz.', en: 'To make sure the first price you see is the best price. No hidden fees, no last-minute add-ons, no language barriers — compare 50+ companies on one screen and book with confidence. ExitCar earns a commission from suppliers, never an extra charge to the customer.', ru: 'Чтобы первая цена, которую вы видите, была лучшей. Без скрытых сборов, без сюрпризов в последний момент, без языкового барьера — сравнивайте 50+ компаний на одном экране и бронируйте уверенно. ExitCar получает комиссию от поставщиков; клиент не платит дополнительно.', de: 'Der erste Preis, den Sie sehen, soll der beste sein. Keine versteckten Gebühren, keine Last-Minute-Aufschläge, keine Sprachbarrieren — 50+ Anbieter auf einem Bildschirm vergleichen und sicher buchen. ExitCar verdient an Provisionen der Anbieter, niemals an Aufschlägen für den Kunden.', ar: 'أن يكون أول سعر تراه هو أفضل سعر. لا رسوم خفية، لا إضافات في اللحظة الأخيرة، لا حواجز لغوية — قارن 50+ شركة على شاشة واحدة واحجز بثقة. تحصل ExitCar على عمولة من الموردين، ولا تُحمَّل أي رسوم إضافية على العميل.' },
  'about.s3Title': { tr: 'Antalya\'dan Türkiye\'ye', en: 'From Antalya to All Türkiye', ru: 'Из Антальи во все уголки Турции', de: 'Von Antalya in die ganze Türkei', ar: 'من أنطاليا إلى كل تركيا' },
  'about.s3Body':  { tr: 'Antalya, ofisimizin merkezi olsa da partner ağımız 81 ile yayılıdır. İstanbul Sabiha Gökçen\'den Diyarbakır havalimanına, Bodrum\'dan Trabzon\'a kadar — Türkiye\'nin her bir araç kiralanabilir noktasında çalışıyoruz. Antalya\'da AYT Havalimanı içi 7/24 teslim, Lara/Konyaaltı/Kemer/Belek/Side bölgelerine direkt servis.', en: 'Our office is in Antalya, but our partner network covers all 81 provinces. From Istanbul Sabiha Gökçen to Diyarbakır Airport, from Bodrum to Trabzon — we operate at every rental point in Türkiye. In Antalya: in-airport AYT pickup 24/7, direct service to Lara, Konyaaltı, Kemer, Belek and Side.', ru: 'Наш офис в Анталье, но партнёрская сеть охватывает все 81 провинции. От Стамбула (Сабиха Гёкчен) до аэропорта Диярбакыра, от Бодрума до Трабзона — мы работаем в каждой точке проката Турции. В Анталье: выдача внутри AYT круглосуточно, прямой сервис в Лару, Коньяалты, Кемер, Белек и Сиде.', de: 'Unser Büro ist in Antalya, unser Partnernetz deckt aber alle 81 Provinzen ab. Von Istanbul Sabiha Gökçen bis zum Flughafen Diyarbakır, von Bodrum bis Trabzon — wir sind an jedem Übergabepunkt der Türkei tätig. In Antalya: Übergabe am AYT 24/7, Direktservice nach Lara, Konyaaltı, Kemer, Belek und Side.', ar: 'مكتبنا في أنطاليا، لكن شبكة شركائنا تغطي 81 محافظة. من إسطنبول صبيحة كوكتشن إلى مطار ديار بكر، ومن بودروم إلى طرابزون — نعمل في كل نقطة تأجير في تركيا. في أنطاليا: استلام داخل مطار AYT 24/7، خدمة مباشرة إلى لارا وكونيا ألتي وكيمر وبيليك وسيدي.' },
  'about.statsTitle': { tr: 'Rakamlarla ExitCar', en: 'ExitCar in Numbers', ru: 'ExitCar в цифрах', de: 'ExitCar in Zahlen', ar: 'ExitCar بالأرقام' },
  'about.stat1Label': { tr: 'Partner Firma', en: 'Partner Companies', ru: 'Компаний-партнёров', de: 'Partnerfirmen', ar: 'شركة شريكة' },
  'about.stat2Label': { tr: 'Hizmet Verilen İl', en: 'Provinces Served', ru: 'Провинций обслуживается', de: 'Provinzen abgedeckt', ar: 'محافظة' },
  'about.stat3Label': { tr: 'Tamamlanmış Rezervasyon', en: 'Completed Bookings', ru: 'Завершённых бронирований', de: 'Abgeschlossene Buchungen', ar: 'حجوزات مكتملة' },
  'about.stat4Label': { tr: 'Müşteri Memnuniyet Oranı', en: 'Customer Satisfaction Rate', ru: 'Уровень удовлетворённости клиентов', de: 'Kundenzufriedenheit', ar: 'معدل رضا العملاء' },
  'about.ctaTitle': { tr: 'Araç ihtiyacınız mı var?', en: 'Need a rental car?', ru: 'Нужна машина в аренду?', de: 'Brauchen Sie einen Mietwagen?', ar: 'بحاجة إلى سيارة للإيجار؟' },
  'about.ctaBtn':   { tr: 'Aracınızı Şimdi Bulun', en: 'Find Your Car Now', ru: 'Найти авто сейчас', de: 'Jetzt Fahrzeug finden', ar: 'ابحث عن سيارتك الآن' },

  // ============================================================
  // KURUMSAL: İLETİŞİM
  // ============================================================
  'title.contact': { tr: 'İletişim — ExitCar Antalya Ofisi', en: 'Contact — ExitCar Antalya Office', ru: 'Контакты — офис ExitCar в Анталье', de: 'Kontakt — ExitCar Büro Antalya', ar: 'اتصل بنا — مكتب ExitCar في أنطاليا' },
  'desc.contact':  { tr: 'ExitCar müşteri hizmetleri 7/24 hizmetinizde: telefon, WhatsApp, e-posta ve Antalya ofisi. Rezervasyon, iptal veya araç değişikliği için bize ulaşın.', en: 'ExitCar customer service is available 24/7: phone, WhatsApp, email and our Antalya office. Reach us for bookings, cancellations or car changes.', ru: 'Служба поддержки ExitCar 24/7: телефон, WhatsApp, эл. почта и офис в Анталье. Свяжитесь с нами для брони, отмены или замены авто.', de: 'ExitCar-Kundenservice rund um die Uhr: Telefon, WhatsApp, E-Mail und unser Büro in Antalya. Kontakt für Buchung, Stornierung oder Fahrzeugwechsel.', ar: 'خدمة عملاء ExitCar متاحة 24/7: هاتف، واتساب، بريد إلكتروني ومكتبنا في أنطاليا. تواصل معنا للحجز أو الإلغاء أو تغيير السيارة.' },
  'contact.h1':    { tr: 'Bize Ulaşın', en: 'Get in Touch', ru: 'Свяжитесь с нами', de: 'Kontakt aufnehmen', ar: 'تواصل معنا' },
  'contact.lead':  { tr: 'Sorunuz, talebiniz veya rezervasyon değişikliğiniz için 7/24 hizmetinizdeyiz. En hızlı yanıt için WhatsApp, en kapsamlı destek için telefon önerilir.', en: 'For any question, request or booking change we are here 24/7. WhatsApp is fastest for quick replies; phone is best for detailed support.', ru: 'По любым вопросам, запросам или изменениям брони мы доступны 24/7. WhatsApp — самый быстрый ответ; телефон — лучшая опция для подробной помощи.', de: 'Bei Fragen, Anliegen oder Buchungsänderungen sind wir rund um die Uhr für Sie da. WhatsApp ist am schnellsten; Telefon eignet sich am besten für ausführlichen Support.', ar: 'لأي سؤال أو طلب أو تعديل حجز نحن متاحون 24/7. واتساب الأسرع للردود، والهاتف الأفضل للدعم التفصيلي.' },
  'contact.phoneTitle': { tr: '📞 Telefon (7/24)', en: '📞 Phone (24/7)', ru: '📞 Телефон (24/7)', de: '📞 Telefon (24/7)', ar: '📞 الهاتف (24/7)' },
  'contact.whatsappTitle': { tr: '💬 WhatsApp', en: '💬 WhatsApp', ru: '💬 WhatsApp', de: '💬 WhatsApp', ar: '💬 واتساب' },
  'contact.whatsappText':  { tr: 'En hızlı yanıt için tıklayın — saniyeler içinde dönüş', en: 'Click for fastest reply — response within seconds', ru: 'Жмите для быстрого ответа — ответ за секунды', de: 'Klicken Sie für schnellste Antwort — Reaktion innerhalb Sekunden', ar: 'اضغط لأسرع رد — استجابة خلال ثوانٍ' },
  'contact.emailTitle': { tr: '✉️ E-posta', en: '✉️ Email', ru: '✉️ Эл. почта', de: '✉️ E-Mail', ar: '✉️ البريد الإلكتروني' },
  'contact.emailText':  { tr: 'Detaylı talepler için — 24 saat içinde yanıt garantisi', en: 'For detailed requests — reply guaranteed within 24 hours', ru: 'Для подробных запросов — ответ в течение 24 часов', de: 'Für ausführliche Anfragen — Antwort innerhalb von 24 Stunden', ar: 'للطلبات التفصيلية — رد مضمون خلال 24 ساعة' },
  'contact.addressTitle': { tr: '🏢 Antalya Ofisi', en: '🏢 Antalya Office', ru: '🏢 Офис в Анталье', de: '🏢 Büro Antalya', ar: '🏢 مكتب أنطاليا' },
  'contact.addressText':  { tr: 'Cihadiye Mah. 23079. Sok. No: 29, Havalimanı Karşısı, Aksu / Antalya', en: 'Cihadiye Mah. 23079. Sok. No: 29, opposite the airport, Aksu / Antalya', ru: 'Cihadiye Mah. 23079. Sok. No: 29, напротив аэропорта, Аксу / Анталья', de: 'Cihadiye Mah. 23079. Sok. Nr. 29, gegenüber dem Flughafen, Aksu / Antalya', ar: 'Cihadiye Mah. 23079. Sok. رقم 29، مقابل المطار، أكسو / أنطاليا' },
  'contact.hoursTitle': { tr: '⏰ Çalışma Saatleri', en: '⏰ Working Hours', ru: '⏰ Часы работы', de: '⏰ Öffnungszeiten', ar: '⏰ ساعات العمل' },
  'contact.hoursText':  { tr: 'Çağrı merkezi 7/24 açık. Antalya ofisi her gün 08:00–22:00 yüz yüze hizmet verir.', en: 'Call center open 24/7. The Antalya office serves walk-ins daily from 08:00–22:00.', ru: 'Колл-центр работает 24/7. Офис в Анталье принимает посетителей ежедневно с 08:00 до 22:00.', de: 'Callcenter rund um die Uhr. Das Büro Antalya empfängt täglich von 08:00 bis 22:00 Besucher.', ar: 'مركز الاتصال مفتوح 24/7. مكتب أنطاليا يستقبل الزيارات يومياً من 08:00 إلى 22:00.' },
  'contact.formTitle':  { tr: 'Mesaj Bırakın', en: 'Leave a Message', ru: 'Оставить сообщение', de: 'Nachricht hinterlassen', ar: 'اترك رسالة' },
  'contact.formName':   { tr: 'Adınız Soyadınız', en: 'Your Full Name', ru: 'Ваше имя', de: 'Ihr Name', ar: 'اسمك الكامل' },
  'contact.formEmail':  { tr: 'E-posta', en: 'Email', ru: 'Эл. почта', de: 'E-Mail', ar: 'البريد الإلكتروني' },
  'contact.formMsg':    { tr: 'Mesajınız', en: 'Your Message', ru: 'Ваше сообщение', de: 'Ihre Nachricht', ar: 'رسالتك' },
  'contact.formBtn':    { tr: 'Gönder', en: 'Send', ru: 'Отправить', de: 'Senden', ar: 'إرسال' },

  // Kurumsal sayfalara erişim için footer/nav anahtarları
  'nav.about':    { tr: '🏢 Hakkımızda', en: '🏢 About Us', ru: '🏢 О нас', de: '🏢 Über uns', ar: '🏢 من نحن' },
  'nav.contact':  { tr: '📞 İletişim', en: '📞 Contact', ru: '📞 Контакты', de: '📞 Kontakt', ar: '📞 اتصل بنا' },
  'footer.kvkk':  { tr: 'KVKK', en: 'GDPR', ru: 'GDPR', de: 'DSGVO', ar: 'GDPR' },

  // ============================================================
  // LOKASYON SAYFASI — ANTALYA (geniş / şehir merkezi)
  // ============================================================
  'title.ant': { tr: 'Antalya Araç Kiralama — En Uygun Fiyat, 50+ Firma | ExitCar', en: 'Antalya Car Rental — Best Prices from 50+ Companies | ExitCar', ru: 'Аренда авто в Анталье — лучшие цены от 50+ компаний | ExitCar', de: 'Mietwagen Antalya — Bestpreise von 50+ Anbietern | ExitCar', ar: 'تأجير السيارات في أنطاليا — أفضل الأسعار من 50+ شركة | ExitCar' },
  'desc.ant':  { tr: 'Antalya\'da araç kiralama: Kaleiçi, Lara, Konyaaltı, Kemer, Belek, Side ve Alanya bölgelerine teslim. 50+ firma karşılaştır, ücretsiz iptal, 7/24 destek.', en: 'Car rental in Antalya: pickup in Kaleiçi, Lara, Konyaaltı, Kemer, Belek, Side and Alanya. Compare 50+ companies, free cancellation, 24/7 support.', ru: 'Аренда авто в Анталье: выдача в Калеичи, Ларе, Коньяалты, Кемере, Белеке, Сиде и Алании. Сравните 50+ компаний, бесплатная отмена, поддержка 24/7.', de: 'Mietwagen in Antalya: Übergabe in Kaleiçi, Lara, Konyaaltı, Kemer, Belek, Side und Alanya. 50+ Anbieter vergleichen, kostenlose Stornierung, 24/7-Support.', ar: 'تأجير السيارات في أنطاليا: استلام في كاليتشي ولارا وكونيا ألتي وكيمر وبيليك وسيدي وألانيا. قارن 50+ شركة، إلغاء مجاني، دعم 24/7.' },
  'ant.h1':       { tr: 'Antalya Araç Kiralama', en: 'Antalya Car Rental', ru: 'Аренда авто в Анталье', de: 'Mietwagen Antalya', ar: 'تأجير السيارات في أنطاليا' },
  'ant.heroSub':  { tr: 'Akdeniz\'in en parlak şehrini özgürce keşfedin. Antalya genelinde 50+ kiralama firmasının fiyatlarını tek ekranda karşılaştırın; havalimanından şehir merkezine, Kemer\'den Side\'ye dilediğiniz noktaya teslim alın.', en: 'Discover the Mediterranean\'s brightest city on your own terms. Compare prices from 50+ rental companies across Antalya on one screen — pickup at the airport, city center, Kemer, Side or anywhere you choose.', ru: 'Откройте для себя самый яркий город Средиземноморья по-своему. Сравните цены 50+ компаний по всей Анталье на одном экране — выдача в аэропорту, центре города, Кемере, Сиде или в любой точке на выбор.', de: 'Entdecken Sie die strahlendste Stadt am Mittelmeer in eigenem Tempo. Vergleichen Sie auf einem Bildschirm die Preise von 50+ Vermietern in ganz Antalya — Abholung am Flughafen, im Stadtzentrum, in Kemer, Side oder an einem Ort Ihrer Wahl.', ar: 'اكتشف أكثر مدن المتوسط إشراقاً على طريقتك. قارن أسعار 50+ شركة تأجير في أنطاليا على شاشة واحدة — استلام في المطار أو وسط المدينة أو كيمر أو سيدي أو أي مكان تختاره.' },
  'ant.heroBadge':{ tr: '📍 Antalya\'da 50+ teslim noktası · 7/24', en: '📍 50+ pickup points across Antalya · 24/7', ru: '📍 50+ точек выдачи в Анталье · 24/7', de: '📍 50+ Übergabepunkte in Antalya · 24/7', ar: '📍 50+ نقطة استلام في أنطاليا · 24/7' },
  'ant.heroCta':  { tr: 'Antalya\'da Müsait Araçları Gör', en: 'See Available Cars in Antalya', ru: 'Доступные авто в Анталье', de: 'Verfügbare Fahrzeuge in Antalya', ar: 'السيارات المتاحة في أنطاليا' },

  'ant.s1Title': { tr: 'Antalya\'da Neden ExitCar?', en: 'Why Choose ExitCar in Antalya?', ru: 'Почему ExitCar в Анталье?', de: 'Warum ExitCar in Antalya?', ar: 'لماذا ExitCar في أنطاليا؟' },
  'ant.s1c1Title': { tr: 'Çok Dilli Destek', en: 'Multilingual Support', ru: 'Поддержка на 5 языках', de: 'Mehrsprachiger Support', ar: 'دعم متعدد اللغات' },
  'ant.s1c1Text':  { tr: 'Türkçe, İngilizce, Rusça, Almanca ve Arapça — ekibimiz dilinizi konuşur. Antalya turist profili çok uluslu; sizi anlayan birinden destek almak hızı ikiye katlar.', en: 'Turkish, English, Russian, German and Arabic — our team speaks your language. Antalya\'s tourist profile is multinational; getting help from someone who understands you doubles the speed.', ru: 'Турецкий, английский, русский, немецкий и арабский — мы говорим на вашем языке. Анталья — многонациональный курорт; помощь на родном языке экономит время.', de: 'Türkisch, Englisch, Russisch, Deutsch und Arabisch — unser Team spricht Ihre Sprache. Antalya empfängt Gäste aus aller Welt; Hilfe in der eigenen Sprache spart Zeit.', ar: 'التركية والإنجليزية والروسية والألمانية والعربية — فريقنا يتحدث لغتك. السياحة في أنطاليا متعددة الجنسيات؛ الدعم بلغتك يوفر الوقت ويضاعف السرعة.' },
  'ant.s1c2Title': { tr: 'Şeffaf Fiyat Karşılaştırma', en: 'Transparent Price Comparison', ru: 'Прозрачное сравнение цен', de: 'Transparenter Preisvergleich', ar: 'مقارنة أسعار شفّافة' },
  'ant.s1c2Text':  { tr: '50+ partner firma tek ekranda. Sigorta, KDV ve havalimanı teslim ücreti dahil; rezervasyondan sonra sürpriz çıkmaz.', en: '50+ partner companies on one screen. Insurance, VAT and airport pickup fee included — no surprises after booking.', ru: '50+ компаний-партнёров на одном экране. Страховка, НДС и сбор за выдачу в аэропорту включены — никаких сюрпризов после брони.', de: '50+ Partnerfirmen auf einem Bildschirm. Versicherung, MwSt. und Flughafengebühr inklusive — keine Überraschungen nach der Buchung.', ar: '50+ شركة شريكة على شاشة واحدة. التأمين والضريبة ورسوم الاستلام من المطار مشمولة — لا مفاجآت بعد الحجز.' },
  'ant.s1c3Title': { tr: 'Esnek Teslim Noktası', en: 'Flexible Pickup Location', ru: 'Гибкая точка выдачи', de: 'Flexible Übergabe', ar: 'موقع استلام مرن' },
  'ant.s1c3Text':  { tr: 'AYT Havalimanı, şehir merkezi, Lara/Konyaaltı plajları veya Kemer/Side/Belek otelinize teslim — bazı firmalar otele direkt getirir.', en: 'AYT Airport, city center, Lara/Konyaaltı beaches or direct to your hotel in Kemer/Side/Belek — some companies deliver to your hotel door.', ru: 'Аэропорт AYT, центр города, пляжи Лара/Коньяалты или прямо к отелю в Кемере/Сиде/Белеке — некоторые компании доставляют машину к двери отеля.', de: 'Flughafen AYT, Stadtzentrum, die Strände Lara/Konyaaltı oder direkt zu Ihrem Hotel in Kemer/Side/Belek — einige Anbieter liefern bis vor die Hoteltür.', ar: 'مطار AYT، وسط المدينة، شواطئ لارا/كونيا ألتي أو مباشرة إلى فندقك في كيمر/سيدي/بيليك — بعض الشركات تُسلّم السيارة عند باب الفندق.' },

  'ant.regionTitle': { tr: 'Antalya Bölge Rehberi — Hangi Bölgede Aracı Almalı?', en: 'Antalya Area Guide — Where to Pick Up Your Car?', ru: 'Гид по районам Антальи — где забрать машину?', de: 'Antalya-Regionenführer — Wo Sie Ihr Auto abholen sollten', ar: 'دليل مناطق أنطاليا — من أين تستلم سيارتك؟' },
  'ant.regionIntro': { tr: 'Antalya geniş bir bölge; konakladığınız yere göre en mantıklı teslim noktası değişir. Bölgelerin kısa özeti:', en: 'Antalya is a large region; the best pickup point depends on where you stay. A quick summary of each area:', ru: 'Анталья — обширный регион; точка выдачи зависит от места проживания. Краткий обзор районов:', de: 'Antalya ist eine große Region; der beste Übergabeort hängt von Ihrer Unterkunft ab. Kurzüberblick:', ar: 'أنطاليا منطقة واسعة؛ أفضل نقطة استلام تعتمد على مكان إقامتك. ملخّص سريع للمناطق:' },
  'ant.r1Title': { tr: '🏛️ Kaleiçi & Şehir Merkezi', en: '🏛️ Kaleiçi & City Center', ru: '🏛️ Калеичи и центр города', de: '🏛️ Kaleiçi & Stadtzentrum', ar: '🏛️ كاليتشي ووسط المدينة' },
  'ant.r1Text':  { tr: 'Tarihi liman, antik dar sokaklar, Hadrian Kapısı. Şehir içi turlar ve gece hayatı için ideal. Trafik yoğun olduğu için kompakt ve otomatik araç önerilir.', en: 'Historic harbour, ancient narrow streets, Hadrian\'s Gate. Ideal for city tours and nightlife. A compact automatic car is best because of traffic.', ru: 'Старая гавань, узкие улочки, ворота Адриана. Идеально для городских туров и ночной жизни. Из-за пробок лучше компактный автомат.', de: 'Historischer Hafen, antike Gassen, Hadrianstor. Ideal für Stadttouren und Nachtleben. Wegen des Verkehrs eignet sich am besten ein kompakter Automatik.', ar: 'الميناء التاريخي والأزقّة القديمة وبوابة هادريان. مثالية للجولات السياحية والحياة الليلية. السيارة المدمجة الأوتوماتيكية أفضل بسبب الازدحام.' },
  'ant.r2Title': { tr: '🏖️ Lara & Konyaaltı Plajları', en: '🏖️ Lara & Konyaaltı Beaches', ru: '🏖️ Пляжи Лара и Коньяалты', de: '🏖️ Strände Lara & Konyaaltı', ar: '🏖️ شواطئ لارا وكونيا ألتي' },
  'ant.r2Text':  { tr: 'Lara, lüks tatil köyleri; Konyaaltı, halk plajı ve modern AKM bölgesi. Her ikisi de havalimanına yakın. Sahil yolunda manzaralı sürüş.', en: 'Lara is the luxury resort strip; Konyaaltı is the public beach with the modern Cultural Centre. Both are close to the airport. Scenic coastal drives in both directions.', ru: 'Лара — зона роскошных отелей; Коньяалты — городской пляж и культурный центр. Обе рядом с аэропортом. Живописная прибрежная дорога.', de: 'Lara ist die Luxusresort-Meile; Konyaaltı ist der Stadtstrand mit Kulturzentrum. Beide nahe am Flughafen. Landschaftlich schöne Küstenfahrten in beide Richtungen.', ar: 'لارا منطقة المنتجعات الفاخرة؛ كونيا ألتي الشاطئ العام مع المركز الثقافي الحديث. كلاهما قريبتان من المطار. قيادة ساحلية خلّابة.' },
  'ant.r3Title': { tr: '⛰️ Kemer & Tekirova', en: '⛰️ Kemer & Tekirova', ru: '⛰️ Кемер и Текирова', de: '⛰️ Kemer & Tekirova', ar: '⛰️ كيمر وتكيروفا' },
  'ant.r3Text':  { tr: 'Dağ ve denizin buluştuğu çam ormanı sahili (~50 km batı). Olympos, Phaselis antik kenti, Yanartaş. Virajlı yollar için orta sınıf sedan veya küçük SUV.', en: 'Pine-forest coast where mountains meet the sea (~50 km west). Olympos, ancient Phaselis, the Yanartaş (Chimaera). Mid-size sedan or small SUV for the winding roads.', ru: 'Сосновое побережье, где горы встречаются с морем (~50 км к западу). Олимпос, Фаселис, гора Янарташ. Седан среднего класса или небольшой кроссовер для серпантина.', de: 'Pinienküste, wo Berge auf Meer treffen (~50 km westlich). Olympos, antikes Phaselis, das Yanartaş-Feuer. Mittelklasse-Limousine oder kleiner SUV für die kurvigen Straßen.', ar: 'ساحل غابات الصنوبر حيث تلتقي الجبال بالبحر (~50 كم غرباً). أوليمبوس وفاسيليس القديمة وجبل النار. سيدان متوسطة أو دفع رباعي صغير للطرق المتعرّجة.' },
  'ant.r4Title': { tr: '🏌️ Belek & Side', en: '🏌️ Belek & Side', ru: '🏌️ Белек и Сиде', de: '🏌️ Belek & Side', ar: '🏌️ بيليك وسيدي' },
  'ant.r4Text':  { tr: 'Belek (~35 km doğu) golf ve all-inclusive resort\'ları; Side (~65 km) antik Roma kenti ve plajı ile bilinir. Aile için orta-üst sınıf araç pratik.', en: 'Belek (~35 km east) is golf and all-inclusive resort country; Side (~65 km) is famous for its Roman ruins and beach. A mid-to-upper sedan suits families.', ru: 'Белек (~35 км восточнее) — гольф и all-inclusive отели; Сиде (~65 км) — античные руины и пляж. Для семьи — седан среднего/высокого класса.', de: 'Belek (~35 km östlich) ist Golf- und All-Inclusive-Region; Side (~65 km) bekannt für römische Ruinen und Strand. Für Familien eignet sich eine Mittel- bis Oberklasse-Limousine.', ar: 'بيليك (~35 كم شرقاً) منطقة الغولف ومنتجعات All-Inclusive؛ سيدي (~65 كم) شهيرة بآثارها الرومانية وشاطئها. سيدان متوسطة-عليا مناسبة للعائلات.' },
  'ant.r5Title': { tr: '🌊 Alanya', en: '🌊 Alanya', ru: '🌊 Алания', de: '🌊 Alanya', ar: '🌊 ألانيا' },
  'ant.r5Text':  { tr: 'Antalya\'nın 130 km doğusunda; uzun kumsal, Selçuklu kalesi, yabancı yerleşik popülasyonu yüksek. O-21 otoyolu (HGS) ile 110 dakikada ulaşılır.', en: '130 km east of Antalya; long beaches, Seljuk castle, large foreign resident community. The O-21 motorway (HGS) gets you there in 110 minutes.', ru: 'В 130 км к востоку от Антальи; длинные пляжи, сельджукская крепость, большая иностранная диаспора. По автостраде O-21 (HGS) — 110 минут.', de: '130 km östlich von Antalya; lange Strände, Seldschukenburg, große ausländische Resident-Community. Über die O-21-Autobahn (HGS) in 110 Minuten erreichbar.', ar: 'تبعد 130 كم شرق أنطاليا؛ شواطئ طويلة، قلعة سلجوقية، جالية أجنبية كبيرة. عبر طريق O-21 السريع (HGS) تصل في 110 دقيقة.' },
  'ant.r6Title': { tr: '🏨 Kundu Oteller Bölgesi', en: '🏨 Kundu Hotel Zone', ru: '🏨 Гостиничная зона Кунду', de: '🏨 Hotelzone Kundu', ar: '🏨 منطقة فنادق كوندو' },
  'ant.r6Text':  { tr: 'Antalya\'nın doğu kıyısı (Lara\'nın hemen yanı), büyük resort\'ların yoğun olduğu bölge. Havalimanına 8 km, çoğu firma otele direkt teslim eder.', en: 'On Antalya\'s eastern coast (right next to Lara), packed with large resorts. 8 km from the airport — most companies deliver directly to your hotel.', ru: 'На восточном побережье Антальи (рядом с Ларой), сосредоточение крупных курортов. 8 км от аэропорта — большинство компаний доставляют машину прямо к отелю.', de: 'An der Ostküste Antalyas (direkt neben Lara), Konzentration großer Resorts. 8 km vom Flughafen — die meisten Anbieter liefern direkt zum Hotel.', ar: 'على الساحل الشرقي لأنطاليا (بجوار لارا)، تتركّز فيه المنتجعات الكبرى. 8 كم من المطار — تُسلّم معظم الشركات السيارة مباشرة إلى الفندق.' },

  'ant.seasonTitle': { tr: 'Mevsime Göre Antalya Araç Kiralama', en: 'Renting in Antalya by Season', ru: 'Аренда в Анталье по сезонам', de: 'Mieten in Antalya nach Saison', ar: 'تأجير السيارات في أنطاليا حسب الموسم' },
  'ant.seasonIntro': { tr: 'Antalya turizminin yoğunluğu yıl boyunca değişir; fiyat ve stok da öyle. Akıllı zamanlama %30\'a varan tasarruf sağlar.', en: 'Antalya\'s tourist density changes through the year — and so do prices and availability. Smart timing can save up to 30%.', ru: 'Туристический поток в Анталье колеблется в течение года — как и цены и доступность. Умное планирование экономит до 30%.', de: 'Das Touristenaufkommen in Antalya schwankt das ganze Jahr über — Preise und Verfügbarkeit ebenfalls. Kluge Planung spart bis zu 30%.', ar: 'تتغيّر كثافة السياحة في أنطاليا على مدار العام — وكذلك الأسعار والتوفّر. التخطيط الذكي يوفّر حتى 30%.' },
  'ant.season1Title': { tr: '☀️ Pik Sezon — Haziran–Eylül', en: '☀️ Peak Season — June–September', ru: '☀️ Пик сезона — июнь–сентябрь', de: '☀️ Hochsaison — Juni–September', ar: '☀️ ذروة الموسم — يونيو إلى سبتمبر' },
  'ant.season1Text':  { tr: 'En sıcak ve en pahalı dönem. Stok çabuk biter; mümkünse 3-6 hafta önce ayırtın. Klima ihtiyacı yüksek, otomatik tercih edin.', en: 'Hottest and most expensive period. Stock runs out fast — book 3-6 weeks ahead if possible. A/C is essential; choose automatic.', ru: 'Самый жаркий и дорогой период. Машины разбирают быстро — бронируйте за 3-6 недель. Кондиционер обязателен; берите автомат.', de: 'Heißeste und teuerste Zeit. Fahrzeuge sind schnell ausgebucht — buchen Sie 3-6 Wochen im Voraus. Klima ist Pflicht; Automatik bevorzugen.', ar: 'الفترة الأكثر حرارة وغلاء. تنفد السيارات بسرعة — احجز قبل 3-6 أسابيع إن أمكن. التكييف ضروري؛ اختر الأوتوماتيك.' },
  'ant.season2Title': { tr: '🌸 Shoulder Sezon — Nisan–Mayıs & Ekim', en: '🌸 Shoulder Season — April–May & October', ru: '🌸 Низкий сезон — апрель–май и октябрь', de: '🌸 Nebensaison — April–Mai & Oktober', ar: '🌸 الموسم الانتقالي — أبريل–مايو وأكتوبر' },
  'ant.season2Text':  { tr: 'Hava 22-28°C, deniz hâlâ ılık. Fiyatlar pik sezona göre %20-30 daha düşük; en uygun değer/maliyet oranı bu dönemde.', en: 'Weather 22-28°C, sea still warm. Prices 20-30% below peak; best value-for-money window.', ru: 'Погода 22-28°C, море ещё тёплое. Цены на 20-30% ниже пика — лучшее соотношение цены и качества.', de: 'Wetter 22-28°C, Meer noch warm. Preise 20-30% unter der Hochsaison — bestes Preis-Leistungs-Verhältnis.', ar: 'الطقس 22-28°م، البحر دافئ. الأسعار أقل بـ20-30% من ذروة الموسم — أفضل توازن بين السعر والجودة.' },
  'ant.season3Title': { tr: '🌧️ Kış — Kasım–Mart', en: '🌧️ Winter — November–March', ru: '🌧️ Зима — ноябрь–март', de: '🌧️ Winter — November–März', ar: '🌧️ الشتاء — نوفمبر–مارس' },
  'ant.season3Text':  { tr: 'Tatil sezonu dışı — fiyatlar yılın en düşüğü. Yağmurlu bazı günler olabilir; sahil yolunda dikkatli sürüş. Toroslar\'a çıkacaksanız kış lastiği paketi ekleyin.', en: 'Off-season — prices at yearly lows. Some rainy days possible; drive carefully on coastal roads. Add a winter tire package if heading to the Taurus Mountains.', ru: 'Низкий сезон — цены на минимуме года. Возможны дожди; будьте внимательны на побережье. Для гор Тавра добавьте пакет зимних шин.', de: 'Außerhalb der Saison — Preise auf Jahrestief. Einige Regentage möglich; auf Küstenstraßen vorsichtig fahren. Für die Taurusberge das Winterreifenpaket buchen.', ar: 'خارج الموسم — الأسعار في أدنى مستوياتها. أيام ممطرة محتملة؛ القيادة بحذر على الطرق الساحلية. أضف باقة إطارات شتوية إن كنت متجهاً إلى جبال طوروس.' },

  'ant.routeTitle': { tr: 'Antalya\'dan Popüler Sürüş Rotaları', en: 'Popular Driving Routes from Antalya', ru: 'Популярные маршруты из Антальи', de: 'Beliebte Routen ab Antalya', ar: 'مسارات قيادة شهيرة من أنطاليا' },
  'ant.routeIntro': { tr: 'Aracınız varken Antalya\'yı evin penceresinden değil, yoldan görmenin keyfini çıkarın. İşte denenmiş 4 rota:', en: 'With a car, see Antalya from the road, not through a window. Four tried-and-tested routes:', ru: 'С арендованным авто открывайте Анталью с дороги, а не из окна. Четыре проверенных маршрута:', de: 'Mit dem Auto erleben Sie Antalya von der Straße aus, nicht durch ein Fenster. Vier bewährte Routen:', ar: 'مع سيارة، شاهد أنطاليا من الطريق وليس من النافذة. أربعة مسارات مجرّبة:' },
  'ant.route1': { tr: '🕒 1 günlük: Kaleiçi + Düden Şelalesi + Konyaaltı plajı (yaklaşık 40 km)', en: '🕒 1 day: Kaleiçi + Düden Waterfalls + Konyaaltı beach (~40 km)', ru: '🕒 1 день: Калеичи + водопад Дюден + пляж Коньяалты (~40 км)', de: '🕒 1 Tag: Kaleiçi + Düden-Wasserfall + Konyaaltı-Strand (~40 km)', ar: '🕒 يوم واحد: كاليتشي + شلال دودين + شاطئ كونيا ألتي (~40 كم)' },
  'ant.route2': { tr: '🕒 2 gün: Kemer sahili + Olympos antik kenti + Yanartaş gece (yaklaşık 130 km)', en: '🕒 2 days: Kemer coast + Olympos ruins + Yanartaş fire by night (~130 km)', ru: '🕒 2 дня: побережье Кемера + Олимпос + ночной Янарташ (~130 км)', de: '🕒 2 Tage: Küste Kemer + Olympos-Ruinen + Yanartaş bei Nacht (~130 km)', ar: '🕒 يومان: ساحل كيمر + أوليمبوس الأثرية + جبل النار ليلاً (~130 كم)' },
  'ant.route3': { tr: '🕒 3-5 gün: Antalya → Side → Alanya sahil yolu, ara duraklar (yaklaşık 280 km)', en: '🕒 3-5 days: Antalya → Side → Alanya coastal drive with stops (~280 km)', ru: '🕒 3-5 дней: Анталья → Сиде → Алания по побережью с остановками (~280 км)', de: '🕒 3-5 Tage: Antalya → Side → Alanya Küstenfahrt mit Stopps (~280 km)', ar: '🕒 3-5 أيام: أنطاليا → سيدي → ألانيا على الساحل مع توقفات (~280 كم)' },
  'ant.route4': { tr: '🕒 1 hafta: Antalya + Kapadokya turu (Konya–Tuz Gölü güzergahı, yaklaşık 1.200 km)', en: '🕒 1 week: Antalya + Cappadocia loop (via Konya & Salt Lake, ~1,200 km)', ru: '🕒 1 неделя: Анталья + Каппадокия (через Конью и Соляное озеро, ~1 200 км)', de: '🕒 1 Woche: Antalya + Kappadokien-Rundreise (über Konya & Salzsee, ~1.200 km)', ar: '🕒 أسبوع: أنطاليا + جولة كابادوكيا (عبر قونيا والبحيرة الملحية، ~1,200 كم)' },

  'ant.faqTitle': { tr: 'Antalya Araç Kiralama — Sık Sorulan Sorular', en: 'Antalya Car Rental — Frequently Asked Questions', ru: 'Аренда авто в Анталье — частые вопросы', de: 'Mietwagen Antalya — Häufige Fragen', ar: 'تأجير السيارات في أنطاليا — الأسئلة الشائعة' },
  'ant.faqQ1': { tr: 'Antalya\'nın hangi noktasından aracımı alabilirim?', en: 'Where in Antalya can I pick up my car?', ru: 'Откуда в Анталье можно забрать машину?', de: 'Wo in Antalya kann ich mein Auto abholen?', ar: 'من أين في أنطاليا يمكنني استلام سيارتي؟' },
  'ant.faqA1': { tr: 'AYT Havalimanı içi (7/24), Antalya şehir merkezi ofisleri, Lara ve Konyaaltı bölgeleri ve büyük resort otellerinden teslim mümkündür. Bazı firmalar Kemer/Side/Belek\'teki otelinize ek ücretsiz veya küçük bir ücretle aracı getirir.', en: 'In-airport AYT (24/7), city center offices, Lara and Konyaaltı areas, and large resort hotels. Some companies deliver to your hotel in Kemer/Side/Belek free of charge or for a small fee.', ru: 'В аэропорту AYT (24/7), в офисах в центре, в районах Лара и Коньяалты, у крупных отелей. Некоторые компании привозят авто к отелю в Кемере/Сиде/Белеке бесплатно или за небольшую плату.', de: 'Im Flughafen AYT (24/7), Stadtbüros, Lara und Konyaaltı sowie an großen Resorthotels. Einige Anbieter liefern kostenlos oder gegen geringe Gebühr zum Hotel in Kemer/Side/Belek.', ar: 'داخل مطار AYT (24/7)، مكاتب وسط المدينة، مناطق لارا وكونيا ألتي، والفنادق الكبرى. بعض الشركات تُسلّم السيارة إلى فندقك في كيمر/سيدي/بيليك مجاناً أو برسم رمزي.' },
  'ant.faqQ2': { tr: 'Antalya\'da otomatik vites mi yoksa manuel mi tercih etmeliyim?', en: 'Should I choose automatic or manual transmission in Antalya?', ru: 'В Анталье брать автомат или механику?', de: 'Sollte ich in Antalya Automatik oder Schaltgetriebe wählen?', ar: 'هل أختار ناقل حركة أوتوماتيكي أم يدوي في أنطاليا؟' },
  'ant.faqA2': { tr: 'Trafik özellikle Lara/Konyaaltı plaj yolları ve şehir merkezinde sıkışık olduğu için otomatik vites kesinlikle daha rahattır. Yaz aylarında otomatik stok hızla tükenir; erken rezervasyon önemli.', en: 'Traffic on the Lara/Konyaaltı beach roads and downtown can be heavy, so automatic is much more comfortable. Automatic stock disappears fast in summer — book early.', ru: 'На дорогах к Ларе/Коньяалты и в центре бывают пробки, так что автомат комфортнее. Летом автомат разбирают быстро — бронируйте заранее.', de: 'Auf den Strandstraßen Lara/Konyaaltı und in der Innenstadt kann es eng werden — Automatik ist klar bequemer. Im Sommer ist Automatik schnell vergriffen, daher früh buchen.', ar: 'الازدحام على طرق شواطئ لارا/كونيا ألتي ووسط المدينة قد يكون مرتفعاً، فالأوتوماتيك أكثر راحة. تنفد الأوتوماتيك بسرعة في الصيف — احجز مبكراً.' },
  'ant.faqQ3': { tr: 'Aracımı otelime kadar teslim edebilir misiniz?', en: 'Can you deliver the car to my hotel?', ru: 'Можете ли вы доставить машину к моему отелю?', de: 'Können Sie das Auto zu meinem Hotel bringen?', ar: 'هل يمكنكم تسليم السيارة إلى فندقي؟' },
  'ant.faqA3': { tr: 'Evet. Lara, Konyaaltı, Kundu, Kemer ve Belek\'teki birçok büyük otele teslim hizmeti vardır. Antalya merkez ve havalimanı yakını bölgelerde genellikle ücretsiz; daha uzak bölgelerde (Side/Alanya) küçük bir teslim ücreti olabilir. Rezervasyon sırasında otelinizin adını yazın.', en: 'Yes. Delivery is available to many large hotels in Lara, Konyaaltı, Kundu, Kemer and Belek. Usually free near central Antalya and the airport; a small fee may apply for further locations (Side/Alanya). Enter your hotel name at booking.', ru: 'Да. Доставка возможна во многие крупные отели Лары, Коньяалты, Кунду, Кемера и Белека. Обычно бесплатно вблизи центра и аэропорта; для дальних точек (Сиде/Алания) может взиматься небольшая плата. Укажите название отеля при бронировании.', de: 'Ja. Lieferung zu vielen großen Hotels in Lara, Konyaaltı, Kundu, Kemer und Belek möglich. Im Zentrum und nahe dem Flughafen meist kostenlos; für entferntere Ziele (Side/Alanya) kann eine geringe Gebühr anfallen. Bei der Buchung Hotelnamen angeben.', ar: 'نعم. متاح التسليم إلى عدد كبير من الفنادق في لارا وكونيا ألتي وكوندو وكيمر وبيليك. مجاناً عادةً قرب وسط أنطاليا والمطار؛ قد تُطبَّق رسوم رمزية للمواقع البعيدة (سيدي/ألانيا). أدخل اسم فندقك عند الحجز.' },
  'ant.faqQ4': { tr: 'Antalya\'da kiraladığım aracı başka bir şehirde iade edebilir miyim?', en: 'Can I return my Antalya rental in another city?', ru: 'Можно ли сдать машину, арендованную в Анталье, в другом городе?', de: 'Kann ich den Antalya-Mietwagen in einer anderen Stadt zurückgeben?', ar: 'هل يمكنني إعادة السيارة المستأجرة من أنطاليا في مدينة أخرى؟' },
  'ant.faqA4': { tr: 'Evet — "tek yön" (one-way) kiralama mümkündür. İstanbul, İzmir, Ankara, Bodrum, Dalaman gibi büyük şehirlerde iade noktaları bulunur. Ek bir tek-yön ücreti uygulanır (mesafeye bağlı, ~1.000-3.000 TL). Rezervasyonda "Farklı bir noktaya bırak" seçeneğini işaretleyin.', en: 'Yes — one-way rentals are possible. Return points are available in Istanbul, Izmir, Ankara, Bodrum, Dalaman and other major cities. A one-way surcharge applies (depends on distance, ~1,000-3,000 TL). Tick the "Return to a different location" option at booking.', ru: 'Да, аренда «в одну сторону» возможна. Точки возврата есть в Стамбуле, Измире, Анкаре, Бодруме, Даламане и других крупных городах. Применяется доплата (в зависимости от расстояния, ~1 000–3 000 TL). При бронировании отметьте «Вернуть в другом месте».', de: 'Ja, Einwegmieten sind möglich. Rückgabepunkte gibt es in Istanbul, Izmir, Ankara, Bodrum, Dalaman und anderen Großstädten. Es fällt eine Einweggebühr an (abhängig von der Distanz, ~1.000–3.000 TL). Bei der Buchung "Rückgabe an anderem Ort" aktivieren.', ar: 'نعم، يمكن التأجير "باتجاه واحد". نقاط الإعادة متوفّرة في إسطنبول وإزمير وأنقرة وبودروم ودالامان وغيرها من المدن الكبرى. تُطبَّق رسوم اتجاه واحد (تعتمد على المسافة، ~1,000-3,000 ليرة). فعّل خيار "الإعادة في موقع مختلف" عند الحجز.' },

  'ant.ctaTitle': { tr: 'Antalya\'da Aracınızı Şimdi Ayırtın', en: 'Reserve Your Antalya Car Now', ru: 'Забронируйте машину в Анталье', de: 'Reservieren Sie jetzt Ihr Antalya-Auto', ar: 'احجز سيارتك في أنطاليا الآن' },
  'ant.ctaSub':   { tr: '50+ firmayı karşılaştırın, dilediğiniz bölgeden teslim alın, ücretsiz iptal güvencesiyle.', en: 'Compare 50+ companies, pick up wherever you want, with free cancellation peace of mind.', ru: 'Сравните 50+ компаний, заберите авто где удобно, с бесплатной отменой.', de: 'Vergleichen Sie 50+ Anbieter, holen Sie das Auto, wo Sie möchten — mit kostenloser Stornierung.', ar: 'قارن 50+ شركة، استلم في المكان الذي تريده، مع ضمان الإلغاء المجاني.' },

  // ============================================================
  // LOKASYON: KEMER
  // ============================================================
  'title.kemer': { tr: 'Kemer Araç Kiralama — Antalya\'nın Çam Sahili | ExitCar', en: 'Kemer Car Rental — Antalya\'s Pine Coast | ExitCar', ru: 'Аренда авто в Кемере — сосновое побережье Антальи | ExitCar', de: 'Mietwagen Kemer — Antalyas Pinienküste | ExitCar', ar: 'تأجير السيارات في كيمر — ساحل الصنوبر في أنطاليا | ExitCar' },
  'desc.kemer':  { tr: 'Kemer\'de araç kiralama: Olympos, Phaselis, Yanartaş ve çam ormanı sahili. AYT\'den 50 km batıda, 50 dakikalık manzaralı sürüş. 50+ firma karşılaştır.', en: 'Kemer car rental: Olympos, Phaselis, the Yanartaş fire and the pine-forest coast. 50 km west of AYT, a 50-minute scenic drive. Compare 50+ companies.', ru: 'Аренда авто в Кемере: Олимпос, Фаселис, гора Янарташ и сосновое побережье. 50 км к западу от AYT, 50 минут живописной дороги.', de: 'Mietwagen in Kemer: Olympos, Phaselis, das Yanartaş-Feuer und die Pinienküste. 50 km westlich vom AYT, 50 Minuten landschaftlich schöne Fahrt.', ar: 'تأجير السيارات في كيمر: أوليمبوس وفاسيليس وجبل النار وساحل غابات الصنوبر. 50 كم غرب AYT، رحلة قيادة خلّابة 50 دقيقة.' },
  'kemer.h1':       { tr: 'Kemer Araç Kiralama', en: 'Kemer Car Rental', ru: 'Аренда авто в Кемере', de: 'Mietwagen Kemer', ar: 'تأجير السيارات في كيمر' },
  'kemer.heroSub':  { tr: 'Dağların denizle buluştuğu Akdeniz sahili. Kemer, Olympos ve Phaselis antik kentleri, geceleri parlayan Yanartaş ile bilinir. Aracınızla bu hazineleri kendi temponuzda gezin.', en: 'The Mediterranean coast where mountains meet the sea. Kemer is famous for Olympos, Phaselis and the Yanartaş — the eternal flame that glows at night. With your own car you set the pace.', ru: 'Средиземноморское побережье, где горы встречаются с морем. Кемер знаменит Олимпосом, Фаселисом и Янарташем — вечным пламенем, светящимся ночью. С арендованным авто — ваш темп, ваши маршруты.', de: 'Die Mittelmeerküste, wo Berge auf Meer treffen. Kemer ist bekannt für Olympos, Phaselis und das Yanartaş — die ewige Flamme, die nachts leuchtet. Mit dem eigenen Auto bestimmen Sie das Tempo.', ar: 'الساحل المتوسطي حيث تلتقي الجبال بالبحر. تشتهر كيمر بأوليمبوس وفاسيليس وجبل النار — اللهب الأبدي الذي يتوهج ليلاً. مع سيارة، أنت تختار وتيرتك.' },
  'kemer.heroBadge':{ tr: '🌲 AYT\'den 50 km · 50 dakika', en: '🌲 50 km from AYT · 50 minutes', ru: '🌲 50 км от AYT · 50 минут', de: '🌲 50 km vom AYT · 50 Minuten', ar: '🌲 50 كم من AYT · 50 دقيقة' },
  'kemer.heroCta':  { tr: 'Kemer\'de Araçları Gör', en: 'See Cars in Kemer', ru: 'Авто в Кемере', de: 'Fahrzeuge in Kemer', ar: 'سيارات في كيمر' },
  'kemer.s1Title': { tr: 'Kemer\'de Neden Araç?', en: 'Why a Car in Kemer?', ru: 'Зачем нужна машина в Кемере?', de: 'Warum ein Auto in Kemer?', ar: 'لماذا تحتاج سيارة في كيمر؟' },
  'kemer.s1c1Title': { tr: 'Antik Yerler Saçılı', en: 'Ancient Sites Are Spread Out', ru: 'Античные памятники разбросаны', de: 'Antike Stätten weit verteilt', ar: 'المواقع الأثرية متناثرة' },
  'kemer.s1c1Text':  { tr: 'Olympos, Phaselis, Yanartaş ve Adrasan birbirinden uzak; otobüs ve dolmuş ile sürüş zaman alır.', en: 'Olympos, Phaselis, Yanartaş and Adrasan are spread out; reaching them by bus or dolmuş eats your day.', ru: 'Олимпос, Фаселис, Янарташ и Адрасан находятся далеко друг от друга; на автобусах вы потеряете день.', de: 'Olympos, Phaselis, Yanartaş und Adrasan liegen weit auseinander; mit Bus und Dolmuş verlieren Sie einen Tag.', ar: 'أوليمبوس وفاسيليس وجبل النار وأدرسان متباعدة؛ الحافلات تأكل يومك.' },
  'kemer.s1c2Title': { tr: 'Çam Ormanı Plajları', en: 'Pine-Forest Beaches', ru: 'Пляжи в сосновом лесу', de: 'Strände im Pinienwald', ar: 'شواطئ غابات الصنوبر' },
  'kemer.s1c2Text':  { tr: 'Beldibi, Göynük, Kemer Plajı, Çamyuva — her birinin karakteri farklı. Aracınızla günde 3-4 plaj denemek mümkün.', en: 'Beldibi, Göynük, Kemer beach, Çamyuva — each has its own character. With a car you can sample 3-4 beaches a day.', ru: 'Бельдиби, Гёйнюк, пляж Кемера, Чамьюва — у каждого свой характер. С машиной можно попробовать 3-4 пляжа за день.', de: 'Beldibi, Göynük, Strand Kemer, Çamyuva — jeder mit eigenem Charakter. Mit Auto schaffen Sie 3-4 Strände am Tag.', ar: 'بيلديبي وغوينوك وشاطئ كيمر وتشاميوفا — لكل منها طابعه. مع سيارة يمكنك تجربة 3-4 شواطئ يومياً.' },
  'kemer.s1c3Title': { tr: 'Toroslar\'a Yakınlık', en: 'Close to the Taurus Mountains', ru: 'Близость к Таврским горам', de: 'Nähe zum Taurusgebirge', ar: 'قرب جبال طوروس' },
  'kemer.s1c3Text':  { tr: 'Tahtalı zirvesi (Olympos Teleferik), Göynük Kanyonu, Kuzdere köyleri — sahile 30-40 dakika mesafede dağ kaçamağı.', en: 'Tahtalı Peak (Olympos cable car), Göynük Canyon, the Kuzdere villages — a mountain escape just 30-40 minutes from the beach.', ru: 'Пик Тахталы (канатная дорога), каньон Гёйнюк, деревни Куздере — горы в 30-40 минутах от пляжа.', de: 'Tahtalı-Gipfel (Olympos-Seilbahn), Göynük-Schlucht, Kuzdere-Dörfer — Bergausflug nur 30-40 Minuten vom Strand.', ar: 'قمة تاهتالي (تلفريك أوليمبوس) ووادي غوينوك وقرى كوزديري — رحلة جبلية على بُعد 30-40 دقيقة من الشاطئ.' },
  'kemer.s2Title': { tr: 'Kemer\'de Mutlaka Görülecek 3 Yer', en: '3 Places You Must See in Kemer', ru: '3 места в Кемере, которые нужно увидеть', de: '3 Orte, die Sie in Kemer sehen müssen', ar: '3 أماكن يجب أن تراها في كيمر' },
  'kemer.s2c1Title': { tr: '🔥 Yanartaş (Chimaera)', en: '🔥 Yanartaş (Chimaera)', ru: '🔥 Янарташ (Химера)', de: '🔥 Yanartaş (Chimaera)', ar: '🔥 جبل النار (شيميرا)' },
  'kemer.s2c1Text':  { tr: 'Dağ yamacından yer altından çıkan doğal gazın binlerce yıldır söndürülemediği antik alev — özellikle gece ziyaret edin.', en: 'A natural gas seeping from the mountainside has been burning for thousands of years — visit at night for the full effect.', ru: 'Природный газ, выходящий из склона горы, горит тысячелетиями — посещение ночью особенно впечатляет.', de: 'Aus dem Berghang austretendes Erdgas brennt seit Jahrtausenden — nachts ist der Anblick am eindrucksvollsten.', ar: 'غاز طبيعي يتسرّب من سفح الجبل ويشتعل منذ آلاف السنين — الزيارة الليلية أكثر تأثيراً.' },
  'kemer.s2c2Title': { tr: '🏛️ Phaselis Antik Kenti', en: '🏛️ Ancient Phaselis', ru: '🏛️ Античный Фаселис', de: '🏛️ Antikes Phaselis', ar: '🏛️ مدينة فاسيليس الأثرية' },
  'kemer.s2c2Text':  { tr: 'Likya kenti — üç limanı, su kemerleri, antik tiyatro ve denizle iç içe yürüyüş rotaları. Kemer\'e 15 km.', en: 'A Lycian city with three harbours, aqueducts, an ancient theatre and seaside walking paths. 15 km from Kemer.', ru: 'Ликийский город с тремя гаванями, акведуками, античным театром и пешими тропами у моря. 15 км от Кемера.', de: 'Lykische Stadt mit drei Häfen, Aquädukten, antikem Theater und Wanderwegen am Meer. 15 km von Kemer.', ar: 'مدينة ليكية بثلاثة موانئ، قنوات مائية، مسرح أثري ومسارات سير بمحاذاة البحر. 15 كم من كيمر.' },
  'kemer.s2c3Title': { tr: '🏔️ Tahtalı Dağı Teleferik', en: '🏔️ Tahtalı Mountain Cable Car', ru: '🏔️ Канатная дорога Тахталы', de: '🏔️ Tahtalı-Seilbahn', ar: '🏔️ تلفريك جبل تاهتالي' },
  'kemer.s2c3Text':  { tr: '2.365 m zirveden Akdeniz manzarası. Teleferik yaklaşık 10 dakika, zirvede restoran ve seyir terası mevcut.', en: 'Mediterranean views from 2,365 m. The cable car ride is about 10 minutes; the peak has a restaurant and viewing deck.', ru: 'Виды Средиземного моря с высоты 2 365 м. Подъём около 10 минут, на вершине ресторан и смотровая площадка.', de: 'Mittelmeerblick aus 2.365 m. Die Seilbahn dauert ca. 10 Minuten, am Gipfel gibt es Restaurant und Aussichtsplattform.', ar: 'إطلالة على المتوسط من ارتفاع 2,365 م. التلفريك حوالي 10 دقائق، وعلى القمة مطعم وشرفة مشاهدة.' },
  'kemer.faqTitle': { tr: 'Kemer Araç Kiralama — Sık Sorulan Sorular', en: 'Kemer Car Rental — FAQ', ru: 'Аренда авто в Кемере — частые вопросы', de: 'Mietwagen Kemer — FAQ', ar: 'تأجير السيارات في كيمر — الأسئلة الشائعة' },
  'kemer.faqQ1': { tr: 'Kemer\'deki otelime aracımı getirebilir misiniz?', en: 'Can you deliver the car to my hotel in Kemer?', ru: 'Можете ли вы привезти машину к моему отелю в Кемере?', de: 'Können Sie das Auto zu meinem Hotel in Kemer bringen?', ar: 'هل يمكنكم تسليم السيارة إلى فندقي في كيمر؟' },
  'kemer.faqA1': { tr: 'Evet. Kemer merkez ve Çamyuva\'daki büyük otellerin çoğuna ücretsiz teslim mümkündür. Tekirova ve Çıralı gibi uzak noktalar için küçük bir teslim ücreti olabilir. Rezervasyon sırasında otel adınızı yazın.', en: 'Yes. Free delivery is available to most large hotels in central Kemer and Çamyuva. A small delivery fee may apply for further points like Tekirova or Çıralı. Add your hotel name at booking.', ru: 'Да. К большинству крупных отелей в центре Кемера и Чамьюве — бесплатно. Для дальних точек (Текирова, Чиралы) возможна небольшая плата. Укажите название отеля при бронировании.', de: 'Ja. Kostenlose Lieferung zu den meisten großen Hotels in Kemer-Zentrum und Çamyuva. Für entferntere Punkte wie Tekirova oder Çıralı kann eine kleine Gebühr anfallen. Hotelnamen bei der Buchung angeben.', ar: 'نعم. تسليم مجاني لمعظم الفنادق الكبرى في كيمر المركز وتشاميوفا. قد تُطبَّق رسوم رمزية للمواقع الأبعد مثل تيكيروفا وشيرالي. أدخل اسم الفندق عند الحجز.' },
  'kemer.faqQ2': { tr: 'Sahil yolu (D400) çocuklar için güvenli mi?', en: 'Is the coastal road (D400) safe with children?', ru: 'Безопасна ли прибрежная дорога D400 с детьми?', de: 'Ist die Küstenstraße D400 mit Kindern sicher?', ar: 'هل الطريق الساحلي D400 آمن مع الأطفال؟' },
  'kemer.faqA2': { tr: 'Genel olarak güvenli ama virajlı. Çocuk koltuğu ekleyin, gündüz seyahat edin, dağ tarafına geçmeyin. Yaz tatil trafiğinde acele etmeyin — manzara ihmal etmeyin.', en: 'Generally safe but winding. Add a child seat, travel by day, don\'t cut to the mountain side. Don\'t rush in summer holiday traffic — and enjoy the views.', ru: 'В целом безопасно, но извилисто. Возьмите детское кресло, ездите днём, не выезжайте на горную сторону. Летом не спешите — наслаждайтесь видами.', de: 'Insgesamt sicher, aber kurvenreich. Kindersitz mitnehmen, tagsüber fahren, nicht auf die Bergseite ausweichen. Im Sommerverkehr nicht hetzen — die Aussicht genießen.', ar: 'آمن عموماً لكنه متعرّج. أضف مقعد أطفال، سافر نهاراً، ولا تعبر إلى الجانب الجبلي. لا تتعجّل في زحمة الصيف — استمتع بالمنظر.' },
  'kemer.faqQ3': { tr: 'Hangi araç sınıfı Kemer için en uygundur?', en: 'Which car class is best for Kemer?', ru: 'Какой класс авто лучше для Кемера?', de: 'Welche Fahrzeugklasse eignet sich am besten für Kemer?', ar: 'أي فئة سيارة هي الأفضل لكيمر؟' },
  'kemer.faqA3': { tr: 'Sahil için kompakt veya orta sınıf sedan ideal. Olympos-Adrasan yan yolları dahil ederseniz küçük SUV daha rahat. Tahtalı teleferikine giderken yokuş için manuel iyidir; otomatik tercih ederseniz benzinli alın.', en: 'A compact or mid-size sedan suits the coast. A small SUV is more comfortable if you add the Olympos-Adrasan side roads. Manual handles the Tahtalı climb well; if you go automatic, pick a petrol engine.', ru: 'Для побережья подойдёт компакт или седан среднего класса. Если планируете боковые дороги Олимпос-Адрасан, удобнее небольшой кроссовер. Для подъёма к Тахталы хорош механический ход; если автомат — берите бензин.', de: 'Für die Küste eignet sich ein Kompakt- oder Mittelklasse-Sedan. Bei Olympos-Adrasan-Seitenstraßen ist ein kleiner SUV bequemer. Den Tahtalı-Anstieg meistert ein Schaltgetriebe gut; bei Automatik wählen Sie Benziner.', ar: 'سيدان مدمجة أو متوسطة مناسبة للساحل. الدفع الرباعي الصغير أكثر راحة إذا أضفت طرق أوليمبوس-أدرسان. الناقل اليدوي يتعامل جيداً مع صعود تاهتالي؛ في حالة الأوتوماتيك اختر محرّك بنزين.' },
  'kemer.ctaTitle': { tr: 'Kemer\'deki aracınızı şimdi ayırtın', en: 'Reserve your Kemer car now', ru: 'Забронируйте машину в Кемере', de: 'Reservieren Sie jetzt Ihr Kemer-Auto', ar: 'احجز سيارتك في كيمر الآن' },
  'kemer.ctaSub':   { tr: 'AYT\'den veya Kemer otelinizden teslim — 50+ firma karşılaştır, ücretsiz iptal.', en: 'Pickup at AYT or your Kemer hotel — compare 50+ companies, free cancellation.', ru: 'Выдача в AYT или у вашего отеля в Кемере — 50+ компаний, бесплатная отмена.', de: 'Übergabe am AYT oder an Ihrem Kemer-Hotel — 50+ Anbieter, kostenlose Stornierung.', ar: 'استلام في AYT أو فندقك في كيمر — 50+ شركة، إلغاء مجاني.' },

  // ============================================================
  // LOKASYON: BELEK
  // ============================================================
  'title.belek': { tr: 'Belek Araç Kiralama — Golf ve Resort Bölgesi | ExitCar', en: 'Belek Car Rental — Golf & Resort Region | ExitCar', ru: 'Аренда авто в Белеке — гольф и резорты | ExitCar', de: 'Mietwagen Belek — Golf- und Resortregion | ExitCar', ar: 'تأجير السيارات في بيليك — منطقة الغولف والمنتجعات | ExitCar' },
  'desc.belek':  { tr: 'Belek\'te araç kiralama: 15+ golf sahası, all-inclusive resort\'lar, Aspendos antik tiyatrosu. AYT\'den 35 km, O-21 otoyolu ile 35 dakika.', en: 'Belek car rental: 15+ golf courses, all-inclusive resorts, ancient Aspendos theatre. 35 km from AYT, 35 minutes via O-21.', ru: 'Аренда авто в Белеке: 15+ полей для гольфа, all-inclusive отели, античный театр Аспендоса. 35 км от AYT, 35 минут по O-21.', de: 'Mietwagen Belek: 15+ Golfplätze, All-Inclusive-Resorts, antikes Theater Aspendos. 35 km vom AYT, 35 Minuten über O-21.', ar: 'تأجير السيارات في بيليك: 15+ ملعب غولف، منتجعات All-Inclusive، مسرح أسبندوس القديم. 35 كم من AYT، 35 دقيقة عبر O-21.' },
  'belek.h1':       { tr: 'Belek Araç Kiralama', en: 'Belek Car Rental', ru: 'Аренда авто в Белеке', de: 'Mietwagen Belek', ar: 'تأجير السيارات في بيليك' },
  'belek.heroSub':  { tr: 'Türkiye\'nin golf başkenti — Belek\'in lüks all-inclusive resort\'ları arasında dolaşın, kıyıdan birkaç dakikada Aspendos\'a kadar uzanın. Aracınızla resort kapısının ötesini keşfedin.', en: 'Türkiye\'s golf capital — explore Belek\'s luxury all-inclusive resorts, then reach ancient Aspendos in minutes from the coast. Your own car opens up everything beyond the resort gates.', ru: 'Турецкая столица гольфа — побродите между люксовыми all-inclusive отелями Белека, а через несколько минут окажетесь у Аспендоса. С машиной открывается всё за воротами отеля.', de: 'Die Golfhauptstadt der Türkei — entdecken Sie Beleks Luxusresorts und erreichen Sie in wenigen Minuten von der Küste aus Aspendos. Mit eigenem Auto öffnet sich alles jenseits der Resorttore.', ar: 'عاصمة الغولف في تركيا — تجوّل بين منتجعات بيليك الفاخرة، ثم تصل إلى أسبندوس في دقائق. مع سيارة، يفتح لك كل ما وراء بوابة المنتجع.' },
  'belek.heroBadge':{ tr: '🏌️ AYT\'den 35 km · 35 dakika', en: '🏌️ 35 km from AYT · 35 minutes', ru: '🏌️ 35 км от AYT · 35 минут', de: '🏌️ 35 km vom AYT · 35 Minuten', ar: '🏌️ 35 كم من AYT · 35 دقيقة' },
  'belek.heroCta':  { tr: 'Belek\'te Araçları Gör', en: 'See Cars in Belek', ru: 'Авто в Белеке', de: 'Fahrzeuge in Belek', ar: 'سيارات في بيليك' },
  'belek.s1Title': { tr: 'Belek\'te Neden Araç?', en: 'Why a Car in Belek?', ru: 'Зачем нужна машина в Белеке?', de: 'Warum ein Auto in Belek?', ar: 'لماذا تحتاج سيارة في بيليك؟' },
  'belek.s1c1Title': { tr: 'Resort Mesafeleri', en: 'Resort Distances', ru: 'Расстояния между отелями', de: 'Resort-Abstände', ar: 'مسافات المنتجعات' },
  'belek.s1c1Text':  { tr: 'Belek otelleri 8 km uzunluğunda bir kıyıya yayılmış; iki otel arası yürünmez. Akşam yemeği başka resort\'ta yemek istiyorsanız araç şart.', en: 'Belek hotels span an 8 km coast; walking between them isn\'t practical. A car is essential if you want dinner at another resort.', ru: 'Отели Белека растянулись на 8 км побережья; пешком между ними не дойти. Без машины не пересесть на ужин в другом отеле.', de: 'Beleks Hotels erstrecken sich über 8 km Küste; zu Fuß ist es weit. Ein Auto ist nötig, wenn Sie zum Dinner ins andere Resort wollen.', ar: 'فنادق بيليك تمتد على 8 كم من الساحل؛ المشي بينها غير عملي. السيارة ضرورية لتذهب لعشاء في منتجع آخر.' },
  'belek.s1c2Title': { tr: 'Golf Sahası Erişimi', en: 'Golf Course Access', ru: 'Доступ к гольф-полям', de: 'Zugang zu Golfplätzen', ar: 'الوصول إلى ملاعب الغولف' },
  'belek.s1c2Text':  { tr: 'Belek\'te 15+ şampiyona seviyesi golf sahası var. Çoğu otel kendi sahasına shuttle çıkarmaz; aracınızla sabah 06:00 tee-off yetişin.', en: 'Belek has 15+ championship-level golf courses. Most hotels don\'t shuttle to their own course; with a car you can make the 6 AM tee-off.', ru: 'В Белеке 15+ полей чемпионского уровня. Большинство отелей не подвозят к собственному полю; с машиной успеваете на ти-офф в 6 утра.', de: 'Belek hat 15+ Golfplätze auf Championship-Niveau. Die meisten Hotels bieten keinen Shuttle zum eigenen Platz; mit Auto erreichen Sie den 6-Uhr-Tee-off.', ar: 'يضم بيليك 15+ ملعب غولف بمستوى البطولات. معظم الفنادق لا توفّر حافلات لملعبها؛ مع سيارة تلحق بانطلاقة الساعة 6 صباحاً.' },
  'belek.s1c3Title': { tr: 'Antik Yerler Çok Yakın', en: 'Ancient Sites Very Close', ru: 'Античные памятники очень близко', de: 'Antike Stätten ganz nah', ar: 'مواقع أثرية قريبة جداً' },
  'belek.s1c3Text':  { tr: 'Aspendos antik tiyatrosu 25 km, Perge antik kenti 30 km, Side antik kenti 30 km. Belek\'ten yarım gün turlar mümkün.', en: 'The ancient Aspendos theatre is 25 km away, Perge 30 km, Side 30 km. Half-day tours from Belek are easy.', ru: 'Театр Аспендоса в 25 км, Перге в 30 км, Сиде в 30 км. Полудневные туры из Белека удобны.', de: 'Das antike Theater Aspendos ist 25 km entfernt, Perge 30 km, Side 30 km. Halbtagestouren von Belek aus sind unkompliziert.', ar: 'مسرح أسبندوس على بُعد 25 كم، بيرغي 30 كم، سيدي 30 كم. جولات نصف يوم من بيليك سهلة.' },
  'belek.s2Title': { tr: 'Belek\'te Mutlaka Görülecek 3 Yer', en: '3 Places You Must See in Belek', ru: '3 места в Белеке, которые нужно увидеть', de: '3 Orte, die Sie in Belek sehen müssen', ar: '3 أماكن يجب أن تراها في بيليك' },
  'belek.s2c1Title': { tr: '🎭 Aspendos Antik Tiyatrosu', en: '🎭 Ancient Aspendos Theatre', ru: '🎭 Античный театр Аспендоса', de: '🎭 Antikes Theater Aspendos', ar: '🎭 مسرح أسبندوس القديم' },
  'belek.s2c1Text':  { tr: '15.000 kişilik antik Roma tiyatrosu — dünyanın en iyi korunmuş örneklerinden. Yaz aylarında opera ve bale festivali sahnesi.', en: 'A 15,000-seat ancient Roman theatre — one of the best preserved in the world. In summer it hosts the opera and ballet festival.', ru: 'Античный римский театр на 15 000 мест — один из лучше всего сохранившихся в мире. Летом — сцена фестиваля оперы и балета.', de: 'Antikes römisches Theater mit 15.000 Plätzen — eines der weltweit besterhaltenen. Im Sommer Bühne des Opern- und Ballettfestivals.', ar: 'مسرح روماني قديم يتسع لـ15,000 شخص — من الأفضل حفظاً في العالم. صيفاً يستضيف مهرجان الأوبرا والباليه.' },
  'belek.s2c2Title': { tr: '⛳ Belek Golf Sahaları', en: '⛳ Belek Golf Courses', ru: '⛳ Поля для гольфа Белека', de: '⛳ Belek-Golfplätze', ar: '⛳ ملاعب غولف بيليك' },
  'belek.s2c2Text':  { tr: 'Carya, Cornelia, Antalya Golf Club, Gloria — uluslararası şampiyonalara ev sahipliği yapan sahalar. Çoğu otel rezervasyonunuza dahil.', en: 'Carya, Cornelia, Antalya Golf Club, Gloria — courses that host international championships. Most are included with hotel bookings.', ru: 'Carya, Cornelia, Antalya Golf Club, Gloria — поля, принимающие международные чемпионаты. Большинство включены в брони отелей.', de: 'Carya, Cornelia, Antalya Golf Club, Gloria — Plätze, die internationale Meisterschaften ausrichten. Die meisten sind in Hotelbuchungen inkludiert.', ar: 'كاريا وكورنيليا ومنتجع غولف أنطاليا وغلوريا — ملاعب تستضيف بطولات دولية. معظمها مشمول مع حجز الفندق.' },
  'belek.s2c3Title': { tr: '🐢 Belek Plajı & Caretta', en: '🐢 Belek Beach & Caretta Turtles', ru: '🐢 Пляж Белека и черепахи каретта', de: '🐢 Belek-Strand & Caretta-Schildkröten', ar: '🐢 شاطئ بيليك وسلاحف كاريتا' },
  'belek.s2c3Text':  { tr: '14 km uzunluğunda altın kumlu plaj. Belek, deniz kaplumbağası Caretta caretta\'nın yumurtladığı koruma bölgesi.', en: '14 km of golden-sand beach. Belek is a protected nesting area for the loggerhead sea turtle (Caretta caretta).', ru: '14 км пляжа с золотым песком. Белек — охраняемая зона гнездования морских черепах каретта.', de: '14 km goldener Sandstrand. Belek ist Brutgebiet der Unechten Karettschildkröte (Caretta caretta).', ar: '14 كم من الشاطئ الرملي الذهبي. بيليك منطقة حماية لتعشيش السلاحف البحرية كاريتا كاريتا.' },
  'belek.faqTitle': { tr: 'Belek Araç Kiralama — Sık Sorulan Sorular', en: 'Belek Car Rental — FAQ', ru: 'Аренда авто в Белеке — частые вопросы', de: 'Mietwagen Belek — FAQ', ar: 'تأجير السيارات في بيليك — الأسئلة الشائعة' },
  'belek.faqQ1': { tr: 'Golf seti aracımla taşıyabilir miyim?', en: 'Can I carry my golf set in the car?', ru: 'Можно ли перевозить гольф-сет в машине?', de: 'Kann ich meine Golfausrüstung im Auto transportieren?', ar: 'هل يمكنني نقل معدات الغولف في السيارة؟' },
  'belek.faqA1': { tr: 'Standart bir sedan bagajında bir golf seti rahat sığar. İki set veya bagaj yoğunsa orta sınıf veya küçük SUV önerilir. Rezervasyonda "Golf seti taşıyacağım" notu düşün.', en: 'A standard sedan trunk fits one golf set comfortably. For two sets or heavy luggage, choose a mid-size sedan or small SUV. Add a "carrying golf set" note at booking.', ru: 'В багажник стандартного седана один гольф-сет помещается легко. Для двух наборов или большого багажа возьмите седан среднего класса или небольшой SUV. Укажите в брони «везу гольф-сет».', de: 'In einen Standard-Sedan-Kofferraum passt bequem ein Golfset. Bei zwei Sets oder viel Gepäck wählen Sie Mittelklasse-Sedan oder kleinen SUV. Bei der Buchung "Golfset dabei" vermerken.', ar: 'صندوق السيدان العادية يستوعب معدات غولف واحدة بسهولة. لمجموعتين أو أمتعة كثيفة اختر سيدان متوسطة أو دفع رباعي صغير. أضف ملاحظة "أنقل معدات غولف" عند الحجز.' },
  'belek.faqQ2': { tr: 'O-21 otoyolu (HGS) ücretli mi?', en: 'Is the O-21 motorway (HGS) tolled?', ru: 'Платная ли автомагистраль O-21 (HGS)?', de: 'Ist die Autobahn O-21 (HGS) mautpflichtig?', ar: 'هل الطريق السريع O-21 (HGS) برسوم؟' },
  'belek.faqA2': { tr: 'Evet. Antalya–Belek arası O-21 ücretli; kiralık araçların çoğunda HGS hazır, geçişler iade sırasında faturalandırılır. Tek geçiş yaklaşık 50-70 TL.', en: 'Yes. The O-21 between Antalya and Belek is tolled; most rental cars come with HGS pre-installed and tolls are billed on return. One pass ~50-70 TL.', ru: 'Да. O-21 между Антальей и Белеком — платная; в большинстве арендованных авто уже стоит HGS, оплата при возврате. Один проезд ~50-70 TL.', de: 'Ja. Die O-21 zwischen Antalya und Belek ist mautpflichtig; HGS ist in den meisten Mietwagen vorinstalliert, Maut wird bei Rückgabe abgerechnet. Eine Durchfahrt ~50-70 TL.', ar: 'نعم. الطريق O-21 بين أنطاليا وبيليك برسوم؛ HGS مثبّت مسبقاً في معظم السيارات المستأجرة وتُحتسب الرسوم عند الإعادة. الرحلة الواحدة ~50-70 ليرة.' },
  'belek.faqQ3': { tr: 'Resort otelimden günde 1-2 saat aracımı kullanmak için kiralamaya değer mi?', en: 'Is it worth renting if I only need the car 1-2 hours a day from my resort?', ru: 'Стоит ли арендовать, если из отеля я уезжаю всего на 1-2 часа в день?', de: 'Lohnt es sich zu mieten, wenn ich das Auto nur 1-2 Stunden pro Tag brauche?', ar: 'هل يستحق التأجير إن كنت أحتاج السيارة 1-2 ساعة فقط يومياً؟' },
  'belek.faqA3': { tr: 'Bir kez Aspendos veya Side gezisi yapacaksanız 1 günlük kiralama daha ucuz. Birden fazla gün gezeceksiniz veya akşam dışarı çıkacaksanız haftalık kiralama kişi başı transfer ücretinden ucuz çıkar.', en: 'For a single Aspendos or Side trip, a 1-day rental is cheaper. For multiple days or evenings out, a weekly rental beats per-person transfer fees.', ru: 'Если едете один раз в Аспендос или Сиде — выгоднее аренда на день. Для нескольких дней или вечерних выездов недельная аренда дешевле трансферов на человека.', de: 'Für eine einzige Fahrt nach Aspendos oder Side ist eine Tagesmiete günstiger. Für mehrere Tage oder Abendausflüge schlägt eine Wochenmiete die Transferkosten pro Person.', ar: 'لرحلة واحدة إلى أسبندوس أو سيدي، التأجير ليوم واحد أرخص. للعديد من الأيام أو الخروج المسائي، التأجير الأسبوعي أرخص من رسوم النقل للشخص الواحد.' },
  'belek.ctaTitle': { tr: 'Belek\'teki aracınızı şimdi ayırtın', en: 'Reserve your Belek car now', ru: 'Забронируйте машину в Белеке', de: 'Reservieren Sie jetzt Ihr Belek-Auto', ar: 'احجز سيارتك في بيليك الآن' },
  'belek.ctaSub':   { tr: 'AYT\'den veya Belek resort\'unuzdan teslim — 50+ firma karşılaştır, ücretsiz iptal.', en: 'Pickup at AYT or your Belek resort — compare 50+ companies, free cancellation.', ru: 'Выдача в AYT или в вашем резорте Белека — 50+ компаний, бесплатная отмена.', de: 'Übergabe am AYT oder an Ihrem Belek-Resort — 50+ Anbieter, kostenlose Stornierung.', ar: 'استلام في AYT أو منتجعك في بيليك — 50+ شركة، إلغاء مجاني.' },

  // ============================================================
  // LOKASYON: SIDE
  // ============================================================
  'title.side': { tr: 'Side Araç Kiralama — Antik Kent ve Plaj | ExitCar', en: 'Side Car Rental — Ancient City and Beach | ExitCar', ru: 'Аренда авто в Сиде — античный город и пляж | ExitCar', de: 'Mietwagen Side — Antike Stadt und Strand | ExitCar', ar: 'تأجير السيارات في سيدي — المدينة الأثرية والشاطئ | ExitCar' },
  'desc.side':  { tr: 'Side\'de araç kiralama: Apollo Tapınağı, antik tiyatro, Manavgat Şelalesi. AYT\'den 65 km, O-21 ile 60 dakika.', en: 'Side car rental: Apollo Temple, ancient theatre, Manavgat Waterfall. 65 km from AYT, 60 minutes via O-21.', ru: 'Аренда авто в Сиде: храм Аполлона, античный театр, водопад Манавгат. 65 км от AYT, 60 минут по O-21.', de: 'Mietwagen Side: Apollotempel, antikes Theater, Manavgat-Wasserfall. 65 km vom AYT, 60 Minuten über O-21.', ar: 'تأجير السيارات في سيدي: معبد أبولو، المسرح الأثري، شلال مانافجات. 65 كم من AYT، 60 دقيقة عبر O-21.' },
  'side.h1':       { tr: 'Side Araç Kiralama', en: 'Side Car Rental', ru: 'Аренда авто в Сиде', de: 'Mietwagen Side', ar: 'تأجير السيارات في سيدي' },
  'side.heroSub':  { tr: 'Antik Pamphylia\'nın liman kenti — Apollo Tapınağı kalıntıları, 20.000 kişilik Roma tiyatrosu ve uzun kumsallar. Tarihten plaja, plajdan şelaleye yolun sahibi siz olun.', en: 'The ancient Pamphylian port city — the ruins of Apollo\'s Temple, a 20,000-seat Roman theatre and long sandy beaches. Own the route from history to beach to waterfall.', ru: 'Древний порт Памфилии — руины храма Аполлона, римский театр на 20 000 мест и длинные песчаные пляжи. История, пляж, водопад — маршрут в ваших руках.', de: 'Die antike pamphylische Hafenstadt — die Ruinen des Apollotempels, ein römisches Theater mit 20.000 Plätzen und lange Sandstrände. Bestimmen Sie selbst die Route von Geschichte zu Strand zu Wasserfall.', ar: 'مدينة الميناء البامفيلية القديمة — أطلال معبد أبولو ومسرح روماني يتسع لـ20,000 شخص وشواطئ رملية طويلة. اختر مسارك من التاريخ إلى الشاطئ إلى الشلال.' },
  'side.heroBadge':{ tr: '🏛️ AYT\'den 65 km · 60 dakika', en: '🏛️ 65 km from AYT · 60 minutes', ru: '🏛️ 65 км от AYT · 60 минут', de: '🏛️ 65 km vom AYT · 60 Minuten', ar: '🏛️ 65 كم من AYT · 60 دقيقة' },
  'side.heroCta':  { tr: 'Side\'de Araçları Gör', en: 'See Cars in Side', ru: 'Авто в Сиде', de: 'Fahrzeuge in Side', ar: 'سيارات في سيدي' },
  'side.s1Title': { tr: 'Side\'de Neden Araç?', en: 'Why a Car in Side?', ru: 'Зачем нужна машина в Сиде?', de: 'Warum ein Auto in Side?', ar: 'لماذا تحتاج سيارة في سيدي؟' },
  'side.s1c1Title': { tr: 'Çevresinde Çok Şey Var', en: 'So Much Around', ru: 'Вокруг очень много', de: 'Viel drumherum', ar: 'كثير في المحيط' },
  'side.s1c1Text':  { tr: 'Manavgat Şelalesi, Aspendos, Kürşunlu Şelalesi, Köprülü Kanyon — hepsi Side\'den 1 saat içinde. Turlar zaman alır, aracınızla esnek olun.', en: 'Manavgat Waterfall, Aspendos, Kursunlu Waterfall, Köprülü Canyon — all within an hour of Side. Tours take a day; a car gives flexibility.', ru: 'Водопад Манавгат, Аспендос, водопад Куршунлу, каньон Кёпрюлю — всё в часе езды от Сиде. Туры занимают день, машина даёт гибкость.', de: 'Manavgat-Wasserfall, Aspendos, Kursunlu-Wasserfall, Köprülü-Schlucht — alle in einer Stunde von Side. Touren dauern den ganzen Tag; mit Auto sind Sie flexibel.', ar: 'شلال مانافجات، أسبندوس، شلال كورشونلو، وادي كوبرولو — جميعها على بُعد ساعة من سيدي. الجولات تأخذ يوماً، السيارة تمنحك المرونة.' },
  'side.s1c2Title': { tr: 'Side Eski Şehir Trafiği', en: 'Side Old Town Traffic', ru: 'Трафик в старом городе Сиде', de: 'Verkehr in Side-Altstadt', ar: 'حركة المرور في سيدي القديمة' },
  'side.s1c2Text':  { tr: 'Eski şehir merkezi yaya öncelikli; otelinizin park alanından dışarı çıkın, kıyıdaki park alanlarını kullanın. Aracın olması otele dönüşü kolaylaştırır.', en: 'The old town is pedestrian-priority; park at your hotel or at the seaside lots. A car makes the trip back to your hotel much easier.', ru: 'Старый город — пешеходный приоритет; паркуйтесь у отеля или на побережье. Машина упрощает возвращение в отель.', de: 'Die Altstadt ist fußgängerorientiert; parken Sie am Hotel oder an Strandparkplätzen. Mit Auto ist die Rückkehr zum Hotel viel einfacher.', ar: 'البلدة القديمة للمشاة بشكل رئيسي؛ اركن في فندقك أو في مواقف الواجهة البحرية. السيارة تُسهّل العودة إلى الفندق.' },
  'side.s1c3Title': { tr: 'Plaj Seçenekleri', en: 'Beach Options', ru: 'Варианты пляжей', de: 'Strandoptionen', ar: 'خيارات الشاطئ' },
  'side.s1c3Text':  { tr: 'Side\'nin doğu plajı geniş ve kumlu; batı plajı daha sakin. Sorgun, Çolaklı ve Titreyengöl plajları 5-10 km uzaklıkta — her gün farklı plaj denemek mümkün.', en: 'Side\'s east beach is wide and sandy; the west is quieter. Sorgun, Çolaklı and Titreyengöl beaches are 5-10 km away — sample a different beach each day.', ru: 'Восточный пляж Сиде широкий и песчаный; западный спокойнее. Пляжи Соргун, Чолаклы и Титренгёль в 5-10 км — каждый день новый пляж.', de: 'Der Oststrand von Side ist breit und sandig, der Weststrand ruhiger. Sorgun, Çolaklı und Titreyengöl liegen 5-10 km entfernt — jeden Tag ein anderer Strand.', ar: 'الشاطئ الشرقي لسيدي عريض ورملي؛ الغربي أكثر هدوءاً. شواطئ سورجون وتشولاكلي وتيتري نجول على بُعد 5-10 كم — جرّب شاطئاً مختلفاً كل يوم.' },
  'side.s2Title': { tr: 'Side\'de Mutlaka Görülecek 3 Yer', en: '3 Places You Must See in Side', ru: '3 места в Сиде, которые нужно увидеть', de: '3 Orte, die Sie in Side sehen müssen', ar: '3 أماكن يجب أن تراها في سيدي' },
  'side.s2c1Title': { tr: '🏛️ Apollo Tapınağı', en: '🏛️ Apollo Temple', ru: '🏛️ Храм Аполлона', de: '🏛️ Apollotempel', ar: '🏛️ معبد أبولو' },
  'side.s2c1Text':  { tr: 'Side\'nin simgesi — denize bakan kalıntıların gün batımında fotoğrafı klasik. M.Ö. 2. yüzyıldan kalma.', en: 'Side\'s icon — the seaside ruins at sunset make the classic photo. Dates from the 2nd century BC.', ru: 'Символ Сиде — руины у моря на закате дают классический кадр. II век до н.э.', de: 'Sides Wahrzeichen — die Ruinen am Meer bei Sonnenuntergang ergeben das klassische Foto. 2. Jh. v. Chr.', ar: 'رمز سيدي — أطلال على البحر تُلتقَط لها صورة كلاسيكية عند الغروب. تعود للقرن الثاني قبل الميلاد.' },
  'side.s2c2Title': { tr: '💧 Manavgat Şelalesi', en: '💧 Manavgat Waterfall', ru: '💧 Водопад Манавгат', de: '💧 Manavgat-Wasserfall', ar: '💧 شلال مانافجات' },
  'side.s2c2Text':  { tr: 'Side\'ye 10 km — Manavgat Nehri\'nin 2 m yükseklikten geniş bir kavisle dökülüşü. Yanında çay bahçeleri ve tekne turu.', en: '10 km from Side — the Manavgat River drops over a wide 2 m arc. Tea gardens and river boat tours nearby.', ru: 'В 10 км от Сиде — река Манавгат падает широкой 2-метровой дугой. Рядом чайные сады и речные катера.', de: '10 km von Side — der Manavgat-Fluss fällt über einen breiten 2-m-Bogen. Daneben Teegärten und Flussbootstouren.', ar: 'على بُعد 10 كم من سيدي — يسقط نهر مانافجات على قوس عريض بارتفاع 2 م. حدائق شاي وجولات قارب بجانبه.' },
  'side.s2c3Title': { tr: '🎭 Side Antik Tiyatrosu', en: '🎭 Ancient Side Theatre', ru: '🎭 Античный театр Сиде', de: '🎭 Antikes Theater Side', ar: '🎭 المسرح الأثري في سيدي' },
  'side.s2c3Text':  { tr: '20.000 kişilik antik tiyatro, Apollo Tapınağı\'na yürüme mesafesinde. Kalıntıların büyüklüğü şaşırtıcı.', en: 'A 20,000-seat ancient theatre within walking distance of Apollo Temple. The scale is astonishing.', ru: 'Античный театр на 20 000 мест в шаговой доступности от храма Аполлона. Масштаб впечатляет.', de: 'Antikes Theater mit 20.000 Plätzen, fußläufig zum Apollotempel. Der Maßstab beeindruckt.', ar: 'مسرح أثري يتسع لـ20,000 شخص على مسافة قصيرة سيراً من معبد أبولو. الحجم مذهل.' },
  'side.faqTitle': { tr: 'Side Araç Kiralama — Sık Sorulan Sorular', en: 'Side Car Rental — FAQ', ru: 'Аренда авто в Сиде — частые вопросы', de: 'Mietwagen Side — FAQ', ar: 'تأجير السيارات في سيدي — الأسئلة الشائعة' },
  'side.faqQ1': { tr: 'Side\'de aracımı eski şehirde park edebilir miyim?', en: 'Can I park my car in Side\'s old town?', ru: 'Можно ли парковаться в старом городе Сиде?', de: 'Kann ich in Sides Altstadt parken?', ar: 'هل يمكنني ركن سيارتي في سيدي القديمة؟' },
  'side.faqA1': { tr: 'Eski şehir büyük ölçüde yayalaştırılmış. Eski şehir girişindeki ücretli park alanları kullanılır (saatlik 20-30 TL). Otelinizde park alanı olabilir; tercih edin.', en: 'The old town is largely pedestrianised. Use paid parking at the old town entrance (20-30 TL/hour). Use your hotel\'s parking if available.', ru: 'Старый город в основном пешеходный. Используйте платные парковки у входа (20-30 TL/час). По возможности — парковка отеля.', de: 'Die Altstadt ist weitgehend Fußgängerzone. Nutzen Sie die Parkplätze am Eingang (20-30 TL/Stunde). Hotelparkplatz, wenn vorhanden, bevorzugen.', ar: 'البلدة القديمة معظمها للمشاة. استخدم المواقف المدفوعة عند المدخل (20-30 ليرة/ساعة). فضّل موقف الفندق إن توفّر.' },
  'side.faqQ2': { tr: 'Side\'den Antalya\'ya nasıl giderim — D400 mü O-21 mi?', en: 'Side to Antalya — D400 or O-21?', ru: 'Из Сиде в Анталью — D400 или O-21?', de: 'Von Side nach Antalya — D400 oder O-21?', ar: 'من سيدي إلى أنطاليا — D400 أم O-21؟' },
  'side.faqA2': { tr: 'Acelesiniz O-21 (ücretli, HGS), 60 dk. Manzara önceliğinizse D400 sahil yolu, 90 dk ama Manavgat ve Side dışı plajları görerek. İkisini de en az bir kez yapın.', en: 'Quick? O-21 (toll, HGS) takes 60 min. Scenic? D400 coastal road takes 90 min but passes Manavgat and outer beaches. Try both at least once.', ru: 'Быстро — O-21 (платно, HGS), 60 минут. По красоте — D400 побережье, 90 минут, мимо Манавгата и пляжей. Попробуйте оба маршрута.', de: 'Schnell? O-21 (Maut, HGS) — 60 Minuten. Landschaftlich? D400-Küstenstraße — 90 Minuten an Manavgat und Aussenstränden vorbei. Beides einmal probieren.', ar: 'سريع؟ O-21 (برسوم، HGS) في 60 دقيقة. مناظر؟ D400 الساحلي 90 دقيقة عبر مانافجات والشواطئ الخارجية. جرّب الطريقين على الأقل مرة.' },
  'side.faqQ3': { tr: 'Sorgun ve Titreyengöl bölgelerine teslim mümkün mü?', en: 'Can you deliver to Sorgun or Titreyengöl?', ru: 'Возможна ли доставка в Соргун или Титренгёль?', de: 'Lieferung nach Sorgun oder Titreyengöl möglich?', ar: 'هل يمكن التسليم إلى سورجون أو تيتري نجول؟' },
  'side.faqA3': { tr: 'Evet, Side bölgesinin tamamına (Sorgun, Çolaklı, Titreyengöl, Kumköy) teslim hizmeti mevcut — büyük resort otellerine genellikle ücretsiz.', en: 'Yes — delivery is available throughout the Side region (Sorgun, Çolaklı, Titreyengöl, Kumköy), usually free to large resorts.', ru: 'Да, доставка по всему региону Сиде (Соргун, Чолаклы, Титренгёль, Кумкёй) — для крупных отелей обычно бесплатно.', de: 'Ja, Lieferung in die gesamte Side-Region (Sorgun, Çolaklı, Titreyengöl, Kumköy), zu großen Resorts meist kostenlos.', ar: 'نعم، التسليم متاح في كامل منطقة سيدي (سورجون، تشولاكلي، تيتري نجول، كوم كوي) — مجاناً للمنتجعات الكبرى عادةً.' },
  'side.ctaTitle': { tr: 'Side\'deki aracınızı şimdi ayırtın', en: 'Reserve your Side car now', ru: 'Забронируйте машину в Сиде', de: 'Reservieren Sie jetzt Ihr Side-Auto', ar: 'احجز سيارتك في سيدي الآن' },
  'side.ctaSub':   { tr: 'AYT\'den veya Side otelinizden teslim — 50+ firma karşılaştır, ücretsiz iptal.', en: 'Pickup at AYT or your Side hotel — compare 50+ companies, free cancellation.', ru: 'Выдача в AYT или в отеле в Сиде — 50+ компаний, бесплатная отмена.', de: 'Übergabe am AYT oder an Ihrem Side-Hotel — 50+ Anbieter, kostenlose Stornierung.', ar: 'استلام في AYT أو فندقك في سيدي — 50+ شركة، إلغاء مجاني.' },
};
