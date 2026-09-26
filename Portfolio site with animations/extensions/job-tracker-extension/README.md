# Job Hunt Tracker: Chrome Extension

Captures job postings as you browse: company, role, location, salary,
responsibilities, and requirements, into a clean dashboard right inside
the extension.

**No sign-up. No login. No server.** Everything is stored with
`chrome.storage.local`, scoped to this one browser profile. There is no
shared database, so there is no way for one person's saved jobs to end up
visible to anyone else. Each install is its own private copy, by
construction, not by policy.

## Install

1. Chrome -> `chrome://extensions`
2. Enable **Developer mode** (top right)
3. **Load unpacked** -> select this `job-tracker-extension` folder
4. Pin it to your toolbar

That's it. No accounts, no API keys, no environment variables to fill in.

## Use

- Land on a job posting, click the extension icon, hit **Save this job**.
  It reads the page's structured job data when the site provides it (most
  ATS platforms like Greenhouse, Lever, and LinkedIn do), so company, role,
  location, salary, and the JD text usually come in filled out. When a site
  doesn't provide that, it falls back to scanning the page for headings
  like "Responsibilities" or "Requirements."
- Or skip the popup entirely: press **Alt+Shift+J** on any job page to save
  it instantly. A small toast appears in the corner confirming it was
  added, with a **View dashboard** button and a thin progress bar that
  fades it out on its own. You can change this shortcut any time at
  `chrome://extensions/shortcuts`.
- The popup shows a **Saved** badge, lets you quick-edit company/role right
  there, and has a **Mark as applied** button.
- Click **Open dashboard** to see everything as cards or a table, search
  and filter, and review the fuller listing.

## The dashboard

- Responsibilities and "What they're looking for" render as bullet lists.
  Click either one to edit it as plain text (one item per line), click away
  to save it back as bullets.
- The original posting link sits in its own subtly highlighted box, so it
  reads as the source of truth rather than another editable field.
- Your own notes (resume-tailoring ideas, interview talking points) live in
  a visually separate section, so what the listing said and what you added
  never get confused.
- Inside an entry, use **Prev / Next** (or the left / right arrow keys) to
  move through your saved roles without going back to the list each time.

## Your data, your device

Since there is no backend, there is also nothing for you to lose access to,
but nothing syncs across devices either. Two things to know:

- **Uninstalling the extension deletes its data.** Chrome clears
  `chrome.storage.local` when an extension is removed.
- **Use Export / Import** (buttons in the dashboard header) to back up your
  entries as a JSON file, move them to another computer, or restore after
  a reinstall. Re-importing the same file twice won't create duplicates,
  it matches on the job URL.

## Sharing this with other people

Anyone can use this the same way you do: they load the same
`job-tracker-extension` folder unpacked (or you publish it to the Chrome
Web Store), and it works immediately on their machine with their own
private, local data. There is nothing to deploy or host on your end, you
are just sharing the extension files.

## How extraction works, and its limits

The extension looks for schema.org `JobPosting` structured data first
(most ATS platforms embed this) for the most reliable fields. Where that's
missing, it falls back to a best-effort scan for headings like
"Responsibilities" or "Requirements" and nearby salary/location patterns.
Job sites vary a lot, so treat the auto-capture as a strong first draft,
not a final answer. Every field is editable in the popup and the
dashboard.

## Project structure

```
job-tracker-extension/
  manifest.json      extension config: permissions, popup, background, shortcut
  store.js            shared local storage layer (get/insert/update/delete/export/import)
  extractor.js         injected into job pages to pull structured data out
  page-capture.js      shared helper that runs extractor.js and shapes the result
  background.js         keyboard shortcut handler + the save-confirmation toast
  popup.html/js/css     quick capture + status when you click the icon
  dashboard.html/js/css full review UI: cards/table, search, filters, editing
  icons/
```
