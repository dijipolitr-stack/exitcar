# SEO Rekabet Analizi Raporu

> **Kapsam:** exitcar.com (mevcut/eski site) vs. yolcu360.com ve enuygun.com
> **Araç:** `seoanalizi` (proje kökünde) · `--no-llm --max-pages 20`
> **Tarih:** 28 Mayıs 2026
> **Detaylı PDF raporlar:** `Projeler/seoanalizi/reports/`

## Skor karşılaştırması

| Domain                 | Genel    | Teknik   | On-Page  | Kritik Sorun |
|------------------------|---------:|---------:|---------:|-------------:|
| **enuygun.com**        | **100**  | 100      | 100      | 0            |
| **yolcu360.com**       | **94**   | 89       | **100**  | 0            |
| **exitcar.com (eski)** | **86**   | 91       | 82       | 0            |

**Önemli çıkarımlar:**
- enuygun teknik+on-page tarafında neredeyse mükemmel — gold standard.
- yolcu360 **on-page 100/100** — açılış sayfaları + blog içeriği son derece iyi optimize.
- Devraldığımız `exitcar.com`'un en zayıf yanı **on-page (82)**: meta description eksiklikleri, sitemap'in olmaması, E-E-A-T düşüklüğü.

## Eski exitcar'ın 6 problemi → yeni sitedeki durum

| Sorun (eski sitede)                            | Öncelik | Yeni sitedeki durum                              |
|------------------------------------------------|--------:|--------------------------------------------------|
| 19 sayfada meta description eksik              | P1      | ✅ **ÇÖZÜLDÜ** (her sayfa `data-i18n-content`)   |
| XML Sitemap bulunamadı                         | P1      | ✅ **ÇÖZÜLDÜ** (`sitemap.xml` 5 dil hreflang ile)|
| E-E-A-T skoru düşük (4.2/10)                   | P1      | ⚠️ Kısmen çözüldü (Organization JSON-LD + Article author var; daha fazla içerik gerek) |
| 2 sayfada H1 etiketi eksik                     | P2      | ✅ Çözüldü (tüm açılış/landing sayfalarında H1)  |
| Görsel alt text kapsamı %48                    | P2      | ⚠️ Mevcut görsellerde `alt` var, ama dinamik araç görsellerinde TR sabit; çoklu dilde dinamik `alt` iyi olur |
| 13 sayfada thin content (<300 kelime)          | P2      | ⚠️ Blog yeni başladı (1 makale). 5-10 makale + lokasyon sayfası eklenince çözülür |

**Net kazanım:** Eski siteden devralınacak 6 sorunun 3'ünü cutover öncesi tamamen çözmüş olacağız, 3'ü ise içerik üretimi devam ettikçe çözülecek.

## Rakiplerin zayıf noktaları — bizim fırsatımız

### yolcu360.com (94/100)
- [P1] 1 sayfada title tag eksik
- [P2] 4 sayfada H1 eksik
- [P2] **Görsel alt text kapsamı %61** — bu konuda biz dikkatli olursak öne geçebiliriz
- **Çoklu dil**: `/en /de /ru` var ama biz **5 dil + Arapça RTL + tam ön-render** ile daha derin. Özellikle Antalya'ya gelen Arap turist için açık alan.
- **Blog**: TR ağırlıklı; EN/DE/RU rehberleri yok — bizim "Türkiye'de Yabancı Olarak Araç Kiralama" makalemiz 5 dilde, onlarda 0.

### enuygun.com (100/100)
- [P3] Sadece 2 sayfada H1 eksik (marjinal)
- Genel olarak nokta atışı zor — bu seviyeye ulaşmak hedef.
- Ama enuygun **çok kategorili genel seyahat sitesi** (uçak/otel/araç) — araç kiralama dikey nişinde fokus avantajımız var.

## Yeni sitemizin SEO durumu (manuel checklist)

| Özellik                            | Durum                                                            |
|------------------------------------|------------------------------------------------------------------|
| XML Sitemap                        | ✅ Var (5 dil hreflang + AYT + Blog + makale)                    |
| robots.txt                         | ✅ Var                                                           |
| Meta description (tüm sayfa)       | ✅ Her sayfada (`data-i18n-content` ile lokalize)                |
| Canonical (her sayfa self)         | ✅ Var                                                           |
| hreflang (5 dil + x-default)       | ✅ Var                                                           |
| Open Graph + Twitter Card          | ✅ Var (lokalize)                                                |
| JSON-LD Organization               | ✅ Var                                                           |
| JSON-LD CarRental/LocalBusiness    | ✅ Var (Antalya ofis adresi dahil)                               |
| JSON-LD FAQPage                    | ✅ Var (anasayfa + AYT sayfası, dile çevriliyor)                 |
| JSON-LD Article                    | ✅ Var (blog makalelerinde, her dilde)                           |
| JSON-LD BreadcrumbList             | ✅ Var (AYT + makale sayfalarında)                               |
| Çok dilli statik URL (ön-render)   | ✅ `/en /ru /de /ar` (rakipler ya yok ya da yarım)               |
| Mobil responsive                   | ✅ (Mevcut CSS responsive)                                       |
| SSL                                | ✅ Vercel otomatik                                               |
| Sayfa hızı (LCP/CLS)               | ⚠️ Henüz ölçülmedi — cutover sonrası Lighthouse koşmalı          |
| Author bio (E-E-A-T)               | ❌ Yok — eklemek lazım                                           |
| Müşteri yorumları/rating (E-E-A-T) | ❌ Yok — eklenecek                                               |
| Backlink profili                   | ⚠️ Eski siteden devralınacak (DA 14, 80 ref domain)              |

## Cutover sonrası tahmini durum (proaktif tahmin)

Yeni sitenin SEO skoru `seoanalizi` ile tekrar koşulduğunda **tahmini 92-96/100** aralığında olmalı:
- Teknik: ~95 (sitemap, robots, canonical, hreflang, JSON-LD hep var)
- On-Page: ~92 (meta desc tüm sayfalarda, H1 yapısı temiz, alt textler büyük çoğunlukla var; thin content sorunu blog büyüdükçe çözülür)

**Hedef:** 6 ay içinde **96+/100** ile yolcu360'ı geçmek, 12 ay içinde enuygun'a yaklaşmak.

## Önerilen yol haritası (eyleme dönük)

### Sprint 1 — Cutover öncesi (1-2 hafta)
1. **Kurumsal sayfaları yaz:** hakkımızda, iletişim, KVKK, gizlilik, kullanım koşulları (E-E-A-T için kritik)
2. **Antalya şehir merkezi açılış sayfası** (`antalya-arac-kiralama.html`) — geniş keyword
3. **2-3 yeni blog yazısı:**
   - "Filo Yönetimi Nedir?" (eski blog yazısının devralan karşılığı)
   - "Antalya 7 Günlük Araçlı Rota Rehberi"
   - "Antalya Havalimanı vs Şehir Merkezi: Hangisi Daha Ucuz?"
4. **Author bio bileşeni:** Blog yazılarına yazar kutusu ekle (resim, ünvan, bağlantılar). E-E-A-T sinyali.

### Sprint 2 — Cutover sonrası ilk 4 hafta
1. Google Search Console kurulumu + sitemap submit
2. Lighthouse audit + Core Web Vitals optimizasyonu
3. **5 ek lokasyon sayfası:** Antalya Kemer/Belek/Side/Alanya/Lara
4. **3 ek blog yazısı**, özellikle EN/RU/DE öncelikli (rakiplerin zayıf alanı)
5. Müşteri yorumları için bir veri kaynağı + JSON-LD `Review`/`AggregateRating`

### Sprint 3 — 3-6 ay
1. Daha derin içerik: araç tipi bazlı rehberler ("Hibrit araç ne zaman seçilmeli?", "Otomatik vs manuel maliyeti")
2. Backlink çalışması: yerel turizm siteleri, Antalya rehber blogları, yabancı dilde forumlar
3. **Schema'yı genişlet:** `OfferCatalog` (araç kataloğu), `Service`, `WebSite SearchAction`

## Detaylı PDF raporlar

Üretilen 12 PDF dosyası (4 tip × 3 domain) burada: `Projeler/seoanalizi/reports/`
- `<domain>-tam-seo-raporu.pdf` — 360° audit
- `<domain>-pozisyon-raporu.pdf` — SERP pozisyon analizi
- `<domain>-etki-raporu.pdf` — rakip etki + backlink
- `<domain>-yol-haritasi.pdf` — 12 aylık aksiyon takvimi

> Not: Bu çalıştırma `--no-llm` ile yapıldı; OpenAI key sağlanırsa LLM ile her bölüm için detaylı yorum + öneri metni eklenir (daha derin ama daha pahalı/yavaş).
