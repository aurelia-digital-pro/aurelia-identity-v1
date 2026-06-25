/* ============================================
   AURELIA Identity Generator v2.0 — script.js
   © 2026 AURELIA. All rights reserved.
============================================ */

/* ══ ENCODE / DECODE ══════════════════════ */
function encode(obj) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  } catch { return ''; }
}

function decode(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch { return null; }
}

/* ══ DETECT MODE ═══════════════════════════ */
const hash = window.location.hash;
const dataParam = hash.startsWith('#data=') ? hash.slice(6) : null;

if (dataParam) {
  showIdentity(dataParam);
} else {
  document.getElementById('formMode').style.display = 'block';
  initForm();
}

/* ══ PHOTO UPLOAD ═══════════════════════════ */
let photoBase64 = '';

function initUpload() {
  const input = document.getElementById('f-photo');
  const btn   = document.getElementById('uploadBtn');
  const box   = document.getElementById('uploadBox');
  const img   = document.getElementById('uploadImg');
  const ph    = document.getElementById('uploadPlaceholder');

  if (!input) return;

  btn.addEventListener('click', () => input.click());
  box.addEventListener('click', (e) => { if (e.target === box) input.click(); });

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('الصورة أكبر من 2MB — يرجى اختيار صورة أصغر');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      compressImage(e.target.result, 400, 0.75, (compressed) => {
        photoBase64 = compressed;
        img.src = compressed;
        img.style.display = 'block';
        ph.style.display = 'none';
        btn.textContent = 'تغيير الصورة';
      });
    };
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl, maxSize, quality, callback) {
  const canvas = document.createElement('canvas');
  const image  = new Image();
  image.onload = () => {
    let w = image.width, h = image.height;
    if (w > maxSize || h > maxSize) {
      if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
      else       { w = Math.round(w * maxSize / h); h = maxSize; }
    }
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(image, 0, 0, w, h);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  image.src = dataUrl;
}

/* ══ FORM MODE ══════════════════════════════ */
function initForm() {
  initUpload();
  const form = document.getElementById('identityForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = v('f-name');
    const title = v('f-title');
    const bio = v('f-bio');

    if (!name || !title || !bio) {
      alert('يرجى ملء الحقول الإلزامية: الاسم، المسمى، والنبذة');
      return;
    }

    const data = {
      name,
      title,
      location: v('f-location'),
      photo: photoBase64,
      bio,
      wa: v('f-wa'),
      email: v('f-email'),
      x: v('f-x'),
      li: v('f-li'),
      web: v('f-web'),
      phone: v('f-phone'),
      services: [
        { title: v('s1-title'), desc: v('s1-desc') },
        { title: v('s2-title'), desc: v('s2-desc') },
        { title: v('s3-title'), desc: v('s3-desc') },
      ].filter(s => s.title),
      projects: [
        { name: v('p1-name'), img: v('p1-img'), desc: v('p1-desc'), link: v('p1-link') },
        { name: v('p2-name'), img: v('p2-img'), desc: v('p2-desc'), link: v('p2-link') },
        { name: v('p3-name'), img: v('p3-img'), desc: v('p3-desc'), link: v('p3-link') },
      ].filter(p => p.name),
    };

    const encoded = encode(data);
    const url = `${location.origin}${location.pathname}#data=${encoded}`;

    // Go to identity view
    location.hash = `data=${encoded}`;
    location.reload();
  });
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ══ IDENTITY VIEW MODE ═════════════════════ */
function showIdentity(encoded) {
  const data = decode(encoded);
  if (!data) {
    alert('رابط غير صالح. يرجى إنشاء هوية جديدة.');
    location.href = 'index.html';
    return;
  }

  document.getElementById('formMode').style.display = 'none';
  document.getElementById('viewMode').style.display = 'block';

  // Name & Title
  set('v-name', data.name || '—');
  set('v-title', data.title || '—');
  set('v-bio', data.bio || '');

  // Location
  if (data.location) {
    document.getElementById('v-loc').style.display = 'flex';
    set('v-loc-text', data.location);
  }

  // Photo
  const photoEl = document.getElementById('v-photo');
  const fbEl = document.getElementById('v-avatar-fb');
  if (data.photo) {
    photoEl.src = data.photo;
    photoEl.style.display = 'block';
    fbEl.style.display = 'none';
  } else {
    photoEl.style.display = 'none';
    fbEl.style.display = 'flex';
    fbEl.textContent = (data.name || 'A')[0];
  }

  // Socials
  const socials = document.getElementById('v-socials');
  const ctaWrap = document.getElementById('v-cta-wrap');
  socials.innerHTML = '';
  ctaWrap.innerHTML = '';

  const links = [];
  if (data.phone) links.push({ href: `tel:${data.phone}`, icon: phoneIcon(), label: 'اتصال' });
  if (data.wa)    links.push({ href: `https://wa.me/${data.wa.replace(/\D/g,'')}`, icon: waIcon(), label: 'واتساب' });
  if (data.email) links.push({ href: `mailto:${data.email}`, icon: emailIcon(), label: 'البريد' });
  if (data.x)     links.push({ href: `https://x.com/${data.x.replace('@','')}`, icon: xIcon(), label: 'X' });
  if (data.li)    links.push({ href: data.li.startsWith('http') ? data.li : `https://${data.li}`, icon: liIcon(), label: 'LinkedIn' });
  if (data.web)   links.push({ href: data.web, icon: webIcon(), label: 'الموقع' });

  links.forEach(l => {
    const a = document.createElement('a');
    a.href = l.href;
    a.target = '_blank';
    a.className = 'social-btn';
    a.innerHTML = `${l.icon}<span>${l.label}</span>`;
    socials.appendChild(a);
  });

  // Primary CTA (WhatsApp first, then email)
  const primary = data.wa
    ? { href: `https://wa.me/${data.wa.replace(/\D/,'')}?text=مرحباً،%20وجدت%20هويتك%20الرقمية%20وأريد%20التواصل`, label: '💬 تواصل معي الآن' }
    : data.email
    ? { href: `mailto:${data.email}`, label: '✉ راسلني الآن' }
    : null;

  if (primary) {
    const btn = document.createElement('a');
    btn.href = primary.href;
    btn.target = '_blank';
    btn.className = 'cta-btn';
    btn.textContent = primary.label;
    ctaWrap.appendChild(btn);
  }

  // Services
  if (data.services && data.services.length) {
    document.getElementById('v-services-sec').style.display = 'block';
    const grid = document.getElementById('v-services');
    grid.innerHTML = data.services.map(s => `
      <div class="v-svc-card">
        <h3>${esc(s.title)}</h3>
        ${s.desc ? `<p>${esc(s.desc)}</p>` : ''}
      </div>
    `).join('');
  }

  // Projects
  if (data.projects && data.projects.length) {
    document.getElementById('v-projects-sec').style.display = 'block';
    const grid = document.getElementById('v-projects');
    grid.innerHTML = data.projects.map(p => `
      <div class="proj-card">
        <div class="proj-thumb">
          ${p.img
            ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" onerror="this.parentElement.innerHTML='<div class=proj-ph>📁</div>'" />`
            : `<div class="proj-ph">📁</div>`}
        </div>
        <div class="proj-body">
          <h3>${esc(p.name)}</h3>
          ${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
          ${p.link ? `<a href="${esc(p.link)}" target="_blank" class="proj-link">عرض ←</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Contact cards
  const contacts = document.getElementById('v-contacts');
  contacts.innerHTML = '';
  if (data.wa) {
    contacts.innerHTML += contactCard(
      waIcon(), 'واتساب',
      `+${data.wa.replace(/\D/g,'')}`,
      `https://wa.me/${data.wa.replace(/\D/g,'')}`,
      true
    );
  }
  if (data.email) contacts.innerHTML += contactCard(emailIcon(), 'البريد الإلكتروني', data.email, `mailto:${data.email}`);
  if (data.x) contacts.innerHTML += contactCard(xIcon(), 'X / Twitter', `@${data.x.replace('@','')}`, `https://x.com/${data.x.replace('@','')}`);
  if (data.li) contacts.innerHTML += contactCard(liIcon(), 'LinkedIn', data.li, data.li.startsWith('http') ? data.li : `https://${data.li}`);
  if (data.web) contacts.innerHTML += contactCard(webIcon(), 'الموقع الإلكتروني', data.web, data.web);
  if (data.phone) contacts.innerHTML += contactCard(phoneIcon(), 'الهاتف', data.phone, `tel:${data.phone}`);

  // Share button
  document.getElementById('shareBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(location.href).then(() => {
      const t = document.getElementById('toast');
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    });
  });

  // Scroll reveal
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 80);
    });
  }, 100);
}

/* ══ HELPERS ════════════════════════════════ */
function set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function contactCard(icon, label, text, href, primary = false) {
  return `
    <a href="${esc(href)}" target="_blank" class="contact-card ${primary ? 'primary' : ''} reveal">
      <div class="cc-icon">${icon}</div>
      <div>
        <h4>${label}</h4>
        <span>${esc(text)}</span>
        ${primary ? '<em>الأسرع استجابةً</em>' : ''}
      </div>
    </a>`;
}

/* ══ SVG ICONS ══════════════════════════════ */
function waIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
}
function xIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
}
function emailIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
}
function phoneIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.63 1.12 2 2 0 012.62 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l.98-.98a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;
}
function liIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`;
}
function webIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`;
}
