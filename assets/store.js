/* =====================================================================
   Tires Store — shared store logic for the static mockup.
   Every block here maps to a Salla piece when we port the theme:
     PRODUCTS      → salla product API (product.queries.list / single)
     cart (storage)→ salla.cart (add / update / remove)
     wishlist      → salla.wishlist
     coupon        → salla.cart.addCoupon
     centers       → theme settings (install centers component)
   Storage can be blocked (private mode) → everything falls back to memory.
   ===================================================================== */
(function () {
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return k in mem ? mem[k] : d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { mem[k] = v; } },
  };

  const IMG = 'v3img/';
  const PRODUCTS = [
    { id: 1, b: 'HANKOOK', br: 'هانكوك', n: 'Ventus Prime 4', s: '205/55 R16', t: 'sedan', p: 420, o: 470, img: 'tire-a', y: 2025, origin: 'كوريا', wy: '5 سنوات', load: 91, speed: 'V', tag: 'الأكثر مبيعاً' },
    { id: 2, b: 'BRIDGESTONE', br: 'بريجستون', n: 'Turanza T005', s: '215/60 R17', t: 'sedan', p: 510, img: 'tire-c', y: 2025, origin: 'اليابان', wy: '5 سنوات', load: 96, speed: 'H' },
    { id: 3, b: 'YOKOHAMA', br: 'يوكوهاما', n: 'Geolandar A/T', s: '265/65 R17', t: 'suv', p: 640, o: 700, img: 'tire-a', y: 2024, origin: 'اليابان', wy: '4 سنوات', load: 112, speed: 'T', tag: 'عرض' },
    { id: 4, b: 'TASH', br: 'تاش', n: 'كفر تاش', s: '275/65 R18', t: 'suv', p: 390, img: 'tire-c', y: 2025, origin: 'تايلند', wy: 'سنتين', load: 116, speed: 'T' },
    { id: 5, b: 'HANKOOK', br: 'هانكوك', n: 'Dynapro HT', s: '245/70 R16', t: 'truck', p: 560, img: 'tire-c', y: 2025, origin: 'كوريا', wy: '5 سنوات', load: 107, speed: 'S' },
    { id: 6, b: 'YOKOHAMA', br: 'يوكوهاما', n: 'BluEarth ES32', s: '195/65 R15', t: 'sedan', p: 330, img: 'tire-a', y: 2025, origin: 'اليابان', wy: '4 سنوات', load: 91, speed: 'H' },
    { id: 7, b: 'BRIDGESTONE', br: 'بريجستون', n: 'Dueler H/T', s: '265/70 R16', t: 'suv', p: 590, img: 'tire-b', y: 2025, origin: 'اليابان', wy: '5 سنوات', load: 112, speed: 'S' },
    { id: 8, b: 'TASH', br: 'تاش', n: 'كفر تاش رياضي', s: '225/45 R18', t: 'sedan', p: 410, o: 450, img: 'tire-a', y: 2025, origin: 'تايلند', wy: 'سنتين', load: 95, speed: 'W', tag: 'عرض' },
    { id: 9, b: 'YOKOHAMA', br: 'يوكوهاما', n: 'كفر يوكوهاما LT', s: '245/75 R16', t: 'truck', p: 610, img: 'tire-c', y: 2025, origin: 'اليابان', wy: '4 سنوات', load: 120, speed: 'R' },
    { id: 10, b: 'THAI', br: 'تايلندي', n: 'كفر تايلندي', s: '215/60 R17', t: 'sedan', p: 340, img: 'tire-b', y: 2025, origin: 'تايلند', wy: 'سنتين', load: 96, speed: 'H' },
    { id: 11, b: 'HANKOOK', br: 'هانكوك', n: 'كفر هانكوك', s: '265/65 R17', t: 'suv', p: 520, img: 'tire-pair', y: 2025, origin: 'كوريا', wy: '5 سنوات', load: 112, speed: 'T' },
    { id: 12, b: 'CHINA', br: 'صيني', n: 'كفر صيني اقتصادي', s: '205/55 R16', t: 'sedan', p: 290, img: 'tire-c', y: 2025, origin: 'الصين', wy: 'سنة', load: 91, speed: 'V' },
  ];
  const TYPES = { sedan: 'سيارات سيدان', suv: 'دفع رباعي', truck: 'نقل وبيك أب' };
  const CENTERS = [
    { id: 'malqa', name: 'مركز الملقا', addr: 'طريق أنس بن مالك، حي الملقا', hours: 'السبت–الخميس · 9 ص – 11 م' },
    { id: 'suwaidi', name: 'مركز السويدي', addr: 'طريق ديراب، حي السويدي', hours: 'السبت–الخميس · 9 ص – 11 م' },
  ];
  const COUPONS = { TIRES10: 0.10 };
  const PHONE = '0593157718', WA = '966593157718';

  const byId = id => PRODUCTS.find(p => p.id === +id);
  const byName = n => PRODUCTS.find(p => p.n === n);
  const link = n => { const p = byName(n); return p ? 'product.html?id=' + p.id : 'category.html'; };
  const rim = s => s.split(' ').pop();
  const fmt = n => Number(n).toLocaleString('en');
  const img = p => IMG + p.img + '.webp';

  /* ---------- cart ---------- */
  const cart = () => store.get('ts-cart', []);
  const saveCart = c => { store.set('ts-cart', c); updateCount(); };
  function add(id, qty = 4) {
    const c = cart(); const it = c.find(i => i.id === +id);
    if (it) it.q = Math.min(it.q + qty, 20); else c.push({ id: +id, q: qty });
    saveCart(c); toast('أُضيف للسلة · ' + qty + ' إطارات');
  }
  const addByName = (n, qty) => { const p = byName(n); if (p) add(p.id, qty); };
  const count = () => cart().reduce((a, i) => a + i.q, 0);
  function updateCount() { document.querySelectorAll('#cartN').forEach(e => (e.textContent = count())); }

  /* ---------- wishlist ---------- */
  const wish = () => store.get('ts-wish', []);
  function toggleWish(id) { let w = wish(); w = w.includes(+id) ? w.filter(x => x !== +id) : [...w, +id]; store.set('ts-wish', w); return w.includes(+id); }

  /* ---------- toast ---------- */
  function toast(msg) {
    let t = document.getElementById('ts-toast');
    if (!t) { t = document.createElement('div'); t.id = 'ts-toast'; t.className = 'ts-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- size helpers (store names use "275/65/18") ---------- */
  function parseSize(q) {
    const m = String(q || '').toUpperCase().match(/(\d{3})\s*\/\s*(\d{2})\s*(?:ZR|R|\/)?\s*(\d{2})/);
    return m ? { w: m[1], r: m[2], j: m[3], label: m[1] + '/' + m[2] + ' R' + m[3] } : null;
  }

  /* ---------- shared chrome wiring ---------- */
  function wireChrome() {
    updateCount();
    document.querySelectorAll('form.hsearch').forEach(f => f.addEventListener('submit', e => {
      e.preventDefault(); const v = f.querySelector('input').value.trim();
      go('category.html' + (v ? '?q=' + encodeURIComponent(v) : ''));
    }));
    const page = document.body.dataset.page;
    document.querySelectorAll('.mbar a').forEach(a => a.classList.toggle('on', a.dataset.p === page));
    document.querySelectorAll('.hnav a').forEach(a => { if (a.dataset.p && a.dataset.p === page) a.classList.add('on'); });
  }

  /* ---------- product card (same card as the home slider) ---------- */
  function card(p) {
    return '<article class="pcard"><a class="pimg" href="product.html?id=' + p.id + '">' + (p.tag ? '<span class="ptag ' + (p.tag === 'عرض' ? 'g' : '') + '">' + p.tag + '</span>' : '') + '<img src="' + img(p) + '" alt="' + p.n + '"></a>'
      + '<div class="pbody"><span class="pbrand">' + p.b + '</span><h3><a href="product.html?id=' + p.id + '">' + p.n + '</a></h3><span class="pline">' + TYPES[p.t] + ' · <b dir="ltr">' + p.s + '</b></span>'
      + '<div class="pfoot2"><div class="pprice2"><div><b>' + p.p + '</b> <span>ر.س</span>' + (p.o ? '<s>' + p.o + '</s>' : '') + '</div><small>للإطار الواحد</small></div><a class="pdetails" href="product.html?id=' + p.id + '">عرض التفاصيل <span>←</span></a></div>'
      + '<button type="button" class="add2" data-id="' + p.id + '">+ أضف 4 إطارات للسلة</button></div></article>';
  }
  function wireCards(root) { (root || document).querySelectorAll('.add2[data-id]').forEach(b => (b.onclick = () => { add(b.dataset.id, 4); b.textContent = '✓ أُضيفت للسلة'; b.classList.add('done'); })); }

  /* remember the query of an internal link (some hosts drop ?query on navigation) */
  function carry(h) { if (!/^[w-]+.html/.test(h || '')) return; try { sessionStorage.setItem('ts-carry', h.includes('?') ? h.split('?')[1].split('#')[0] : ''); } catch (_) {} }
  const go = url => { carry(url); location.href = url; };
  window.STORE = { go, PRODUCTS, TYPES, CENTERS, COUPONS, PHONE, WA, byId, byName, link, rim, fmt, img, cart, saveCart, add, addByName, count, updateCount, wish, toggleWish, toast, parseSize, card, wireCards, get: store.get, set: store.set };
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href]'); if (!a) return; const h = a.getAttribute('href'); carry(h); });
  document.addEventListener('DOMContentLoaded', wireChrome);
})();
