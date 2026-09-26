const contentEl = document.getElementById("content");
const dashboardBtn = document.getElementById("dashboardBtn");

let activeTab = null;
let currentEntry = null; // populated once we know this URL is already saved

dashboardBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});

init();

async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;

    if (!tab || !/^https?:\/\//.test(tab.url || "")) {
      renderUnsupported();
      return;
    }

    const existing = await findEntryByUrl(tab.url);
    if (existing) {
      currentEntry = existing;
      renderSaved(existing);
    } else {
      renderCapturePrompt(tab);
    }
  } catch (err) {
    renderError(err);
  }
}

/* ---------------- Rendering ---------------- */

function renderUnsupported() {
  contentEl.innerHTML = `
    <div class="helper-text" style="margin-top:8px;">
      This page can't be captured (not a regular web page).
    </div>`;
}

function renderError(err) {
  contentEl.innerHTML = `
    <div class="error-text">Something went wrong: ${escapeHtml(
      err.message || String(err)
    )}</div>`;
}

function renderCapturePrompt(tab) {
  const hostname = new URL(tab.url).hostname.replace(/^www\./, "");
  contentEl.innerHTML = `
    <div class="page-preview">
      <div class="preview-label">Current page</div>
      <div class="preview-title">${escapeHtml(truncate(tab.title || tab.url, 90))}</div>
      <div class="preview-company">${escapeHtml(hostname)}</div>
    </div>
    <button id="saveBtn" class="primary-btn">Save this job</button>
    <div class="helper-text">
      Pulls the role, company, location, salary, and JD text from this page.
      Saved only on this device.
    </div>
    <div class="shortcut-hint">Tip: press <kbd id="shortcutKey">the keyboard shortcut</kbd> on any job page to save it without opening this popup.</div>
  `;
  document.getElementById("saveBtn").addEventListener("click", handleSaveClick);
  fillShortcutHint();
}

async function fillShortcutHint() {
  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find((c) => c.name === "save-current-job");
    const el = document.getElementById("shortcutKey");
    if (el) el.textContent = cmd && cmd.shortcut ? cmd.shortcut : "chrome://extensions/shortcuts";
  } catch {
    /* commands API unavailable in some contexts, ignore */
  }
}

async function handleSaveClick() {
  const btn = document.getElementById("saveBtn");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    const data = await captureJobFromTab(activeTab);
    const saved = await insertEntry(data);
    currentEntry = saved;
    renderSaved(saved, true);
  } catch (err) {
    renderError(err);
  }
}

function renderSaved(entry, justSaved = false) {
  const savedDate = new Date(entry.date_saved || entry.created_at || Date.now());
  const dateStr = savedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  contentEl.innerHTML = `
    <div class="status-row">
      <span class="status-badge ${entry.applied ? "applied" : ""}">
        <span class="dot"></span>${entry.applied ? "Applied" : "Saved"}
      </span>
      <span class="saved-date">${dateStr}</span>
    </div>

    <div class="field">
      <label>Company</label>
      <input id="companyInput" type="text" value="${escapeAttr(entry.company || "")}" />
    </div>
    <div class="field">
      <label>Role</label>
      <input id="roleInput" type="text" value="${escapeAttr(entry.role_title || "")}" />
    </div>

    <div class="action-row">
      <button id="appliedBtn" class="secondary-btn ${entry.applied ? "applied-active" : ""}">
        ${entry.applied ? "Marked applied" : "Mark as applied"}
      </button>
    </div>
    <div class="saved-toast" id="toast"></div>
    <div class="helper-text">
      Full JD, notes, and resume tailoring live in the dashboard.
    </div>
  `;

  if (justSaved) {
    document.getElementById("toast").textContent = "Saved";
  }

  const companyInput = document.getElementById("companyInput");
  const roleInput = document.getElementById("roleInput");
  const appliedBtn = document.getElementById("appliedBtn");

  const commitField = async (field, value) => {
    try {
      currentEntry = await updateEntry(currentEntry.id, { [field]: value });
      flashToast("Updated");
    } catch (err) {
      flashToast("Couldn't save change", true);
    }
  };

  companyInput.addEventListener("blur", () => {
    if (companyInput.value !== currentEntry.company) commitField("company", companyInput.value);
  });
  roleInput.addEventListener("blur", () => {
    if (roleInput.value !== currentEntry.role_title) commitField("role_title", roleInput.value);
  });

  appliedBtn.addEventListener("click", async () => {
    const nextApplied = !currentEntry.applied;
    appliedBtn.disabled = true;
    try {
      currentEntry = await updateEntry(currentEntry.id, {
        applied: nextApplied,
        applied_date: nextApplied ? new Date().toISOString() : null,
      });
      renderSaved(currentEntry);
    } catch (err) {
      appliedBtn.disabled = false;
      flashToast("Couldn't update", true);
    }
  });
}

function flashToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.color = isError ? "var(--coral)" : "var(--sage)";
  setTimeout(() => {
    if (toast) toast.textContent = "";
  }, 1800);
}

/* ---------------- utils ---------------- */

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/`/g, "&#96;");
}
