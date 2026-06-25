/* ============================================
   AURELIA Identity — script.js
   © 2026 Foued Sendi. All rights reserved.
============================================ */

/* ── NAV SCROLL ─────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ── ACTIVE NAV LINK ─────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
function setActiveNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + height);
  });
}
window.addEventListener('scroll', setActiveNav);

/* ── REVEAL ON SCROLL ────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

/* ── COUNTER ANIMATION ───────────────────── */
const counters = document.querySelectorAll('.stat-num');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 28);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

/* ── SKILL BAR FILL ──────────────────────── */
const fills = document.querySelectorAll('.fill');
const fillObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.style.width;
      fillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
fills.forEach(f => fillObs.observe(f));

/* ── AVATAR TILT ─────────────────────────── */
const avatar = document.getElementById('avatar');
if (avatar) {
  avatar.addEventListener('mousemove', (e) => {
    const rect = avatar.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    avatar.style.transform = `perspective(400px) rotateY(${x}deg) rotateX(${y}deg) scale(1.04)`;
  });
  avatar.addEventListener('mouseleave', () => {
    avatar.style.transform = '';
  });
}

/* ── SMOOTH SCROLL ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── CARD GLOW ───────────────────────────── */
document.querySelectorAll('.service-card, .offer-card, .proj-card, .testi-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
  });
});

/* ── CTA PULSE (WhatsApp) ────────────────── */
const waBtns = document.querySelectorAll('a[href*="wa.me"]');
waBtns.forEach(btn => {
  setInterval(() => {
    btn.style.transform = 'scale(1.03)';
    setTimeout(() => { btn.style.transform = ''; }, 300);
  }, 4000);
});
