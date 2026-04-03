// Fade-in au scroll via IntersectionObserver
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // une seule fois
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

// Déclencher immédiatement le hero (visible au chargement)
window.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  if (hero) hero.classList.add('visible');
});
