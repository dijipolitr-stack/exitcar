// ===== VALIDATION RULES =====
const rules = {
  firstName:   { required: true, minLen: 2, lbl: 'lbl.firstName' },
  lastName:    { required: true, minLen: 2, lbl: 'lbl.lastName' },
  email:       { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, lbl: 'lbl.email' },
  phone:       { required: true, minLen: 10, lbl: 'lbl.phone' },
  birthDate:   { required: true, lbl: 'lbl.birthDate', custom: validateAge },
  tcNo:        { required: true, exactLen: 11, lbl: 'lbl.tcNo' },
  licenseNo:   { required: true, minLen: 4, lbl: 'lbl.licenseNo' },
  licenseDate: { required: true, lbl: 'lbl.licenseDate', custom: validateLicense },
  licenseClass:{ required: true, lbl: 'lbl.licenseClass' },
};

function validateAge(val) {
  const d = new Date(val); const now = new Date();
  const age = (now - d) / (365.25 * 24 * 3600 * 1000);
  if (age < 21) return t('di.val.minAge');
  if (age > 100) return t('di.val.badBirth');
  return null;
}

function validateLicense(val) {
  const d = new Date(val); const now = new Date();
  const years = (now - d) / (365.25 * 24 * 3600 * 1000);
  if (years < 1) return t('di.val.license1yr');
  return null;
}

function validateField(id) {
  const rule = rules[id]; if (!rule) return true;
  const val = document.getElementById(id).value.trim();
  const errEl = document.getElementById(id + '-err');
  const label = t(rule.lbl);
  let error = '';

  if (rule.required && !val) { error = `${label} ${t('di.val.required')}`; }
  else if (rule.minLen && val.length < rule.minLen) { error = `${label} ${t('di.val.minLen').replace('{n}', rule.minLen)}`; }
  else if (rule.exactLen && val.replace(/\D/g,'').length !== rule.exactLen) { error = `${label} ${t('di.val.exactLen').replace('{n}', rule.exactLen)}`; }
  else if (rule.pattern && !rule.pattern.test(val)) { error = t('di.val.pattern').replace('{label}', label.toLowerCase()); }
  else if (rule.custom) { error = rule.custom(val) || ''; }

  const inp = document.getElementById(id);
  inp.classList.toggle('error', !!error);
  if (errEl) errEl.textContent = error;
  return !error;
}

function validateAll() {
  return Object.keys(rules).map(id => validateField(id)).every(Boolean);
}

// ===== PHONE FORMAT =====
function formatPhone(input) {
  let v = input.value.replace(/\D/g,'');
  if (v.startsWith('0')) v = v;
  if (v.length > 11) v = v.slice(0,11);
  if (v.length > 7) input.value = v.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  else if (v.length > 4) input.value = v.replace(/(\d{4})(\d{3})/, '$1 $2');
  else input.value = v;
}

// ===== LOAD SESSION DATA =====
window.addEventListener('DOMContentLoaded', () => {
  try {
    const data = JSON.parse(sessionStorage.getItem('reservationData') || '{}');
    if (data.grand) {
      document.getElementById('s2-total').textContent = fmtPrice(data.grand);
      document.getElementById('s2-base').textContent = fmtPrice(data.baseTotal);
      if (data.insTotal > 0) {
        const labels = { basic: t('res.basicName'), medium: t('res.mediumName'), full: t('res.fullName') };
        document.getElementById('s2-ins-label').textContent = labels[data.insurance] || t('step1.name');
        document.getElementById('s2-ins-val').textContent = fmtPrice(data.insTotal);
      }
      if (data.extTotal > 0) {
        document.getElementById('s2-ext-row').style.display = 'flex';
        document.getElementById('s2-ext-val').textContent = fmtPrice(data.extTotal);
      }
    }
    const car = JSON.parse(sessionStorage.getItem('selectedCar') || '{}');
    if (car.model) document.getElementById('s2-car').textContent = car.model;
    const sImg = document.getElementById('summary-img');
    if (sImg && car.img) { sImg.src = car.img; sImg.alt = car.model; }
  } catch(e) {}
});

// ===== GO TO PAYMENT =====
function goToPayment() {
  if (!validateAll()) {
    const firstError = document.querySelector('.form-input.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!document.getElementById('kvkk').checked) {
    alert(t('di.val.acceptKvkk')); return;
  }
  if (!document.getElementById('terms').checked) {
    alert(t('di.val.acceptTerms')); return;
  }

  // Save driver info
  const driver = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
  };
  sessionStorage.setItem('driverInfo', JSON.stringify(driver));
  window.location.href = 'payment.html';
}
