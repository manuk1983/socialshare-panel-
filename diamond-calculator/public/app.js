import { CUT_DESCRIPTIONS } from "./cut-descriptions.js";

const PRICES_KEY = "diamonds-carat-prices-v1";

const fmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 4 });
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const els = {
  tabCalc: document.getElementById("tab-calc"),
  tabInfo: document.getElementById("tab-info"),
  viewCalc: document.getElementById("view-calc"),
  viewInfo: document.getElementById("view-info"),
  pageTitle: document.getElementById("page-title"),
  pageLede: document.getElementById("page-lede"),
  cutGrid: document.getElementById("cut-grid"),
  infoCutGrid: document.getElementById("info-cut-grid"),
  cutImage: document.getElementById("cut-image"),
  cutName: document.getElementById("cut-name"),
  sizeSelect: document.getElementById("size-select"),
  qtyInput: document.getElementById("qty-input"),
  priceInput: document.getElementById("price-input"),
  unitCarat: document.getElementById("unit-carat"),
  totalCarat: document.getElementById("total-carat"),
  totalPrice: document.getElementById("total-price"),
  meta: document.getElementById("meta"),
  excelInput: document.getElementById("excel-input"),
  btnDownloadTemplate: document.getElementById("btn-download-template"),
  importStatus: document.getElementById("import-status"),
  modal: document.getElementById("cut-info-modal"),
  modalCutName: document.getElementById("modal-cut-name"),
  modalCutImage: document.getElementById("modal-cut-image"),
  modalCutDesc: document.getElementById("modal-cut-desc"),
  modalSizeSelect: document.getElementById("modal-size-select"),
  dimDiagram: document.getElementById("dim-diagram"),
  dimList: document.getElementById("dim-list"),
};

let data = null;
let selectedCutId = null;
let modalCutId = null;
let priceEditTimer = null;

function priceKey(cutId, sizeIndex) {
  return `${cutId}|${sizeIndex}`;
}

function loadPrices() {
  try {
    return JSON.parse(localStorage.getItem(PRICES_KEY) || "{}");
  } catch {
    return {};
  }
}

function savePrices(all) {
  localStorage.setItem(PRICES_KEY, JSON.stringify(all));
}

function getStoredPrice(cutId, sizeIndex) {
  const v = loadPrices()[priceKey(cutId, sizeIndex)];
  return v != null && Number(v) > 0 ? Number(v) : null;
}

function persistCurrentPrice() {
  const cut = selectedCut();
  if (!cut) return;
  const idx = Number(els.sizeSelect.value);
  const raw = els.priceInput.value.trim();
  const all = loadPrices();
  const key = priceKey(cut.id, idx);
  if (raw === "" || !Number.isFinite(Number(raw))) {
    delete all[key];
  } else {
    all[key] = Number(raw);
  }
  savePrices(all);
}

function applyStoredPrice() {
  const cut = selectedCut();
  if (!cut) return;
  const idx = Number(els.sizeSelect.value);
  const stored = getStoredPrice(cut.id, idx);
  els.priceInput.value = stored != null ? String(stored) : "";
}

function selectedCut() {
  return data?.cuts?.find((c) => c.id === selectedCutId) || null;
}

function selectedSize() {
  const cut = selectedCut();
  if (!cut) return null;
  const idx = Number(els.sizeSelect.value);
  return cut.sizes[idx] || null;
}

function cutCard(cut, { selectedId, onClick }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cut-card";
  btn.dataset.cutId = cut.id;
  btn.setAttribute("role", "option");
  btn.setAttribute("aria-selected", String(cut.id === selectedId));
  btn.title = cut.nameEn || cut.name;

  const img = document.createElement("img");
  img.src = cut.image || "";
  img.alt = cut.name;
  img.loading = "lazy";

  const span = document.createElement("span");
  span.textContent = cut.name;

  btn.append(img, span);
  btn.addEventListener("click", () => onClick(cut.id));
  return btn;
}

function renderCuts() {
  els.cutGrid.innerHTML = "";
  for (const cut of data.cuts) {
    els.cutGrid.append(
      cutCard(cut, { selectedId: selectedCutId, onClick: selectCut })
    );
  }
}

function renderInfoCuts() {
  els.infoCutGrid.innerHTML = "";
  for (const cut of data.cuts) {
    // Clicks handled via delegation on #info-cut-grid (more reliable than per-card listeners)
    const card = cutCard(cut, { selectedId: null, onClick: () => {} });
    card.removeAttribute("role");
    card.setAttribute("type", "button");
    card.setAttribute("aria-haspopup", "dialog");
    els.infoCutGrid.append(card);
  }
}

function renderSizes() {
  const cut = selectedCut();
  els.sizeSelect.innerHTML = "";
  if (!cut) return;

  cut.sizes.forEach((size, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = size.label;
    els.sizeSelect.append(opt);
  });

  if (cut.id === "round") {
    els.sizeSelect.value = "0";
  } else {
    let pick = Math.floor(cut.sizes.length / 2);
    const nearOne = cut.sizes.findIndex((s) => Math.abs(s.carat - 1) < 0.08);
    if (nearOne >= 0) pick = nearOne;
    els.sizeSelect.value = String(pick);
  }
}

function selectCut(id) {
  selectedCutId = id;
  const cut = selectedCut();
  if (!cut) return;

  els.cutName.textContent = cut.name;
  els.cutImage.src = cut.image || "";
  els.cutImage.alt = cut.name;
  els.meta.textContent = `${cut.sizeCount} ölçü · fiyatlar tarayıcıda saklanır`;

  for (const btn of els.cutGrid.querySelectorAll(".cut-card")) {
    btn.setAttribute("aria-selected", String(btn.dataset.cutId === cut.id));
  }

  renderSizes();
  applyStoredPrice();
  recalculate();
}

function recalculate() {
  const size = selectedSize();
  const qty = Math.max(0, Number(els.qtyInput.value) || 0);
  const price = Number(els.priceInput.value);

  if (!size) {
    els.unitCarat.textContent = "—";
    els.totalCarat.textContent = "—";
    els.totalPrice.textContent = "—";
    return;
  }

  const unit = size.carat;
  const totalCt = unit * qty;
  els.unitCarat.textContent = `${fmt.format(unit)} ct`;
  els.totalCarat.textContent = `${fmt.format(totalCt)} ct`;

  if (!Number.isFinite(price) || els.priceInput.value === "") {
    els.totalPrice.textContent = "—";
  } else {
    els.totalPrice.textContent = money.format(totalCt * price);
  }
}

function onSizeChange() {
  const cut = selectedCut();
  if (!cut) return;
  const prevIdx = Number(
    els.sizeSelect.dataset.prevIndex ?? els.sizeSelect.value
  );
  const all = loadPrices();
  const raw = els.priceInput.value.trim();
  const keyPrev = priceKey(cut.id, prevIdx);
  if (raw === "" || !Number.isFinite(Number(raw))) delete all[keyPrev];
  else all[keyPrev] = Number(raw);
  savePrices(all);
  els.sizeSelect.dataset.prevIndex = els.sizeSelect.value;
  applyStoredPrice();
  recalculate();
}

function onPriceInput() {
  clearTimeout(priceEditTimer);
  priceEditTimer = setTimeout(() => {
    persistCurrentPrice();
    recalculate();
  }, 300);
}

function switchTab(which) {
  const calc = which === "calc";
  els.tabCalc.classList.toggle("active", calc);
  els.tabInfo.classList.toggle("active", !calc);
  els.tabCalc.setAttribute("aria-selected", String(calc));
  els.tabInfo.setAttribute("aria-selected", String(!calc));
  els.viewCalc.classList.toggle("hidden", !calc);
  els.viewCalc.hidden = !calc;
  els.viewInfo.classList.toggle("hidden", calc);
  els.viewInfo.hidden = calc;
  if (calc) {
    els.pageTitle.textContent = "Karat & Fiyat Hesaplayıcı";
    els.pageLede.textContent =
      "Kesim ve ölçü seçin, adet ile karat başına fiyat girin — toplam karat ve tutarı anında görün.";
  } else {
    els.pageTitle.textContent = "Kesim bilgileri";
    els.pageLede.textContent =
      "Kesimlere tıklayın; ölçü seçerek mm boyutlarını ve şemayı görün.";
  }
}

function getCutDims(cut, size) {
  const length = (size.mmMin + size.mmMax) / 2;
  const hasWidth = size.widthMmMin != null && size.widthMmMax != null;
  const width = hasWidth ? (size.widthMmMin + size.widthMmMax) / 2 : length;

  const depthRatio =
    cut.id === "round" || cut.id === "old-european-cut" || cut.id === "rose-cut"
      ? 0.59
      : hasWidth
        ? 0.42
        : cut.id.includes("emerald") ||
            cut.id.includes("asscher") ||
            cut.id === "baguette" ||
            cut.id.includes("baguette")
          ? 0.68
          : cut.id.includes("princess") || cut.id.includes("radiant")
            ? 0.72
            : 0.62;
  const depth = length * depthRatio;

  return {
    length,
    width,
    depth,
    lengthRange: [size.mmMin, size.mmMax],
    widthRange: hasWidth ? [size.widthMmMin, size.widthMmMax] : [size.mmMin, size.mmMax],
    hasWidth,
    depthEst: true,
    lengthLabel:
      cut.id === "round" || cut.id === "old-european-cut" || cut.id === "rose-cut"
        ? "Çap"
        : hasWidth
          ? "Uzunluk"
          : "Genişlik",
    widthLabel: hasWidth ? "Genişlik" : null,
  };
}

function measureRows(cut, size) {
  const d = getCutDims(cut, size);
  const rows = [
    {
      label: d.lengthLabel,
      min: d.lengthRange[0],
      max: d.lengthRange[1],
      est: false,
    },
  ];
  if (d.widthLabel) {
    rows.push({
      label: d.widthLabel,
      min: d.widthRange[0],
      max: d.widthRange[1],
      est: false,
    });
  }
  rows.push({
    label: "Derinlik",
    min: d.depth,
    max: d.depth,
    est: true,
  });
  return rows;
}

function fmtMmRange(min, max) {
  if (Math.abs(min - max) < 1e-9) return `${fmt.format(min)} mm`;
  return `${fmt.format(min)}–${fmt.format(max)} mm`;
}

function fmtMm(n) {
  return `${fmt.format(Number(n.toFixed(2)))} mm`;
}

/** Profile family for technical side-view schematics */
function profileKind(cutId) {
  if (
    cutId === "round" ||
    cutId === "old-european-cut" ||
    cutId === "rose-cut" ||
    cutId === "old-mine-cut"
  )
    return "brilliant";
  if (
    cutId.includes("emerald") ||
    cutId.includes("asscher") ||
    cutId === "baguette" ||
    cutId.includes("baguette") ||
    cutId === "carre-cut" ||
    cutId === "french-cut"
  )
    return "step";
  if (cutId.includes("princess") || cutId.includes("radiant") || cutId === "lucida-cut")
    return "square-brilliant";
  if (cutId === "pear-cut" || cutId.includes("marquise") || cutId === "oval-cut")
    return "elongated";
  if (cutId === "heart-cut") return "heart";
  if (cutId.includes("bullet") || cutId === "kite-cut" || cutId === "lozenge-cut")
    return "pointed";
  if (cutId === "half-moon-cut") return "halfmoon";
  if (cutId === "trilliant-cut") return "triangle";
  return "brilliant";
}

function dimTick(x1, y1, x2, y2, stroke) {
  // Perpendicular end ticks for technical dimension lines
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * 4;
  const py = (dx / len) * 4;
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2"/>
    <line x1="${x1 - px}" y1="${y1 - py}" x2="${x1 + px}" y2="${y1 + py}" stroke="${stroke}" stroke-width="1.2"/>
    <line x1="${x2 - px}" y1="${y2 - py}" x2="${x2 + px}" y2="${y2 + py}" stroke="${stroke}" stroke-width="1.2"/>
  `;
}

function stoneProfilePath(kind, left, top, right, girdleY, bottom, tableHalf) {
  const cx = (left + right) / 2;
  const tableL = cx - tableHalf;
  const tableR = cx + tableHalf;

  switch (kind) {
    case "step":
      // Angular step-cut silhouette
      return `M ${tableL} ${top}
        L ${tableR} ${top}
        L ${right - 6} ${girdleY - 4}
        L ${right} ${girdleY}
        L ${right - 4} ${girdleY + 6}
        L ${cx + 8} ${bottom}
        L ${cx - 8} ${bottom}
        L ${left + 4} ${girdleY + 6}
        L ${left} ${girdleY}
        L ${left + 6} ${girdleY - 4}
        Z`;
    case "square-brilliant":
      return `M ${tableL} ${top}
        L ${tableR} ${top}
        L ${right - 2} ${girdleY - 2}
        L ${right} ${girdleY}
        L ${cx + 10} ${bottom}
        L ${cx - 10} ${bottom}
        L ${left} ${girdleY}
        L ${left + 2} ${girdleY - 2}
        Z`;
    case "elongated":
      return `M ${tableL} ${top}
        L ${tableR} ${top}
        L ${right} ${girdleY}
        L ${cx + 6} ${bottom}
        L ${cx - 6} ${bottom}
        L ${left} ${girdleY}
        Z`;
    case "heart":
      return `M ${tableL} ${top + 4}
        Q ${cx} ${top - 2} ${tableR} ${top + 4}
        L ${right} ${girdleY}
        L ${cx} ${bottom}
        L ${left} ${girdleY}
        Z`;
    case "pointed":
      return `M ${tableL} ${top}
        L ${tableR} ${top}
        L ${right} ${girdleY}
        L ${cx} ${bottom}
        L ${left} ${girdleY}
        Z`;
    case "halfmoon":
      return `M ${left} ${top}
        L ${right} ${top}
        L ${right} ${girdleY}
        Q ${cx} ${bottom} ${left} ${girdleY}
        Z`;
    case "triangle":
      return `M ${cx} ${top}
        L ${right} ${girdleY}
        L ${cx} ${bottom}
        L ${left} ${girdleY}
        Z`;
    case "brilliant":
    default:
      // Classic round brilliant side profile
      return `M ${tableL} ${top}
        L ${tableR} ${top}
        L ${right - 4} ${girdleY - 3}
        L ${right} ${girdleY}
        L ${cx + 3} ${bottom}
        L ${cx - 3} ${bottom}
        L ${left} ${girdleY}
        L ${left + 4} ${girdleY - 3}
        Z`;
  }
}

function renderDimDiagram(cut, size, rows) {
  const dims = getCutDims(cut, size);
  const kind = profileKind(cut.id);
  const stroke = "#4a5560";
  const fill = "#e8ecf0";
  const ink = "#2d3740";
  const muted = "#6b7785";

  const svgW = 360;
  const svgH = 260;
  // Stone drawing box (leave margins for dimension callouts)
  const left = 70;
  const right = 250;
  const top = 48;
  const bottom = 200;
  const stoneW = right - left;
  const stoneH = bottom - top;
  const girdleY = top + stoneH * 0.32;
  const tableHalf = stoneW * 0.22;
  const cx = (left + right) / 2;

  const profile = stoneProfilePath(kind, left, top, right, girdleY, bottom, tableHalf);

  // Facet hints (subtle internals)
  const facets = `
    <line x1="${cx}" y1="${top}" x2="${cx}" y2="${bottom}" stroke="${stroke}" stroke-width="0.6" opacity="0.35"/>
    <line x1="${left}" y1="${girdleY}" x2="${right}" y2="${girdleY}" stroke="${stroke}" stroke-width="1" opacity="0.55"/>
    <line x1="${cx - tableHalf}" y1="${top}" x2="${left}" y2="${girdleY}" stroke="${stroke}" stroke-width="0.7" opacity="0.4"/>
    <line x1="${cx + tableHalf}" y1="${top}" x2="${right}" y2="${girdleY}" stroke="${stroke}" stroke-width="0.7" opacity="0.4"/>
    <line x1="${left}" y1="${girdleY}" x2="${cx}" y2="${bottom}" stroke="${stroke}" stroke-width="0.7" opacity="0.4"/>
    <line x1="${right}" y1="${girdleY}" x2="${cx}" y2="${bottom}" stroke="${stroke}" stroke-width="0.7" opacity="0.4"/>
  `;

  // Width / diameter dimension (above stone)
  const widthText = dims.hasWidth
    ? `${fmtMm(dims.length)} × ${fmtMm(dims.width)}`
    : fmtMmRange(dims.lengthRange[0], dims.lengthRange[1]);
  const widthCaption = dims.hasWidth
    ? "UZUNLUK × GENİŞLİK"
    : dims.lengthLabel === "Çap"
      ? "ÇAP (Ø)"
      : "GENİŞLİK";

  const widthDim = `
    ${dimTick(left, 28, right, 28, stroke)}
    <text x="${cx}" y="18" fill="${ink}" font-size="11" font-family="Outfit, sans-serif" font-weight="500" text-anchor="middle">${widthText}</text>
    <text x="${cx}" y="40" fill="${muted}" font-size="9" font-family="Outfit, sans-serif" letter-spacing="0.06em" text-anchor="middle">${widthCaption}</text>
  `;

  // Depth dimension (right side)
  const depthLabel = `${fmtMm(dims.depth)}${dims.depthEst ? " · tahmini" : ""}`;
  const depthDim = `
    ${dimTick(right + 22, top, right + 22, bottom, stroke)}
    <text x="${right + 34}" y="${(top + bottom) / 2 - 6}" fill="${ink}" font-size="11" font-family="Outfit, sans-serif" font-weight="500">${depthLabel}</text>
    <text x="${right + 34}" y="${(top + bottom) / 2 + 10}" fill="${muted}" font-size="9" font-family="Outfit, sans-serif" letter-spacing="0.06em">DERİNLİK</text>
  `;

  // Anatomy labels (like reference)
  const anatomy = `
    <circle cx="${left}" cy="${girdleY}" r="3" fill="none" stroke="${stroke}" stroke-width="1"/>
    <line x1="${left}" y1="${girdleY + 3}" x2="${left}" y2="${bottom + 28}" stroke="${stroke}" stroke-width="0.9"/>
    <text x="${left}" y="${bottom + 42}" fill="${muted}" font-size="9" font-family="Outfit, sans-serif" letter-spacing="0.08em" text-anchor="middle">GIRDLE</text>
    <circle cx="${cx}" cy="${bottom}" r="3" fill="none" stroke="${stroke}" stroke-width="1"/>
    <line x1="${cx}" y1="${bottom + 3}" x2="${cx}" y2="${bottom + 28}" stroke="${stroke}" stroke-width="0.9"/>
    <text x="${cx}" y="${bottom + 42}" fill="${muted}" font-size="9" font-family="Outfit, sans-serif" letter-spacing="0.08em" text-anchor="middle">CULET</text>
    <text x="${right + 22}" y="${top + (girdleY - top) / 2 + 3}" fill="${muted}" font-size="8" font-family="Outfit, sans-serif" letter-spacing="0.06em">CROWN</text>
    <text x="${right + 22}" y="${girdleY + (bottom - girdleY) / 2 + 3}" fill="${muted}" font-size="8" font-family="Outfit, sans-serif" letter-spacing="0.06em">PAVILION</text>
  `;

  els.dimDiagram.innerHTML = `
    <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" role="img" aria-label="Kesim boyut şeması">
      <rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#f4f6f8" rx="8"/>
      <path d="${profile}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>
      ${facets}
      ${widthDim}
      ${depthDim}
      ${anatomy}
    </svg>
  `;

  els.dimList.innerHTML = "";
  for (const row of rows) {
    const li = document.createElement("li");
    const est = row.est ? ' <span class="dim-est">(tahmini)</span>' : "";
    li.innerHTML = `<strong>${row.label}:</strong> ${fmtMmRange(row.min, row.max)}${est}`;
    els.dimList.append(li);
  }
}

function closeCutInfoModal() {
  const dialog = els.modal;
  if (!dialog) return;
  dialog.classList.remove("is-open");
  if (typeof dialog.close === "function" && dialog.open) {
    try {
      dialog.close();
    } catch {
      /* ignore */
    }
  }
  dialog.removeAttribute("open");
}

function openCutInfoModal(cutId) {
  if (!cutId || !data) return;
  modalCutId = cutId;
  const cut = data.cuts.find((c) => c.id === cutId);
  if (!cut || !els.modal) {
    console.warn("openCutInfoModal: cut or dialog missing", cutId);
    return;
  }

  els.modalCutName.textContent = cut.name;
  els.modalCutImage.src = cut.image || "";
  els.modalCutImage.alt = cut.name;
  els.modalCutDesc.textContent =
    CUT_DESCRIPTIONS[cutId] ||
    `${cut.name} kesimi hakkında özet bilgi. Ölçüler diamondsizecharts.com verisinden alınır.`;

  els.modalSizeSelect.innerHTML = "";
  cut.sizes.forEach((size, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = size.label;
    els.modalSizeSelect.append(opt);
  });
  if (cut.id === "round") els.modalSizeSelect.value = "0";

  updateModalDimensions();

  // Prefer native dialog; fall back to CSS class if showModal fails
  try {
    if (typeof els.modal.showModal === "function") {
      if (!els.modal.open) els.modal.showModal();
    } else {
      els.modal.setAttribute("open", "");
      els.modal.classList.add("is-open");
    }
  } catch (err) {
    console.warn("showModal failed, using fallback", err);
    els.modal.setAttribute("open", "");
    els.modal.classList.add("is-open");
  }
}

function updateModalDimensions() {
  const cut = data.cuts.find((c) => c.id === modalCutId);
  if (!cut) return;
  const idx = Number(els.modalSizeSelect.value);
  const size = cut.sizes[idx];
  if (!size) return;
  const rows = measureRows(cut, size);
  renderDimDiagram(cut, size, rows);
}

function buildCutLookup() {
  const byId = new Map();
  const byName = new Map();
  for (const c of data.cuts) {
    byId.set(c.id.toLowerCase(), c);
    byName.set(c.name.toLowerCase(), c);
    if (c.nameEn) byName.set(c.nameEn.toLowerCase(), c);
  }
  return { byId, byName };
}

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = row[i];
  });
  return obj;
}

function resolveCut(row, lookup) {
  const id = String(row.cut_id || row.kesim_id || row.cutid || "").trim().toLowerCase();
  if (id && lookup.byId.has(id)) return lookup.byId.get(id);
  const name = String(row.cut_name || row.kesim || row.kesim_adi || "").trim().toLowerCase();
  if (name && lookup.byName.has(name)) return lookup.byName.get(name);
  return null;
}

function findSizeIndex(cut, row) {
  if (row.size_index != null && row.size_index !== "") {
    const i = Number(row.size_index);
    if (Number.isInteger(i) && cut.sizes[i]) return i;
  }
  const label = String(row.size_label || row.olcu || row.label || "").trim();
  if (label) {
    let i = cut.sizes.findIndex((s) => s.label === label);
    if (i >= 0) return i;
    i = cut.sizes.findIndex((s) => s.label.includes(label) || label.includes(s.label));
    if (i >= 0) return i;
  }
  const mmMin = row.mm_min ?? row.mmmin;
  const mmMax = row.mm_max ?? row.mmmax;
  if (mmMin != null && mmMax != null) {
    const a = Number(mmMin);
    const b = Number(mmMax);
    const i = cut.sizes.findIndex(
      (s) => Math.abs(s.mmMin - a) < 0.02 && Math.abs(s.mmMax - b) < 0.02
    );
    if (i >= 0) return i;
  }
  return -1;
}

function parsePrice(row) {
  const raw = row.price_usd ?? row.price ?? row.fiyat ?? row.fiyat_usd;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

async function importExcel(file) {
  if (!window.XLSX) {
    els.importStatus.textContent = "Excel kütüphanesi yüklenemedi.";
    return;
  }
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (rows.length < 2) {
    els.importStatus.textContent = "Dosyada veri satırı yok.";
    return;
  }

  const headers = rows[0].map(normalizeHeader);
  const lookup = buildCutLookup();
  const all = loadPrices();
  let updated = 0;
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rowToObject(headers, rows[r]);
    const cut = resolveCut(row, lookup);
    if (!cut) {
      skipped++;
      continue;
    }
    const sizeIdx = findSizeIndex(cut, row);
    const price = parsePrice(row);
    if (sizeIdx < 0 || price == null) {
      skipped++;
      continue;
    }
    all[priceKey(cut.id, sizeIdx)] = price;
    updated++;
  }

  savePrices(all);
  applyStoredPrice();
  recalculate();
  els.importStatus.textContent = `${updated} fiyat güncellendi${skipped ? `, ${skipped} satır atlandı` : ""}.`;
}

function downloadTemplate() {
  if (!window.XLSX || !data) return;
  const round = data.cuts.find((c) => c.id === "round");
  const princess = data.cuts.find((c) => c.id === "princess-cut");
  const rows = [
    ["cut_id", "cut_name", "size_index", "size_label", "mm_min", "mm_max", "price_usd"],
    ["round", "Yuvarlak (Round)", 0, round?.sizes[0]?.label || "", 0.9, 1.1, 4500],
    ["round", "", 10, "", "", "", 5200],
    ["princess-cut", "Prenses (Princess)", 17, princess?.sizes[17]?.label || "", "", "", 4800],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "fiyatlar");
  XLSX.writeFile(wb, "diamonds-carat-fiyat-sablonu.xlsx");
}

async function boot() {
  const res = await fetch("./data/diamonds.json");
  if (!res.ok) throw new Error("Veri yüklenemedi");
  data = await res.json();
  selectedCutId = data.cuts[0]?.id;

  renderCuts();
  renderInfoCuts();
  selectCut(selectedCutId);

  els.tabCalc.addEventListener("click", () => switchTab("calc"));
  els.tabInfo.addEventListener("click", () => switchTab("info"));
  els.sizeSelect.addEventListener("focus", () => {
    els.sizeSelect.dataset.prevIndex = els.sizeSelect.value;
  });
  els.sizeSelect.addEventListener("change", onSizeChange);
  els.qtyInput.addEventListener("input", recalculate);
  els.priceInput.addEventListener("input", onPriceInput);
  els.priceInput.addEventListener("blur", () => {
    persistCurrentPrice();
    recalculate();
  });
  els.btnDownloadTemplate.addEventListener("click", downloadTemplate);
  els.excelInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importExcel(file);
    e.target.value = "";
  });
  els.modalSizeSelect.addEventListener("change", updateModalDimensions);

  // Event delegation: reliable cut → modal open on Kesim bilgileri grid
  els.infoCutGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".cut-card");
    if (!card || !els.infoCutGrid.contains(card)) return;
    e.preventDefault();
    openCutInfoModal(card.dataset.cutId);
  });

  document.getElementById("modal-close")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeCutInfoModal();
  });

  els.modal?.addEventListener("click", (e) => {
    // Click on backdrop (dialog itself, not inner content) closes
    if (e.target === els.modal) closeCutInfoModal();
  });

  els.modal?.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeCutInfoModal();
  });

  // Expose for debugging / Try Live console checks
  window.__openCutInfo = openCutInfoModal;
  window.__closeCutInfo = closeCutInfoModal;
}

boot().catch((err) => {
  els.cutName.textContent = "Veri yüklenemedi";
  els.meta.textContent = String(err);
  console.error(err);
});
