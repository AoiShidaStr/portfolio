/* ================================================================
   MEVEN HOARAU TECHER — site.js
   Sans dépendance. Chaque bloc ignore sa partie si la page ne l'a pas.
   ================================================================ */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ── Barre du haut + lien actif ─────────────────────────────── */
  const topbar = $('#topbar');
  const menuLinks = $$('.menu a[href^="#"]');
  const sections = menuLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 20);
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    menuLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Apparition au défilement ───────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ── Chiffres qui défilent ──────────────────────────────────── */
  const fmt = new Intl.NumberFormat('fr-FR');
  function countUp(el) {
    const target = Number(el.dataset.count);
    const suffix = el.querySelector('.u') ? el.querySelector('.u').outerHTML : '';
    if (reduceMotion || !target) return;
    const dur = 1600 + Math.min(target, 400);
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.innerHTML = fmt.format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countUp(e.target);
      statIO.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => statIO.observe(el));

  /* ── Braises (canvas du hero) ───────────────────────────────── */
  const canvas = $('#embers');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, running = true;
    const embers = [];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: Math.random() * 1.8 + 0.4,
        vy: Math.random() * 0.5 + 0.18,
        vx: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.6 + 0.25,
        ph: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.8 ? '255,106,74' : '227,178,92',
      };
    }
    resize();
    const count = w < 700 ? 34 : 70;
    for (let i = 0; i < count; i++) embers.push(spawn(true));
    window.addEventListener('resize', resize);
    const heroIO = new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(draw); });
    heroIO.observe(canvas);
    function draw(t) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.y -= p.vy;
        p.x += p.vx + Math.sin(t / 1400 + p.ph) * 0.22;
        if (p.y < -10) embers[i] = spawn(false);
        const fade = Math.min(1, (h - p.y) / (h * 0.25)) * Math.min(1, p.y / (h * 0.3));
        const flick = 0.75 + 0.25 * Math.sin(t / 220 + p.ph);
        const alpha = Math.max(0, p.a * fade * flick);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${alpha})`;
        ctx.shadowColor = `rgba(${p.hue},${alpha})`;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ── Fenêtre de jeu : diaporama + inclinaison ───────────────── */
  const screen = $('#gw-screen');
  if (screen) {
    const imgs = $$('img', screen);
    const cap = $('#gw-caption');
    const bar = $('#gw-progress');
    let idx = 0, timer = null;
    const dots = imgs.map((img, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Capture ${i + 1} sur ${imgs.length}`);
      b.addEventListener('click', () => { show(i); restart(); });
      bar.appendChild(b);
      return b;
    });
    function show(i) {
      imgs[idx].classList.remove('is-active');
      dots[idx].classList.remove('is-active');
      dots[idx].setAttribute('aria-selected', 'false');
      idx = (i + imgs.length) % imgs.length;
      imgs[idx].classList.add('is-active');
      // relance l'animation de la barre
      dots[idx].classList.remove('is-active'); void dots[idx].offsetWidth; dots[idx].classList.add('is-active');
      dots[idx].setAttribute('aria-selected', 'true');
      if (cap) cap.innerHTML = imgs[idx].dataset.caption || '';
    }
    function restart() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(() => show(idx + 1), 5000);
    }
    dots[0].classList.add('is-active');
    dots[0].setAttribute('aria-selected', 'true');
    restart();

    const win = $('#game-window');
    const visual = win && win.parentElement;
    if (win && !reduceMotion && window.matchMedia('(hover: hover) and (min-width: 1081px)').matches) {
      visual.addEventListener('mousemove', (e) => {
        const r = visual.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        win.style.transform = `rotateY(${-8 + x * 12}deg) rotateX(${4 - y * 10}deg)`;
      });
      visual.addEventListener('mouseleave', () => { win.style.transform = ''; });
    }
  }

  /* ── Lueur qui suit la souris sur les piliers ───────────────── */
  $$('.pillar').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ── Cadence de livraison ───────────────────────────────────── */
  const cad = $('#cadence');
  const releasesEl = $('#releases');
  if (cad && releasesEl) {
    const releases = JSON.parse(releasesEl.textContent);
    const start = new Date('2026-09-30T12:00:00');
    const days = 27;
    const byDay = Array.from({ length: days }, () => []);
    releases.forEach((r) => {
      const d = Math.round((new Date(r[2] + 'T12:00:00') - start) / 86400000);
      if (d >= 0 && d < days) byDay[d].push(r);
    });
    const tip = $('#cad-tip');
    const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    let n = 0;
    byDay.forEach((list, d) => {
      const col = document.createElement('div');
      col.className = 'cad-day' + (list.length ? '' : ' is-empty');
      list.forEach((r) => {
        const c = document.createElement('div');
        c.className = 'cad-cell' + (r[3] ? ' is-major' : '');
        c.style.transitionDelay = `${n++ * 35}ms`;
        const day = new Date(start.getTime() + d * 86400000);
        c.dataset.tip = `<span>${esc(r[0])}</span>${esc(r[1])} · ${dateFmt.format(day)}`;
        col.appendChild(c);
      });
      cad.appendChild(col);
    });
    const cadIO = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cad.classList.add('is-in'); cadIO.disconnect(); } }, { threshold: 0.4 });
    cadIO.observe(cad);
    if (tip) {
      cad.addEventListener('mousemove', (e) => {
        const cell = e.target.closest('.cad-cell');
        if (!cell) { tip.classList.remove('is-on'); return; }
        tip.innerHTML = cell.dataset.tip;
        tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 250) + 'px';
        tip.style.top = (e.clientY - 40) + 'px';
        tip.classList.add('is-on');
      });
      cad.addEventListener('mouseleave', () => tip.classList.remove('is-on'));
    }
  }

  /* ── Fenêtres (fiche projet, visionneuse) ───────────────────── */
  let lastFocus = null;
  function openOverlay(ov) {
    lastFocus = document.activeElement;
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const close = $('[data-close]', ov);
    if (close) close.focus();
  }
  function closeOverlay(ov) {
    if (!ov.classList.contains('is-open')) return;
    ov.classList.remove('is-open');
    ov.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('.overlay').forEach((ov) => {
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) closeOverlay(ov); });
  });
  document.addEventListener('keydown', (e) => {
    const ov = $('.overlay.is-open');
    if (!ov) return;
    if (e.key === 'Escape') closeOverlay(ov);
    if (ov.id === 'lightbox' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) lbStep(e.key === 'ArrowRight' ? 1 : -1);
    if (e.key === 'Tab') {
      const f = $$('a[href], button', ov).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // fiches projet
  const fichesEl = $('#fiches-data');
  const fiche = $('#fiche');
  if (fichesEl && fiche) {
    const data = JSON.parse(fichesEl.textContent);
    const body = $('#fiche-body');
    $$('[data-fiche]').forEach((btn) => btn.addEventListener('click', () => {
      const d = data[btn.dataset.fiche];
      if (!d) return;
      const block = (title, text) => (text ? `<h3>${title}</h3><p>${esc(text)}</p>` : '');
      const items = (d.realise || []).map((r) => `<li>${esc(r)}</li>`).join('');
      const tags = (d.tags || []).map((t) => `<li>${esc(t)}</li>`).join('');
      body.innerHTML = `
        <p class="s-type">${esc(d.type)}</p>
        <h2 id="fiche-title">${esc(d.titre)}</h2>
        ${block('Contexte', d.contexte)}
        ${block('Mon rôle', d.role)}
        ${items ? `<h3>Ce que j'ai réalisé</h3><ul>${items}</ul>` : ''}
        ${block('Obstacle rencontré', d.obstacle)}
        ${block('Résultat', d.resultat)}
        <h3>Technologies</h3><ul class="chips">${tags}</ul>
        ${d.github ? `<a class="link-btn" href="${esc(d.github)}" target="_blank" rel="noopener">Voir sur GitHub ↗<span class="sr-only"> (nouvel onglet)</span></a>` : ''}`;
      $('.sheet', fiche).scrollTop = 0;
      openOverlay(fiche);
    }));
  }

  // visionneuse
  const lb = $('#lightbox');
  const lbShots = $$('#gallery .shot, .gallery-shots .shot');
  let lbIdx = 0;
  function lbShow(i) {
    lbIdx = (i + lbShots.length) % lbShots.length;
    const img = $('img', lbShots[lbIdx]);
    const cap = $('figcaption', lbShots[lbIdx]);
    $('#lb-img').src = img.currentSrc || img.src;
    $('#lb-img').alt = img.alt;
    $('#lb-cap').innerHTML = cap ? cap.innerHTML : '';
  }
  function lbStep(s) { lbShow(lbIdx + s); }
  if (lb && lbShots.length) {
    lbShots.forEach((shot, i) => {
      const trigger = $('button', shot) || shot;
      trigger.addEventListener('click', () => { lbShow(i); openOverlay(lb); });
    });
    $$('[data-step]', lb).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); lbStep(Number(b.dataset.step)); }));
  }

  /* ── Copier l'e-mail ────────────────────────────────────────── */
  const copyBtn = $('#copy-mail');
  const toast = $('#copy-ok');
  if (copyBtn && toast) {
    copyBtn.addEventListener('click', async () => {
      const mail = copyBtn.dataset.mail;
      let ok = false;
      try { await navigator.clipboard.writeText(mail); ok = true; } catch (_) { ok = false; }
      toast.textContent = ok ? `Copié : ${mail}` : mail;
      toast.classList.add('is-on');
      setTimeout(() => toast.classList.remove('is-on'), 2200);
    });
  }
})();
