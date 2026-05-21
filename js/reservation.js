// ===== STATE =====
const state = { insurance: 'medium', insurancePrice: 350, extras: {}, days: 7, basePrice: 2700 };

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  const p = new URLSearchParams(window.location.search);
  const car = getCarFromSession() || { model: 'Toyota Corolla', price: 2700, img: 'assets/cars/compact.png' };

  document.getElementById('summary-car-name').textContent = car.model;
  document.getElementById('s-base-price').textContent = car.price.toLocaleString('tr-TR');
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

  document.getElementById('s-base-total').textContent = baseTotal.toLocaleString('tr-TR') + ' TL';
  document.getElementById('s-days').textContent = state.days;
  document.getElementById('s-base-price').textContent = state.basePrice.toLocaleString('tr-TR');

  const insRow = document.getElementById('s-ins-row');
  if (insTotal > 0) {
    insRow.style.display = 'flex';
    const labels = { basic:'Temel Paket', medium:'Güvenli Paket', full:'Her Şey Dahil' };
    document.getElementById('s-ins-label').textContent = labels[state.insurance];
    document.getElementById('s-ins-total').textContent = insTotal.toLocaleString('tr-TR') + ' TL';
  } else { insRow.style.display = 'none'; }

  const extRow = document.getElementById('s-extra-row');
  if (extTotal > 0) {
    extRow.style.display = 'flex';
    document.getElementById('s-extra-total').textContent = extTotal.toLocaleString('tr-TR') + ' TL';
  } else { extRow.style.display = 'none'; }

  document.getElementById('s-grand-total').textContent = grand.toLocaleString('tr-TR') + ' TL';

  // Save to session
  sessionStorage.setItem('reservationData', JSON.stringify({ ...state, baseTotal, insTotal, extTotal, grand }));
}

// ===== NAVIGATE =====
function goToDriverInfo() {
  updateTotal();
  window.location.href = 'driver-info.html';
}
