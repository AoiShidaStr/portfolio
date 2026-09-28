/* ================================================================
   PORTFOLIO — MEVEN HOARAU TECHER — fiches projet
   ================================================================ */

const fiches = JSON.parse(document.getElementById('fiches-data').textContent);
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalContent = document.getElementById('modal-content');
let lastFocus = null;

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Une rubrique absente de la fiche n'affiche pas de titre vide.
const bloc = (titre, texte) => texte ? `<h3>${titre}</h3><p>${esc(texte)}</p>` : '';

function openFiche(key) {
  const d = fiches[key];
  if (!d) return;
  const items = (d.realise || []).map(r => `<li>${esc(r)}</li>`).join('');

  modalContent.innerHTML = `
    <p class="modal-type">${esc(d.type)}</p>
    <h2 id="modal-title">${esc(d.titre)}</h2>
    ${bloc('Contexte', d.contexte)}
    ${bloc('Mon rôle', d.role)}
    ${items ? `<h3>Ce que j'ai réalisé</h3><ul>${items}</ul>` : ''}
    ${bloc('Obstacle rencontré', d.obstacle)}
    ${bloc('Résultat', d.resultat)}
    ${bloc('Technologies', (d.tags || []).join(' · '))}
    ${d.github ? `<a class="modal-github" href="${esc(d.github)}" target="_blank" rel="noopener">Voir sur GitHub<span class="sr-only"> (nouvel onglet)</span></a>` : ''}
  `;

  lastFocus = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeFiche() {
  if (!modal.classList.contains('open')) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll('[data-project]').forEach(btn => {
  btn.addEventListener('click', () => openFiche(btn.dataset.project));
});
modalClose.addEventListener('click', closeFiche);
modal.addEventListener('click', e => { if (e.target === modal) closeFiche(); });

document.addEventListener('keydown', e => {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') closeFiche();
  if (e.key === 'Tab') {                                    // le focus reste dans la fiche ouverte
    const f = modal.querySelectorAll('a[href], button');
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
