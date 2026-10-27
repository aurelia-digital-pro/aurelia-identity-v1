/* ============================================
   AURELIA Identity Generator v2.0 — script.js
   Zero Backend | Client-Side | Static System
   © 2026 AURELIA. All rights reserved.
============================================ */

const STORAGE_KEY = 'aurelia-identity-v1-current';
let photoBase64 = '';
let projectImage = ['', '', ''];
let currentIdentityData = null;
let isSaving = false;

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('show');
  toast.classList.toggle('error', !!isError);
  void toast.offsetWidth;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function normalizeIdentityData(data) {
  if (!data || typeof data !== 'object') return null;

  const normalized = {
    profileImage: typeof data.profileImage === 'string' ? data.profileImage : '',
    fullName: typeof data.fullName === 'string' ? data.fullName.trim() : '',
    title: typeof data.title === 'string' ? data.title.trim() : '',
    location: typeof data.location === 'string' ? data.location.trim() : '',
    bio: typeof data.bio === 'string' ? data.bio.trim() : '',
    socials: {
      whatsapp: data.socials && typeof data.socials.whatsapp === 'string' ? data.socials.whatsapp.trim() : '',
      email: data.socials && typeof data.socials.email === 'string' ? data.socials.email.trim() : '',
      x: data.socials && typeof data.socials.x === 'string' ? data.socials.x.trim() : '',
      linkedin: data.socials && typeof data.socials.linkedin === 'string' ? data.socials.linkedin.trim() : '',
      website: data.socials && typeof data.socials.website === 'string' ? data.socials.website.trim() : '',
      phone: data.socials && typeof data.socials.phone === 'string' ? data.socials.phone.trim() : '',
    },
    services: Array.isArray(data.services) ? data.services.filter(Boolean).map((service) => ({
      title: service && typeof service.title === 'string' ? service.title.trim() : '',
      description: service && typeof service.description === 'string' ? service.description.trim() : '',
    })).filter((service) => service.title || service.description) : [],
    projects: Array.isArray(data.projects) ? data.projects.filter(Boolean).map((project) => ({
      image: project && typeof project.image === 'string' ? project.image : '',
      name: project && typeof project.name === 'string' ? project.name.trim() : '',
      description: project && typeof project.description === 'string' ? project.description.trim() : '',
    })).filter((project) => project.name || project.image || project.description) : []
  };

  const projectSlots = Array.from({ length: 3 }, (_, idx) => (normalized.projects[idx] || {}));
  const cleanProjects = projectSlots.map((project) => ({
    image: project.image || '',
    name: project.name || '',
    description: project.description || ''
  }));

  normalized.projects = cleanProjects;
  normalized.services = normalized.services.slice(0, 3);
  return normalized;
}

function persistIdentityState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Local storage unavailable:', error);
  }
}

function readLocalIdentityState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeIdentityData(JSON.parse(raw));
  } catch (error) {
    console.warn('Failed to read local identity data:', error);
    return null;
  }
}

function encodeData(data) {
  try {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    console.error('Encode error:', e);
    return '';
  }
}

function decodeData(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch (e) {
    console.error('Decode error:', e);
    return null;
  }
}

function getIdentityFromHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#data=')) return null;
  const encoded = hash.slice(6);
  const data = decodeData(encoded);
  if (!data) return null;
  return normalizeIdentityData(data);
}

function checkURLState() {
  const existingHashData = getIdentityFromHash();
  if (existingHashData) {
    currentIdentityData = existingHashData;
    persistIdentityState(existingHashData);
    renderIdentity(existingHashData);
    return;
  }

  const savedIdentity = readLocalIdentityState();
  if (savedIdentity) {
    currentIdentityData = savedIdentity;
    renderIdentity(savedIdentity);
    return;
  }

  const formMode = document.getElementById('formMode');
  const viewMode = document.getElementById('viewMode');
  if (formMode) formMode.style.display = 'block';
  if (viewMode) viewMode.style.display = 'none';
  initForm();
}

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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function collectFormData() {
  return normalizeIdentityData({
    profileImage: photoBase64 || '',
    fullName: fieldVal('f-name'),
    title: fieldVal('f-title'),
    location: fieldVal('f-location'),
    bio: fieldVal('f-bio'),
    socials: {
      whatsapp: fieldVal('f-wa'),
      email: fieldVal('f-email'),
      x: fieldVal('f-x'),
      linkedin: fieldVal('f-li'),
      website: fieldVal('f-web'),
      phone: fieldVal('f-phone')
    },
    services: [
      { title: fieldVal('s1-title'), description: fieldVal('s1-desc') },
      { title: fieldVal('s2-title'), description: fieldVal('s2-desc') },
      { title: fieldVal('s3-title'), description: fieldVal('s3-desc') }
    ],
    projects: [
      { image: projectImage[0] || '', name: fieldVal('p1-name'), description: fieldVal('p1-desc') },
      { image: projectImage[1] || '', name: fieldVal('p2-name'), description: fieldVal('p2-desc') },
      { image: projectImage[2] || '', name: fieldVal('p3-name'), description: fieldVal('p3-desc') }
    ]
  });
}

function updateHashFromData(data) {
  const encoded = encodeData(data);
  if (!encoded) {
    showToast('حدث خطأ أثناء إنشاء الرابط. حاول مرة أخرى.', true);
    return false;
  }

  window.location.hash = `data=${encoded}`;
  currentIdentityData = data;
  persistIdentityState(data);
  return true;
}

function saveIdentityAndRender(data) {
  if (!data || typeof data !== 'object') return false;
  const normalized = normalizeIdentityData(data);
  if (!normalized) return false;

  if (!normalized.fullName || !normalized.title || !normalized.bio) {
    showToast('يرجى ملء الاسم الكامل، المسمى المهني، والنص المختصر.', true);
    return false;
  }

  currentIdentityData = normalized;
  persistIdentityState(normalized);
  if (!updateHashFromData(normalized)) return false;
  renderIdentity(normalized);
  showToast('تم حفظ الهوية بنجاح');
  return true;
}

function generateIdentityLink() {
  const data = collectFormData();
  if (!data.fullName || !data.title || !data.bio) {
    showToast('يرجى ملء الحقول الإلزامية: الاسم الكامل، المسمى المهني، والنبذة.', true);
    return;
  }

  if (isSaving) return;
  isSaving = true;

  const submitBtn = document.querySelector('#identityForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const saved = saveIdentityAndRender(data);
    if (!saved) {
      showToast('لم يتم حفظ الهوية. حاول مرة أخرى.', true);
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    isSaving = false;
  }
}

function showFormMode(preloadedData = null) {
  const formMode = document.getElementById('formMode');
  const viewMode = document.getElementById('viewMode');
  if (formMode) formMode.style.display = 'block';
  if (viewMode) viewMode.style.display = 'none';
  initForm();
  if (preloadedData) {
    hydrateFormFromData(preloadedData);
  }
}

function openEditor() {
  const data = currentIdentityData || readLocalIdentityState() || getIdentityFromHash() || {};
  showFormMode(data);
  hydrateFormFromData(data);
}

function hydrateFormFromData(data) {
  const identity = normalizeIdentityData(data || currentIdentityData || {});
  if (!identity) return;

  const fieldMap = {
    'f-name': identity.fullName,
    'f-title': identity.title,
    'f-location': identity.location,
    'f-bio': identity.bio,
    'f-wa': identity.socials.whatsapp,
    'f-phone': identity.socials.phone,
    'f-email': identity.socials.email,
    'f-x': identity.socials.x,
    'f-li': identity.socials.linkedin,
    'f-web': identity.socials.website
  };

  Object.entries(fieldMap).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (el) el.value = value || '';
  });

  const serviceMap = [
    ['s1-title', identity.services[0] && identity.services[0].title],
    ['s1-desc', identity.services[0] && identity.services[0].description],
    ['s2-title', identity.services[1] && identity.services[1].title],
    ['s2-desc', identity.services[1] && identity.services[1].description],
    ['s3-title', identity.services[2] && identity.services[2].title],
    ['s3-desc', identity.services[2] && identity.services[2].description]
  ];

  serviceMap.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  });

  const projectSlots = Array.from({ length: 3 }, (_, index) => identity.projects[index] || {});
  projectSlots.forEach((project, index) => {
    const preview = document.getElementById(`p${index + 1}-img-preview`);
    const fileInput = document.getElementById(`p${index + 1}-img-file`);
    if (preview) {
      if (project.image) {
        preview.src = project.image;
        preview.style.display = 'block';
      } else {
        preview.removeAttribute('src');
        preview.style.display = 'none';
      }
    }
    if (fileInput) fileInput.value = '';
    projectImage[index] = project.image || '';

    const nameEl = document.getElementById(`p${index + 1}-name`);
    const descEl = document.getElementById(`p${index + 1}-desc`);
    if (nameEl) nameEl.value = project.name || '';
    if (descEl) descEl.value = project.description || '';
  });

  if (identity.profileImage) {
    photoBase64 = identity.profileImage;
    const uploadImg = document.getElementById('uploadImg');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadBtn = document.getElementById('uploadBtn');
    const removeBtn = document.getElementById('removePhotoBtn');
    if (uploadImg) {
      uploadImg.src = identity.profileImage;
      uploadImg.style.display = 'block';
    }
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
    if (uploadBtn) uploadBtn.textContent = 'تغيير الصورة';
    if (removeBtn) removeBtn.hidden = false;
  } else {
    photoBase64 = '';
    const uploadImg = document.getElementById('uploadImg');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadBtn = document.getElementById('uploadBtn');
    const removeBtn = document.getElementById('removePhotoBtn');
    if (uploadImg) {
      uploadImg.removeAttribute('src');
      uploadImg.style.display = 'none';
    }
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
    if (uploadBtn) uploadBtn.textContent = 'اختيار الصورة';
    if (removeBtn) removeBtn.hidden = true;
  }

  const bioEl = document.getElementById('f-bio');
  const counterEl = document.getElementById('bio-count');
  if (bioEl && counterEl) {
    const length = bioEl.value.length;
    counterEl.textContent = `${length} / 180 حرف`;
    counterEl.style.color = length > 160 ? '#c0392b' : '';
  }
}

function renderIdentity(data) {
  const normalized = normalizeIdentityData(data || currentIdentityData || {});
  if (!normalized) return;

  const formMode = document.getElementById('formMode');
  const viewMode = document.getElementById('viewMode');
  if (formMode) formMode.style.display = 'none';
  if (viewMode) viewMode.style.display = 'grid';
  startClocks();

  setText('v-name', normalized.fullName || '—');
  setText('v-title', normalized.title || '—');
  setText('v-bio', normalized.bio || '');

  const locEl = document.getElementById('v-loc');
  if (normalized.location) {
    if (locEl) locEl.style.display = 'flex';
    setText('v-loc-text', normalized.location);
  } else if (locEl) {
    locEl.style.display = 'none';
  }

  const photoEl = document.getElementById('v-photo');
  const fbEl = document.getElementById('v-avatar-fb');
  if (normalized.profileImage) {
    photoEl.src = normalized.profileImage;
    photoEl.style.display = 'block';
    if (fbEl) fbEl.style.display = 'none';
  } else {
    photoEl.style.display = 'none';
    if (fbEl) {
      fbEl.style.display = 'flex';
      fbEl.textContent = (normalized.fullName || 'A')[0].toUpperCase();
    }
  }

  buildSocials(normalized.socials || {});
  renderServicesStrip(normalized.services);
  renderProjectsStrip(normalized.projects);
  buildContactCards(normalized.socials || {});

  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (copyLinkBtn) {
    copyLinkBtn.onclick = () => {
      const link = window.location.href;
      navigator.clipboard.writeText(link).then(() => {
        showToast('تم نسخ رابط الهوية');
      }).catch(() => {
        showToast('تعذر النسخ تلقائياً. انسخ الرابط يدويًا.', true);
      });
    };
  }

  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.onclick = () => openEditor();
  }

  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 70);
    });
  }, 150);
}

function validateImageFile(file) {
  if (!file) return false;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(file.type)) {
    showToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP.', true);
    return false;
  }
  if (file.size > 4 * 1024 * 1024) {
    showToast('حجم الصورة كبير جدًا. اختر صورة أصغر من 4MB.', true);
    return false;
  }
  return true;
}

function readAndCompress(file, maxSize, quality, callback) {
  const reader = new FileReader();
  reader.onload = (e) => compressImage(e.target.result, maxSize, quality, callback);
  reader.readAsDataURL(file);
}

function compressImage(dataUrl, maxSize, quality, callback) {
  const canvas = document.createElement('canvas');
  const image = new Image();

  image.onload = () => {
    let width = image.width;
    let height = image.height;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      callback(dataUrl);
      return;
    }

    ctx.drawImage(image, 0, 0, width, height);
    callback(canvas.toDataURL('image/jpeg', quality));
  };

  image.onerror = () => {
    callback(dataUrl);
  };

  image.src = dataUrl;
}

function clearProfilePhoto() {
  photoBase64 = '';
  const uploadImg = document.getElementById('uploadImg');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const uploadBtn = document.getElementById('uploadBtn');
  const removeBtn = document.getElementById('removePhotoBtn');

  if (uploadImg) {
    uploadImg.removeAttribute('src');
    uploadImg.style.display = 'none';
  }
  if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
  if (uploadBtn) uploadBtn.textContent = 'اختيار الصورة';
  if (removeBtn) removeBtn.hidden = true;
  showToast('تم حذف صورة الملف الشخصي');
}

function setupProfileUpload() {
  const input = document.getElementById('f-photo');
  const btn = document.getElementById('uploadBtn');
  const removeBtn = document.getElementById('removePhotoBtn');
  const img = document.getElementById('uploadImg');
  const placeholder = document.getElementById('uploadPlaceholder');

  if (!input || !btn) return;

  btn.addEventListener('click', () => input.click());

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      input.value = '';
      clearProfilePhoto();
    });
  }

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!validateImageFile(file)) {
      input.value = '';
      return;
    }

    readAndCompress(file, 1200, 0.82, (b64) => {
      photoBase64 = b64;
      if (img) {
        img.src = b64;
        img.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';
      if (removeBtn) removeBtn.hidden = false;
      btn.textContent = 'تغيير الصورة';
      showToast('تم اختيار الصورة بنجاح');
    });
  });
}

function setupProjectUploads() {
  [1, 2, 3].forEach((n) => {
    const input = document.getElementById(`p${n}-img-file`);
    const btn = document.getElementById(`p${n}-img-btn`);
    if (!input || !btn) return;

    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (!validateImageFile(file)) {
        input.value = '';
        return;
      }

      readAndCompress(file, 800, 0.82, (b64) => {
        projectImage[n - 1] = b64;
        const preview = document.getElementById(`p${n}-img-preview`);
        if (preview) {
          preview.src = b64;
          preview.style.display = 'block';
        }
      });
    });
  });
}

function initUpload() {
  setupProfileUpload();
  setupProjectUploads();
}

function initForm() {
  initUpload();

  const bioEl = document.getElementById('f-bio');
  const countEl = document.getElementById('bio-count');
  if (bioEl && countEl) {
    bioEl.addEventListener('input', () => {
      const len = bioEl.value.length;
      countEl.textContent = `${len} / 180 حرف`;
      countEl.style.color = len > 160 ? '#c0392b' : '';
    });
  }

  const form = document.getElementById('identityForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      generateIdentityLink();
    });
  }

  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', () => {
      const data = collectFormData();
      if (!data.fullName && !data.title && !data.bio && !data.profileImage) {
        showToast('لا توجد بيانات لحفظها.', true);
        return;
      }
      const saved = saveIdentityAndRender(data);
      if (saved) {
        const formMode = document.getElementById('formMode');
        const viewMode = document.getElementById('viewMode');
        if (formMode) formMode.style.display = 'none';
        if (viewMode) viewMode.style.display = 'grid';
      }
    });
  }

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const formEl = document.getElementById('identityForm');
      if (formEl) formEl.reset();
      photoBase64 = '';
      projectImage = ['', '', ''];
      const uploadImg = document.getElementById('uploadImg');
      const uploadPlaceholder = document.getElementById('uploadPlaceholder');
      const removeBtn = document.getElementById('removePhotoBtn');
      if (uploadImg) {
        uploadImg.removeAttribute('src');
        uploadImg.style.display = 'none';
      }
      if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
      if (removeBtn) removeBtn.hidden = true;
      ['p1-img-preview', 'p2-img-preview', 'p3-img-preview'].forEach((id) => {
        const preview = document.getElementById(id);
        if (preview) {
          preview.removeAttribute('src');
          preview.style.display = 'none';
        }
      });
      showToast('تم مسح الحقول الحالية');
    });
  }

  const downloadBtn = document.getElementById('downloadJsonBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const data = collectFormData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aurelia-identity.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تصدير ملف JSON');
    });
  }

  const importBtn = document.getElementById('importJsonBtn');
  const importInput = document.getElementById('importJsonInput');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', () => {
      const file = importInput.files && importInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = normalizeIdentityData(JSON.parse(String(event.target.result || '{}')));
          if (!imported) throw new Error('Bad JSON');
          hydrateFormFromData(imported);
          currentIdentityData = imported;
          persistIdentityState(imported);
          showToast('تم استيراد الهوية بنجاح');
        } catch (error) {
          console.error('Import error:', error);
          showToast('ملف JSON غير صالح.', true);
        }
      };
      reader.readAsText(file);
    });
  }
}

function buildSocials(s) {
  const wrap = document.getElementById('v-socials');
  const ctaWrap = document.getElementById('v-cta-wrap');
  if (!wrap) return;

  const links = [];
  if (s.phone) links.push({ href: `tel:${s.phone}`, icon: phoneIcon(), label: 'اتصال' });
  if (s.whatsapp) links.push({ href: `https://wa.me/${s.whatsapp.replace(/\D/g, '')}`, icon: waIcon(), label: 'واتساب' });
  if (s.email) links.push({ href: `mailto:${s.email}`, icon: emailIcon(), label: 'البريد' });
  if (s.x) links.push({ href: `https://x.com/${s.x.replace('@', '')}`, icon: xIcon(), label: 'X' });
  if (s.linkedin) links.push({ href: s.linkedin.startsWith('http') ? s.linkedin : `https://${s.linkedin}`, icon: liIcon(), label: 'LinkedIn' });
  if (s.website) links.push({ href: s.website, icon: webIcon(), label: 'الموقع' });

  wrap.innerHTML = links.map((l) => `
    <a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer" class="social-btn">
      ${l.icon}<span>${l.label}</span>
    </a>
  `).join('');

  if (ctaWrap) {
    const primary = s.whatsapp
      ? { href: `https://wa.me/${s.whatsapp.replace(/\D/g, '')}?text=مرحباً،%20وجدت%20هويتك%20الرقمية%20وأريد%20التواصل`, label: '💬 تواصل معي الآن' }
      : s.email
        ? { href: `mailto:${s.email}`, label: '✉ راسلني الآن' }
        : null;

    ctaWrap.innerHTML = primary ? `<a href="${esc(primary.href)}" target="_blank" rel="noopener noreferrer" class="cta-btn">${primary.label}</a>` : '';
  }
}

function buildContactCards(s) {
  const wrap = document.getElementById('v-contacts');
  if (!wrap) return;
  let html = '';
  if (s.whatsapp) html += contactCard(waIcon(), 'واتساب', `+${s.whatsapp.replace(/\D/g, '')}`, `https://wa.me/${s.whatsapp.replace(/\D/g, '')}`, true);
  if (s.email) html += contactCard(emailIcon(), 'البريد الإلكتروني', s.email, `mailto:${s.email}`);
  if (s.x) html += contactCard(xIcon(), 'X / Twitter', `@${s.x.replace('@', '')}`, `https://x.com/${s.x.replace('@', '')}`);
  if (s.linkedin) html += contactCard(liIcon(), 'LinkedIn', s.linkedin, s.linkedin.startsWith('http') ? s.linkedin : `https://${s.linkedin}`);
  if (s.website) html += contactCard(webIcon(), 'الموقع الإلكتروني', s.website, s.website);
  if (s.phone) html += contactCard(phoneIcon(), 'الهاتف', s.phone, `tel:${s.phone}`);
  wrap.innerHTML = html;
}

function contactCard(icon, label, text, href, primary = false) {
  return `
    <a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="contact-card ${primary ? 'primary' : ''} reveal">
      <div class="cc-icon">${icon}</div>
      <div>
        <h4>${label}</h4>
        <span>${esc(text)}</span>
        ${primary ? '<em>الأسرع استجابةً</em>' : ''}
      </div>
    </a>`;
}

function renderServicesStrip(services) {
  const col = document.getElementById('v-services-col');
  const wrap = document.getElementById('v-services');
  if (!col || !wrap || !services || !services.length) return;
  col.style.display = 'block';
  wrap.innerHTML = services.map((service) => `
    <div class="strip-card reveal">
      <strong>${esc(service.title || '')}</strong>
      ${service.description ? `<p>${esc(service.description)}</p>` : ''}
    </div>
  `).join('');
}

function renderProjectsStrip(projects) {
  const col = document.getElementById('v-projects-col');
  const wrap = document.getElementById('v-projects');
  if (!col || !wrap || !projects || !projects.length) return;
  col.style.display = 'block';
  wrap.innerHTML = projects.map((project) => `
    <div class="strip-card reveal">
      ${project.image ? `<img src="${esc(project.image)}" class="proj-strip-thumb" alt="${esc(project.name || 'Project')}" onerror="this.style.display='none'" />` : ''}
      <strong>${esc(project.name || '')}</strong>
      ${project.description ? `<p>${esc(project.description)}</p>` : ''}
    </div>
  `).join('');
}

function startClocks() {
  function updateClocks() {
    const now = new Date();

    const tn = now.toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Tunis',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const ny = now.toLocaleTimeString('en-GB', {
      timeZone: 'America/New_York',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const tnEl = document.getElementById('clock-tn');
    const nyEl = document.getElementById('clock-ny');
    if (tnEl) tnEl.textContent = tn;
    if (nyEl) nyEl.textContent = ny;
  }

  updateClocks();
  if (!startClocks.timer) {
    startClocks.timer = window.setInterval(updateClocks, 1000);
  }
}

function waIcon() { return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.2...` }
function xIcon() { return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.5...` }
function emailIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 7 12 13 2 7"/></svg>`; }
function phoneIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.63 4.68 2 2 0 014.6 2h3a2 2 0 012 1.72c.13 1.1.44 2.15.93 3.17.25.5.02 1.08-.46 1.32l-1.43 1.26a16 16 0 008.29 8.29l1.26-1.43c.24-.48.82-.71 1.32-.46.98.48 2.07.8 3.17.93A2 2 0 0122 16.92z"/></svg>`; }
function liIcon() { return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`; }
function webIcon() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 01 4-10z"/></svg>`; }

window.addEventListener('hashchange', () => {
  const hashData = getIdentityFromHash();
  if (hashData) {
    currentIdentityData = hashData;
    renderIdentity(hashData);
  }
});

checkURLState();
