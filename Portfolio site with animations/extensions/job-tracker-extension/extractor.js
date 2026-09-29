// Injected into the job posting page via chrome.scripting.executeScript.
// Exposes window.__jhtExtractJobData() which the popup / background script
// call afterward to pull structured data out of the page.
(function () {
  function getMeta(attr, value) {
    const el = document.querySelector(`meta[${attr}="${value}"]`);
    return el ? el.content.trim() : "";
  }

  /* ---------- schema.org JobPosting (JSON-LD) ---------- */
  // Most ATS platforms (Greenhouse, Lever, LinkedIn, Indeed, Ashby...)
  // embed this. It's a far more reliable source than scraping the DOM.
  function findJobPostingLd() {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    for (const s of scripts) {
      let data;
      try {
        data = JSON.parse(s.textContent);
      } catch {
        continue;
      }
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const found = findJobPostingInNode(item);
        if (found) return found;
      }
    }
    return null;
  }

  function findJobPostingInNode(node) {
    if (!node || typeof node !== "object") return null;
    const type = node["@type"];
    const isJobPosting = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
    if (isJobPosting) return node;
    if (Array.isArray(node["@graph"])) {
      for (const child of node["@graph"]) {
        const found = findJobPostingInNode(child);
        if (found) return found;
      }
    }
    return null;
  }

  function formatSalary(baseSalary) {
    if (!baseSalary) return "";
    const currency = baseSalary.currency || "";
    const value = baseSalary.value;
    if (!value) return "";
    const unit = (value.unitText || "").toLowerCase();
    const unitLabel = { year: "/yr", hour: "/hr", month: "/mo", week: "/wk", day: "/day" }[unit] || "";
    const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);

    if (value.minValue && value.maxValue) {
      return `${currency} ${fmt(value.minValue)} to ${fmt(value.maxValue)}${unitLabel}`.trim();
    }
    if (value.value) {
      return `${currency} ${fmt(value.value)}${unitLabel}`.trim();
    }
    return "";
  }

  function formatLocation(jobLocation, jobLocationType) {
    if (jobLocationType && /telecommute/i.test(jobLocationType)) return "Remote";
    if (!jobLocation) return "";
    const locations = Array.isArray(jobLocation) ? jobLocation : [jobLocation];
    const parts = locations
      .map((loc) => {
        const addr = loc && loc.address;
        if (!addr) return "";
        return [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(", ");
      })
      .filter(Boolean);
    return parts.join(" · ");
  }

  /* ---------- turning an HTML description into clean, sectioned text ---------- */

  function parseFragment(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html || "";
    return wrapper;
  }

  // Splits a container into lines, treating <li> as one bullet-worthy line
  // each, and block elements as line breaks.
  function linesFromNode(node) {
    const lines = [];
    const walk = (el) => {
      if (!el) return;
      if (el.nodeType === Node.TEXT_NODE) return;
      const tag = el.tagName;
      if (tag === "LI") {
        const text = el.innerText.trim();
        if (text) lines.push(text);
        return;
      }
      if (tag === "UL" || tag === "OL") {
        Array.from(el.children).forEach(walk);
        return;
      }
      if (["P", "DIV", "BR", "H1", "H2", "H3", "H4", "H5", "H6"].includes(tag)) {
        const text = el.innerText ? el.innerText.trim() : "";
        if (text && !Array.from(el.children).some((c) => ["UL", "OL"].includes(c.tagName))) {
          lines.push(text);
          return;
        }
      }
      Array.from(el.children || []).forEach(walk);
    };
    Array.from(node.children).forEach(walk);
    return lines.filter(Boolean);
  }

  // Looks for a heading matching keywords, then collects lines until the
  // next heading of equal-or-higher level.
  function findSectionInDoc(root, keywords) {
    const headings = Array.from(root.querySelectorAll("h1,h2,h3,h4,h5,strong,b"));
    for (const el of headings) {
      const text = (el.innerText || "").trim().toLowerCase();
      if (!text || text.length > 80) continue;
      if (keywords.some((k) => text.includes(k))) {
        const collected = [];
        let cur = el.closest("h1,h2,h3,h4,h5,strong,b") === el ? el : el;
        let sib = cur.nextElementSibling || (cur.parentElement && cur.parentElement.nextElementSibling);
        let node = cur;
        for (let i = 0; i < 10; i++) {
          node = node.nextElementSibling;
          if (!node) break;
          if (/^H[1-5]$/.test(node.tagName)) break;
          collected.push(...linesFromNode(wrapSingle(node)));
          if (collected.join("\n").length > 1600) break;
        }
        if (collected.length) return collected.join("\n");
      }
    }
    return "";
  }

  function wrapSingle(el) {
    const w = document.createElement("div");
    w.appendChild(el.cloneNode(true));
    return w;
  }

  function findSectionOnLivePage(keywords) {
    const candidates = Array.from(document.querySelectorAll("h1,h2,h3,h4,strong,b"));
    for (const el of candidates) {
      const text = (el.innerText || "").trim().toLowerCase();
      if (!text || text.length > 80) continue;
      if (keywords.some((k) => text.includes(k))) {
        const collected = [];
        let cur = el;
        for (let i = 0; i < 10; i++) {
          cur = cur.nextElementSibling;
          if (!cur) break;
          if (/^H[1-4]$/.test(cur.tagName)) break;
          collected.push(...linesFromNode(wrapSingle(cur)));
          if (collected.join("\n").length > 1600) break;
        }
        if (collected.length) return collected.join("\n");
      }
    }
    return "";
  }

  const RESPONSIBILITY_KEYWORDS = [
    "responsibilit",
    "what you'll do",
    "what you will do",
    "the role",
    "day to day",
    "day-to-day",
    "in this role",
  ];
  const REQUIREMENT_KEYWORDS = [
    "requirement",
    "qualif",
    "what we're looking for",
    "what you'll bring",
    "you have",
    "you'll need",
    "skills",
    "about you",
  ];

  /* ---------- salary / location fallback for pages without JSON-LD ---------- */

  function guessSalaryFromText() {
    const text = document.body.innerText || "";
    const match = text.match(/\$\s?\d[\d,]*(?:\.\d+)?\s?(?:k|K)?\s?(?:to|-)\s?\$?\s?\d[\d,]*(?:\.\d+)?\s?(?:k|K)?(?:\s?\/\s?(?:yr|hr|year|hour|mo|month))?/);
    return match ? match[0].trim() : "";
  }

  function guessLocationFromDom() {
    const el = document.querySelector(
      '[class*="location" i], [data-testid*="location" i], [id*="location" i]'
    );
    if (!el) return "";
    const text = (el.innerText || "").trim();
    if (text && text.length < 70) return text;
    return "";
  }

  /* ---------- main ---------- */

  window.__jhtExtractJobData = function () {
    const title = (document.title || "").trim();
    const ogTitle = getMeta("property", "og:title");
    const ogSiteName = getMeta("property", "og:site_name");
    const metaDescription = getMeta("name", "description") || getMeta("property", "og:description");
    const hostname = location.hostname.replace(/^www\./, "");

    const jobPosting = findJobPostingLd();

    let role = "";
    let company = "";
    let location_ = "";
    let salary = "";
    let responsibilities = "";
    let requirements = "";
    let notes = metaDescription;

    if (jobPosting) {
      role = jobPosting.title || "";
      company = (jobPosting.hiringOrganization && jobPosting.hiringOrganization.name) || "";
      location_ = formatLocation(jobPosting.jobLocation, jobPosting.jobLocationType);
      salary = formatSalary(jobPosting.baseSalary);

      if (jobPosting.description) {
        const frag = parseFragment(jobPosting.description);
        responsibilities = findSectionInDoc(frag, RESPONSIBILITY_KEYWORDS);
        requirements = findSectionInDoc(frag, REQUIREMENT_KEYWORDS);

        if (!responsibilities && !requirements) {
          // No clear headings inside the description, use the whole thing
          // as a first-draft "responsibilities" block for the person to sort.
          const allLines = linesFromNode(frag);
          if (allLines.length) responsibilities = allLines.join("\n");
        }
      }
    }

    // Fall back to scanning the live page for anything JSON-LD didn't give us.
    if (!role) role = (ogTitle || title).split(/\s[|]\s/)[0].trim();
    if (!company) company = ogSiteName || hostname.split(".")[0].replace(/^\w/, (c) => c.toUpperCase());
    if (!responsibilities) responsibilities = findSectionOnLivePage(RESPONSIBILITY_KEYWORDS);
    if (!requirements) requirements = findSectionOnLivePage(REQUIREMENT_KEYWORDS);
    if (!location_) location_ = guessLocationFromDom();
    if (!salary) salary = guessSalaryFromText();

    return {
      href: location.href,
      hostname,
      role,
      company,
      location: location_,
      salary,
      responsibilities,
      requirements,
      notes,
    };
  };
})();
