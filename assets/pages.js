/* =====================================================================
   Inner pages (category / product / cart / thank-you / wishlist / account)
   Salla mapping: category.html → product listing page (also search),
   product.html → single product, cart.html → cart, thankyou.html → thank-you.
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const S = window.STORE, q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  let carried = ''; try { carried = sessionStorage.getItem('ts-carry') || ''; } catch (_) {}
  const params = new URLSearchParams(location.search || carried);
  const page = document.body.dataset.page;

  /* ---------------- category / search ---------------- */
  if (page === 'category') {
    const st = { type: params.get('type') || '', brand: params.get('brand') || '', size: S.parseSize(params.get('q')), text: '', sort: 'feat', rim: '' };
    const qv = params.get('q') || '';
    if (qv && !st.size) st.text = qv.trim();
    const range = (a, b, s) => Array.from({ length: Math.floor((b - a) / s) + 1 }, (_, i) => a + i * s);
    const fill = (id, arr, d) => (q(id).innerHTML = '<option value="">الكل</option>' + arr.map(v => '<option' + (String(v) === String(d) ? ' selected' : '') + '>' + v + '</option>').join(''));
    fill('#fw', range(155, 335, 10), st.size && st.size.w); fill('#fr', range(25, 85, 5), st.size && st.size.r); fill('#fj', range(13, 22, 1), st.size && st.size.j);
    q('#fbar').onsubmit = e => { e.preventDefault(); const w = q('#fw').value, r = q('#fr').value, j = q('#fj').value;
      st.size = w && r && j ? S.parseSize(w + '/' + r + '/' + j) : null; st.text = ''; draw(); };
    // facets
    q('#fType').innerHTML = [['', 'كل الأنواع'], ...Object.entries(S.TYPES)].map(([k, v]) => '<label><input type="radio" name="t" value="' + k + '"' + (k === st.type ? ' checked' : '') + '> ' + v + '</label>').join('');
    const brands = [...new Set(S.PRODUCTS.map(p => p.br))];
    q('#fBrand').innerHTML = [['', 'كل الماركات'], ...brands.map(b => [b, b])].map(([k, v]) => '<label><input type="radio" name="b" value="' + k + '"' + (k === st.brand ? ' checked' : '') + '> ' + v + '</label>').join('');
    qa('#fType input').forEach(i => (i.onchange = () => { st.type = i.value; draw(); }));
    qa('#fBrand input').forEach(i => (i.onchange = () => { st.brand = i.value; draw(); }));
    q('#csort').onchange = e => { st.sort = e.target.value; draw(); };
    q('#clear').onclick = () => { st.type = st.brand = st.text = ''; st.size = null; qa('#fType input,#fBrand input').forEach(i => (i.checked = !i.value)); ['#fw', '#fr', '#fj'].forEach(id => (q(id).value = '')); draw(); };
    function draw() {
      let l = S.PRODUCTS.filter(p => (!st.type || p.t === st.type) && (!st.brand || p.br === st.brand)
        && (!st.size || p.s === st.size.label) && (!st.text || (p.n + ' ' + p.b + ' ' + p.br + ' ' + p.s).toLowerCase().includes(st.text.toLowerCase())));
      if (st.sort === 'low') l.sort((a, b) => a.p - b.p); else if (st.sort === 'high') l.sort((a, b) => b.p - a.p);
      const title = st.size ? 'إطارات مقاس ' + st.size.label : st.text ? 'نتائج «' + st.text + '»' : st.type ? 'إطارات ' + S.TYPES[st.type] : st.brand ? 'إطارات ' + st.brand : 'كل الإطارات';
      q('#ctitle').textContent = title; document.title = title + ' — متجر الإطارات';
      q('#ccount').textContent = l.length + ' منتج';
      q('#cgridx').innerHTML = l.length ? l.map(S.card).join('') : '<div class="empty"><h3>ما لقينا إطارات بهالمواصفات.</h3><p>جرّب مقاس قريب، أو ابعت صورة إطارك على واتساب ونساعدك.</p><a class="btn btn-gold" href="https://wa.me/' + S.WA + '">تواصل عبر واتساب</a></div>';
      S.wireCards(q('#cgridx'));
      q('#chips').innerHTML = [st.size && ['المقاس', st.size.label], st.type && ['النوع', S.TYPES[st.type]], st.brand && ['الماركة', st.brand], st.text && ['بحث', st.text]].filter(Boolean).map(c => '<span>' + c[0] + ': <b>' + c[1] + '</b></span>').join('');
    }
    draw();
  }

  /* ---------------- product ---------------- */
  if (page === 'product') {
    const p = S.byId(params.get('id')) || S.PRODUCTS[0];
    document.title = p.n + ' ' + p.s + ' — متجر الإطارات';
    q('#bc').innerHTML = '<a href="index.html">الرئيسية</a><span>/</span><a href="category.html?type=' + p.t + '">' + S.TYPES[p.t] + '</a><span>/</span><b>' + p.n + '</b>';
    const imgs = [S.img(p), 'v3img/tire-b.webp', 'v3img/tire-c.webp', 'v3img/tread-depth.webp'];
    q('#gmain').innerHTML = '<span class="gghost">' + S.rim(p.s) + '</span><img id="gimg" src="' + imgs[0] + '" alt="' + p.n + '">' + (p.tag ? '<span class="ptag ' + (p.tag === 'عرض' ? 'g' : '') + '">' + p.tag + '</span>' : '');
    q('#gthumbs').innerHTML = imgs.map((s, i) => '<button type="button"' + (i ? '' : ' class="on"') + ' aria-label="صورة ' + (i + 1) + '"><img src="' + s + '" alt=""></button>').join('');
    qa('#gthumbs button').forEach((b, i) => (b.onclick = () => { q('#gimg').src = imgs[i]; qa('#gthumbs button').forEach(x => x.classList.toggle('on', x === b)); }));
    q('#pbrand').textContent = p.b; q('#pname').textContent = p.n; q('#psize').textContent = p.s; q('#ptype').textContent = S.TYPES[p.t];
    q('#pprice').textContent = p.p; q('#pold').textContent = p.o ? p.o + ' ر.س' : '';
    q('#psave').hidden = !p.o; if (p.o) q('#psave').textContent = 'وفّر ' + (p.o - p.p) + ' ر.س | -' + Math.round((1 - p.p / p.o) * 100) + '%';
    const SPEED = { R: 170, S: 180, T: 190, H: 210, V: 240, W: 270, Y: 300 };
    q('#pspecs').innerHTML = [['المقاس', p.s], ['الماركة', p.b], ['النوع', S.TYPES[p.t]], ['سنة الصنع', p.y], ['المنشأ', p.origin], ['مؤشر الحمولة', p.load], ['مؤشر السرعة', p.speed + (SPEED[p.speed] ? ' · حتى ' + SPEED[p.speed] + ' كم/س' : '')], ['الضمان', p.wy]]
      .map(r => '<div><dt>' + r[0] + '</dt><dd' + (r[0] === 'المقاس' ? ' dir="ltr"' : '') + '>' + r[1] + '</dd></div>').join('');
    let qty = 4;
    const upd = () => { q('#qn').textContent = qty; q('#ptotal').textContent = S.fmt(qty * p.p); q('#sbTotal').textContent = S.fmt(qty * p.p); qa('#qbtn button').forEach(b => b.classList.toggle('on', +b.dataset.q === qty)); };
    qa('#qbtn button').forEach(b => (b.onclick = () => { qty = +b.dataset.q; upd(); }));
    q('#qm').onclick = () => { qty = Math.max(1, qty - 1); upd(); }; q('#qp').onclick = () => { qty = Math.min(20, qty + 1); upd(); };
    upd();
    q('#centerSel').innerHTML = S.CENTERS.map(c => '<option value="' + c.id + '">' + c.name + ' — ' + c.addr + '</option>').join('');
    qa('input[name=dm]').forEach(r => (r.onchange = () => { q('#centerSel').disabled = r.value !== 'install' && !q('#dmInstall').checked; }));
    const remember = () => S.set('ts-delivery', { m: q('#dmInstall').checked ? 'install' : 'ship', c: q('#centerSel').value });
    q('#addCart').onclick = () => { remember(); S.add(p.id, qty); };
    q('#buyNow').onclick = () => { remember(); S.add(p.id, qty); S.go('cart.html'); };
    q('#sbAdd').onclick = () => { remember(); S.add(p.id, qty); };
    q('#sbName').textContent = p.n + ' · ' + p.s; q('#sbImg').src = S.img(p);
    const fav = q('#pfav'); const setFav = on => { fav.setAttribute('aria-pressed', on); fav.lastChild.textContent = on ? ' في المفضلة' : ' أضف للمفضلة'; };
    setFav(S.wish().includes(p.id)); fav.onclick = () => setFav(S.toggleWish(p.id));
    const rel = S.PRODUCTS.filter(x => x.id !== p.id && (x.t === p.t || x.s === p.s)).slice(0, 4);
    q('#related').innerHTML = rel.map(S.card).join(''); S.wireCards(q('#related'));
    // sticky bar appears after the buy box leaves the screen
    const io = new IntersectionObserver(es => es.forEach(e => q('#sbar').classList.toggle('show', !e.isIntersecting)), { threshold: 0 });
    io.observe(q('#buybox'));
  }

  /* ---------------- cart ---------------- */
  if (page === 'cart') {
    const d = S.get('ts-delivery', { m: 'install', c: S.CENTERS[0].id });
    let coupon = S.get('ts-coupon', '');
    q('#centerSel').innerHTML = S.CENTERS.map(c => '<option value="' + c.id + '"' + (c.id === d.c ? ' selected' : '') + '>' + c.name + ' — ' + c.addr + '</option>').join('');
    q(d.m === 'ship' ? '#dmShip' : '#dmInstall').checked = true;
    const syncDm = () => { const inst = q('#dmInstall').checked; q('#installBox').hidden = !inst; S.set('ts-delivery', { m: inst ? 'install' : 'ship', c: q('#centerSel').value }); draw(); };
    qa('input[name=dm]').forEach(r => (r.onchange = syncDm)); q('#centerSel').onchange = syncDm;
    q('#cpForm').onsubmit = e => { e.preventDefault(); const v = q('#cpIn').value.trim().toUpperCase();
      if (S.COUPONS[v]) { coupon = v; S.set('ts-coupon', v); q('#cpMsg').textContent = 'تم تطبيق الكود ' + v; q('#cpMsg').className = 'ok'; }
      else { q('#cpMsg').textContent = 'الكود غير صحيح'; q('#cpMsg').className = 'err'; } draw(); };
    if (coupon) q('#cpIn').value = coupon;
    function draw() {
      const c = S.cart();
      q('#cartEmpty').hidden = c.length > 0; q('#cartFull').hidden = c.length === 0;
      if (!c.length) return;
      q('#items').innerHTML = c.map(i => { const p = S.byId(i.id); if (!p) return '';
        return '<article class="ci" data-id="' + p.id + '"><a href="product.html?id=' + p.id + '" class="ci-img"><img src="' + S.img(p) + '" alt=""></a>'
          + '<div class="ci-b"><span class="pbrand">' + p.b + '</span><h3><a href="product.html?id=' + p.id + '">' + p.n + '</a></h3><span class="pline"><b dir="ltr">' + p.s + '</b> · ' + p.p + ' ر.س للإطار</span>'
          + '<div class="ci-q"><button type="button" data-a="-" aria-label="إنقاص">−</button><b>' + i.q + '</b><button type="button" data-a="+" aria-label="زيادة">+</button><button type="button" class="ci-x" data-a="x">حذف</button></div></div>'
          + '<div class="ci-t"><b>' + S.fmt(i.q * p.p) + '</b> ر.س</div></article>'; }).join('');
      qa('.ci button').forEach(b => (b.onclick = () => { const id = +b.closest('.ci').dataset.id; let cc = S.cart(); const it = cc.find(x => x.id === id);
        if (b.dataset.a === '+') it.q = Math.min(20, it.q + 1); else if (b.dataset.a === '-') it.q = Math.max(1, it.q - 1); else cc = cc.filter(x => x.id !== id);
        S.saveCart(cc); draw(); }));
      const sub = c.reduce((a, i) => a + i.q * S.byId(i.id).p, 0), tires = c.reduce((a, i) => a + i.q, 0);
      const disc = coupon ? Math.round(sub * S.COUPONS[coupon]) : 0, ship = q('#dmInstall').checked ? 0 : (sub >= 1000 ? 0 : 60);
      const total = sub - disc + ship;
      q('#sum').innerHTML = '<div><span>المجموع (' + tires + ' إطارات)</span><b>' + S.fmt(sub) + ' ر.س</b></div>'
        + (disc ? '<div class="g"><span>خصم ' + coupon + '</span><b>−' + S.fmt(disc) + ' ر.س</b></div>' : '')
        + '<div><span>' + (q('#dmInstall').checked ? 'التركيب في المركز' : 'التوصيل') + '</span><b>' + (ship ? ship + ' ر.س' : 'مجاني') + '</b></div>'
        + '<div class="tot"><span>الإجمالي <small>شامل الضريبة</small></span><b>' + S.fmt(total) + ' ر.س</b></div>'
        + '<p class="inst">أو 4 دفعات بقيمة <b>' + S.fmt(Math.round(total / 4)) + ' ر.س</b> مع تابي أو تمارا</p>';
      q('#checkout').onclick = () => { const order = { no: 'TS-' + Math.floor(100000 + Math.random() * 900000), items: c, total, m: q('#dmInstall').checked ? 'install' : 'ship', c: q('#centerSel').value, slot: q('#slotSel').value };
        S.set('ts-last-order', order); S.saveCart([]); S.set('ts-coupon', ''); S.go('thankyou.html'); };
    }
    syncDm();
  }

  /* ---------------- thank-you ---------------- */
  if (page === 'thankyou') {
    const o = S.get('ts-last-order', null);
    if (!o) { q('#tyNo').textContent = '—'; q('#tyItems').innerHTML = '<p class="lead">ما في طلب حديث. <a class="link" href="category.html">ابدأ التسوق</a></p>'; return; }
    q('#tyNo').textContent = o.no;
    q('#tyItems').innerHTML = o.items.map(i => { const p = S.byId(i.id); return '<div class="ty-i"><img src="' + S.img(p) + '" alt=""><div><b>' + p.n + '</b><small dir="ltr">' + p.s + '</small></div><span>× ' + i.q + '</span></div>'; }).join('')
      + '<div class="ty-tot"><span>الإجمالي</span><b>' + S.fmt(o.total) + ' ر.س</b></div>';
    const c = S.CENTERS.find(x => x.id === o.c) || S.CENTERS[0];
    q('#tyCenter').innerHTML = o.m === 'install'
      ? '<span class="kicker">موعد التركيب</span><h3>' + c.name + '</h3><p>' + c.addr + '<br>' + c.hours + '</p><p class="slot">' + o.slot + '</p><a class="btn btn-dark" href="https://maps.google.com/?q=' + encodeURIComponent(c.addr + ' الرياض') + '">الاتجاهات على الخريطة</a>'
      : '<span class="kicker">التوصيل</span><h3>نجهّز شحنتك</h3><p>توصلك رسالة برقم التتبع خلال 24 ساعة. المدة المتوقعة 1–5 أيام حسب مدينتك.</p>';
  }

  /* ---------------- wishlist ---------------- */
  if (page === 'wishlist') {
    const draw = () => { const l = S.wish().map(S.byId).filter(Boolean);
      q('#wgrid').innerHTML = l.length ? l.map(S.card).join('') : '<div class="empty"><h3>المفضلة فاضية.</h3><p>اضغط «أضف للمفضلة» بصفحة أي إطار عشان تحفظه هون.</p><a class="btn btn-gold" href="category.html">تصفّح الإطارات</a></div>';
      S.wireCards(q('#wgrid')); };
    draw();
  }

  /* ---------------- account (Salla handles login itself) ---------------- */
  if (page === 'account') {
    const o = S.get('ts-last-order', null);
    q('#orders').innerHTML = o ? '<div class="ord"><div><b>' + o.no + '</b><small>' + (o.m === 'install' ? 'استلام وتركيب' : 'توصيل') + '</small></div><span class="st">قيد التجهيز</span><b>' + S.fmt(o.total) + ' ر.س</b><a class="link" href="thankyou.html">التفاصيل</a></div>'
      : '<p class="lead">ما عندك طلبات لسا. <a class="link" href="category.html">ابدأ التسوق</a></p>';
  }
});
