# ExitCar — Araç Kiralama Web Sitesi

Modern, responsive araç kiralama landing page ve arama sayfası. **yolcu360.com** referans alınarak ExitCar markası için sıfırdan tasarlandı.

## 🚗 Özellikler

- **Ana Sayfa** (`index.html`) — Hero arama formu, araç kategorileri, avantajlar, popüler lokasyonlar, araç markaları, SSS, footer
- **Arama Sayfası** (`search.html`) — Filtreli araç listesi, fiyat/vites/yakıt/sınıf filtreleri, sıralama
- Kırmızı & Beyaz premium tasarım
- **Çok dilli (5 dil):** Türkçe, İngilizce, Rusça, Almanca, Arapça (Arapça RTL)
- **Dile göre otomatik para birimi:** TR→₺, EN/DE→€, RU→₽, AR→$
- Flatpickr date picker (seçili dile göre yerelleşir)
- Şehir autocomplete (30+ Türkiye lokasyonu)
- Tam responsive (mobil + tablet + masaüstü)
- Scroll animasyonları, hover efektleri

## 🌍 Çok Dilli Sistem

Tüm metinler `js/i18n.js` içindeki `EC_T` sözlüğünde toplanır (anahtar → `{tr, en, ru, de, ar}`).
HTML'de metinler `data-i18n="anahtar"`, fiyatlar `data-price` / `data-price-day` ile işaretlenir;
dinamik içerik (araç kartları, doğrulama mesajları) JS içinde `t()` ve `fmtPrice()` çağırır.

- **Çeviri eklemek/düzeltmek:** `js/i18n.js` → `EC_T` sözlüğünde ilgili anahtarı düzenle.
- **Döviz kurlarını güncellemek:** `js/i18n.js` → `EC_CUR` (her birim yabancı paranın kaç TL ettiği).
- **Dil değişimi:** Navbar'daki dil seçici ilgili dilin URL'ine gider
  (tr → kök, diğerleri → `/en/`, `/ru/`, `/de/`, `/ar/`).
- **İlk giriş:** Kökte (`/`) bir insan ziyaretçi, tarayıcı diline veya kayıtlı
  tercihine göre otomatik `/en/` gibi bir URL'e yönlenir. Botlar daima Türkçe
  kökü görür (SEO temizliği için).

## 🔎 SEO Altyapısı

Site SEO için **dil başına statik sayfalar** üretir — Google JS'e bağımlı kalmadan
her dili ayrı, taranabilir URL olarak görür.

- **Ön-render:** `npm run build:i18n` komutu, Türkçe kaynak sayfaları okuyup
  `js/i18n.js` çevirilerini uygular ve `/en`, `/ru`, `/de`, `/ar` altına statik
  HTML üretir (her biri doğru `lang/dir`, `hreflang`, `canonical`, `og:locale` ile).
  > ⚠️ **Önemli:** Herhangi bir sayfada veya `js/i18n.js`'te metin değiştirdiğinde
  > `npm run build:i18n` komutunu **yeniden çalıştır**, yoksa dil sayfaları eski kalır.
- **`robots.txt` + `sitemap.xml`** — kökte; sitemap dil alternatiflerini `hreflang`
  ile listeler. Huni sayfaları (arama/rezervasyon/ödeme) `noindex`'tir.
- **Yapısal veri (JSON-LD):** Organization, WebSite, CarRental (Antalya ofisi) ve
  FAQPage. FAQ rich snippet'i ön-render sırasında her dile çevrilir.
- **Open Graph + Twitter Card** — sosyal paylaşım önizlemeleri için.

### ⚠️ Alan adı yer tutucusu
`exitcar.com` şu an yer tutucudur. Yayına geçince şu dosyalarda gerçek alan adıyla
değiştir: `index.html` (canonical/og/hreflang/JSON-LD), `sitemap.xml`, `robots.txt`,
`scripts/prerender.mjs` (`BASE`). Sonra `npm run build:i18n` çalıştır.

## 📁 Dosya Yapısı

```
exitcar/
├── index.html          ← Ana sayfa
├── search.html         ← Arama sonuçları
├── styles/
│   ├── main.css        ← Design system
│   └── search.css      ← Arama sayfası stilleri
├── js/
│   ├── main.js         ← Ana sayfa JS (autocomplete, datepicker)
│   └── search.js       ← Araç verisi ve filtreler
└── assets/
    ├── hero_bg.png
    └── cars/           ← Araç görselleri
```

## 🚀 Lokal Çalıştırma

```bash
python -m http.server 7360
# http://localhost:7360 adresini aç
```

## 🌐 Canlı

Vercel üzerinde deploy edilmiştir.

---

© 2025 ExitCar. Tüm hakları saklıdır.
