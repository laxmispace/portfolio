/**
 * All job entries live in chrome.storage.local under this one key.
 * There is no server and no account. This data never leaves the device
 * it was saved on, unless the person explicitly exports it.
 */
const STORE_KEY = "job_entries";

async function getAllEntries() {
  const data = await chrome.storage.local.get(STORE_KEY);
  return data[STORE_KEY] || [];
}

async function saveAllEntries(entries) {
  await chrome.storage.local.set({ [STORE_KEY]: entries });
}

async function findEntryByUrl(url) {
  const entries = await getAllEntries();
  return entries.find((e) => e.url === url) || null;
}

async function getEntryById(id) {
  const entries = await getAllEntries();
  return entries.find((e) => e.id === id) || null;
}

async function insertEntry(partial) {
  const entries = await getAllEntries();
  const now = new Date().toISOString();
  const entry = {
    id: crypto.randomUUID(),
    url: "",
    company: "",
    role_title: "",
    location: "",
    salary: "",
    responsibilities: "",
    requirements: "",
    notes: "",
    source_site: "",
    applied: false,
    applied_date: null,
    date_saved: now,
    created_at: now,
    ...partial,
  };
  entries.unshift(entry);
  await saveAllEntries(entries);
  return entry;
}

async function updateEntry(id, patch) {
  const entries = await getAllEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error("Entry not found");
  entries[idx] = { ...entries[idx], ...patch };
  await saveAllEntries(entries);
  return entries[idx];
}

async function deleteEntry(id) {
  const entries = await getAllEntries();
  await saveAllEntries(entries.filter((e) => e.id !== id));
}

async function exportEntriesJSON() {
  const entries = await getAllEntries();
  return JSON.stringify(entries, null, 2);
}

/**
 * Import entries from a previously exported JSON file. Matches on `url`
 * so re-importing the same file twice doesn't create duplicates.
 */
async function importEntriesJSON(jsonText) {
  const incoming = JSON.parse(jsonText);
  if (!Array.isArray(incoming)) throw new Error("That file doesn't look like a Job Hunt Tracker export.");

  const existing = await getAllEntries();
  const byUrl = new Map(existing.map((e) => [e.url, e]));

  for (const inc of incoming) {
    if (!inc.url) continue;
    if (byUrl.has(inc.url)) {
      const current = byUrl.get(inc.url);
      byUrl.set(inc.url, { ...current, ...inc, id: current.id });
    } else {
      byUrl.set(inc.url, { ...inc, id: inc.id || crypto.randomUUID() });
    }
  }

  const merged = Array.from(byUrl.values()).sort(
    (a, b) => new Date(b.date_saved) - new Date(a.date_saved)
  );
  await saveAllEntries(merged);
  return merged.length;
}
