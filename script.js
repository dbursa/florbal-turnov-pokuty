// ---- "Databáze" v JSON: soubor data.js vedle index.html, sledovaný v gitu ----

const STORAGE_KEY = "florbal-turnov-pokuty-data";

const DEFAULT_PLAYERS = [
  "Bursa Daniel",
  "Cvekl Štěpán",
  "Dědek Filip",
  "Honzák Matouš",
  "Iker Jakub",
  "Janoušek Jakub",
  "Janoušek Šimon",
  "Kořínek Viktor",
  "Kuntoš Jan",
  "Nayperk Jakub",
  "Rychtera Štěpán",
  "Stěhula Michal",
  "Šmída Jaroslav",
  "Šmída Ondřej",
  "Špetlík Jan",
  "Šťastný Jan",
  "Bulušek Štěpán",
  "Jiránek Tomáš",
  "Mlejnek Mikuláš",
  "Šafář Ondřej"
];

const FINE_CATALOG = [
  { amount: 20, label: "Nejlepší hráč zápasu" },
  { amount: 20, label: "Hattrick v zápase - asistence" },
  { amount: 20, label: "První asistence v letošní sezóně" },
  { amount: 20, label: "Vyloučení 2´" },
  { amount: 20, label: "Pozdní přihlášení/odhlášení z tréninku (půlnoc dne před tréninkem)" },
  { amount: 20, label: "Zapomenuté štulpny/ponožky v barvě (pokud se nekřekne jinak, tak v černé)" },
  { amount: 20, label: "Pozdní příchod na trénink" },
  { amount: 20, label: "Každý sedmý obdržený gól v zápase (brankář)" },
  { amount: 20, label: "Vlastní gól" },
  { amount: 20, label: "Neproměněný nájezd" },
  { amount: 20, label: "Za každý týden, co hráč nezaplatí už zapsanou pokutu v pokutníku" },

  { amount: 50, label: "První gól v sezóně" },
  { amount: 50, label: "Více jak jedno vyloučení v zápase" },
  { amount: 50, label: "Pozdní příchod na zápas" },
  { amount: 50, label: "Pozdní přihlášení/odhlášení ze zápasu (do začátku úterního tréninku)" },
  { amount: 50, label: "Vyloučení za nesportovní chování" },
  { amount: 50, label: "Zapomenutý dres na zápas" },
  { amount: 50, label: "Zapomenutý předzápasový dres (žížaly) – až budeme mít nové dresy" },
  { amount: 50, label: "Hattrick v zápase - góly" },

  { amount: 100, label: "Nejlepší střelec sezóny" },
  { amount: 100, label: "Nejlepší nahrávač sezóny" },
  { amount: 100, label: "Pozdní zaplacení příspěvků (nebo pokud se hráč nedomluví jinak)" },
  { amount: 100, label: "Vyloučení 2+2" },
  { amount: 100, label: "Vychytaná 0 (brankář, odchytány alespoň 2 celé třetiny v zápase)" },

  { amount: 150, label: "Nejméně kanadských bodů (minimálně 10 zápasů odehráno)" },
  { amount: 150, label: "Nejtrestanější hráč týmu" },

  { amount: 250, label: "Neúčast na rozlučce" },

  { amount: 500, label: "ČK (do konce utkání)" },

  { amount: 1000, label: "ČK (řeší komise)" }
].map((item, i) => ({ id: "f" + i, ...item }));

// Nouzová záloha pro případ, že by se soubor data.js nepodařilo načíst
// (chybí v repu, poškozený...). Normálně se vůbec nepoužije - rozvrh
// a hráči žijí v data.js, který je vedle index.html a načítá se automaticky.
function defaultData() {
  return {
    players: [...DEFAULT_PLAYERS],
    fineCatalog: JSON.parse(JSON.stringify(FINE_CATALOG)), // ceník pokut
    columns: [], // { id, label, defaultAmount }
    fines: {}    // { playerName: { columnId: [{ id, label, amount }, ...] } }
  };
}

// Starší zálohy měly u buňky jedno číslo místo pole pokut - převede je na nový formát.
function migrateFines(fines) {
  Object.keys(fines).forEach(player => {
    Object.keys(fines[player]).forEach(colId => {
      const val = fines[player][colId];
      if (typeof val === "number") {
        fines[player][colId] = val > 0 ? [{ id: "m" + colId, label: "Pokuta", amount: val }] : undefined;
        if (!fines[player][colId]) delete fines[player][colId];
      }
    });
  });
  return fines;
}

// data.js (vedle index.html, natažený jako <script> ve stránce) je zdroj pravdy -
// nastavuje window.SAVED_DATA. Ukládá se do něj tlačítkem "Uložit soubor",
// stažený soubor pak stačí přetáhnout do repozitáře přes ten starý a udělat git commit.
// localStorage v prohlížeči slouží jen jako nouzová záloha, kdyby se data.js
// nepodařilo načíst (např. smazaný ze souborového systému).
function loadData() {
  if (window.SAVED_DATA) {
    try {
      const data = JSON.parse(JSON.stringify(window.SAVED_DATA));
      if (!data.players || !data.columns || !data.fines) throw new Error("invalid data.js");
      if (!data.fineCatalog) data.fineCatalog = JSON.parse(JSON.stringify(FINE_CATALOG));
      data.fines = migrateFines(data.fines);
      return data;
    } catch (e) {
      console.warn("data.js má neplatný obsah, zkouším zálohu z tohoto prohlížeče.", e);
    }
  } else {
    console.warn("data.js se nenačetl - zkontroluj, že leží vedle index.html.");
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.players || !parsed.columns || !parsed.fines) throw new Error("invalid cache");
      if (!parsed.fineCatalog) parsed.fineCatalog = JSON.parse(JSON.stringify(FINE_CATALOG));
      parsed.fines = migrateFines(parsed.fines);
      return parsed;
    } catch (e) {
      console.warn("Záloha v prohlížeči je poškozená, používám výchozí data.", e);
    }
  }

  return defaultData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  markDirty();
  writeToServer();
  writeToLinkedFile();
}

let state = loadData();

// ---- DOM ----

const headerRow = document.getElementById("headerRow");
const tableBody = document.getElementById("tableBody");
const footerRow = document.getElementById("footerRow");
const grandTotalEl = document.getElementById("grandTotal");
const fileStatusEl = document.getElementById("fileStatus");
const noServerWarningEl = document.getElementById("noServerWarning");
const exportBtn = document.getElementById("exportBtn");
const linkFileBtn = document.getElementById("linkFileBtn");
const importLabel = document.getElementById("importLabel");

// Tahle appka nemá server - soubor data.js JE databáze.
// hasUnsavedChanges hlídá, jestli se od posledního uložení něco změnilo.
let hasUnsavedChanges = false;
let linkedFileName = window.SAVED_DATA ? "data.js" : null;

function markDirty() {
  hasUnsavedChanges = true;
  updateFileStatus();
}

function markSaved(fileName) {
  hasUnsavedChanges = false;
  if (fileName) linkedFileName = fileName;
  updateFileStatus();
}

function updateFileStatus() {
  if (serverSaveAvailable) {
    linkFileBtn.hidden = true;
    exportBtn.hidden = true;
    importLabel.hidden = true;
    noServerWarningEl.hidden = true;
    fileStatusEl.textContent = hasUnsavedChanges
      ? "Ukládám do data.js…"
      : "✓ Ukládá se automaticky do data.js.";
    return;
  }

  if (linkedFileHandle) {
    linkFileBtn.hidden = true;
    exportBtn.hidden = true;
    importLabel.hidden = true;
    noServerWarningEl.hidden = true;
    fileStatusEl.textContent = hasUnsavedChanges
      ? `Ukládám do „${linkedFileHandle.name}“…`
      : `✓ Propojeno s „${linkedFileHandle.name}“ – ukládá se automaticky, žádné stahování.`;
    return;
  }

  exportBtn.hidden = false;
  importLabel.hidden = false;
  linkFileBtn.hidden = !FS_SUPPORTED;
  noServerWarningEl.hidden = !serverSaveChecked;

  if (hasUnsavedChanges) {
    exportBtn.textContent = "● Uložit data.js";
    exportBtn.classList.add("dirty");
    fileStatusEl.textContent = FS_SUPPORTED
      ? "Máš neuložené změny. Klikni na „Propojit data.js“ pro automatické ukládání bez stahování."
      : "Máš neuložené změny – klikni na „Uložit data.js“, stažený soubor přetáhni do složky projektu (přepiš starý) a udělej git commit.";
  } else {
    exportBtn.textContent = "Uložit data.js";
    exportBtn.classList.remove("dirty");
    fileStatusEl.textContent = linkedFileName ? `Vše uloženo (${linkedFileName}).` : "";
  }
}

window.addEventListener("beforeunload", (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// ---- Přímý zápis do data.js přes lokální server (server.py spuštěný start.sh) ----
// Funguje ve všech prohlížečích, dokud appka běží přes start.sh (ne přes file://).

let serverSaveAvailable = false;
let serverSaveChecked = false;

async function checkServerSave() {
  try {
    const res = await fetch("/api/ping");
    serverSaveAvailable = res.ok;
  } catch (e) {
    serverSaveAvailable = false;
  }
  serverSaveChecked = true;
  updateFileStatus();
}

async function writeToServer() {
  if (!serverSaveAvailable) return;
  try {
    const content = `window.SAVED_DATA = ${JSON.stringify(state, null, 2)};\n`;
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      keepalive: true // dokončí zápis, i když stránku hned zavřeš/obnovíš
    });
    if (!res.ok) throw new Error("save failed");
    hasUnsavedChanges = false;
    updateFileStatus();
    flashSaved();
  } catch (e) {
    console.warn("Zápis přes lokální server selhal, přepínám na ostatní způsoby ukládání.", e);
    serverSaveAvailable = false;
    updateFileStatus();
  }
}

let flashSavedTimer = null;
function flashSaved() {
  clearTimeout(flashSavedTimer);
  fileStatusEl.classList.remove("justSaved");
  void fileStatusEl.offsetWidth; // reflow, aby animace naskočila i při rychlých opakovaných uloženích
  fileStatusEl.textContent = "✓ Uloženo!";
  fileStatusEl.classList.add("justSaved");
  flashSavedTimer = setTimeout(() => {
    fileStatusEl.classList.remove("justSaved");
    updateFileStatus();
  }, 1200);
}

// ---- Přímý zápis do data.js přes File System Access API ----
// Funguje jen v zabezpečeném kontextu (http://localhost, ne file://) a jen
// v Chrome/Edge/Chromium (Firefox to nepodporuje) - proto zůstává stahování
// jako záloha pro ostatní případy.

const FS_SUPPORTED = "showOpenFilePicker" in window && window.isSecureContext;
const IDB_NAME = "florbal-pokuty-fs";
const IDB_STORE = "handles";
const IDB_KEY = "dataFileHandle";

let linkedFileHandle = null;

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetHandle() {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSetHandle(handle) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function writeToLinkedFile() {
  if (!linkedFileHandle) return;
  try {
    const content = `window.SAVED_DATA = ${JSON.stringify(state, null, 2)};\n`;
    const writable = await linkedFileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    hasUnsavedChanges = false;
    updateFileStatus();
  } catch (e) {
    console.warn("Zápis do propojeného souboru selhal, přepínám na ruční ukládání.", e);
    linkedFileHandle = null;
    updateFileStatus();
  }
}

// Zkusí na startu potichu obnovit dřív propojený soubor (bez dialogu),
// pokud prohlížeč ještě pamatuje udělené oprávnění.
async function tryAutoLinkFile() {
  if (!FS_SUPPORTED) return;
  try {
    const handle = await idbGetHandle();
    if (!handle) return;
    const perm = await handle.queryPermission({ mode: "readwrite" });
    if (perm === "granted") {
      linkedFileHandle = handle;
      updateFileStatus();
    }
  } catch (e) {
    console.warn("Automatické propojení souboru selhalo.", e);
  }
}

async function linkFile() {
  try {
    let handle = await idbGetHandle();
    if (handle) {
      const perm = await handle.requestPermission({ mode: "readwrite" });
      if (perm !== "granted") handle = null;
    }
    if (!handle) {
      [handle] = await window.showOpenFilePicker({
        types: [{ description: "JavaScript", accept: { "text/javascript": [".js"] } }]
      });
      const perm = await handle.requestPermission({ mode: "readwrite" });
      if (perm !== "granted") return;
      await idbSetHandle(handle);
    }
    linkedFileHandle = handle;
    await writeToLinkedFile();
  } catch (e) {
    if (e.name !== "AbortError") alert("Propojení souboru se nepodařilo: " + e.message);
  }
}

function newColumnId() {
  return "c" + Date.now() + Math.floor(Math.random() * 1000);
}

function getCellFines(player, colId) {
  return (state.fines[player] && state.fines[player][colId]) || [];
}

function cellTotal(player, colId) {
  return getCellFines(player, colId).reduce((sum, f) => sum + f.amount, 0);
}

function newEntryId() {
  return "e" + Date.now() + Math.floor(Math.random() * 1000);
}

function addFineToCell(player, colId, label, amount) {
  if (!state.fines[player]) state.fines[player] = {};
  if (!state.fines[player][colId]) state.fines[player][colId] = [];
  state.fines[player][colId].push({ id: newEntryId(), label, amount });
  saveData();
}

function removeFineFromCell(player, colId, entryId) {
  if (!state.fines[player] || !state.fines[player][colId]) return;
  state.fines[player][colId] = state.fines[player][colId].filter(f => f.id !== entryId);
  if (state.fines[player][colId].length === 0) delete state.fines[player][colId];
  saveData();
}

function formatKc(n) {
  return n.toLocaleString("cs-CZ") + " Kč";
}

function render() {
  // --- header ---
  headerRow.querySelectorAll(".fineCol").forEach(el => el.remove());
  const totalTh = headerRow.querySelector(".totalCol");

  state.columns.forEach(col => {
    const th = document.createElement("th");
    th.className = "fineCol" + colExtraClasses(col);
    th.innerHTML = `
      <div class="colHeaderInner">
        <input type="text" class="colTitleInput" data-col="${col.id}" value="${escapeAttr(col.label)}">
        <button class="deleteColBtn" data-col="${col.id}" title="Smazat sloupec">&times;</button>
      </div>
    `;
    headerRow.insertBefore(th, totalTh);
  });

  // --- body ---
  tableBody.innerHTML = "";

  if (state.players.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="emptyState" colspan="99">Žádní hráči</td>`;
    tableBody.appendChild(tr);
  }

  state.players.forEach(player => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.className = "nameCol";
    nameTd.textContent = player;
    tr.appendChild(nameTd);

    let rowSum = 0;
    state.columns.forEach(col => {
      const entries = getCellFines(player, col.id);
      const total = entries.reduce((sum, f) => sum + f.amount, 0);
      rowSum += total;
      const td = document.createElement("td");
      td.className = "amountCell" + colExtraClasses(col);
      const title = entries.length
        ? entries.map(f => `${f.label} (${formatKc(f.amount)})`).join(", ")
        : "Kliknutím přidáš pokutu";
      const text = total ? formatKc(total) + (entries.length > 1 ? ` ×${entries.length}` : "") : "—";
      td.innerHTML = `<button type="button" class="cellBtn${total ? " hasFine" : ""}" data-player="${escapeAttr(player)}" data-col="${col.id}" title="${escapeAttr(title)}">${text}</button>`;
      tr.appendChild(td);
    });

    const totalTd = document.createElement("td");
    totalTd.className = "rowTotal";
    totalTd.textContent = formatKc(rowSum);
    tr.appendChild(totalTd);

    tableBody.appendChild(tr);
  });

  // --- footer (column sums) ---
  footerRow.querySelectorAll(".colSum").forEach(el => el.remove());
  const footerTotalTh = footerRow.querySelector(".totalCol");

  let grandTotal = 0;
  state.columns.forEach(col => {
    let colSum = 0;
    state.players.forEach(player => {
      colSum += cellTotal(player, col.id);
    });
    grandTotal += colSum;
    const th = document.createElement("th");
    th.className = "colSum";
    th.textContent = formatKc(colSum);
    footerRow.insertBefore(th, footerTotalTh);
  });

  grandTotalEl.textContent = formatKc(grandTotal);

  attachEvents();
  renderPriceList();
}

function colExtraClasses(col) {
  let cls = "";
  if (col.type === "training") cls += " trainingCol";
  if (col.type === "match") cls += " matchCol";
  if (col.monthStart) cls += " monthStart";
  return cls;
}

function groupCatalogByAmount() {
  const groups = new Map();
  state.fineCatalog.forEach(item => {
    if (!groups.has(item.amount)) groups.set(item.amount, []);
    groups.get(item.amount).push(item);
  });
  return [...groups.entries()].sort((a, b) => a[0] - b[0]);
}

function renderPriceList() {
  const container = document.getElementById("priceListContent");
  container.innerHTML = "";
  groupCatalogByAmount().forEach(([amount, items]) => {
    const group = document.createElement("div");
    group.className = "priceGroup";
    group.innerHTML = `
      <h3>${formatKc(amount)}</h3>
      <ul>${items.map(i => `<li>${escapeHtml(i.label)}</li>`).join("")}</ul>
    `;
    container.appendChild(group);
  });
}

// Vykreslí ceník jako klikací tlačítka seskupená podle částky do daného kontejneru.
// Po kliknutí na položku zavolá onSelect(item).
function renderCatalogPicker(container, onSelect) {
  container.innerHTML = "";
  groupCatalogByAmount().forEach(([amount, items]) => {
    const group = document.createElement("div");
    group.className = "catalogGroup";
    group.innerHTML = `
      <h4>${formatKc(amount)}</h4>
      <div class="catalogItems">
        ${items.map(i => `<button type="button" class="catalogItemBtn" data-id="${i.id}">${escapeHtml(i.label)}</button>`).join("")}
      </div>
    `;
    container.appendChild(group);
  });
  container.querySelectorAll(".catalogItemBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = state.fineCatalog.find(i => i.id === btn.dataset.id);
      if (item) onSelect(item);
    });
  });
}

function renderCatalogDialog() {
  renderCatalogPicker(document.getElementById("catalogList"), item => {
    addColumn(`${item.label} (${item.amount} Kč)`, item.amount);
    addFineDialog.close();
  });
}

function addColumn(label, defaultAmount) {
  state.columns.push({ id: newColumnId(), label, defaultAmount: defaultAmount || undefined });
  saveData();
  render();
}

// ---- Modal pro přidání/odebrání pokuty konkrétnímu hráči v konkrétním sloupci ----

let currentCellPlayer = null;
let currentCellCol = null;
const cellFineDialog = document.getElementById("cellFineDialog");

function openCellDialog(player, colId) {
  currentCellPlayer = player;
  currentCellCol = colId;
  const col = state.columns.find(c => c.id === colId);
  document.getElementById("cellDialogTitle").textContent = `${player} — ${col ? col.label : ""}`;
  renderCellFinesList();
  renderCatalogPicker(document.getElementById("cellCatalogList"), item => {
    addFineToCell(currentCellPlayer, currentCellCol, item.label, item.amount);
    renderCellFinesList();
    render();
  });
  cellFineDialog.showModal();
}

function renderCellFinesList() {
  const container = document.getElementById("cellFinesList");
  const entries = getCellFines(currentCellPlayer, currentCellCol);
  if (entries.length === 0) {
    container.innerHTML = `<p class="emptyHint">Zatím žádná pokuta.</p>`;
    return;
  }
  container.innerHTML = entries.map(f => `
    <div class="cellFineRow">
      <span class="cellFineLabel">${escapeHtml(f.label)}</span>
      <span class="cellFineAmount">${formatKc(f.amount)}</span>
      <button type="button" class="removeFineBtn" data-entry="${f.id}" title="Odebrat">&times;</button>
    </div>
  `).join("");
  container.querySelectorAll(".removeFineBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFineFromCell(currentCellPlayer, currentCellCol, btn.dataset.entry);
      renderCellFinesList();
      render();
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function attachEvents() {
  document.querySelectorAll(".cellBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      openCellDialog(btn.dataset.player, btn.dataset.col);
    });
  });

  document.querySelectorAll(".colTitleInput").forEach(input => {
    input.addEventListener("change", () => {
      const col = state.columns.find(c => c.id === input.dataset.col);
      if (col) {
        col.label = input.value.trim() || "Pokuta";
        saveData();
      }
    });
  });

  document.querySelectorAll(".deleteColBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const col = state.columns.find(c => c.id === btn.dataset.col);
      if (!col) return;
      if (!confirm(`Smazat sloupec "${col.label}"? Smažou se i všechny zadané částky.`)) return;
      state.columns = state.columns.filter(c => c.id !== btn.dataset.col);
      state.players.forEach(p => {
        if (state.fines[p]) delete state.fines[p][btn.dataset.col];
      });
      saveData();
      render();
    });
  });
}

// ---- Toolbar ----

const addFineDialog = document.getElementById("addFineDialog");

document.getElementById("addColumnBtn").addEventListener("click", () => {
  renderCatalogDialog();
  addFineDialog.showModal();
});

document.getElementById("customFineAddBtn").addEventListener("click", () => {
  const labelInput = document.getElementById("customFineLabel");
  const amountInput = document.getElementById("customFineAmount");
  const label = labelInput.value.trim();
  if (!label) {
    labelInput.focus();
    return;
  }
  const amount = Math.max(0, parseInt(amountInput.value, 10) || 0);
  addColumn(amount ? `${label} (${amount} Kč)` : label, amount);
  labelInput.value = "";
  amountInput.value = "";
  addFineDialog.close();
});

document.getElementById("cellCustomAddBtn").addEventListener("click", () => {
  const labelInput = document.getElementById("cellCustomLabel");
  const amountInput = document.getElementById("cellCustomAmount");
  const label = labelInput.value.trim();
  if (!label) {
    labelInput.focus();
    return;
  }
  const amount = Math.max(0, parseInt(amountInput.value, 10) || 0);
  addFineToCell(currentCellPlayer, currentCellCol, label, amount);
  labelInput.value = "";
  amountInput.value = "";
  renderCellFinesList();
  render();
});

// data.js má tvar "window.SAVED_DATA = {...};" - starší zálohy byly čisté .json.
// Umí přečíst obojí.
function parseDataFile(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("window.SAVED_DATA")) {
    const jsonPart = trimmed.slice(trimmed.indexOf("=") + 1).trim().replace(/;\s*$/, "");
    return JSON.parse(jsonPart);
  }
  return JSON.parse(trimmed);
}

exportBtn.addEventListener("click", () => {
  const fileName = "data.js";
  const content = `window.SAVED_DATA = ${JSON.stringify(state, null, 2)};\n`;
  const blob = new Blob([content], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  markSaved(fileName);
});

document.getElementById("importInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = parseDataFile(reader.result);
      if (!parsed.players || !parsed.columns || !parsed.fines) throw new Error("Neplatný formát souboru.");
      if (!parsed.fineCatalog) parsed.fineCatalog = JSON.parse(JSON.stringify(FINE_CATALOG));
      parsed.fines = migrateFines(parsed.fines);
      if (!confirm("Nahradit aktuální data obsahem souboru?")) return;
      state = parsed;
      saveData();
      render();
      markSaved(file.name);
    } catch (err) {
      alert("Soubor se nepodařilo načíst: " + err.message);
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
});

linkFileBtn.addEventListener("click", linkFile);

render();
updateFileStatus();
checkServerSave();
tryAutoLinkFile();
