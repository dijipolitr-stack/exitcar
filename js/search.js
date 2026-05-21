// ===== CAR DATA =====
const CARS = [
  { id:1, model:"Fiat Egea", alt:"veya benzeri", category:"Ekonomi", badge:"economy", transmission:"Manuel", fuel:"Benzin", seats:5, price:1890, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/economy.png", rating:4.7, reviews:312 },
  { id:2, model:"Hyundai i20", alt:"veya benzeri", category:"Ekonomi", badge:"economy", transmission:"Otomatik", fuel:"Benzin", seats:5, price:2100, totalDays:7, insurance:"Mini Hasar Dahil", img:"assets/cars/economy.png", rating:4.8, reviews:241 },
  { id:3, model:"Renault Megane", alt:"veya benzeri", category:"Kompakt", badge:"compact", transmission:"Otomatik", fuel:"Benzin", seats:5, price:2450, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/compact.png", rating:4.6, reviews:189 },
  { id:4, model:"Toyota Corolla", alt:"veya benzeri", category:"Kompakt", badge:"compact", transmission:"Otomatik", fuel:"Benzin", seats:5, price:2700, totalDays:7, insurance:"Mini Hasar Dahil", img:"assets/cars/compact.png", rating:4.9, reviews:428 },
  { id:5, model:"Opel Crossland", alt:"veya benzeri", category:"Küçük SUV", badge:"suv", transmission:"Otomatik", fuel:"Benzin", seats:5, price:3200, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/suv.png", rating:4.5, reviews:156 },
  { id:6, model:"Hyundai Tucson", alt:"veya benzeri", category:"SUV", badge:"suv", transmission:"Otomatik", fuel:"Dizel", seats:5, price:3800, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/suv.png", rating:4.7, reviews:203 },
  { id:7, model:"Kia Sportage", alt:"veya benzeri", category:"SUV", badge:"suv", transmission:"Otomatik", fuel:"Benzin", seats:5, price:3500, totalDays:7, insurance:"Mini Hasar Dahil", img:"assets/cars/suv.png", rating:4.6, reviews:178 },
  { id:8, model:"Ford Tourneo", alt:"veya benzeri", category:"Van", badge:"van", transmission:"Otomatik", fuel:"Dizel", seats:9, price:5800, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/van.png", rating:4.4, reviews:92 },
  { id:9, model:"Volkswagen Transporter", alt:"veya benzeri", category:"Van", badge:"van", transmission:"Manuel", fuel:"Dizel", seats:9, price:6200, totalDays:7, insurance:"Mini Hasar Dahil", img:"assets/cars/van.png", rating:4.5, reviews:115 },
  { id:10, model:"BMW 3 Serisi", alt:"veya benzeri", category:"Premium", badge:"premium", transmission:"Otomatik", fuel:"Benzin", seats:5, price:7500, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/premium.png", rating:4.9, reviews:87 },
  { id:11, model:"Mercedes C Serisi", alt:"veya benzeri", category:"Premium", badge:"premium", transmission:"Otomatik", fuel:"Benzin", seats:5, price:8200, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/premium.png", rating:4.8, reviews:64 },
  { id:12, model:"Peugeot 308", alt:"veya benzeri", category:"Orta", badge:"compact", transmission:"Otomatik", fuel:"Dizel", seats:5, price:2900, totalDays:7, insurance:"Her Şey Dahil", img:"assets/cars/compact.png", rating:4.5, reviews:143 },
];

let currentCars = [...CARS];

// Badge colors
const badgeColors = {
  economy: 'background:#EEF2FF;color:#4F46E5',
  compact: 'background:#F0FDF4;color:#16A34A',
  suv: 'background:#FDF4FF;color:#9333EA',
  van: 'background:#FFF7ED;color:#C2410C',
  premium: 'background:#1F2937;color:#F9FAFB',
};

function renderCars(cars) {
  const list = document.getElementById('carList');
  document.getElementById('resultCount').textContent = cars.length;
  if (!cars.length) {
    list.innerHTML = '<div style="text-align:center;padding:60px;color:#9CA3AF;font-size:16px;">😔 Filtrelere uygun araç bulunamadı. Filtreleri değiştirmeyi deneyin.</div>';
    return;
  }
  list.innerHTML = cars.map(car => `
    <div class="result-card">
      <div class="result-img">
        <img src="${car.img}" alt="${car.model}" loading="lazy">
      </div>
      <div class="result-info">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <div class="result-model">${car.model}</div>
            <span style="font-size:12px;padding:3px 10px;border-radius:20px;font-weight:700;${badgeColors[car.badge]}">${car.category}</span>
          </div>
          <div class="result-alt">${car.alt}</div>
          <div class="result-features">
            <div class="feat">⚙️ ${car.transmission}</div>
            <div class="feat">⛽ ${car.fuel}</div>
            <div class="feat">👥 ${car.seats} Kişi</div>
            <div class="feat">❄️ Klima</div>
          </div>
        </div>
        <div class="result-badges" style="margin-top:14px">
          <span class="rbadge">✅ Ücretsiz İptal</span>
          <span class="rbadge">📍 Ofis Teslim</span>
          <span class="rbadge red">⭐ ${car.rating} (${car.reviews})</span>
        </div>
      </div>
      <div class="result-pricing">
        <div>
          <div class="price-label">başlayan fiyatlarla</div>
          <div class="price-amount">${car.price.toLocaleString('tr-TR')}</div>
          <div class="price-unit">TL / gün</div>
          <div class="price-total">Toplam: ${(car.price * car.totalDays).toLocaleString('tr-TR')} TL</div>
        </div>
        <div style="width:100%">
          <button class="btn-book" onclick="bookCar(${car.id})">Hemen Kirala →</button>
          <div class="insurance-tag">🛡️ ${car.insurance}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function sortCars(val) {
  const sorted = [...currentCars];
  if (val === 'price_asc') sorted.sort((a,b) => a.price - b.price);
  else if (val === 'price_desc') sorted.sort((a,b) => b.price - a.price);
  else if (val === 'rating') sorted.sort((a,b) => b.rating - a.rating);
  renderCars(sorted);
}

function applyFilters() {
  renderCars(currentCars);
}

function updatePrice(input) {
  document.getElementById('priceMax').textContent = parseInt(input.value).toLocaleString('tr-TR');
  const filtered = currentCars.filter(c => c.price <= parseInt(input.value));
  renderCars(filtered);
}

function clearFilters() {
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = true);
  document.getElementById('priceRange').value = 15000;
  document.getElementById('priceMax').textContent = '15.000';
  renderCars(currentCars);
}

function bookCar(id) {
  const car = CARS.find(c => c.id === id);
  if (car) alert(`✅ "${car.model}" için rezervasyon sayfasına yönlendiriliyorsunuz...\n\nFiyat: ${car.price.toLocaleString('tr-TR')} TL/gün`);
}

// Load URL params into mini search
window.addEventListener('DOMContentLoaded', () => {
  const p = new URLSearchParams(window.location.search);
  if (p.get('pickup')) document.getElementById('ms-pickup-val').textContent = p.get('pickup');
  if (p.get('pDate')) document.getElementById('ms-pdate').textContent = p.get('pDate');
  if (p.get('pTime')) document.getElementById('ms-ptime').textContent = p.get('pTime');
  if (p.get('rDate')) document.getElementById('ms-rdate').textContent = p.get('rDate');
  if (p.get('rTime')) document.getElementById('ms-rtime').textContent = p.get('rTime');
  if (p.get('category')) {
    currentCars = CARS.filter(c => c.badge === p.get('category'));
  }
  renderCars(currentCars);
});
