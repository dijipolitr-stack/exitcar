// ===== VALIDATION RULES =====
const rules = {
  firstName:   { required: true, minLen: 2, label: 'Ad' },
  lastName:    { required: true, minLen: 2, label: 'Soyad' },
  email:       { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'E-posta' },
  phone:       { required: true, minLen: 10, label: 'Telefon' },
  birthDate:   { required: true, label: 'Doğum Tarihi', custom: validateAge },
  tcNo:        { required: true, exactLen: 11, label: 'TC Kimlik No' },
  licenseNo:   { required: true, minLen: 4, label: 'Ehliyet Numarası' },
  licenseDate: { required: true, label: 'Ehliyet Veriliş Tarihi', custom: validateLicense },
  licenseClass:{ required: true, label: 'Ehliyet Sınıfı' },
};

function validateAge(val) {
  const d = new Date(val); const now = new Date();
  const age = (now - d) / (365.25 * 24 * 3600 * 1000);
  if (age < 21) return 'Araç kiralama için minimum yaş 21\'dir.';
  if (age > 100) return 'Geçersiz doğum tarihi.';
  return null;
}

function validateLicense(val) {
  const d = new Date(val); const now = new Date();
  const years = (now - d) / (365.25 * 24 * 3600 * 1000);
  if (years < 1) return 'En az 1 yıllık ehliyete sahip olmalısınız.';
  return null;
}

function validateField(id) {
  const rule = rules[id]; if (!rule) return true;
  const val = document.getElementById(id).value.trim();
  const errEl = document.getElementById(id + '-err');
  let error = '';

  if (rule.required && !val) { error = `${rule.label} zorunludur.`; }
  else if (rule.minLen && val.length < rule.minLen) { error = `${rule.label} en az ${rule.minLen} karakter olmalıdır.`; }
  else if (rule.exactLen && val.replace(/\D/g,'').length !== rule.exactLen) { error = `${rule.label} ${rule.exactLen} haneli olmalıdır.`; }
  else if (rule.pattern && !rule.pattern.test(val)) { error = `Geçerli bir ${rule.label.toLowerCase()} girin.`; }
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
      document.getElementById('s2-total').textContent = data.grand.toLocaleString('tr-TR') + ' TL';
      document.getElementById('s2-base').textContent = data.baseTotal.toLocaleString('tr-TR') + ' TL';
      if (data.insTotal > 0) {
        const labels = { basic:'Temel Paket', medium:'Güvenli Paket', full:'Her Şey Dahil' };
        document.getElementById('s2-ins-label').textContent = labels[data.insurance] || 'Sigorta';
        document.getElementById('s2-ins-val').textContent = data.insTotal.toLocaleString('tr-TR') + ' TL';
      }
      if (data.extTotal > 0) {
        document.getElementById('s2-ext-row').style.display = 'flex';
        document.getElementById('s2-ext-val').textContent = data.extTotal.toLocaleString('tr-TR') + ' TL';
      }
    }
    const car = JSON.parse(sessionStorage.getItem('selectedCar') || '{}');
    if (car.model) document.getElementById('s2-car').textContent = car.model;
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
    alert('Lütfen KVKK Aydınlatma Metni\'ni kabul edin.'); return;
  }
  if (!document.getElementById('terms').checked) {
    alert('Lütfen Kiralama Koşulları\'nı kabul edin.'); return;
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
