/* ============================================
   AURELIA Identity Generator v2.0 — script.js
   Zero Backend | Client-Side | Static System
   © 2026 AURELIA. All rights reserved.
============================================ */

/* ══════════════════════════════════════════
   CORE: checkURLState()
   الوظيفة الأولى — تحديد حالة التشغيل
══════════════════════════════════════════ */
function checkURLState() {
  const hash = window.location.hash;
  if (hash.startsWith('#data=')) {
    const encoded = hash.slice(6);
    const data = decodeData(encoded);
    if (data) {
      renderIdentity(data);
    } else {
      alert('رابط غير صالح. يرجى إنشاء هوية جديدة.');
      window.location.href = window.location.pathname;
    }
  } else {
    document.getElementById('formMode').style.display = 'block';
    initForm();
  }
}

/* ══════════════════════════════════════════
   CORE: encodeData(data)
   تحويل JSON → Base64 → URL
══════════════════════════════════════════ */
function encodeData(data) {
  try {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    console.error('Encode error:', e);
    return '';
  }
}

/* ══════════════════════════════════════════
   CORE: decodeData(hash)
   URL Base64 → JSON → Object
══════════════════════════════════════════ */
function decodeData(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch (e) {
    console.error('Decode error:', e);
    return null;
  }
}

/* ══════════════════════════════════════════
   CORE: collectFormData()
   جمع بيانات النموذج وبناء JSON Object
   Schema يطابق المواصفة حرفياً
══════════════════════════════════════════ */
function collectFormData() {
  return {
    profileImage: photoBase64 || '',
    fullName:     fieldVal('f-name'),
    title:        fieldVal('f-title'),
    location:     fieldVal('f-location'),
    bio:          fieldVal('f-bio'),
    socials: {
      whatsapp: fieldVal('f-wa'),
      email:    fieldVal('f-email'),
      x:        fieldVal('f-x'),
      linkedin: fieldVal('f-li'),
      website:  fieldVal('f-web'),
      phone:    fieldVal('f-phone'),
    },
    services: [
      { title: fieldVal('s1-title'), description: fieldVal('s1-desc') },
      { title: fieldVal('s2-title'), description: fieldVal('s2-desc') },
      { title: fieldVal('s3-title'), description: fieldVal('s3-desc') },
    ].filter(s => s.title.trim()),
    projects: [
      { image: projectImage[0] || '', name: fieldVal('p1-name'), description: fieldVal('p1-desc') },
      { image: projectImage[1] || '', name: fieldVal('p2-name'), description: fieldVal('p2-desc') },
      { image: projectImage[2] || '', name: fieldVal('p3-name'), description: fieldVal('p3-desc') },
    ].filter(p => p.name.trim()),
  };
}

/* ══════════════════════════════════════════
   CORE: generateIdentityLink()
   بناء الرابط النهائي وتنفيذ الانتقال
══════════════════════════════════════════ */
function generateIdentityLink() {
  const data = collectFormData();

  if (!data.fullName || !data.title || !data.bio) {
    alert('يرجى ملء الحقول الإلزامية: الاسم الكامل، المسمى المهني، والنبذة');
    return;
  }

  const encoded = encodeData(data);
  if (!encoded) {
    alert('حدث خطأ أثناء معالجة البيانات. يرجى المحاولة مجدداً.');
    return;
  }

  // الانتقال إلى رابط الهوية
  window.location.hash = `data=${encoded}`;
  window.location.reload();
}

/* ══════════════════════════════════════════
   CORE: renderIdentity(data)
   عرض الهوية الكاملة من JSON Object
══════════════════════════════════════════ */
function renderIdentity(data) {
  document.getElementById('formMode').style.display = 'none';
  document.getElementById('viewMode').style.display = 'block';

  /* — الاسم والمسمى والنبذة — */
  setText('v-name',  data.fullName || '—');
  setText('v-title', data.title    || '—');
  setText('v-bio',   data.bio      || '');

  /* — الموقع الجغرافي — */
  if (data.location) {
    const locEl = document.getElementById('v-loc');
    if (locEl) locEl.style.display = 'flex';
    setText('v-loc-text', data.location);
  }

  /* — الصورة الشخصية — */
  const photoEl = document.getElementById('v-photo');
  const fbEl    = document.getElementById('v-avatar-fb');
  if (data.profileImage) {
    photoEl.src = data.profileImage;
    photoEl.style.display = 'block';
    if (fbEl) fbEl.style.display = 'none';
  } else {
    photoEl.style.display = 'none';
    if (fbEl) {
      fbEl.style.display = 'flex';
      fbEl.textContent = (data.fullName || 'A')[0].toUpperCase();
    }
  }

  /* — الروابط الاجتماعية — */
  buildSocials(data.socials || {});

  /* — الخدمات — */
  if (data.services && data.services.length > 0) {
    document.getElementById('v-services-sec').style.display = 'block';
    document.getElementById('v-services').innerHTML =
      data.services.map(s => `
        <div class="v-svc-card reveal">
          <h3>${esc(s.title)}</h3>
          ${s.description ? `<p>${esc(s.description)}</p>` : ''}
        </div>
      `).join('');
  }

  /* — المشاريع — */
  if (data.projects && data.projects.length > 0) {
    document.getElementById('v-projects-sec').style.display = 'block';
    document.getElementById('v-projects').innerHTML =
      data.projects.map(p => `
        <div class="proj-card reveal">
          <div class="proj-thumb">
            ${p.image
              ? `<img src="${esc(p.image)}" alt="${esc(p.name)}"
                      onerror="this.parentElement.innerHTML='<div class=proj-ph>📁</div>'" />`
              : `<div class="proj-ph">📁</div>`}
          </div>
          <div class="proj-body">
            <h3>${esc(p.name)}</h3>
            ${p.description ? `<p>${esc(p.description)}</p>` : ''}
          </div>
        </div>
      `).join('');
  }

  /* — بطاقات التواصل — */
  buildContactCards(data.socials || {});

  /* — زر المشاركة — */
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const toast = document.getElementById('toast');
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      });
    });
  }

  /* — تأثير الظهور التدريجي — */
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 70);
    });
  }, 150);
}

/* ══════════════════════════════════════════
   PHOTO UPLOAD — الصورة الشخصية
   قسم: Upload → Canvas → Base64 (داخل الرابط)
══════════════════════════════════════════ */
let photoBase64   = '';
let projectImage  = ['', '', ''];

function initUpload() {
  setupProfileUpload();
  setupProjectUploads();
}

function setupProfileUpload() {
  const input = document.getElementById('f-photo');
  const btn   = document.getElementById('uploadBtn');
  const img   = document.getElementById('uploadImg');
  const ph    = document.getElementById('uploadPlaceholder');
  if (!input) return;

  btn.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('الصورة أكبر من 2MB — يرجى اختيار صورة أصغر');
      return;
    }
    readAndCompress(file, 400, 0.75, (b64) => {
      photoBase64 = b64;
      img.src     = b64;
      img.style.display = 'block';
      if (ph) ph.style.display = 'none';
      btn.textContent = 'تغيير الصورة';
    });
  });
}

function setupProjectUploads() {
  [1, 2, 3].forEach(n => {
    const input = document.getElementById(`p${n}-img-file`);
    if (!input) return;
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      readAndCompress(file, 600, 0.75, (b64) => {
        projectImage[n - 1] = b64;
        const preview = document.getElementById(`p${n}-img-preview`);
        if (preview) { preview.src = b64; preview.style.display = 'block'; }
      });
    });
    const btn = document.getElementById(`p${n}-img-btn`);
    if (btn) btn.addEventListener('click', () => input.click());
  });
}

function readAndCompress(file, maxSize, quality, callback) {
  const reader = new FileReader();
  reader.onload = (e) => compressImage(e.target.result, maxSize, quality, callback);
  reader.readAsDataURL(file);
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

/* ══════════════════════════════════════════
   FORM INIT
══════════════════════════════════════════ */
function initForm() {
  initUpload();
  const form = document.getElementById('identityForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      generateIdentityLink();
    });
  }
}

/* ══════════════════════════════════════════
   SOCIALS BUILDER
══════════════════════════════════════════ */
function buildSocials(s) {
  const wrap   = document.getElementById('v-socials');
  const ctaWrap = document.getElementById('v-cta-wrap');
  if (!wrap) return;

  const links = [];
  if (s.phone)    links.push({ href: `tel:${s.phone}`,                                      icon: phoneIcon(), label: 'اتصال' });
  if (s.whatsapp) links.push({ href: `https://wa.me/${s.whatsapp.replace(/\D/g,'')}`,       icon: waIcon(),    label: 'واتساب' });
  if (s.email)    links.push({ href: `mailto:${s.email}`,                                    icon: emailIcon(), label: 'البريد' });
  if (s.x)        links.push({ href: `https://x.com/${s.x.replace('@','')}`,                icon: xIcon(),     label: 'X' });
  if (s.linkedin) links.push({ href: s.linkedin.startsWith('http') ? s.linkedin : `https://${s.linkedin}`, icon: liIcon(), label: 'LinkedIn' });
  if (s.website)  links.push({ href: s.website,                                              icon: webIcon(),   label: 'الموقع' });

  wrap.innerHTML = links.map(l =>
    `<a href="${esc(l.href)}" target="_blank" class="social-btn">
       ${l.icon}<span>${l.label}</span>
     </a>`
  ).join('');

  if (ctaWrap) {
    const primary = s.whatsapp
      ? { href: `https://wa.me/${s.whatsapp.replace(/\D/g,'')}?text=مرحباً،%20وجدت%20هويتك%20الرقمية%20وأريد%20التواصل`, label: '💬 تواصل معي الآن' }
      : s.email
      ? { href: `mailto:${s.email}`, label: '✉ راسلني الآن' }
      : null;

    ctaWrap.innerHTML = primary
      ? `<a href="${esc(primary.href)}" target="_blank" class="cta-btn">${primary.label}</a>`
      : '';
  }
}

/* ══════════════════════════════════════════
   CONTACT CARDS BUILDER
══════════════════════════════════════════ */
function buildContactCards(s) {
  const wrap = document.getElementById('v-contacts');
  if (!wrap) return;
  let html = '';
  if (s.whatsapp) html += contactCard(waIcon(),    'واتساب',            `+${s.whatsapp.replace(/\D/g,'')}`,  `https://wa.me/${s.whatsapp.replace(/\D/g,'')}`, true);
  if (s.email)    html += contactCard(emailIcon(), 'البريد الإلكتروني', s.email,                             `mailto:${s.email}`);
  if (s.x)        html += contactCard(xIcon(),     'X / Twitter',       `@${s.x.replace('@','')}`,           `https://x.com/${s.x.replace('@','')}`);
  if (s.linkedin) html += contactCard(liIcon(),    'LinkedIn',          s.linkedin,                          s.linkedin.startsWith('http') ? s.linkedin : `https://${s.linkedin}`);
  if (s.website)  html += contactCard(webIcon(),   'الموقع الإلكتروني', s.website,                           s.website);
  if (s.phone)    html += contactCard(phoneIcon(), 'الهاتف',            s.phone,                             `tel:${s.phone}`);
  wrap.innerHTML = html;
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function fieldVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

/* ══════════════════════════════════════════
   SVG ICONS
══════════════════════════════════════════ */
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

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
checkURLState();
