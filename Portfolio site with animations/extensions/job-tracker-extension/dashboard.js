const state = {
  entries: [],
  filter: "all",
  query: "",
  view: "cards",
  orderedIds: [], // order the list was last rendered in, used for prev/next nav
};

const els = {
  stats: document.getElementById("statsBar"),
  container: document.getElementById("entriesContainer"),
  listView: document.getElementById("listView"),
  detailView: document.getElementById("detailView"),
  filterTabs: document.getElementById("filterTabs"),
  viewToggle: document.getElementById("viewToggle"),
  search: document.getElementById("searchInput"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFile: document.getElementById("importFile"),
};

init();

async function init() {
  await refreshEntries();
  bindGlobalControls();
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", handleGlobalKeydown);
  route();
}

async function refreshEntries() {
  state.entries = await getAllEntries();
}

/* ---------------- routing ---------------- */

function route() {
  const hash = window.location.hash; // "" or "#/entry/<id>"
  const match = hash.match(/^#\/entry\/(.+)$/);
  if (match) {
    showDetail(match[1]);
  } else {
    showList();
  }
}

function showList() {
  els.detailView.hidden = true;
  els.listView.hidden = false;
  renderStats();
  renderList();
}

async function showDetail(id) {
  els.listView.hidden = true;
  els.detailView.hidden = false;
  const entry = await getEntryById(id);
  if (!entry) {
    els.detailView.innerHTML = `
      <button class="back-link" id="backLink">&larr; All entries</button>
      <p style="color:var(--coral); font-size:13px; margin-top:12px;">
        That entry could not be found. It may have been deleted.
      </p>`;
    document.getElementById("backLink").addEventListener("click", () => { window.location.hash = ""; });
    return;
  }
  renderDetail(entry);
}

function handleGlobalKeydown(e) {
  if (els.detailView.hidden) return;
  const tag = (e.target && e.target.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return; // don't hijack typing

  if (e.key === "ArrowLeft") {
    const prevBtn = document.getElementById("navPrev");
    if (prevBtn && !prevBtn.disabled) prevBtn.click();
  } else if (e.key === "ArrowRight") {
    const nextBtn = document.getElementById("navNext");
    if (nextBtn && !nextBtn.disabled) nextBtn.click();
  } else if (e.key === "Escape") {
    window.location.hash = "";
  }
}

/* ---------------- controls ---------------- */

function bindGlobalControls() {
  els.filterTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-tab");
    if (!btn) return;
    state.filter = btn.dataset.filter;
    [...els.filterTabs.children].forEach((c) => c.classList.toggle("active", c === btn));
    renderList();
  });

  els.viewToggle.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-btn");
    if (!btn) return;
    state.view = btn.dataset.view;
    [...els.viewToggle.children].forEach((c) => c.classList.toggle("active", c === btn));
    renderList();
  });

  els.search.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderList();
  });

  els.exportBtn.addEventListener("click", async () => {
    const json = await exportEntriesJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-hunt-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  els.importBtn.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const count = await importEntriesJSON(text);
      await refreshEntries();
      renderStats();
      renderList();
      alert(`Imported. You now have ${count} entries on this device.`);
    } catch (err) {
      alert(`Could not import that file. ${err.message}`);
    } finally {
      els.importFile.value = "";
    }
  });
}

/* ---------------- stats ---------------- */

function renderStats() {
  if (state.entries.length === 0) {
    els.stats.innerHTML = "";
    return;
  }
  const total = state.entries.length;
  const applied = state.entries.filter((e) => e.applied).length;
  const pending = total - applied;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = state.entries.filter((e) => new Date(e.date_saved).getTime() >= weekAgo).length;

  const stats = [
    ["Total saved", total],
    ["Applied", applied],
    ["Not yet applied", pending],
    ["Saved this week", thisWeek],
  ];

  els.stats.innerHTML = stats
    .map(([label, value]) => `
      <div class="stat">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>`)
    .join("");
}

/* ---------------- list rendering ---------------- */

function getFiltered() {
  let list = state.entries;
  if (state.filter === "applied") list = list.filter((e) => e.applied);
  if (state.filter === "pending") list = list.filter((e) => !e.applied);

  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter((e) =>
      [e.role_title, e.company, e.url, e.requirements, e.responsibilities]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
    );
  }
  return list;
}

function renderList() {
  const filtered = getFiltered();
  state.orderedIds = filtered.map((e) => e.id);

  if (filtered.length === 0) {
    els.container.innerHTML = state.entries.length === 0 ? emptyStateHTML(false) : emptyStateHTML(true);
    return;
  }

  els.container.innerHTML = state.view === "cards" ? cardsHTML(filtered) : tableHTML(filtered);
  bindListEvents();
}

function emptyStateHTML(filtered) {
  if (filtered) {
    return `<div class="empty"><h3>No entries match</h3><p>Try a different search term or switch filters.</p></div>`;
  }
  return `<div class="empty">
    <img class="empty-mark" src="icons/logo.svg" alt="" />
    <h3>Nothing captured yet</h3>
    <p>Land on a job posting, click the extension icon, and hit "Save this job." It will show up here.</p>
  </div>`;
}

function cardsHTML(entries) {
  return `<div class="cards-grid">${entries.map(cardHTML).join("")}</div>`;
}

function cardHTML(entry) {
  const preview = entry.requirements || entry.responsibilities || entry.notes || "";
  return `
    <div class="card" data-id="${entry.id}">
      <div class="card-top">
        ${badgeHTML(entry.applied)}
        <span class="card-date">${formatShortDate(entry.date_saved)}</span>
      </div>
      <div class="card-body" data-action="open">
        <p class="card-role">${escapeHtml(entry.role_title || "Untitled role")}</p>
        <p class="card-company">${escapeHtml(entry.company || hostnameFromUrl(entry.url))}</p>
        ${preview ? `<p class="card-preview">${escapeHtml(truncate(preview, 180))}</p>` : ""}
      </div>
      <div class="card-bottom">
        <a class="card-source" href="${escapeAttr(entry.url)}" target="_blank" rel="noreferrer" title="${escapeAttr(entry.url)}">
          ${escapeHtml(hostnameFromUrl(entry.url))} &#8599;
        </a>
        <div class="card-actions">
          <button class="pill-btn ${entry.applied ? "applied" : ""}" data-action="toggle-applied">
            ${entry.applied ? "Undo" : "Mark applied"}
          </button>
          <button class="icon-btn" data-action="delete" aria-label="Delete entry">${trashIcon()}</button>
        </div>
      </div>
    </div>`;
}

function tableHTML(entries) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Role</th><th>Company</th><th>Source</th><th>Saved</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(tableRowHTML).join("")}
        </tbody>
      </table>
    </div>`;
}

function tableRowHTML(entry) {
  return `
    <tr data-id="${entry.id}">
      <td><a class="role-link" href="#/entry/${entry.id}">${escapeHtml(truncate(entry.role_title || "Untitled role", 60))}</a></td>
      <td>${entry.company ? escapeHtml(entry.company) : '<span style="color:var(--slate-light);">Not added</span>'}</td>
      <td><a href="${escapeAttr(entry.url)}" target="_blank" rel="noreferrer" style="color:var(--slate); text-decoration:none;">${escapeHtml(hostnameFromUrl(entry.url))} &#8599;</a></td>
      <td style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--slate);">${formatShortDate(entry.date_saved)}</td>
      <td>${badgeHTML(entry.applied)}</td>
      <td>
        <div class="td-actions">
          <button class="pill-btn ${entry.applied ? "applied" : ""}" data-action="toggle-applied">${entry.applied ? "Undo" : "Mark applied"}</button>
          <button class="icon-btn" data-action="delete" aria-label="Delete entry">${trashIcon()}</button>
        </div>
      </td>
    </tr>`;
}

function badgeHTML(applied) {
  return `<span class="badge ${applied ? "applied" : ""}"><span class="dot"></span>${applied ? "Applied" : "Saved"}</span>`;
}

function bindListEvents() {
  els.container.querySelectorAll("[data-id]").forEach((node) => {
    const id = node.dataset.id;

    const openTarget = node.matches(".card") ? node.querySelector('[data-action="open"]') : null;
    if (openTarget) {
      openTarget.addEventListener("click", () => { window.location.hash = `#/entry/${id}`; });
    }

    const toggleBtn = node.querySelector('[data-action="toggle-applied"]');
    if (toggleBtn) {
      toggleBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const entry = state.entries.find((x) => x.id === id);
        const nextApplied = !entry.applied;
        await updateEntry(id, { applied: nextApplied, applied_date: nextApplied ? new Date().toISOString() : null });
        await refreshEntries();
        renderStats();
        renderList();
      });
    }

    const deleteBtn = node.querySelector('[data-action="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const entry = state.entries.find((x) => x.id === id);
        if (!confirm(`Remove "${entry.role_title || "this entry"}"? This can't be undone.`)) return;
        await deleteEntry(id);
        await refreshEntries();
        renderStats();
        renderList();
      });
    }
  });
}

/* ---------------- detail view ---------------- */

function getNavOrder() {
  if (state.orderedIds.length) return state.orderedIds;
  // Opened directly (e.g. from the "View dashboard" toast) without the list
  // having rendered first, fall back to the default newest-first order.
  return [...state.entries]
    .sort((a, b) => new Date(b.date_saved) - new Date(a.date_saved))
    .map((e) => e.id);
}

function renderDetail(entry) {
  const order = getNavOrder();
  const idx = order.indexOf(entry.id);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  const position = idx >= 0 ? `${idx + 1} of ${order.length}` : "";

  els.detailView.innerHTML = `
    <div class="detail-nav">
      <button class="back-link" id="backLink">&larr; All entries</button>
      <div class="entry-nav">
        <button class="nav-btn" id="navPrev" ${prevId ? "" : "disabled"} title="Previous entry">&lsaquo; Prev</button>
        <span class="nav-position">${position}</span>
        <button class="nav-btn" id="navNext" ${nextId ? "" : "disabled"} title="Next entry">Next &rsaquo;</button>
      </div>
    </div>

    <div class="detail-header">
      <div class="detail-header-top">
        ${badgeHTML(entry.applied)}
        <span class="save-indicator" id="saveIndicator"></span>
      </div>

      <input class="detail-role-input" data-field="role_title" value="${escapeAttr(entry.role_title || "")}" placeholder="Untitled role" />
      <input class="detail-company-input" data-field="company" value="${escapeAttr(entry.company || "")}" placeholder="Add a company name" />

      <div class="meta-row">
        <input class="meta-input" data-field="location" value="${escapeAttr(entry.location || "")}" placeholder="Location" style="width:${inputWidth(entry.location, "Location")}ch;" />
        <input class="meta-input" data-field="salary" value="${escapeAttr(entry.salary || "")}" placeholder="Salary / comp" style="width:${inputWidth(entry.salary, "Salary / comp")}ch;" />
        <span class="meta-timestamp">saved ${formatDate(entry.date_saved)}${entry.applied_date ? ` &middot; applied ${formatDate(entry.applied_date)}` : ""}</span>
      </div>
    </div>

    <a class="posting-box" href="${escapeAttr(entry.url)}" target="_blank" rel="noreferrer">
      <span class="posting-label">Posting</span>
      <span class="posting-url">${escapeHtml(entry.url)} &#8599;</span>
      <span class="posting-host">${escapeHtml(hostnameFromUrl(entry.url))}</span>
    </a>

    <div class="section-block">
      <span class="section-label">From the listing</span>
      <div class="bullet-field" data-field="responsibilities" tabindex="0">
        <div class="field-title">Responsibilities</div>
        ${bulletDisplayHTML(entry.responsibilities, "What this role actually does day to day.")}
      </div>
      <div class="bullet-field" data-field="requirements" tabindex="0">
        <div class="field-title">What they're looking for</div>
        ${bulletDisplayHTML(entry.requirements, "Requirements, qualifications, must haves.")}
      </div>
    </div>

    <div class="section-block notes-block">
      <span class="section-label">Your prep notes</span>
      <div class="notes-field">
        <textarea data-field="notes" rows="6" placeholder="Keywords to mirror in your resume, talking points for the interview, questions to ask.">${escapeHtml(entry.notes || "")}</textarea>
      </div>
    </div>

    <div class="detail-footer">
      <button id="applyToggle" class="pill-btn ${entry.applied ? "applied" : ""}" style="padding:9px 16px;">
        ${entry.applied ? "Applied &middot; undo" : "Mark as applied"}
      </button>
      <button id="deleteEntry" class="delete-link">Delete entry</button>
    </div>
  `;

  bindDetailEvents(entry, prevId, nextId);
}

function inputWidth(value, placeholder) {
  const len = (value || placeholder).length;
  return Math.min(Math.max(len + 2, 8), 28);
}

function bulletDisplayHTML(value, placeholder) {
  const lines = (value || "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) {
    return `<p class="bullet-empty">${escapeHtml(placeholder)} Click to add.</p>`;
  }
  return `<ul class="bullet-list">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`;
}

function bindDetailEvents(entry, prevId, nextId) {
  const id = entry.id;
  const indicator = document.getElementById("saveIndicator");

  document.getElementById("backLink").addEventListener("click", () => { window.location.hash = ""; });

  const prevBtn = document.getElementById("navPrev");
  const nextBtn = document.getElementById("navNext");
  if (prevId) prevBtn.addEventListener("click", () => { window.location.hash = `#/entry/${prevId}`; });
  if (nextId) nextBtn.addEventListener("click", () => { window.location.hash = `#/entry/${nextId}`; });

  const flashSaved = () => {
    indicator.textContent = "Saved";
    setTimeout(() => { if (indicator) indicator.textContent = ""; }, 1200);
  };

  // simple text fields (role, company, location, salary): save on blur
  els.detailView.querySelectorAll("input[data-field]").forEach((field) => {
    const original = field.value;
    field.addEventListener("blur", async () => {
      if (field.value === original) return;
      indicator.textContent = "Saving";
      await updateEntry(id, { [field.dataset.field]: field.value });
      await refreshEntries();
      flashSaved();
    });
  });

  // notes textarea: save on blur
  const notesArea = els.detailView.querySelector('textarea[data-field="notes"]');
  if (notesArea) {
    const original = notesArea.value;
    notesArea.addEventListener("blur", async () => {
      if (notesArea.value === original) return;
      indicator.textContent = "Saving";
      await updateEntry(id, { notes: notesArea.value });
      await refreshEntries();
      flashSaved();
    });
  }

  // bullet fields (responsibilities, requirements): click to edit, blur to commit
  els.detailView.querySelectorAll(".bullet-field").forEach((container) => {
    const fieldName = container.dataset.field;
    const activate = () => {
      if (container.querySelector("textarea")) return; // already editing
      const currentValue = entry[fieldName] || "";
      const titleText = container.querySelector(".field-title").outerHTML;
      container.innerHTML = `
        ${titleText}
        <textarea rows="6" placeholder="One item per line.">${escapeHtml(currentValue)}</textarea>
        <div class="bullet-hint">Click outside to save, one item per line</div>
      `;
      const textarea = container.querySelector("textarea");
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      textarea.addEventListener("blur", async () => {
        const newValue = textarea.value;
        if (newValue !== currentValue) {
          indicator.textContent = "Saving";
          const updated = await updateEntry(id, { [fieldName]: newValue });
          entry[fieldName] = updated[fieldName];
          await refreshEntries();
          flashSaved();
        }
        container.innerHTML = `${titleText}${bulletDisplayHTML(entry[fieldName], fieldName === "responsibilities" ? "What this role actually does day to day." : "Requirements, qualifications, must haves.")}`;
      });
    };

    container.addEventListener("click", activate);
    container.addEventListener("focus", activate);
  });

  document.getElementById("applyToggle").addEventListener("click", async () => {
    const fresh = await getEntryById(id);
    const next = !fresh.applied;
    await updateEntry(id, { applied: next, applied_date: next ? new Date().toISOString() : null });
    await refreshEntries();
    const updated = await getEntryById(id);
    renderDetail(updated);
  });

  document.getElementById("deleteEntry").addEventListener("click", async () => {
    if (!confirm("Delete this entry? This can't be undone.")) return;
    await deleteEntry(id);
    await refreshEntries();
    if (nextId) window.location.hash = `#/entry/${nextId}`;
    else if (prevId) window.location.hash = `#/entry/${prevId}`;
    else window.location.hash = "";
  });
}

/* ---------------- utils ---------------- */

function formatDate(value) {
  if (!value) return "unknown date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "unknown date";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatShortDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function hostnameFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url || ""; }
}

function truncate(str, n) {
  if (!str) return "";
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

function trashIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>`;
}
