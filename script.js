/* ============================================
   AURELIA Identity — script.js (Light Edition)
   © 2026 Foued Sendi. All rights reserved.
============================================ */

/* ── NAV SHADOW ON SCROLL ────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('shadow', window.scrollY > 30);
}, { passive: true });

/* ── ACTIVE NAV LINK ─────────────────────── */
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a[href^="#"]');
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  sections.forEach(sec => {
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (!link) return;
    link.classList.toggle('active', y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight);
  });
}, { passive: true });

/* ── MOBILE NAV TOGGLE ───────────────────── */
const toggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (toggle) {
  toggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '60px';
    navLinks.style.right = '0';
    navLinks.style.left = '0';
    navLinks.style.background = 'rgba(254,252,248,.98)';
    navLinks.style.padding = '1rem';
    navLinks.style.borderBottom = '1px solid #e8e2d6';
    navLinks.style.backdropFilter = 'blur(16px)';
    navLinks.style.zIndex = '999';
  });
}

/* ── REVEAL ON SCROLL ────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revObs.observe(el));

/* ── COUNTER ANIMATION ───────────────────── */
const counters = document.querySelectorAll('.stat-num[data-target]');
const cntObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    let cur = 0;
    const step = Math.ceil(target / 50);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(t);
    }, 30);
    cntObs.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => cntObs.observe(c));

/* ── SMOOTH SCROLL ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navLinks) navLinks.style.display = '';
    }
  });
});

/* ── CARD HOVER LIFT (touch-safe) ────────── */
document.querySelectorAll('.proj-card,.about-card,.feature').forEach(card => {
  card.addEventListener('mouseenter', () => card.style.willChange = 'transform');
  card.addEventListener('mouseleave', () => card.style.willChange = '');
});
