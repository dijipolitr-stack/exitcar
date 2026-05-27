// ============================================================
// ExitCar — Tedarikçi Araç Veri Tabanı
// Gerçekte: API çağrısı ile tedarikçi sistemlerinden gelir.
// Şimdilik: Demo veri seti (Garenta, Rent Go, Avis, Sixt, vb.)
// ============================================================

const SUPPLIERS = [
  { id: 'garenta',  name: 'Garenta',  logo: '🚗', score: 4.4, reviews: 387,  color: '#E31E24' },
  { id: 'rentgo',   name: 'Rent Go',  logo: '🏎️', score: 4.4, reviews: 490,  color: '#E31E24' },
  { id: 'avis',     name: 'Avis',     logo: '🚙', score: 8.4, reviews: 1241, color: '#CC0000' },
  { id: 'sixt',     name: 'Sixt',     logo: '🚘', score: 8.1, reviews: 892,  color: '#FF6600' },
  { id: 'budget',   name: 'Budget',   logo: '🚖', score: 7.9, reviews: 634,  color: '#CC0000' },
  { id: 'europcar', name: 'Europcar', logo: '🚗', score: 7.6, reviews: 412,  color: '#00873E' },
  { id: 'hertz',    name: 'Hertz',    logo: '🚙', score: 8.2, reviews: 1087, color: '#FFD700' },
  { id: 'thrifty',  name: 'Thrifty',  logo: '🚗', score: 7.5, reviews: 278,  color: '#005BA6' },
  { id: 'oncars',   name: 'On Cars',  logo: '🏎️', score: 4.2, reviews: 156,  color: '#2563EB' },
  { id: 'decar',    name: 'Decar',    logo: '🚗', score: 4.1, reviews: 201,  color: '#7C3AED' },
];

const CARS = [
  { id:1,  model:'Opel Combo',      alt:'veya benzeri', cat:'Ekonomi',  badge:'ekonomi', trans:'Otomatik', fuel:'Dizel',   seats:5, km:1500, deposit:6000, supplier:'garenta', price:9328,  days:3, img:'assets/cars/opel-combo.png',     delivery:'airport', freeCancel:true,  extras:['GPS dahil','Bebek koltugu eklenebilir'] },
  { id:2,  model:'Renault Clio',    alt:'veya benzeri', cat:'Ekonomi',  badge:'ekonomi', trans:'Otomatik', fuel:'Benzin',  seats:5, km:1500, deposit:5000, supplier:'rentgo',   price:6607,  days:3, img:'assets/cars/renault-clio.png',   delivery:'airport', freeCancel:true,  extras:['Ucretsiz iptal','Tam sigorta secenegi'] },
  { id:3,  model:'Fiat Egea',       alt:'veya benzeri', cat:'Ekonomi',  badge:'ekonomi', trans:'Manuel',   fuel:'Benzin',  seats:5, km:1200, deposit:4000, supplier:'oncars',   price:5490,  days:3, img:'assets/cars/fiat-egea.png',      delivery:'office',  freeCancel:false, extras:['Ucuz baslangic fiyati'] },
  { id:4,  model:'Toyota Corolla',  alt:'veya benzeri', cat:'Orta',     badge:'orta',    trans:'Otomatik', fuel:'Hibrit',  seats:5, km:2000, deposit:7500, supplier:'avis',     price:8950,  days:3, img:'assets/cars/toyota-corolla.png', delivery:'airport', freeCancel:true,  extras:['Hibrit yakit tasarrufu','GPS dahil','24/7 yol yardimi'] },
  { id:5,  model:'Renault Megane',  alt:'veya benzeri', cat:'Orta',     badge:'orta',    trans:'Otomatik', fuel:'Benzin',  seats:5, km:1500, deposit:5000, supplier:'europcar', price:7480,  days:3, img:'assets/cars/renault-megane.png', delivery:'airport', freeCancel:true,  extras:['Ucretsiz iptal','Kasko dahil'] },
  { id:6,  model:'VW Passat',       alt:'veya benzeri', cat:'Ust',      badge:'ust',     trans:'Otomatik', fuel:'Dizel',   seats:5, km:2500, deposit:8000, supplier:'sixt',     price:11200, days:3, img:'assets/cars/vw-passat.png',      delivery:'airport', freeCancel:true,  extras:['Business sinifi','Navigasyon','Tam kasko'] },
  { id:7,  model:'Hyundai Tucson',  alt:'veya benzeri', cat:'SUV',      badge:'suv',     trans:'Otomatik', fuel:'Dizel',   seats:5, km:1500, deposit:9000, supplier:'hertz',    price:12900, days:3, img:'assets/cars/hyundai-tucson.png', delivery:'airport', freeCancel:true,  extras:['4x4 secenegi','Genis bagaj','GPS'] },
  { id:8,  model:'Kia Sorento',     alt:'veya benzeri', cat:'SUV',      badge:'suv',     trans:'Otomatik', fuel:'Benzin',  seats:5, km:1500, deposit:8000, supplier:'budget',   price:11450, days:3, img:'assets/cars/kia-sorento.png',    delivery:'office',  freeCancel:true,  extras:['Genis ic mekan','Apple CarPlay'] },
  { id:9,  model:'Ford Tourneo',    alt:'veya benzeri', cat:'Van',      badge:'van',     trans:'Otomatik', fuel:'Dizel',   seats:9, km:2000, deposit:12000,supplier:'rentgo',   price:18600, days:3, img:'assets/cars/ford-tourneo.png',   delivery:'airport', freeCancel:true,  extras:['9 kisilik','Genis bagaj bolmesi'] },
  { id:10, model:'BMW 5 Serisi',    alt:'veya benzeri', cat:'Luks',     badge:'luks',    trans:'Otomatik', fuel:'Benzin',  seats:5, km:3000, deposit:20000,supplier:'sixt',     price:24750, days:3, img:'assets/cars/bmw-5.png',          delivery:'airport', freeCancel:true,  extras:['Premium sinif','Sahin gozu kamera','Kablosuz sarj'] },
  { id:11, model:'Mercedes C Serisi',alt:'veya benzeri',cat:'Luks',    badge:'luks',    trans:'Otomatik', fuel:'Benzin',  seats:5, km:3000, deposit:22000,supplier:'hertz',    price:26100, days:3, img:'assets/cars/mercedes-c.png',     delivery:'airport', freeCancel:true,  extras:['AMG Line','Panoramik cam tavan','Navigasyon'] },
  { id:12, model:'Honda City',      alt:'veya benzeri', cat:'Ekonomi',  badge:'ekonomi', trans:'Otomatik', fuel:'Hibrit',  seats:5, km:1500, deposit:5000, supplier:'decar',    price:7890,  days:3, img:'assets/cars/honda-city.png',     delivery:'office',  freeCancel:true,  extras:['Hibrit','Dusuk yakit tuketimi'] },
  { id:13, model:'Opel Astra',      alt:'veya benzeri', cat:'Orta',     badge:'orta',    trans:'Otomatik', fuel:'Benzin',  seats:5, km:1500, deposit:5500, supplier:'thrifty',  price:8100,  days:3, img:'assets/cars/opel-astra.png',     delivery:'office',  freeCancel:false, extras:['Ekonomik fiyat'] },
  { id:14, model:'Peugeot 3008',    alt:'veya benzeri', cat:'SUV',      badge:'suv',     trans:'Otomatik', fuel:'Dizel',   seats:5, km:2000, deposit:9500, supplier:'avis',     price:13800, days:3, img:'assets/cars/peugeot-3008.png',   delivery:'airport', freeCancel:true,  extras:['Genis SUV','GPS','Tam kasko','24/7 destek'] },
  { id:15, model:'VW Caravelle',    alt:'veya benzeri', cat:'Van',      badge:'van',     trans:'Manuel',   fuel:'Dizel',   seats:9, km:2000, deposit:11000,supplier:'budget',   price:16200, days:3, img:'assets/cars/vw-caravelle.png',   delivery:'office',  freeCancel:true,  extras:['9 kisilik','Ticari arac'] },
];

// Category min prices
const CAT_PRICES = {};
CARS.forEach(c => {
  if (!CAT_PRICES[c.cat] || c.price < CAT_PRICES[c.cat]) CAT_PRICES[c.cat] = c.price;
});

const CAT_IMGS = { 'Ekonomi': 'assets/cars/fiat-egea.png', 'Orta': 'assets/cars/renault-megane.png', 'Ust': 'assets/cars/vw-passat.png', 'Luks': 'assets/cars/bmw-5.png', 'SUV': 'assets/cars/hyundai-tucson.png', 'Van': 'assets/cars/ford-tourneo.png' };

let activeFilters = { cats: [], suppliers: [], trans: [], fuel: [], delivery: [], maxPrice: Infinity, freeCancel: false };
let currentSort = 'recommended';
let activeCat = null;

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  readURLParams();
  renderCategoryTabs();
  renderResults(CARS);
  openAllFilters();
});

function readURLParams() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('location')) document.getElementById('sb-location').textContent = p.get('location');
  if (p.get('pickup'))   document.getElementById('sb-location').textContent = p.get('pickup');
  if (p.get('p_d')) document.getElementById('sb-pdate').textContent = p.get('p_d');
  if (p.get('d_d')) document.getElementById('sb-ddate').textContent = p.get('d_d');
  if (p.get('p_t')) document.getElementById('sb-ptime').textContent = p.get('p_t');
  if (p.get('d_t')) document.getElementById('sb-dtime').textContent = p.get('d_t');
  if (p.get('days')) {
    const d = parseInt(p.get('days'));
    CARS.forEach(c => c.days = d);
    const dEl = document.getElementById('sb-days');
    if (dEl) dEl.textContent = d;
  }
  if (p.get('category')) {
    activeCat = p.get('category');
    activeFilters.cats = [p.get('category')];
  }
}

// ===== CATEGORY TABS =====
function renderCategoryTabs() {
  const cats = ['Ekonomi','Orta','Ust','Luks','SUV','Van'];
  const wrap = document.getElementById('categoryTabs');
  wrap.innerHTML = cats.map(cat => `
    <div class="category-tab ${activeCat === cat ? 'active' : ''}" onclick="filterByCategory('${cat}')">
      <img class="cat-img" src="${CAT_IMGS[cat]}" alt="${t('catName.' + cat)}">
      <div class="cat-name ${activeCat === cat ? 'active' : ''}">${t('catName.' + cat)}</div>
      <div class="cat-price">${CAT_PRICES[cat] ? fmtPrice(CAT_PRICES[cat]) + t('sr.fromShort') : ''}</div>
    </div>
  `).join('');
}

function filterByCategory(cat) {
  if (activeCat === cat) { activeCat = null; activeFilters.cats = []; }
  else { activeCat = cat; activeFilters.cats = [cat]; }
  renderCategoryTabs();
  applyAndRender();
}

// ===== FILTER TOGGLES =====
function openAllFilters() {
  document.querySelectorAll('.filter-section').forEach(s => s.classList.add('open'));
}

function toggleSection(el) {
  el.closest('.filter-section').classList.toggle('open');
}

function onPriceChange(val) {
  activeFilters.maxPrice = parseInt(val);
  document.getElementById('price-max-label').textContent = fmtPrice(parseInt(val));
  applyAndRender();
}

function onCheckFilter(type, val, checked) {
  if (!activeFilters[type]) activeFilters[type] = [];
  if (checked) { if (!activeFilters[type].includes(val)) activeFilters[type].push(val); }
  else { activeFilters[type] = activeFilters[type].filter(v => v !== val); }
  applyAndRender();
}

function onFreeCancelFilter(checked) {
  activeFilters.freeCancel = checked;
  applyAndRender();
}

function clearAllFilters() {
  activeFilters = { cats: [], suppliers: [], trans: [], fuel: [], delivery: [], maxPrice: Infinity, freeCancel: false };
  activeCat = null;
  document.querySelectorAll('.filter-opt input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('priceRange').value = 30000;
  document.getElementById('price-max-label').textContent = fmtPrice(30000);
  renderCategoryTabs();
  applyAndRender();
}

// ===== APPLY FILTERS =====
function applyAndRender() {
  let results = CARS.filter(car => {
    if (activeFilters.cats.length && !activeFilters.cats.includes(car.cat)) return false;
    if (activeFilters.suppliers.length && !activeFilters.suppliers.includes(car.supplier)) return false;
    if (activeFilters.trans.length && !activeFilters.trans.includes(car.trans)) return false;
    if (activeFilters.fuel.length && !activeFilters.fuel.includes(car.fuel)) return false;
    if (activeFilters.delivery.length && !activeFilters.delivery.includes(car.delivery)) return false;
    if (activeFilters.freeCancel && !car.freeCancel) return false;
    if (car.price > activeFilters.maxPrice) return false;
    return true;
  });
  results = sortCars(results, currentSort);
  renderResults(results);
}

function sortCars(arr, by) {
  const sorted = [...arr];
  if (by === 'price_asc') sorted.sort((a,b) => a.price - b.price);
  else if (by === 'price_desc') sorted.sort((a,b) => b.price - a.price);
  else if (by === 'score') sorted.sort((a,b) => (getSupplier(b).score) - (getSupplier(a).score));
  else sorted.sort((a,b) => (b.freeCancel ? 1:0) - (a.freeCancel ? 1:0) || a.price - b.price);
  return sorted;
}

function onSort(val) {
  currentSort = val;
  applyAndRender();
}

function getSupplier(car) {
  return SUPPLIERS.find(s => s.id === car.supplier) || { name: car.supplier, logo: '🚗', score: 7.5, reviews: 100 };
}

// ===== RENDER =====
function renderResults(cars) {
  const list = document.getElementById('carList');
  document.getElementById('resultCount').textContent = cars.length;

  if (!cars.length) {
    list.innerHTML = `<div class="no-results"><div class="no-results-icon">🔍</div><div class="no-results-title">${t('sr.noResultsTitle')}</div><div class="no-results-sub">${t('sr.noResultsSub')}</div></div>`;
    return;
  }

  // Insert a promo card after 4th result
  const html = cars.map((car, i) => renderCard(car) + (i === 3 ? renderPromo() : '')).join('');
  list.innerHTML = html;
}

function renderCard(car) {
  const sup = getSupplier(car);
  const dailyPrice = Math.round(car.price / car.days);
  const deliveryLabel = car.delivery === 'airport' ? t('sr.deliveryAirport') : t('sr.deliveryOffice');
  const catClass = 'badge-' + car.badge;
  const stars = '⭐'.repeat(Math.round(sup.score > 5 ? sup.score/2 : sup.score)) + '☆'.repeat(5 - Math.round(sup.score > 5 ? sup.score/2 : sup.score));
  const exT = e => { const k = 'ex.' + e; const v = t(k); return v === k ? e : v; };
  const daysPrice = t('sr.daysPrice').replace('{d}', car.days);

  return `
  <div class="car-card" id="card-${car.id}">
    <div class="car-card-inner">
      <!-- Image -->
      <div class="car-img-col">
        <img src="${car.img}" alt="${car.model}" loading="lazy">
      </div>

      <!-- Info -->
      <div class="car-info-col">
        <div>
          <div class="car-top-row">
            <div class="car-name-group">
              <div class="car-name">${car.model}</div>
              <div class="car-alt">${t('common.orSimilar')}</div>
            </div>
            <span class="car-category-badge ${catClass}">${t('catName.' + car.cat)}</span>
          </div>

          <div class="car-specs">
            <div class="car-spec"><span class="car-spec-icon">⚙️</span> ${t('val.' + car.trans)}</div>
            <div class="car-spec"><span class="car-spec-icon">⛽</span> ${t('val.' + car.fuel)}</div>
            <div class="car-spec"><span class="car-spec-icon">👥</span> ${car.seats} ${t('common.person')}</div>
            <div class="car-spec"><span class="car-spec-icon">❄️</span> ${t('common.ac')}</div>
          </div>

          <div class="car-meta">
            <div class="car-meta-item">${deliveryLabel}</div>
            <div class="car-meta-item">• ${t('sr.kmLimit')}: <span class="car-meta-val">${car.km.toLocaleString('tr-TR')} km</span></div>
            <div class="car-meta-item">• ${t('sr.deposit')}: <span class="car-meta-val">${fmtPrice(car.deposit)}</span></div>
          </div>
        </div>

        <div class="company-row">
          <div class="company-info">
            <div style="font-size:24px">${sup.logo}</div>
            <div>
              <div style="font-weight:800;font-size:14px;color:${sup.color}">${sup.name}</div>
              <div class="company-score">
                <span class="score-badge">${sup.score}</span>
                <span class="score-stars">${stars}</span>
                <span class="score-reviews">${sup.reviews} ${t('sr.reviews')}</span>
              </div>
            </div>
          </div>
          <div class="card-tags">
            ${car.freeCancel ? `<span class="tag tag-green">✅ ${t('sr.freeCancel')}</span>` : ''}
            <span class="tag tag-gray">🛡️ ${car.days} ${t('common.days')}</span>
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="car-price-col">
        <div>
          <div class="price-total-label">${daysPrice}</div>
          <div class="price-total">${fmtPrice(car.price)}</div>
          <div class="price-daily">${t('sr.daily')} ${fmtPrice(dailyPrice)}</div>
        </div>
        <div style="width:100%">
          <button class="btn-book-now" onclick="bookCar(${car.id})">${t('sr.bookNow')}</button>
          ${car.freeCancel ? `<div class="free-cancel">✅ ${t('sr.freeCancel')}</div>` : '<div style="height:20px"></div>'}
        </div>
      </div>
    </div>

    <!-- Detail toggle -->
    <div class="car-detail-toggle" onclick="toggleDetail(${car.id})">
      <span>${t('sr.showIncl')}</span>
      <span id="toggle-icon-${car.id}">▼</span>
    </div>
    <div class="car-detail-body" id="detail-${car.id}">
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-item-label">${t('sr.supplier')}</div><div class="detail-item-val">${sup.name}</div></div>
        <div class="detail-item"><div class="detail-item-label">${t('sr.transmission')}</div><div class="detail-item-val">${t('val.' + car.trans)}</div></div>
        <div class="detail-item"><div class="detail-item-label">${t('sr.fuel')}</div><div class="detail-item-val">${t('val.' + car.fuel)}</div></div>
        <div class="detail-item"><div class="detail-item-label">${t('sr.seats')}</div><div class="detail-item-val">${car.seats} ${t('common.person')}</div></div>
        <div class="detail-item"><div class="detail-item-label">${t('sr.kmLimit')}</div><div class="detail-item-val">${car.km.toLocaleString('tr-TR')} km/${car.days} ${t('common.days')}</div></div>
        <div class="detail-item"><div class="detail-item-label">${t('sr.deposit')}</div><div class="detail-item-val">${fmtPrice(car.deposit)}</div></div>
      </div>
      <div class="incl-list" style="margin-top:14px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#9CA3AF;margin-bottom:6px">${t('sr.inclServices')}</div>
        ${car.extras.map(e => `<div class="incl-item"><span class="dot-green">✓</span> ${exT(e)}</div>`).join('')}
        <div class="incl-item"><span class="dot-green">✓</span> ${t('sr.trafficIns')}</div>
        <div class="incl-item"><span class="dot-green">✓</span> ${t('sr.vatIncl')}</div>
        <div class="incl-item"><span class="dot-red">✗</span> ${t('sr.cascoOpt')}</div>
      </div>
    </div>
  </div>`;
}

function renderPromo() {
  return `<div class="promo-card">
    <div class="promo-card-text">
      <div class="promo-card-title">${t('sr.promoTitle')}</div>
      <div class="promo-card-sub">${t('sr.promoSub')}</div>
    </div>
    <button class="btn-promo-card" onclick="window.location.href='index.html'">${t('sr.promoBtn')}</button>
  </div>`;
}

// ===== DETAIL EXPAND =====
function toggleDetail(id) {
  const body = document.getElementById('detail-'+id);
  const icon = document.getElementById('toggle-icon-'+id);
  body.classList.toggle('open');
  icon.textContent = body.classList.contains('open') ? '▲' : '▼';
  document.getElementById('card-'+id).querySelector('.car-detail-toggle span:first-child').textContent =
    body.classList.contains('open') ? t('sr.hideIncl') : t('sr.showIncl');
}

// ===== BOOK =====
function bookCar(id) {
  const car = CARS.find(c => c.id === id);
  if (!car) return;
  sessionStorage.setItem('selectedCar', JSON.stringify({
    id: car.id, model: car.model, price: Math.round(car.price/car.days), days: car.days,
    img: car.img, supplier: getSupplier(car).name,
    transmission: car.trans, fuel: car.fuel, seats: car.seats
  }));
  window.location.href = 'reservation.html';
}

// Campaign banner close
function closeCampaign() {
  document.getElementById('campaignBanner').style.display = 'none';
}
