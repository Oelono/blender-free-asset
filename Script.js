/* =========================================================
   Vaultframe — front-end logic
   Products are loaded from data/products.json, which is the
   single file Decap CMS edits (see admin/config.yml).
   ========================================================= */

const state = {
  products: [],
  activeCategory: "All",
  query: "",
};

const grid = document.getElementById("product-grid");
const emptyState = document.getElementById("empty-state");
const resultsCount = document.getElementById("results-count");
const searchInput = document.getElementById("search-input");
const chipsWrap = document.getElementById("category-chips");

document.getElementById("year").textContent = new Date().getFullYear();

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
  resultsCount.textContent = items.length
    ? `${items.length} asset${items.length === 1 ? "" : "s"}`
    : "";

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
        <div class="text-xs text-[var(--ink-dim)] mb-1.5">${escapeHtml(p.category || "")}</div>
        <h3 class="font-semibold leading-snug mb-1.5">${escapeHtml(p.title)}</h3>
        <p class="text-sm text-[var(--ink-dim)] line-clamp-2 mb-4">${escapeHtml(p.description || "")}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-[var(--ink-dim)]">${escapeHtml(p.fileSize || "")}</span>
          <button data-download-id="${escapeAttr(p.id)}" class="btn-primary text-xs px-4 py-2 rounded-md">Download</button>
        </div>
      </div>
    </article>
  `;
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
  modalHint.textContent = "A sponsor page opens in a new tab to keep this library free.";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";

  startCountdown();
}

function startCountdown() {
  let remaining = COUNTDOWN_SECONDS;
  unlockLabel.textContent = `Unlocking in ${remaining}s…`;

  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    remaining -= 1;
    const progress = 1 - remaining / COUNTDOWN_SECONDS;
    unlockRingProgress.style.strokeDashoffset = `${RING_CIRCUMFERENCE * progress}`;

    if (remaining <= 0) {
      clearInterval(countdownTimer);
      unlockBtn.disabled = false;
      unlockLabel.textContent = "Unlock download link";
    } else {
      unlockLabel.textContent = `Unlocking in ${remaining}s…`;
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
  modalHint.textContent = "Your file is ready — the link opens Google Drive.";
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

loadProducts();
