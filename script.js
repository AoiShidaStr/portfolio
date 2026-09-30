/* ================================================================
   PORTFOLIO — MEVEN HOARAU TECHER — script.js v3
   ================================================================ */

/* ── Curseur losange + halo ─────────────────────────────────── */
const cursor = document.getElementById('cursor');
const halo   = document.getElementById('cursor-halo');

let mx = -100, my = -100;
let hx = -100, hy = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animHalo() {
  hx += (mx - hx) * 0.1;
  hy += (my - hy) * 0.1;
  halo.style.left = hx + 'px';
  halo.style.top  = hy + 'px';
  requestAnimationFrame(animHalo);
})();

/* ── Champ d'étoiles (canvas) ────────────────────────────────── */
const canvas = document.getElementById('canvas-bg');
const ctx    = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); if (reduceMotion) drawStars(0); });

function randBetween(a, b) { return a + Math.random() * (b - a); }

const STAR_COLORS = ['255,255,255', '255,255,255', '196,194,255', '125,211,252', '244,190,255'];
const STAR_COUNT  = window.innerWidth < 700 ? 130 : 280;

class Star {
  constructor() {
    this.x = randBetween(0, canvas.width);
    this.y = randBetween(0, canvas.height);
    this.big = Math.random() < 0.10;
    this.r = this.big ? randBetween(1.3, 2.1) : randBetween(0.4, 1.2);
    this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    this.base = this.big ? randBetween(0.7, 1) : randBetween(0.25, 0.75);
    this.speed = randBetween(0.4, 1.6);          // vitesse du scintillement
    this.phase = randBetween(0, Math.PI * 2);
    this.drift = this.r * 0.035;                 // parallaxe : les plus grosses avancent plus vite
  }
  update() {
    this.y -= this.drift;
    if (this.y < -4) { this.y = canvas.height + 4; this.x = randBetween(0, canvas.width); }
  }
  draw(t) {
    const tw = 0.65 + 0.35 * Math.sin(t * this.speed + this.phase);
    ctx.fillStyle = `rgba(${this.color},${this.base * tw})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    if (this.big) {                               // léger halo pour les étoiles brillantes
      ctx.fillStyle = `rgba(${this.color},${0.10 * tw})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const stars = Array.from({ length: STAR_COUNT }, () => new Star());
let shooting = null;
let nextShot = performance.now() + randBetween(4000, 9000);

function spawnShootingStar() {
  const startX = randBetween(canvas.width * 0.2, canvas.width * 0.95);
  shooting = { x: startX, y: randBetween(0, canvas.height * 0.35), vx: -randBetween(9, 13), vy: randBetween(4, 6), life: 0 };
}

function drawStars(now) {
  const t = now / 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(st => { if (!reduceMotion) st.update(); st.draw(t); });

  if (!reduceMotion) {
    if (!shooting && now > nextShot) { spawnShootingStar(); nextShot = now + randBetween(7000, 15000); }
    if (shooting) {
      shooting.x += shooting.vx; shooting.y += shooting.vy; shooting.life += 1;
      const a = Math.max(0, 1 - shooting.life / 45);
      const g = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - shooting.vx * 7, shooting.y - shooting.vy * 7);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(1, 'rgba(125,211,252,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(shooting.x - shooting.vx * 7, shooting.y - shooting.vy * 7);
      ctx.stroke();
      if (shooting.life > 45) shooting = null;
    }
  }
}

function animStars(now) {
  drawStars(now);
  requestAnimationFrame(animStars);
}
if (reduceMotion) drawStars(0); else requestAnimationFrame(animStars);

/* ── Barre de progression ────────────────────────────────────── */
const progressBar = document.getElementById('progress-bar');

function updateProgress() {
  const scrolled = window.scrollY;
  const total    = document.documentElement.scrollHeight - window.innerHeight;
  const pct      = total > 0 ? (scrolled / total) * 100 : 0;
  progressBar.style.width = pct + '%';
  progressBar.setAttribute('aria-valuenow', Math.round(pct));
}
window.addEventListener('scroll', updateProgress, { passive: true });

/* ── Nav opacité au scroll ────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ── Ambient light scroll-driven ─────────────────────────────── */
const ambientLight = document.getElementById('ambient-light');
const SECTION_COLORS = [
  'rgba(79,70,229,.13)',
  'rgba(200,65,46,.10)',
  'rgba(67,56,202,.12)',
  'rgba(79,70,229,.13)',
  'rgba(55,48,163,.10)',
  'rgba(99,102,241,.11)',
  'rgba(79,70,229,.09)',
  'rgba(55,48,163,.10)',
  'rgba(79,70,229,.08)',
  'rgba(55,48,163,.09)',
];
const sectionIds = ['hero','rivages','presentation','competences','projets','stages','veille','perspectives','documents','contact'];

function updateAmbient() {
  const scrollY = window.scrollY + window.innerHeight * 0.4;
  let activeIdx = 0;
  sectionIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) activeIdx = i;
  });
  const c    = SECTION_COLORS[activeIdx] || SECTION_COLORS[0];
  const yPos = 10 + (activeIdx / (sectionIds.length - 1)) * 80;
  ambientLight.style.background =
    `radial-gradient(ellipse 70% 60% at 50% ${yPos}%, ${c} 0%, transparent 70%)`;
}
window.addEventListener('scroll', updateAmbient, { passive: true });
updateAmbient();

/* ── Dot-nav synchronisation ─────────────────────────────────── */
const dotItems   = document.querySelectorAll('.dot-nav-item');
const dotTargets = Array.from(dotItems).map(d => d.getAttribute('href').slice(1));

function updateDotNav() {
  const scrollY = window.scrollY + window.innerHeight * 0.35;
  let activeIdx = 0;
  dotTargets.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) activeIdx = i;
  });
  dotItems.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
}
window.addEventListener('scroll', updateDotNav, { passive: true });
updateDotNav();

/* ── IntersectionObserver — fade-in ──────────────────────────── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ── RGPD banner ─────────────────────────────────────────────── */
const rgpdBanner = document.getElementById('rgpd-banner');
const rgpdClose  = document.getElementById('rgpd-close');

if (rgpdBanner && !localStorage.getItem('rgpd-ok')) {
  setTimeout(() => rgpdBanner.classList.add('visible'), 1200);
}
if (rgpdClose) {
  rgpdClose.addEventListener('click', () => {
    rgpdBanner.classList.remove('visible');
    localStorage.setItem('rgpd-ok', '1');
  });
}

/* ── Modal fiches projet ─────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const fichesDataEl = document.getElementById('fiches-data');
const fichesData = fichesDataEl ? JSON.parse(fichesDataEl.textContent) : {};

const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const modalContent = document.getElementById('modal-content');

let lastFocus = null;

function openModal(projectKey) {
  const d = fichesData[projectKey];
  if (!d) return;

  const liItems = (d.realise || []).map(r => `<li>${escHtml(r)}</li>`).join('');
  const tagHtml = (d.tags || []).map(t => `<span class="modal-tag">${escHtml(t)}</span>`).join('');
  const githubHtml = d.github
    ? `<a class="modal-github" href="${escHtml(d.github)}" target="_blank" rel="noopener">[ GitHub ] →</a>`
    : '';

  // Une rubrique absente de la fiche n'affiche pas de titre vide.
  const section = (titre, texte) => texte ? `<h3>${titre}</h3><p>${escHtml(texte)}</p>` : '';

  modalContent.innerHTML = `
    <p class="modal-type">${escHtml(d.type)}</p>
    <h2 id="modal-title">${escHtml(d.titre)}</h2>
    ${section('Contexte', d.contexte)}
    ${section('Mon rôle', d.role)}
    ${liItems ? `<h3>Ce que j'ai réalisé</h3><ul>${liItems}</ul>` : ''}
    ${section('Obstacle rencontré', d.obstacle)}
    ${section('Résultat', d.resultat)}
    <h3>Technologies</h3>
    <div class="modal-tags">${tagHtml}</div>
    ${githubHtml}
  `;

  lastFocus = document.activeElement;
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  if (!modalOverlay.classList.contains('open')) return;
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll('.btn-fiche').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.project));
});

/* veille.html et tibillet.html chargent ce script sans markup de modale. */
if (modalOverlay && modalClose) {
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!modalOverlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {                                  // le focus reste dans la fiche ouverte
      const f = modalOverlay.querySelectorAll('a[href], button');
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ── Logo gemme — attraction magnétique + éclat au clic (idée D) ─ */
(function initNavGem() {
  const svg   = document.getElementById('nav-gem-svg');
  const gem   = document.getElementById('nav-gem');
  const burst = document.getElementById('nav-gem-burst');
  if (!svg || !gem || !burst) return;                       // autres pages : on ignore
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // accessibilité

  const NS = 'http://www.w3.org/2000/svg';
  let gx = 100, gy = 100, vx = 0, vy = 0;                   // position/vitesse de la gemme
  let px = -999, py = -999;                                 // position curseur (repère SVG)

  function toViewBox(clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const vb   = svg.viewBox.baseVal;
    return {
      x: (clientX - rect.left) / rect.width  * vb.width,
      y: (clientY - rect.top)  / rect.height * vb.height,
    };
  }

  svg.addEventListener('mousemove', e => { const p = toViewBox(e.clientX, e.clientY); px = p.x; py = p.y; });
  svg.addEventListener('mouseleave', () => { px = -999; py = -999; });

  svg.addEventListener('click', e => {
    const p = toViewBox(e.clientX, e.clientY);
    spawnBurst(p.x, p.y);
    const dx = gx - p.x, dy = gy - p.y;
    const d  = Math.hypot(dx, dy) || 1;
    vx += (dx / d) * 16;                                    // la gemme est repoussée par le clic
    vy += (dy / d) * 16;
  });

  function spawnBurst(x, y) {
    burst.innerHTML = '';
    burst.setAttribute('opacity', '1');
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const line  = document.createElementNS(NS, 'line');
      line.setAttribute('x1', x); line.setAttribute('y1', y);
      line.setAttribute('x2', x); line.setAttribute('y2', y);
      line.setAttribute('stroke', '#a5b4fc');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linecap', 'round');
      burst.appendChild(line);
      let t = 0;
      (function(l, a) {
        function step() {
          t += 0.06;
          const len = t * 30;
          l.setAttribute('x2', x + Math.cos(a) * len);
          l.setAttribute('y2', y + Math.sin(a) * len);
          l.setAttribute('stroke-opacity', Math.max(0, 1 - t));
          if (t < 1) requestAnimationFrame(step);
          else l.remove();
        }
        requestAnimationFrame(step);
      })(line, angle);
    }
  }

  (function tick() {
    vx += (100 - gx) * 0.04;                                // ressort vers le centre (100,100)
    vy += (100 - gy) * 0.04;
    if (px > 0) {                                           // attraction magnétique vers le curseur
      const dx = px - gx, dy = py - gy;
      const d  = Math.hypot(dx, dy);
      if (d < 80 && d > 0) {
        const f = (1 - d / 80) * 2.4;
        vx += (dx / d) * f;
        vy += (dy / d) * f;
      }
    }
    vx *= 0.82; vy *= 0.82;                                 // friction
    gx += vx;   gy += vy;
    const floatY = Math.sin(Date.now() / 900) * 4;          // léger flottement permanent
    gem.style.transform = `translate(${gx - 100}px, ${gy - 100 + floatY}px)`;
    requestAnimationFrame(tick);
  })();
})();
