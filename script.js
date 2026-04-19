/* ================================================================
   PORTFOLIO — MEVEN HOARAU TECHER — script.js
   - Curseur losange personnalisé
   - Particules losanges en arrière-plan
   - Scroll reveal (IntersectionObserver)
   - Modal fiches projets
   - Navigation au scroll
   ================================================================ */

/* ----------------------------------------------------------------
   1. CURSEUR PERSONNALISÉ
   ---------------------------------------------------------------- */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
})();

/* ----------------------------------------------------------------
   2. PARTICULES LOSANGES EN ARRIÈRE-PLAN
   ---------------------------------------------------------------- */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const dur   = 14 + Math.random() * 16;
    const delay = -(Math.random() * dur);
    const size  = 5 + Math.random() * 8;
    const op    = 0.06 + Math.random() * 0.14;
    p.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;--dur:${dur}s;--delay:${delay}s;--op:${op};`;
    container.appendChild(p);
  }
})();

/* ----------------------------------------------------------------
   3. SCROLL REVEAL — IntersectionObserver
   ---------------------------------------------------------------- */
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  // Hero visible immédiatement
  const hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('visible'));
})();

/* ----------------------------------------------------------------
   4. NAVIGATION — fond opaque au scroll
   ---------------------------------------------------------------- */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(10,10,15,0.92)'
      : 'rgba(10,10,15,0.7)';
  }, { passive: true });
})();

/* ----------------------------------------------------------------
   5. MODAL FICHES PROJETS
   ---------------------------------------------------------------- */
(function initModal() {
  const overlay  = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const content  = document.getElementById('modal-content');
  if (!overlay || !content) return;

  // Charger les données JSON embarquées dans le HTML
  let fiches = {};
  try {
    fiches = JSON.parse(document.getElementById('fiches-data').textContent);
  } catch (e) {
    console.error('Erreur de lecture des fiches:', e);
  }

  // Ouvrir le modal
  function openModal(projectKey) {
    const f = fiches[projectKey];
    if (!f) return;

    content.innerHTML = buildFicheHTML(f);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus piège (accessibilité)
    closeBtn.focus();
  }

  // Fermer le modal
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Générer le HTML de la fiche
  function buildFicheHTML(f) {
    const realiseLi = f.realise.map(r => `<li>${r}</li>`).join('');
    const compSpans  = f.competences.map(c => `<span>${c}</span>`).join('');
    const tagSpans   = f.tags.map(t => `<span>${t}</span>`).join('');
    const githubLink = f.github
      ? `<a class="fiche-github" href="${f.github}" target="_blank" rel="noopener">[ GitHub ] →</a>`
      : '';

    return `
      <div class="fiche-type">${escHtml(f.type)}</div>
      <h3 class="fiche-titre">${escHtml(f.titre)}</h3>

      <h5>Contexte</h5>
      <p>${escHtml(f.contexte)}</p>

      <h5>Mon rôle</h5>
      <p>${escHtml(f.role)}</p>

      <h5>Ce qui a été réalisé</h5>
      <ul>${realiseLi}</ul>

      <h5>Obstacle &amp; solution</h5>
      <p>${escHtml(f.obstacle)}</p>

      <h5>Résultat</h5>
      <p>${escHtml(f.resultat)}</p>

      <h5>Capture d'écran</h5>
      <div class="modal-screenshot">📸 Capture à ajouter</div>

      <h5>Technologies</h5>
      <div class="fiche-tags">${tagSpans}</div>

      <h5>Compétences E5 couvertes</h5>
      <div class="fiche-comps">${compSpans}</div>

      ${githubLink}
    `;
  }

  // Échapper les caractères HTML pour éviter XSS
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Boutons "Voir la fiche"
  document.querySelectorAll('.btn-fiche').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.project));
  });

  // Fermer avec le bouton ✕
  closeBtn.addEventListener('click', closeModal);

  // Fermer en cliquant sur l'overlay (hors de la card)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Fermer avec Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
})();
