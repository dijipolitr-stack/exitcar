// ===== STATE =====
const state = { insurance: 'medium', insurancePrice: 350, extras: {}, days: 7, basePrice: 2700 };

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  const p = new URLSearchParams(window.location.search);
  const car = getCarFromSession() || { model: 'Toyota Corolla', price: 2700, img: 'assets/cars/toyota-corolla.png' };

  document.getElementById('summary-car-name').textContent = car.model;
  const carImg = document.getElementById('summary-car-img');
  if (carImg && car.img) { carImg.src = car.img; carImg.alt = car.model; }
  document.getElementById('s-base-price').textContent = fmtPrice(car.price);
  if (p.get('pickup')) document.getElementById('disp-pickup').textContent = p.get('pickup');

  state.basePrice = car.price;
  updateTotal();
  selectInsurance('medium', 350); // default
});

function getCarFromSession() {
  try { return JSON.parse(sessionStorage.getItem('selectedCar')); } catch { return null; }
}

// ===== INSURANCE =====
function selectInsurance(type, pricePerDay) {
  ['basic','medium','full'].forEach(t => {
    document.getElementById('ins-'+t).classList.remove('selected');
  });
  document.getElementById('ins-'+type).classList.add('selected');
  state.insurance = type;
  state.insurancePrice = pricePerDay;
  updateTotal();
}

// ===== EXTRAS =====
const extraNames = { gps:'GPS/Navigasyon', baby:'Bebek Koltuğu', driver2:'2. Sürücü', wifi:'Mobil Wi-Fi', snow:'Kış Lastiği', roadside:'Yol Yardımı' };

function toggleExtra(key, pricePerDay) {
  const el = document.getElementById('extra-'+key);
  if (state.extras[key]) {
    delete state.extras[key];
    el.classList.remove('selected');
  } else {
    state.extras[key] = pricePerDay;
    el.classList.add('selected');
  }
  updateTotal();
}

// ===== TOTAL =====
function updateTotal() {
  const baseTotal = state.basePrice * state.days;
  const insTotal = state.insurancePrice * state.days;
  const extTotal = Object.values(state.extras).reduce((a,b) => a+b, 0) * state.days;
  const grand = baseTotal + insTotal + extTotal;

  document.getElementById('s-base-total').textContent = fmtPrice(baseTotal);
  document.getElementById('s-days').textContent = state.days;
  document.getElementById('s-base-price').textContent = fmtPrice(state.basePrice);
  const daysNum = document.getElementById('disp-days-num');
  if (daysNum) daysNum.textContent = state.days;

  const insRow = document.getElementById('s-ins-row');
  if (insTotal > 0) {
    insRow.style.display = 'flex';
    const labels = { basic: t('res.basicName'), medium: t('res.mediumName'), full: t('res.fullName') };
    document.getElementById('s-ins-label').textContent = labels[state.insurance];
    document.getElementById('s-ins-total').textContent = fmtPrice(insTotal);
  } else { insRow.style.display = 'none'; }

  const extRow = document.getElementById('s-extra-row');
  if (extTotal > 0) {
    extRow.style.display = 'flex';
    document.getElementById('s-extra-total').textContent = fmtPrice(extTotal);
  } else { extRow.style.display = 'none'; }

  document.getElementById('s-grand-total').textContent = fmtPrice(grand);

  // Save to session
  sessionStorage.setItem('reservationData', JSON.stringify({ ...state, baseTotal, insTotal, extTotal, grand }));
}

// ===== NAVIGATE =====
function goToDriverInfo() {
  updateTotal();
  window.location.href = 'driver-info.html';
}
