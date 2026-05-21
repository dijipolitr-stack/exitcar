# ExitCar — Araç Kiralama Web Sitesi

Modern, responsive araç kiralama landing page ve arama sayfası. **yolcu360.com** referans alınarak ExitCar markası için sıfırdan tasarlandı.

## 🚗 Özellikler

- **Ana Sayfa** (`index.html`) — Hero arama formu, araç kategorileri, avantajlar, popüler lokasyonlar, araç markaları, SSS, footer
- **Arama Sayfası** (`search.html`) — Filtreli araç listesi, fiyat/vites/yakıt/sınıf filtreleri, sıralama
- Kırmızı & Beyaz premium tasarım
- Flatpickr Türkçe date picker
- Şehir autocomplete (30+ Türkiye lokasyonu)
- Tam responsive (mobil + tablet + masaüstü)
- Scroll animasyonları, hover efektleri

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
