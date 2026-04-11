/* ================================================================
   PORTFOLIO — MEVEN HOARAU TECHER — script.js
   - Curseur losange personnalisé
   - Particules losanges en arrière-plan
   - Scroll reveal (IntersectionObserver)
   ================================================================ */

/* ----------------------------------------------------------------
   1. CURSEUR PERSONNALISÉ
   ---------------------------------------------------------------- */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  // Suivre la souris avec requestAnimationFrame pour la fluidité
  let mx = 0, my = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Masquer le curseur quand la souris quitte la fenêtre
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
})();

/* ----------------------------------------------------------------
   2. PARTICULES LOSANGES EN ARRIÈRE-PLAN
   Génère 25 losanges SVG driftants en position fixed
   ---------------------------------------------------------------- */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const COUNT = 25;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    // Position horizontale aléatoire
    const x   = Math.random() * 100;           // % de la largeur
    const dur  = 14 + Math.random() * 16;      // durée 14–30s
    const delay = -(Math.random() * dur);      // démarrage décalé (négatif = déjà en cours)
    const size  = 5 + Math.random() * 8;       // taille 5–13px
    const op    = 0.06 + Math.random() * 0.14; // opacité 0.06–0.20

    p.style.cssText = `
      left: ${x}%;
      width: ${size}px;
      height: ${size}px;
      --dur: ${dur}s;
      --delay: ${delay}s;
      --op: ${op};
    `;

    container.appendChild(p);
  }
})();

/* ----------------------------------------------------------------
   3. SCROLL REVEAL — IntersectionObserver
   Ajoute .visible sur les éléments .fade-in quand ils entrent
   dans le viewport. Déclenché une seule fois par élément.
   ---------------------------------------------------------------- */
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // une seule fois
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  // Hero visible immédiatement au chargement (pas besoin de scroll)
  const hero = document.querySelector('.hero');
  if (hero) {
    // Léger délai pour laisser le CSS se mettre en place
    requestAnimationFrame(() => hero.classList.add('visible'));
  }
})();

/* ----------------------------------------------------------------
   4. NAVIGATION — fond opaque au scroll
   ---------------------------------------------------------------- */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(10, 10, 15, 0.92)';
    } else {
      nav.style.background = 'rgba(10, 10, 15, 0.7)';
    }
  }, { passive: true });
})();
