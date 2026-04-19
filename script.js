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

/* ── Canvas particules losanges ─────────────────────────────── */
const canvas = document.getElementById('canvas-bg');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PARTICLE_COUNT = 55;
const particles = [];

function randBetween(a, b) { return a + Math.random() * (b - a); }

class Particle {
  constructor() { this.reset(true); }

  reset(init) {
    this.x      = randBetween(0, canvas.width);
    this.y      = init ? randBetween(0, canvas.height) : canvas.height + 10;
    this.size   = randBetween(2, 5);
    this.speedX = randBetween(-0.3, 0.3);
    this.speedY = randBetween(-0.6, -0.15);
    this.alpha  = randBetween(0.08, 0.35);
    this.fadeDir   = Math.random() > .5 ? 1 : -1;
    this.fadeDelta = randBetween(0.002, 0.006);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha += this.fadeDelta * this.fadeDir;
    if (this.alpha > .35 || this.alpha < .05) this.fadeDir *= -1;
    if (this.y < -10) this.reset(false);
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#818cf8';
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function animParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animParticles);
}
animParticles();

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
  'rgba(99,102,241,.10)',
  'rgba(67,56,202,.12)',
  'rgba(79,70,229,.13)',
  'rgba(55,48,163,.10)',
  'rgba(99,102,241,.11)',
  'rgba(79,70,229,.09)',
  'rgba(55,48,163,.10)',
  'rgba(79,70,229,.08)',
];
const sectionIds = ['hero','presentation','stages','projets','competences','veille','perspectives','documents','contact'];

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

function openModal(projectKey) {
  const d = fichesData[projectKey];
  if (!d) return;

  const liItems = d.realise.map(r => `<li>${escHtml(r)}</li>`).join('');
  const tagHtml = d.tags.map(t => `<span class="modal-tag">${escHtml(t)}</span>`).join('');
  const compHtml = d.competences.map(c => `<li>${escHtml(c)}</li>`).join('');
  const githubHtml = d.github
    ? `<a class="modal-github" href="${escHtml(d.github)}" target="_blank" rel="noopener">[ GitHub ] →</a>`
    : '';

  modalContent.innerHTML = `
    <p class="modal-type">${escHtml(d.type)}</p>
    <h2 id="modal-title">${escHtml(d.titre)}</h2>
    <h3>Contexte</h3>
    <p>${escHtml(d.contexte)}</p>
    <h3>Mon rôle</h3>
    <p>${escHtml(d.role)}</p>
    <h3>Ce que j'ai réalisé</h3>
    <ul>${liItems}</ul>
    <h3>Obstacle rencontré</h3>
    <p>${escHtml(d.obstacle)}</p>
    <h3>Résultat</h3>
    <p>${escHtml(d.resultat)}</p>
    <h3>Compétences E5</h3>
    <ul>${compHtml}</ul>
    <h3>Technologies</h3>
    <div class="modal-tags">${tagHtml}</div>
    ${githubHtml}
  `;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.btn-fiche').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.project));
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
