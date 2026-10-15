/* ═══════════════════════════════════════════════════════════════════════════
   novus-mobile.js  —  Novus Foods 1730 Ops Hub  —  Mobile / touch helpers
   Load with:  <script src="novus-mobile.js" defer></script>
   Works together with novus-mobile.css. Safe on desktop (it only injects UI
   that novus-mobile.css reveals at ≤1024px).

   What it does
     1. Builds the bottom tab bar from the page's existing <nav class="cmd-nav">
        so the links never drift out of sync with the desktop nav.
     2. Keeps --app-h / --vh equal to the REAL visible viewport (iOS URL bar,
        Android toolbar, rotation) so full-screen panels never get clipped.
     3. Hides the tab bar while the on-screen keyboard is up.
     4. Closes the ··· menu when tapping outside (iOS doesn't fire `click` on
        non-interactive elements, which broke the desktop outside-click logic).
     5. Adds theme-color + iOS "Add to Home Screen" meta if the page lacks them.
═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement;

  /* ── 1. Viewport height variable ───────────────────────────────────────── */
  function setViewportVars() {
    var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    root.style.setProperty('--vh', (h * 0.01) + 'px');
    // Only override --app-h where dvh is unsupported; modern browsers keep CSS dvh.
    if (!(window.CSS && CSS.supports && CSS.supports('height', '100dvh'))) {
      root.style.setProperty('--app-h', h + 'px');
    }
  }
  setViewportVars();
  window.addEventListener('resize', setViewportVars, { passive: true });
  window.addEventListener('orientationchange', function () { setTimeout(setViewportVars, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', setViewportVars, { passive: true });

  /* ── 2. Head meta (theme colour, standalone web-app hints) ─────────────── */
  function ensureMeta(name, content) {
    if (doc.querySelector('meta[name="' + name + '"]')) return;
    var m = doc.createElement('meta'); m.name = name; m.content = content; doc.head.appendChild(m);
  }
  ensureMeta('theme-color', '#ffffff');
  ensureMeta('mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-status-bar-style', 'default');
  ensureMeta('format-detection', 'telephone=no');

  /* ── 3. Bottom tab bar ─────────────────────────────────────────────────── */
  var ICONS = {
    'hub.html':               '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    'dds-announcements.html': '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    'dds-dashboard.html':     '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    'weekly-kpis.html':       '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M22 20H2"/>',
    'play-call.html':         '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'needs-action.html':      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  var SHORT = { 'dds-announcements.html': 'News', 'dds-dashboard.html': 'Dashboard', 'weekly-kpis.html': 'KPIs', 'play-call.html': 'Play Call', 'hub.html': 'Hub' };

  function fileOf(href) {
    try { return new URL(href, location.href).pathname.split('/').pop() || 'index.html'; }
    catch (e) { return String(href || '').split('?')[0].split('/').pop(); }
  }

  function buildTabBar() {
    var nav = doc.querySelector('.cmd-nav');
    if (!nav || doc.querySelector('.nv-tabbar')) return;

    var current = fileOf(location.href);
    var items = [{ href: 'hub.html', label: 'Hub' }];
    nav.querySelectorAll('a.cmd-tab').forEach(function (a) {
      var f = fileOf(a.getAttribute('href'));
      items.push({ href: a.getAttribute('href'), label: SHORT[f] || a.textContent.trim() });
    });

    var bar = doc.createElement('nav');
    bar.className = 'nv-tabbar';
    bar.setAttribute('aria-label', 'Primary');

    items.forEach(function (it) {
      var f = fileOf(it.href);
      var a = doc.createElement('a');
      a.className = 'nv-tab' + (f === current ? ' active' : '');
      a.href = it.href;
      if (f === current) a.setAttribute('aria-current', 'page');
      a.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[f] || '<circle cx="12" cy="12" r="9"/>') + '</svg>' +
        '<span>' + it.label + '</span>';
      bar.appendChild(a);
    });

    doc.body.appendChild(bar);
    doc.body.classList.add('has-tabbar');
  }

  /* ── 4. Keyboard awareness ─────────────────────────────────────────────── */
  function isTextField(el) {
    if (!el) return false;
    var t = el.tagName;
    if (t === 'TEXTAREA' || t === 'SELECT') return true;
    if (t === 'INPUT') return !/^(checkbox|radio|button|submit|range|file|color)$/i.test(el.type);
    return el.isContentEditable;
  }
  var kbdTimer;
  doc.addEventListener('focusin', function (e) {
    if (!isTextField(e.target)) return;
    clearTimeout(kbdTimer);
    doc.body.classList.add('kbd-open');
    // keep the focused field visible above the keyboard
    setTimeout(function () {
      try { e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (_) {}
    }, 280);
  });
  doc.addEventListener('focusout', function () {
    clearTimeout(kbdTimer);
    kbdTimer = setTimeout(function () { doc.body.classList.remove('kbd-open'); }, 120);
  });

  /* ── 5. Close ··· menu on any outside tap / Escape ─────────────────────── */
  function outsideClose(e) {
    var wrap = doc.getElementById('more-wrap');
    var dd = doc.getElementById('more-dropdown');
    if (!wrap || !dd || dd.classList.contains('hidden')) return;
    if (!wrap.contains(e.target) && typeof window.closeMore === 'function') window.closeMore();
  }
  doc.addEventListener('touchstart', outsideClose, { passive: true });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && typeof window.closeMore === 'function') window.closeMore(); });

  /* ── 6. Lock page scroll behind open full-screen overlays ──────────────── */
  var OVERLAYS = ['cv-overlay', 'roe-overlay', 'na-overlay', 'help-overlay', 'maint-overlay', 'cw-overlay', 'modal-overlay', 'center-modal-overlay', 'lean-overlay'];
  function syncScrollLock() {
    var open = OVERLAYS.some(function (id) {
      var el = doc.getElementById(id);
      if (!el) return false;
      return /(^|\s)(cv-visible|roe-visible|na-visible|help-visible|maint-visible|cw-visible|active|lean-visible)(\s|$)/.test(el.className);
    });
    doc.body.classList.toggle('nv-scroll-lock', open);
  }
  var mo = new MutationObserver(syncScrollLock);
  function watchOverlays() {
    OVERLAYS.forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
    // overlays created lazily by novus-core.js
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.id && OVERLAYS.indexOf(n.id) > -1) { mo.observe(n, { attributes: true, attributeFilter: ['class'] }); syncScrollLock(); }
        });
      });
    }).observe(doc.body, { childList: true });
  }

  function init() { buildTabBar(); watchOverlays(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
