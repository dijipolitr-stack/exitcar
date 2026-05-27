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

// ===== TAKSİT SEÇENEKLERİ =====
function buildInstallments(total) {
  const sel = document.getElementById('installment');
  if (!sel) return;
  const plans = [
    { n: 1,  rate: 0,    pct: '0%'  },
    { n: 3,  rate: 0,    pct: '0%'  },
    { n: 6,  rate: 0.03, pct: '+3%' },
    { n: 9,  rate: 0.06, pct: '+6%' },
    { n: 12, rate: 0.09, pct: '+9%' },
  ];
  sel.innerHTML = plans.map(p => {
    if (p.n === 1) {
      return `<option value="1">${t('pay.singlePay')} — ${fmtPrice(total)}</option>`;
    }
    const per = Math.round(total * (1 + p.rate) / p.n);
    return `<option value="${p.n}">${p.n} ${t('pay.installments')} — ${p.n} × ${fmtPrice(per)} (${p.pct} ${t('pay.interest')})</option>`;
  }).join('');
}

// ===== LOAD SESSION DATA =====
window.addEventListener('DOMContentLoaded', () => {
  try {
    const resData = JSON.parse(sessionStorage.getItem('reservationData') || '{}');
    const driver = JSON.parse(sessionStorage.getItem('driverInfo') || '{}');
    const car = JSON.parse(sessionStorage.getItem('selectedCar') || '{}');

    const grand     = resData.grand     || 21350;
    const baseTotal = resData.baseTotal || 18900;
    const insTotal  = resData.insTotal  || 2450;
    const extTotal  = resData.extTotal  || 0;
    const insurance = resData.insurance || 'medium';
    const labels = { basic: t('res.basicName'), medium: t('res.mediumName'), full: t('res.fullName') };
    const insLabel = labels[insurance] || t('step1.name');

    document.getElementById('sidebar-total').textContent = fmtPrice(grand);
    document.getElementById('oi-total').textContent = fmtPrice(grand);
    document.getElementById('oi-base').textContent = fmtPrice(baseTotal);
    document.getElementById('pay-btn-amount').textContent = fmtPrice(grand);

    document.getElementById('oi-ins-label').textContent = insLabel;
    document.getElementById('oi-ins').textContent = fmtPrice(insTotal);
    document.getElementById('pay-ins-badge').innerHTML = '🛡️ ' + insLabel;
    if (extTotal > 0) {
      document.getElementById('oi-ext-row').style.display = 'flex';
      document.getElementById('oi-ext').textContent = fmtPrice(extTotal);
    }

    buildInstallments(grand);

    if (driver.firstName) {
      document.getElementById('pay-driver').textContent = driver.firstName + ' ' + driver.lastName;
      document.getElementById('pay-email').textContent = driver.email;
    }
    if (car.model) document.getElementById('pay-car-name').textContent = car.model;
    const pImg = document.getElementById('pay-car-img');
    if (pImg && car.img) { pImg.src = car.img; pImg.alt = car.model; }

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

  if (num.length < 16) { alert(t('pay.errCardNum')); return false; }
  if (name.length < 3) { alert(t('pay.errCardName')); return false; }
  if (!/^\d{2}\/\d{2}$/.test(exp)) { alert(t('pay.errExpFmt')); return false; }
  const [mm, yy] = exp.split('/').map(Number);
  const now = new Date(); const expDate = new Date(2000+yy, mm-1, 1);
  if (mm < 1 || mm > 12 || expDate < now) { alert(t('pay.errExpPast')); return false; }
  if (cvv.length < 3) { alert(t('pay.errCvv')); return false; }
  return true;
}

// ===== COMPLETE PAYMENT =====
function completePayment() {
  const activeMethod = document.querySelector('.pay-method.selected').id;

  if (activeMethod === 'pm-card' && !validateCard()) return;

  const btn = document.getElementById('btnPay');
  btn.disabled = true;
  btn.innerHTML = t('pay.processing');

  // Simulate 3D Secure / processing
  setTimeout(() => {
    btn.innerHTML = t('pay.approving');
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
