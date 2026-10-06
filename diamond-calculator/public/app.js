const fmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 4 });
const money = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const els = {
  cutGrid: document.getElementById("cut-grid"),
  cutImage: document.getElementById("cut-image"),
  cutName: document.getElementById("cut-name"),
  sizeSelect: document.getElementById("size-select"),
  qtyInput: document.getElementById("qty-input"),
  priceInput: document.getElementById("price-input"),
  unitCarat: document.getElementById("unit-carat"),
  totalCarat: document.getElementById("total-carat"),
  totalPrice: document.getElementById("total-price"),
  meta: document.getElementById("meta"),
};

let data = null;
let selectedCutId = null;

function selectedCut() {
  return data?.cuts?.find((c) => c.id === selectedCutId) || null;
}

function selectedSize() {
  const cut = selectedCut();
  if (!cut) return null;
  const idx = Number(els.sizeSelect.value);
  return cut.sizes[idx] || null;
}

function renderCuts() {
  els.cutGrid.innerHTML = "";
  for (const cut of data.cuts) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cut-card";
    btn.dataset.cutId = cut.id;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", String(cut.id === selectedCutId));
    btn.title = cut.nameEn || cut.name;

    const img = document.createElement("img");
    img.src = cut.image || "";
    img.alt = cut.name;
    img.loading = "lazy";

    const span = document.createElement("span");
    span.textContent = cut.name;

    btn.append(img, span);
    btn.addEventListener("click", () => selectCut(cut.id));
    els.cutGrid.append(btn);
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

  let pick = Math.floor(cut.sizes.length / 2);
  const nearOne = cut.sizes.findIndex((s) => Math.abs(s.carat - 1) < 0.08);
  if (nearOne >= 0) pick = nearOne;
  els.sizeSelect.value = String(pick);
}

function selectCut(id) {
  selectedCutId = id;
  const cut = selectedCut();
  if (!cut) return;

  els.cutName.textContent = cut.name;
  els.cutImage.src = cut.image || "";
  els.cutImage.alt = cut.name;
  els.meta.textContent = `${cut.sizeCount} ölçü · kaynak: diamondsizecharts.com`;

  for (const btn of els.cutGrid.querySelectorAll(".cut-card")) {
    btn.setAttribute("aria-selected", String(btn.dataset.cutId === cut.id));
  }

  renderSizes();
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

async function boot() {
  const res = await fetch("./data/diamonds.json");
  if (!res.ok) throw new Error("Veri yüklenemedi");
  data = await res.json();
  selectedCutId = data.cuts[0]?.id;
  renderCuts();
  selectCut(selectedCutId);

  els.sizeSelect.addEventListener("change", recalculate);
  els.qtyInput.addEventListener("input", recalculate);
  els.priceInput.addEventListener("input", recalculate);
}

boot().catch((err) => {
  els.cutName.textContent = "Veri yüklenemedi";
  els.meta.textContent = String(err);
  console.error(err);
});
