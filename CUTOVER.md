# ExitCar.com Cutover Planı

Mevcut `exitcar.com` (eski site) → bu repo (yeni site) geçiş planı. Onay geldiğinde kayıpsız çıkarmak için.

## ✅ Hazır olanlar

- [x] **Çok dilli yapı** (TR/EN/RU/DE/AR, hreflang, canonical, dile özel slug)
- [x] **Teknik SEO temeli** (robots.txt, sitemap.xml, OG, Twitter, JSON-LD)
- [x] **Antalya Havalimanı açılış sayfası** (5 dilde, BreadcrumbList + FAQPage)
- [x] **Blog altyapısı + ilk makale** (Yabancı turist rehberi, 5 dilde)
- [x] **301 redirect haritası** (`vercel.json`) — eski URL'leri yeni karşılıklarına yönlendirir

## 🔴 Cutover öncesi MUTLAKA yapılacaklar

### 1. Eski siteden tam URL envanteri çıkar
Mevcut `exitcar.com`'da Google'da indekslenmiş daha fazla URL olabilir.

```bash
# Google'da site:exitcar.com aramasıyla manuel kontrol
# veya Screaming Frog SEO Spider ile crawl
# Listede olmayan ama indekste olan URL'ler için redirect ekle
```

### 2. Eksik yüksek-değer sayfaları üret (rakipten önce)
Eski sitedeki şu URL'ler **rank ediyor olabilir**, redirect /search.html'e gidiyor ama dedike sayfa yapsak daha iyi:

- [ ] **Antalya Şehir Merkezi Araç Kiralama** — `/antalya-arac-kiralama.html`
- [ ] **Antalya Kemer Araç Kiralama** — `/antalya-kemer-arac-kiralama.html`
- [ ] **Antalya Belek Araç Kiralama** — `/antalya-belek-arac-kiralama.html`
- [ ] **Antalya Alanya Araç Kiralama** — `/antalya-alanya-arac-kiralama.html`
- [ ] **İstanbul Havalimanı Araç Kiralama** — `/istanbul-havalimani-arac-kiralama.html`
- [ ] **İzmir Adnan Menderes Araç Kiralama** — `/izmir-arac-kiralama.html`
- [ ] **Blog: Filo yönetimi** — eski `/tr/blog/filo-yonetimi` için
- [ ] **Blog: Araç kiralama hizmetleri genel rehber** — eski `/tr/blog/arac-oto-kiralama-hizmetleri` için

Bu sayfalar üretildikçe `vercel.json` redirect hedefini de güncelle.

### 3. Statik sayfalar (kurumsal)
Eski sitede vardı, biz koymadık. Cutover öncesi en azından temel sayfalar lazım:

- [ ] **Hakkımızda** — `/hakkimizda.html`
- [ ] **İletişim** — `/iletisim.html` (ya da homepage footer'a anchor)
- [ ] **KVKK Aydınlatma Metni** — `/kvkk.html`
- [ ] **Gizlilik Politikası** — `/gizlilik.html`
- [ ] **Kullanım Koşulları** — `/kullanim-kosullari.html`
- [ ] **Araç Kiralama Şartları** — `/arac-kiralama-sartlari.html`

Üretilince `vercel.json`'da bu URL'leri direkt yönlendirsin (şu an `/`'ye gidiyorlar).

### 4. www vs non-www karar
Eski site `www.exitcar.com` kullanıyor (robots.txt'ten görüldü). Yeni site non-www (`exitcar.com`) varsayılıyor.

- [ ] Vercel domain ayarlarında: **www.exitcar.com → exitcar.com 301 redirect**'i kur
- [ ] DNS: `exitcar.com` A/AAAA → Vercel; `www.exitcar.com` CNAME → exitcar.com
- Vercel bunu otomatik yapar; sadece her iki alan adını da projeye ekle, biri primary olarak işaretle

### 5. Vercel preview deployments noindex
Cutover öncesi Vercel'in `*.vercel.app` URL'i indekslenmemeli. Vercel default'ta preview deployment'lara `X-Robots-Tag: noindex` ekler. Production deployment için **alan adı bağlanana kadar** Vercel project ayarlarında "Deployment Protection" veya manuel noindex header aktif et.

## 🚀 Cutover günü adımları

```
1. Final build:    npm run build:i18n        (her durumda son hali)
2. Final commit:   git add -A && git commit  (varsa)
3. Final push:     git push origin main      (Vercel auto-deploy tetiklenir)
4. Vercel'de:      exitcar.com domain'ini bu projeye bağla (Primary)
5. Vercel'de:      www.exitcar.com → exitcar.com redirect ayarla
6. DNS'te:         A record / CNAME Vercel'e işaret etsin (TTL düşük tutarak)
7. Bekle:          DNS propagation (5-30 dakika)
8. Doğrula:        https://exitcar.com/ → bizim site, status 200, doğru içerik
9. Doğrula:        https://exitcar.com/tr/ → 301 → / (redirect çalışıyor mu?)
10. Doğrula:       https://exitcar.com/tr/reservasyon/antalya-belek-oto-kiralama → /search.html?pickup=...
11. Doğrula:       https://www.exitcar.com/ → 301 → https://exitcar.com/
12. Google Search Console:  yeni sitemap'i ekle (https://exitcar.com/sitemap.xml)
13. Google Search Console:  yeni property doğrula, eski property'de "Change of Address" gerekmez (aynı domain)
14. İlk 48 saat:   GSC "Coverage" raporunu takip et — 404 fırlayan eski URL varsa redirect ekle
```

## 🔍 Cutover sonrası izleme

İlk 2 hafta günlük, sonraki 2 hafta haftalık kontrol edilecek:

- [ ] **GSC → Coverage:** Hata sayısı, "Crawled - currently not indexed" listesi
- [ ] **GSC → Performance:** Anahtar kelimelerde sıralama değişimi (özellikle "antalya araç kiralama", "antalya havalimanı araç kiralama")
- [ ] **GSC → Sitemaps:** Submitted vs Indexed sayısı
- [ ] **GA / Plausible:** Organik trafik trend'i (cutover öncesi 4 haftalık baseline ile kıyas)
- [ ] **Backlink kontrolü** (ahrefs/Semrush): Eski URL'lere link verenler 301'i takip ediyor mu?

## ⚠️ Risk maddeleri

1. **Eski blog yazılarının kaybı** — `/tr/blog/filo-yonetimi` ve `/tr/blog/arac-oto-kiralama-hizmetleri`'ye giren trafiği kaybedebiliriz. Çözüm: Cutover öncesi bu iki konuda makale yaz, redirect'i doğrudan yeni makaleye yönlendir.

2. **Firma sayfalarının kaybı** — eski `/tr/rent-a-car-firmalari/<firma>` 12 sayfası vardı, hepsi şu an `/search.html`'e gidiyor. Eğer bu sayfalar lokal SEO'da rank ediyorsa, supplier-detail sayfası geliştirilebilir (gelecek).

3. **Statik kurumsal sayfaların eksikliği** — hakkımızda/iletişim/KVKK olmadan profesyonel görünmüyor. Cutover öncesi en azından minimal versiyonları yazılmalı.

4. **DNS TTL** — Cutover öncesi mevcut DNS TTL'i 300s'ye düşür ki geçiş hızlı olsun.

## 📝 Notlar

- `vercel.json` redirect'leri sıralı denenir: en spesifikten en genele.
- Vercel "permanent: true" = HTTP 301.
- Eski `https://www.exitcar.com/tr/reservasyon/antalya-belek-oto-kiralama` → Vercel www→non-www → vercel.json kuralı → `/search.html?pickup=...` (toplam tek bir 301 chain, hızlı).
