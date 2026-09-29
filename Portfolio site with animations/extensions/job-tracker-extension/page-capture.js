/**
 * Shared between popup.js and background.js. Injects extractor.js into the
 * target tab, runs it, and shapes the result into the fields our storage
 * layer expects.
 */
async function captureJobFromTab(tab) {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["extractor.js"],
  });

  const [{ result: data }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.__jhtExtractJobData(),
  });

  return {
    url: data.href,
    company: data.company,
    role_title: data.role,
    location: data.location,
    salary: data.salary,
    responsibilities: data.responsibilities,
    requirements: data.requirements,
    notes: data.notes || "",
    source_site: data.hostname,
  };
}
