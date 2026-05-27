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
- **Dil değişimi:** Navbar'daki dil seçici `localStorage`'a yazar ve sayfayı yeniler.
  İlk girişte kayıt yoksa tarayıcı diline göre otomatik seçilir.

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
