// ===== LOCATIONS DATA =====
const CITIES = [
  "İstanbul - Sabiha Gökçen Havalimanı","İstanbul - İstanbul Havalimanı","İstanbul - Anadolu Yakası",
  "İstanbul - Avrupa Yakası","Ankara - Esenboğa Havalimanı","Ankara - Şehir Merkezi",
  "İzmir - Adnan Menderes Havalimanı","İzmir - Şehir Merkezi","Antalya Havalimanı","Antalya - Şehir Merkezi",
  "Bodrum - Milas Havalimanı","Bodrum - Şehir Merkezi","Trabzon Havalimanı","Trabzon - Şehir Merkezi",
  "Dalaman Havalimanı","Gaziantep Havalimanı","Kayseri Havalimanı","Bursa","Konya","Adana","Erzurum",
  "Nevşehir - Kapadokya","Mardin","Diyarbakır","Van","Samsun","Rize","Denizli","Çanakkale","Muğla - Fethiye"
];

// ===== FLATPICKR DATE PICKERS =====
document.addEventListener('DOMContentLoaded', () => {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const weekLater = new Date(); weekLater.setDate(weekLater.getDate() + 7);
  const fpLoc = (typeof EC_fpLocale === 'function') ? EC_fpLocale() : 'default';

  flatpickr("#pickupDate", {
    locale: fpLoc, minDate: "today", dateFormat: "d M Y",
    defaultDate: tomorrow,
    onChange: (sel) => { rpDp.set('minDate', sel[0]); }
  });

  const rpDp = flatpickr("#returnDate", {
    locale: fpLoc, dateFormat: "d M Y",
    defaultDate: weekLater,
    minDate: tomorrow,
  });

  // Scroll animations — show immediately if in viewport
  const fadeEls = document.querySelectorAll('.fade-up');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  fadeEls.forEach(el => obs.observe(el));

  // Navbar scroll
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });
});

// ===== AUTOCOMPLETE =====
function filterLocations(input, listId) {
  const val = input.value.toLowerCase();
  const list = document.getElementById(listId);
  if (!val) { list.classList.remove('show'); return; }
  const matches = CITIES.filter(c => c.toLowerCase().includes(val)).slice(0, 8);
  if (!matches.length) { list.classList.remove('show'); return; }
  list.innerHTML = matches.map(c =>
    `<div class="autocomplete-item" onclick="selectCity('${c}','${input.id}','${listId}')">
      📍 ${c}
    </div>`
  ).join('');
  list.classList.add('show');
}

function selectCity(city, inputId, listId) {
  document.getElementById(inputId).value = city;
  document.getElementById(listId).classList.remove('show');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.field-input')) {
    document.querySelectorAll('.autocomplete-list').forEach(l => l.classList.remove('show'));
  }
});

// ===== TOGGLE RETURN LOCATION =====
function toggleReturn() {
  const checked = document.getElementById('diffReturn').checked;
  document.getElementById('returnGroup').style.display = checked ? 'block' : 'none';
}

// ===== TAB SWITCH =====
function setTab(btn, type) {
  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// ===== SEARCH =====
function doSearch() {
  const pickup = document.getElementById('pickupInput').value;
  const pDate = document.getElementById('pickupDate').value;
  const pTime = document.getElementById('pickupTime').value;
  const rDate = document.getElementById('returnDate').value;
  const rTime = document.getElementById('returnTime').value;

  if (!pickup) {
    document.getElementById('pickupInput').focus();
    document.getElementById('pickupInput').style.borderColor = '#F30006';
    setTimeout(() => document.getElementById('pickupInput').style.borderColor = '', 2000);
    return;
  }
  const params = new URLSearchParams({ pickup, pDate, pTime, rDate, rTime });
  window.location.href = `search.html?${params}`;
}

function searchByCategory(cat) {
  window.location.href = `search.html?category=${cat}`;
}

function searchByCity(city) {
  document.getElementById('pickupInput').value = city;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => document.getElementById('pickupDate').focus(), 500);
}
