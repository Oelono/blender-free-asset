/* =========================================================
   Vaultframe — front-end logic
   Products are loaded from data/products.json, which is the
   single file Decap CMS edits (see admin/config.yml).
   ========================================================= */

const state = {
  products: [],
  activeCategory: "All",
  query: "",
  lang: "en",
};

/* =========================================================
   Translations — UI chrome only. Product titles/descriptions
   are entered once via the CMS and shown as-is in every language;
   ask if you also want per-language product fields later.
   ========================================================= */
const translations = {
  en: {
    nav_library: "Library",
    nav_how: "How it works",
    nav_browse: "Browse assets",
    search_placeholder: "Search assets — try “cyberpunk character”",
    chip_all: "All",
    chip_characters: "Characters",
    chip_environments: "Environments",
    chip_shaders: "Shaders",
    chip_animations: "Animations",
    chip_assets: "Assets",
    library_heading: "The library",
    library_sub: "Every file is inspected before it's listed. New drops weekly.",
    empty_title: "No assets match that search.",
    empty_sub: "Try a different keyword or clear the category filter.",
    how_heading: "How a download works",
    how1_title: "Pick your asset",
    how1_desc: "Browse or search the library, then open any asset's download panel to see its specs.",
    how2_title: "Unlock the link",
    how2_desc: "A short sponsor page opens in a new tab — this is what keeps the library free to run.",
    how3_title: "Grab the file",
    how3_desc: "Your Google Drive link unlocks right after — no login, no waiting rooms.",
    footer_built: "Built by Oelono.",
    footer_admin: "Admin",
    footer_top: "Back to top",
    modal_filesize_label: "File size",
    modal_engine_label: "Render engine",
    modal_license_label: "License",
    modal_drive_btn: "Open Google Drive file",
    modal_hint_default: "A sponsor page opens in a new tab to keep this library free.",
    modal_hint_ready: "Your file is ready — the link opens Google Drive.",
    unlock_unlocking: (s) => `Unlocking in ${s}s…`,
    unlock_ready: "Unlock download link",
    card_download: "Download",
    results_count: (n) => `${n} asset${n === 1 ? "" : "s"}`,
  },
  ar: {
    nav_library: "المكتبة",
    nav_how: "طريقة الاستخدام",
    nav_browse: "تصفّح الأصول",
    search_placeholder: "ابحث عن أصل — جرّب «شخصية سايبربانك»",
    chip_all: "الكل",
    chip_characters: "شخصيات",
    chip_environments: "بيئات",
    chip_shaders: "شيدرات",
    chip_animations: "أنيميشن",
    chip_assets: "أصول",
    library_heading: "المكتبة",
    library_sub: "كل ملف يتم فحصه قبل إدراجه. إضافات جديدة أسبوعيًا.",
    empty_title: "لا توجد أصول مطابقة لبحثك.",
    empty_sub: "جرّب كلمة بحث مختلفة أو ألغِ فلتر الفئة.",
    how_heading: "طريقة التحميل",
    how1_title: "اختر الأصل",
    how1_desc: "تصفّح أو ابحث في المكتبة، ثم افتح لوحة التحميل لأي أصل لمعرفة مواصفاته.",
    how2_title: "افتح الرابط",
    how2_desc: "تُفتح صفحة راعٍ قصيرة في تبويب جديد — وهذا ما يبقي المكتبة مجانية.",
    how3_title: "احصل على الملف",
    how3_desc: "رابط جوجل درايف يظهر مباشرة بعدها — بدون تسجيل دخول، وبدون انتظار.",
    footer_built: "من صنع Oelono.",
    footer_admin: "الإدارة",
    footer_top: "العودة للأعلى",
    modal_filesize_label: "حجم الملف",
    modal_engine_label: "محرك الرندر",
    modal_license_label: "الترخيص",
    modal_drive_btn: "افتح ملف جوجل درايف",
    modal_hint_default: "تُفتح صفحة راعٍ في تبويب جديد لإبقاء المكتبة مجانية.",
    modal_hint_ready: "ملفك جاهز — الرابط يفتح جوجل درايف.",
    unlock_unlocking: (s) => `فتح الرابط خلال ${s} ثوانٍ…`,
    unlock_ready: "افتح رابط التحميل",
    card_download: "تحميل",
    results_count: (n) => `${n} أصل`,
  },
  ru: {
    nav_library: "Библиотека",
    nav_how: "Как это работает",
    nav_browse: "Смотреть ассеты",
    search_placeholder: "Поиск ассетов — например, «киберпанк персонаж»",
    chip_all: "Все",
    chip_characters: "Персонажи",
    chip_environments: "Окружения",
    chip_shaders: "Шейдеры",
    chip_animations: "Анимации",
    chip_assets: "Ассеты",
    library_heading: "Библиотека",
    library_sub: "Каждый файл проверяется перед публикацией. Новинки каждую неделю.",
    empty_title: "Ничего не найдено по запросу.",
    empty_sub: "Попробуйте другое слово или сбросьте фильтр категории.",
    how_heading: "Как устроена загрузка",
    how1_title: "Выберите ассет",
    how1_desc: "Просмотрите или найдите нужный файл, затем откройте панель загрузки, чтобы увидеть его характеристики.",
    how2_title: "Откройте ссылку",
    how2_desc: "В новой вкладке откроется короткая спонсорская страница — это то, что позволяет библиотеке оставаться бесплатной.",
    how3_title: "Заберите файл",
    how3_desc: "Ссылка на Google Drive появится сразу после — без входа в аккаунт и без ожидания.",
    footer_built: "Создано Oelono.",
    footer_admin: "Админка",
    footer_top: "Наверх",
    modal_filesize_label: "Размер файла",
    modal_engine_label: "Движок рендера",
    modal_license_label: "Лицензия",
    modal_drive_btn: "Открыть файл на Google Drive",
    modal_hint_default: "Спонсорская страница откроется в новой вкладке — это поддерживает библиотеку бесплатной.",
    modal_hint_ready: "Файл готов — ссылка откроет Google Drive.",
    unlock_unlocking: (s) => `Разблокировка через ${s} с…`,
    unlock_ready: "Открыть ссылку на файл",
    card_download: "Скачать",
    results_count: (n) => `${n} ассет(ов)`,
  },
};

const categoryLabels = {
  en: { Characters: "Characters", Environments: "Environments", Shaders: "Shaders", Animations: "Animations", Assets: "Assets" },
  ar: { Characters: "شخصيات", Environments: "بيئات", Shaders: "شيدرات", Animations: "أنيميشن", Assets: "أصول" },
  ru: { Characters: "Персонажи", Environments: "Окружения", Shaders: "Шейдеры", Animations: "Анимации", Assets: "Ассеты" },
};

function t(key) {
  return (translations[state.lang] && translations[state.lang][key]) ?? translations.en[key] ?? key;
}

const grid = document.getElementById("product-grid");
const emptyState = document.getElementById("empty-state");
const resultsCount = document.getElementById("results-count");
const searchInput = document.getElementById("search-input");
const chipsWrap = document.getElementById("category-chips");

document.getElementById("year").textContent = new Date().getFullYear();

/* =========================================================
   Language switching
   ========================================================= */
const langSwitcher = document.getElementById("lang-switcher");

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (typeof val === "string") el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  langSwitcher.querySelectorAll("button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === state.lang);
  });
}

function setLanguage(lang) {
  if (!translations[lang]) lang = "en";
  state.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  try { localStorage.setItem("vaultframe-lang", lang); } catch (e) { /* ignore */ }
  applyStaticTranslations();
  render(); // re-render products so card labels / category names / counts refresh
}

langSwitcher.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-lang]");
  if (!btn) return;
  setLanguage(btn.dataset.lang);
});

function initLanguage() {
  let saved = null;
  try { saved = localStorage.getItem("vaultframe-lang"); } catch (e) { /* ignore */ }
  const browserLang = (navigator.language || "en").slice(0, 2);
  const initial = saved || (translations[browserLang] ? browserLang : "en");
  state.lang = initial;
  document.documentElement.lang = initial;
  document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
  applyStaticTranslations();
}

/* ---------- load data ---------- */
async function loadProducts() {
  renderSkeletons(6);
  try {
    const res = await fetch("data/products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load products.json");
    const json = await res.json();
    state.products = (json.products || []).filter(p => p && p.title);
  } catch (err) {
    console.error(err);
    state.products = [];
  }
  render();
}

function renderSkeletons(n) {
  grid.innerHTML = Array.from({ length: n }).map(() => `
    <div class="card rounded-xl overflow-hidden">
      <div class="skeleton h-44 w-full"></div>
      <div class="p-5 space-y-3">
        <div class="skeleton h-4 w-3/4 rounded"></div>
        <div class="skeleton h-3 w-full rounded"></div>
        <div class="skeleton h-3 w-5/6 rounded"></div>
      </div>
    </div>
  `).join("");
}

/* ---------- filtering ---------- */
function getFiltered() {
  const q = state.query.trim().toLowerCase();
  return state.products.filter(p => {
    const matchesCategory = state.activeCategory === "All" || p.category === state.activeCategory;
    const haystack = `${p.title} ${p.description} ${p.category}`.toLowerCase();
    const matchesQuery = q === "" || haystack.includes(q);
    return matchesCategory && matchesQuery;
  });
}

/* ---------- render ---------- */
function render() {
  const items = getFiltered();
  resultsCount.textContent = items.length ? t("results_count")(items.length) : "";

  if (items.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  grid.innerHTML = items.map(cardTemplate).join("");

  grid.querySelectorAll("[data-download-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = state.products.find(p => p.id === btn.dataset.downloadId);
      if (product) openModal(product);
    });
  });
}

function cardTemplate(p) {
  const thumb = p.thumbnail || "https://placehold.co/600x400/0B0C10/00F0FF?text=Vaultframe";
  return `
    <article class="card rounded-xl overflow-hidden group">
      <div class="relative h-44 overflow-hidden bg-[var(--bg-raised)]">
        <img src="${escapeAttr(thumb)}" alt="${escapeAttr(p.title)}" loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-3 left-3 flex gap-1.5">
          <span class="badge px-2 py-1 rounded">${escapeHtml(p.blenderVersion || "")}</span>
        </div>
        <div class="absolute top-3 right-3">
          <span class="badge px-2 py-1 rounded" style="border-color:rgba(157,78,221,0.4); color:#C79BFF; background:rgba(157,78,221,0.08);">${escapeHtml(p.engine || "")}</span>
        </div>
      </div>
      <div class="p-5">
        <div class="text-xs text-[var(--ink-dim)] mb-1.5">${escapeHtml(translateCategory(p.category))}</div>
        <h3 class="font-semibold leading-snug mb-1.5">${escapeHtml(p.title)}</h3>
        <p class="text-sm text-[var(--ink-dim)] line-clamp-2 mb-4">${escapeHtml(p.description || "")}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--ink-dim)]">${escapeHtml(p.fileSize || "")}</span>
          <button data-download-id="${escapeAttr(p.id)}" class="btn-primary text-xs px-4 py-2 rounded-md">${escapeHtml(t("card_download"))}</button>
        </div>
      </div>
    </article>
  `;
}

function translateCategory(cat) {
  return (categoryLabels[state.lang] && categoryLabels[state.lang][cat]) || cat || "";
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}
function escapeAttr(str = "") { return escapeHtml(str); }

/* ---------- search + chips ---------- */
searchInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

chipsWrap.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  chipsWrap.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  state.activeCategory = btn.dataset.cat;
  render();
});

/* =========================================================
   Download modal — ad-monetized unlock flow
   ========================================================= */

const modal = document.getElementById("download-modal");
const modalBadge = document.getElementById("modal-badge");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalFilesize = document.getElementById("modal-filesize");
const modalEngine = document.getElementById("modal-engine");
const modalLicense = document.getElementById("modal-license");
const unlockBtn = document.getElementById("unlock-btn");
const unlockLabel = document.getElementById("unlock-label");
const unlockRingProgress = document.getElementById("unlock-ring-progress");
const driveBtn = document.getElementById("drive-btn");
const modalHint = document.getElementById("modal-hint");
const modalClose = document.getElementById("modal-close");

const COUNTDOWN_SECONDS = 5;
const RING_CIRCUMFERENCE = 2 * Math.PI * 15.5; // matches r=15.5 in the SVG
let countdownTimer = null;
let activeProduct = null;

function openModal(product) {
  activeProduct = product;

  modalBadge.textContent = product.blenderVersion || "Blender";
  modalTitle.textContent = product.title;
  modalDesc.textContent = product.description || "";
  modalFilesize.textContent = product.fileSize || "—";
  modalEngine.textContent = product.engine || "—";
  modalLicense.textContent = product.license || "—";

  // reset state
  driveBtn.classList.add("hidden");
  driveBtn.classList.remove("flex");
  unlockBtn.classList.remove("hidden");
  unlockBtn.disabled = true;
  unlockRingProgress.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  unlockRingProgress.style.strokeDashoffset = "0";
  modalHint.textContent = t("modal_hint_default");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";

  startCountdown();
}

function startCountdown() {
  let remaining = COUNTDOWN_SECONDS;
  unlockLabel.textContent = t("unlock_unlocking")(remaining);

  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    remaining -= 1;
    const progress = 1 - remaining / COUNTDOWN_SECONDS;
    unlockRingProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE * progress}`;

    if (remaining <= 0) {
      clearInterval(countdownTimer);
      unlockBtn.disabled = false;
      unlockLabel.textContent = t("unlock_ready");
    } else {
      unlockLabel.textContent = t("unlock_unlocking")(remaining);
    }
  }, 1000);
}

unlockBtn.addEventListener("click", () => {
  if (unlockBtn.disabled || !activeProduct) return;

  // Open the monetized (Monetag/Adsterra) link in a new tab.
  const adUrl = activeProduct.monetizedLink;
  if (adUrl) window.open(adUrl, "_blank", "noopener");

  // Reveal the real Google Drive link right after.
  driveBtn.href = activeProduct.driveLink || "#";
  unlockBtn.classList.add("hidden");
  driveBtn.classList.remove("hidden");
  driveBtn.classList.add("flex");
  modalHint.textContent = t("modal_hint_ready");
});

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
  clearInterval(countdownTimer);
  activeProduct = null;
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

initLanguage();
loadProducts();
