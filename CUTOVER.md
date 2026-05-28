# ExitCar.com Cutover Planı

Mevcut `exitcar.com` (eski site) → bu repo (yeni site) geçiş planı. Onay geldiğinde kayıpsız çıkarmak için.

## ✅ Hazır olanlar — TAMAMI

- [x] **Çok dilli yapı** (TR/EN/RU/DE/AR, hreflang, canonical, dile özel slug)
- [x] **Teknik SEO temeli** (robots.txt, sitemap.xml, OG, Twitter, JSON-LD)
- [x] **Antalya Havalimanı açılış sayfası** (5 dilde)
- [x] **Antalya Şehir Merkezi hub sayfası** (5 dilde + 6 bölge kartı)
- [x] **Kemer dedike sayfası** (5 dilde)
- [x] **Belek dedike sayfası** (5 dilde)
- [x] **Side dedike sayfası** (5 dilde)
- [x] **Blog altyapısı + 3 makale** (Yabancı turist rehberi, Filo yönetimi, Araç kiralama hizmetleri rehberi — her biri 5 dilde)
- [x] **Kurumsal sayfalar** (Hakkımızda + İletişim 5 dilde; KVKK + Gizlilik + Kullanım Koşulları TR)
- [x] **301 redirect haritası** (`vercel.json` — 53 kural, eski URL'lerin doğrudan yeni karşılıklarına yönlendirilmesi dahil)

## 🔴 Cutover öncesi MUTLAKA yapılacaklar

### 1. Eski siteden tam URL envanteri ✅ KISMEN
Mevcut `exitcar.com` WebFetch ile tarandı (~50 URL inventory'lendi). Cutover öncesi son bir tarama önerilir:
```bash
# Google'da site:exitcar.com araması ile manuel kontrol
# veya Screaming Frog ile crawl — listede olmayan URL için redirect ekle
```

### 2. Eksik yüksek-değer sayfaları üret ✅ TAMAMLANDI
- [x] Antalya Şehir Merkezi · Antalya Havalimanı · Kemer · Belek · Side
- [x] Blog: Filo yönetimi · Araç kiralama hizmetleri rehberi
- [ ] (Opsiyonel/ileride) İstanbul Havalimanı · İzmir Adnan Menderes — Antalya odaklı oldukları için cutover sonrası eklenebilir
- [ ] (Opsiyonel/ileride) Alanya dedike sayfa — şu an hub'da bölüm olarak var

### 3. Statik sayfalar (kurumsal) ✅ TAMAMLANDI
- [x] Hakkımızda · İletişim (her ikisi 5 dilde)
- [x] KVKK · Gizlilik · Kullanım Koşulları (TR — Türk hukuku gereği)
- `vercel.json` eski `/tr/hakkimizda`, `/tr/kvkk`, `/tr/gizlilik`, `/tr/site-kullamin-sartlari`, `/tr/arac-kiralama-sartlari` URL'leri doğrudan yeni sayfalara 301

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
