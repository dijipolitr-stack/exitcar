// ===== CARD FORMATTING =====
function formatCardNumber(input) {
  let v = input.value.replace(/\D/g,'').slice(0,16);
  const parts = v.match(/.{1,4}/g) || [];
  input.value = parts.join(' ');
  const display = parts.map(p => p).join(' ').padEnd(19,'•').replace(/\d(?=(?:\d| )*$)/g, d => d);
  document.getElementById('vis-number').textContent = input.value.padEnd(19,' ').replace(/\d{4}/g, g => g + ' ').trim() || '•••• •••• •••• ••••';

  // Detect brand
  const brand = detectBrand(v);
  document.getElementById('vis-brand').textContent = brand.emoji;
  document.getElementById('cardBrandIcon').textContent = brand.emoji;
}

function detectBrand(num) {
  if (/^4/.test(num)) return { emoji: '💙', name: 'Visa' };
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return { emoji: '🔴', name: 'Mastercard' };
  if (/^3[47]/.test(num)) return { emoji: '🟢', name: 'Amex' };
  if (/^62/.test(num)) return { emoji: '🟡', name: 'UnionPay' };
  return { emoji: '💳', name: '' };
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g,'').slice(0,4);
  if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
  input.value = v;
  document.getElementById('vis-exp').textContent = v || 'AA/YY';
}

function flipCard(toBack) {
  document.getElementById('cardVisual').classList.toggle('flipped', toBack);
}

// ===== PAYMENT METHODS =====
function selectPayMethod(type) {
  ['card','bkm','transfer'].forEach(t => {
    document.getElementById('pm-'+t).classList.remove('selected');
    document.getElementById(t+'Form').style.display = 'none';
  });
  document.getElementById('pm-'+type).classList.add('selected');
  document.getElementById(type+'Form').style.display = type === 'card' ? 'block' : (type === 'bkm' ? 'block' : 'block');
  document.getElementById('cardVisual').style.display = type === 'card' ? 'block' : 'none';
}

// ===== LOAD SESSION DATA =====
window.addEventListener('DOMContentLoaded', () => {
  try {
    const resData = JSON.parse(sessionStorage.getItem('reservationData') || '{}');
    const driver = JSON.parse(sessionStorage.getItem('driverInfo') || '{}');
    const car = JSON.parse(sessionStorage.getItem('selectedCar') || '{}');

    if (resData.grand) {
      const fmt = n => n.toLocaleString('tr-TR') + ' TL';
      document.getElementById('sidebar-total').textContent = fmt(resData.grand);
      document.getElementById('oi-total').textContent = fmt(resData.grand);
      document.getElementById('oi-base').textContent = fmt(resData.baseTotal || 0);
      document.getElementById('pay-btn-amount').textContent = fmt(resData.grand);

      if (resData.insTotal > 0) {
        const labels = { basic:'Temel Paket', medium:'Güvenli Paket', full:'Her Şey Dahil' };
        document.getElementById('oi-ins-label').textContent = labels[resData.insurance] || 'Sigorta';
        document.getElementById('oi-ins').textContent = fmt(resData.insTotal);
        document.getElementById('pay-ins-badge').textContent = '🛡️ ' + (labels[resData.insurance] || 'Sigorta');
      }
      if (resData.extTotal > 0) {
        document.getElementById('oi-ext-row').style.display = 'flex';
        document.getElementById('oi-ext').textContent = fmt(resData.extTotal);
      }
    }
    if (driver.firstName) {
      document.getElementById('pay-driver').textContent = driver.firstName + ' ' + driver.lastName;
      document.getElementById('pay-email').textContent = driver.email;
    }
    if (car.model) document.getElementById('pay-car-name').textContent = car.model;

    // Transfer ref
    document.getElementById('transfer-ref').textContent = 'EXT-' + Math.floor(100000 + Math.random()*900000);
  } catch(e) {}
});

// ===== CARD VALIDATION =====
function validateCard() {
  const num = document.getElementById('cardNumber').value.replace(/\s/g,'');
  const name = document.getElementById('cardName').value.trim();
  const exp = document.getElementById('cardExp').value;
  const cvv = document.getElementById('cardCvv').value;

  if (num.length < 16) { alert('Lütfen geçerli bir kart numarası girin.'); return false; }
  if (name.length < 3) { alert('Lütfen kart üzerindeki adı girin.'); return false; }
  if (!/^\d{2}\/\d{2}$/.test(exp)) { alert('Lütfen son kullanma tarihini AA/YY formatında girin.'); return false; }
  const [mm, yy] = exp.split('/').map(Number);
  const now = new Date(); const expDate = new Date(2000+yy, mm-1, 1);
  if (mm < 1 || mm > 12 || expDate < now) { alert('Kart son kullanma tarihi geçmiş veya geçersiz.'); return false; }
  if (cvv.length < 3) { alert('Lütfen CVV/CVC kodunu girin.'); return false; }
  return true;
}

// ===== COMPLETE PAYMENT =====
function completePayment() {
  const activeMethod = document.querySelector('.pay-method.selected').id;

  if (activeMethod === 'pm-card' && !validateCard()) return;

  const btn = document.getElementById('btnPay');
  btn.disabled = true;
  btn.innerHTML = '⏳ Ödeme İşleniyor...';

  // Simulate 3D Secure / processing
  setTimeout(() => {
    btn.innerHTML = '✅ Onaylanıyor...';
    setTimeout(() => {
      showSuccess();
    }, 1200);
  }, 2000);
}

function showSuccess() {
  const code = 'EXT-' + Math.floor(100000 + Math.random() * 900000);
  document.getElementById('success-code').textContent = code;
  document.getElementById('successOverlay').classList.add('show');
  sessionStorage.clear();
}
