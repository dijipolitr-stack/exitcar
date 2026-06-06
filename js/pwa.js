/* ExitCar PWA — service worker kaydı + "uygulamayı yükle" deneyimi
 * - SW'yi kaydeder, güncelleme gelince nazik bir "yeni sürüm" çubuğu gösterir.
 * - Android/Chrome: beforeinstallprompt yakalanır, kendi yükle butonumuz gösterilir.
 * - iOS Safari: native prompt yok; "Paylaş → Ana Ekrana Ekle" ipucu gösterilir.
 * - Banner kapatılınca tercih localStorage'da tutulur (30 gün). */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  var lang = (document.documentElement.lang || 'tr').slice(0, 2);
  var T = {
    install: { tr: 'ExitCar uygulamasını yükle', en: 'Install the ExitCar app', ru: 'Установить приложение ExitCar', de: 'ExitCar-App installieren', ar: 'ثبّت تطبيق ExitCar' },
    btn:     { tr: 'Yükle', en: 'Install', ru: 'Установить', de: 'Installieren', ar: 'تثبيت' },
    ios:     { tr: 'Yüklemek için: Paylaş ⬆️ → "Ana Ekrana Ekle"', en: 'To install: Share ⬆️ → "Add to Home Screen"', ru: 'Установка: Поделиться ⬆️ → «На экран Домой»', de: 'Installieren: Teilen ⬆️ → "Zum Home-Bildschirm"', ar: 'للتثبيت: مشاركة ⬆️ ← "إضافة إلى الشاشة الرئيسية"' },
    update:  { tr: 'Yeni sürüm hazır', en: 'New version available', ru: 'Доступна новая версия', de: 'Neue Version verfügbar', ar: 'يتوفر إصدار جديد' },
    refresh: { tr: 'Güncelle', en: 'Refresh', ru: 'Обновить', de: 'Aktualisieren', ar: 'تحديث' },
    close:   { tr: 'Kapat', en: 'Close', ru: 'Закрыть', de: 'Schließen', ar: 'إغلاق' }
  };
  function t(k) { return (T[k] && (T[k][lang] || T[k].en)) || ''; }

  var DISMISS_KEY = 'ec_pwa_dismissed';
  function dismissed() {
    try {
      var v = localStorage.getItem(DISMISS_KEY);
      return v && (Date.now() - parseInt(v, 10) < 30 * 864e5);
    } catch (e) { return false; }
  }
  function setDismissed() { try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {} }

  var STYLE = '#ec-pwa-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:9999;'
    + 'max-width:440px;width:calc(100% - 24px);background:#fff;color:#1F2937;border-radius:14px;'
    + 'box-shadow:0 10px 40px rgba(0,0,0,.18);padding:12px 14px;display:flex;align-items:center;gap:12px;'
    + 'font-family:Inter,system-ui,sans-serif;animation:ecpwa .35s ease}'
    + '@keyframes ecpwa{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}'
    + '#ec-pwa-bar img{width:38px;height:38px;border-radius:9px;flex:0 0 auto}'
    + '#ec-pwa-bar .ec-txt{flex:1;font-size:.9rem;line-height:1.3}'
    + '#ec-pwa-bar button{border:0;cursor:pointer;border-radius:9px;font-weight:600;font-family:inherit}'
    + '#ec-pwa-bar .ec-go{background:#F30006;color:#fff;padding:9px 16px;font-size:.9rem}'
    + '#ec-pwa-bar .ec-go:hover{background:#B71C1C}'
    + '#ec-pwa-bar .ec-x{background:transparent;color:#9CA3AF;font-size:1.3rem;padding:0 4px;line-height:1}'
    + '[dir=rtl] #ec-pwa-bar{direction:rtl}';

  function injectStyle() {
    if (document.getElementById('ec-pwa-style')) return;
    var s = document.createElement('style');
    s.id = 'ec-pwa-style'; s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function showBar(opts) {
    if (document.getElementById('ec-pwa-bar')) return;
    injectStyle();
    var bar = document.createElement('div');
    bar.id = 'ec-pwa-bar';
    bar.setAttribute('role', 'dialog');
    bar.innerHTML =
      '<img src="/assets/icons/icon-192.png" alt="ExitCar">' +
      '<div class="ec-txt">' + opts.text + '</div>' +
      (opts.actionText ? '<button class="ec-go">' + opts.actionText + '</button>' : '') +
      '<button class="ec-x" aria-label="' + t('close') + '">&times;</button>';
    document.body.appendChild(bar);
    bar.querySelector('.ec-x').onclick = function () { bar.remove(); if (opts.onClose) opts.onClose(); };
    if (opts.actionText) bar.querySelector('.ec-go').onclick = function () { opts.onAction(bar); };
  }

  // --- Install akışı ---
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (dismissed()) return;
    showBar({
      text: t('install'),
      actionText: t('btn'),
      onAction: function (bar) {
        bar.remove();
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () { deferredPrompt = null; });
      },
      onClose: setDismissed
    });
  });

  window.addEventListener('appinstalled', function () { setDismissed(); deferredPrompt = null; });

  // iOS Safari: beforeinstallprompt yok → ipucu göster (standalone değilse)
  function isiOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function standalone() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
  if (isiOS() && !standalone() && !dismissed()) {
    window.addEventListener('load', function () {
      setTimeout(function () { showBar({ text: t('ios'), onClose: setDismissed }); }, 2500);
    });
  }

  // --- SW kaydı + güncelleme bildirimi ---
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      reg.addEventListener('updatefound', function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function () {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            showBar({
              text: t('update'),
              actionText: t('refresh'),
              onAction: function () { nw.postMessage('SKIP_WAITING'); }
            });
          }
        });
      });
    }).catch(function () { /* SW kaydı başarısız — sessiz geç */ });

    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return; refreshing = true; window.location.reload();
    });
  });
})();
