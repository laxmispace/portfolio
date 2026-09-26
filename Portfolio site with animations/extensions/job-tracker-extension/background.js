importScripts("store.js", "page-capture.js");

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "save-current-job") return;
  if (!tab || !tab.id || !/^https?:\/\//.test(tab.url || "")) return;

  try {
    const existing = await findEntryByUrl(tab.url);
    let entry = existing;
    const alreadySaved = Boolean(existing);

    if (!existing) {
      const data = await captureJobFromTab(tab);
      entry = await insertEntry(data);
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectSavedToast,
      args: [{ alreadySaved, entryId: entry.id, roleTitle: entry.role_title }],
    });
  } catch (err) {
    console.error("Job Hunt Tracker: couldn't save via shortcut", err);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message && message.action === "open-dashboard") {
    const url =
      chrome.runtime.getURL("dashboard.html") + (message.entryId ? `#/entry/${message.entryId}` : "");
    chrome.tabs.create({ url });
  }
});

/**
 * Runs inside the page (isolated content-script world) via
 * chrome.scripting.executeScript, must be fully self-contained, it cannot
 * close over anything outside its own body.
 */
function injectSavedToast({ alreadySaved, entryId, roleTitle }) {
  const prior = document.getElementById("__jht_toast__");
  if (prior) prior.remove();

  const DURATION = 4500;

  const wrap = document.createElement("div");
  wrap.id = "__jht_toast__";
  wrap.style.cssText = [
    "position:fixed",
    "bottom:20px",
    "right:20px",
    "z-index:2147483647",
    "background:#1B2430",
    "color:#EEF1F4",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    "border-radius:12px",
    "box-shadow:0 10px 30px rgba(0,0,0,.28)",
    "width:290px",
    "overflow:hidden",
    "opacity:0",
    "transform:translateY(8px)",
    "transition:opacity .18s ease, transform .18s ease",
  ].join(";");

  const inner = document.createElement("div");
  inner.style.cssText = "display:flex; align-items:flex-start; gap:10px; padding:14px 12px 12px 14px;";

  const mark = document.createElement("img");
  mark.src = chrome.runtime.getURL("icons/logo.svg");
  mark.alt = "";
  mark.style.cssText = "width:22px; height:22px; flex-shrink:0; margin-top:1px; object-fit:contain;";

  const textWrap = document.createElement("div");
  textWrap.style.cssText = "flex:1; min-width:0;";

  const titleEl = document.createElement("div");
  titleEl.style.cssText = "font-size:13px; font-weight:600; line-height:1.4;";
  titleEl.textContent = alreadySaved ? "Already on your dashboard" : "Added to your dashboard";

  const sub = document.createElement("div");
  sub.style.cssText =
    "margin-top:2px; font-size:11.5px; color:#C7CED6; line-height:1.4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
  sub.textContent = roleTitle || "This posting";

  const viewBtn = document.createElement("button");
  viewBtn.type = "button";
  viewBtn.textContent = "View dashboard";
  viewBtn.style.cssText =
    "margin-top:9px; border:none; background:#E3A008; color:#1B2430; font-weight:600; font-size:11px; letter-spacing:.02em; padding:6px 12px; border-radius:20px; cursor:pointer;";
  viewBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "open-dashboard", entryId });
    dismiss();
  });

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Dismiss");
  closeBtn.textContent = "\u00d7";
  closeBtn.style.cssText =
    "background:none; border:none; color:#88919C; font-size:17px; line-height:1; cursor:pointer; padding:2px 4px; flex-shrink:0;";
  closeBtn.addEventListener("click", dismiss);

  textWrap.appendChild(titleEl);
  textWrap.appendChild(sub);
  textWrap.appendChild(viewBtn);
  inner.appendChild(mark);
  inner.appendChild(textWrap);
  inner.appendChild(closeBtn);

  const track = document.createElement("div");
  track.style.cssText = "height:2.5px; background:rgba(255,255,255,.12);";
  const bar = document.createElement("div");
  bar.style.cssText = `height:100%; width:100%; background:#4C7A5E; transition:width ${DURATION}ms linear;`;
  track.appendChild(bar);

  wrap.appendChild(inner);
  wrap.appendChild(track);
  document.body.appendChild(wrap);

  requestAnimationFrame(() => {
    wrap.style.opacity = "1";
    wrap.style.transform = "translateY(0)";
    requestAnimationFrame(() => {
      bar.style.width = "0%";
    });
  });

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    wrap.style.opacity = "0";
    wrap.style.transform = "translateY(8px)";
    setTimeout(() => wrap.remove(), 200);
  }

  setTimeout(dismiss, DURATION);
}
