// The journey runs from START to END inclusive. Dates are plain "YYYY-MM-DD"
// strings in Asia/Kolkata so a day never shifts with the browser's clock zone.
export const START = "2026-11-01";
export const END = "2027-12-31";

export const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const DAY = 86400000;
const toUTC = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const fromUTC = (ms) => new Date(ms).toISOString().slice(0, 10);

export const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / DAY);
export const addDays = (iso, n) => fromUTC(toUTC(iso) + n * DAY);

// total days, today's day number (1-based, clamped), and days still to come.
export function countdown(now = today()) {
  const total = daysBetween(START, END) + 1;
  const day = Math.min(Math.max(daysBetween(START, now) + 1, 0), total);
  return { total, day, left: total - day };
}

// Every day of the journey grouped by month, for the dot grid.
export function months() {
  const out = [];
  for (let d = START; d <= END; d = addDays(d, 1)) {
    const key = d.slice(0, 7);
    if (out.at(-1)?.key !== key) out.push({ key, days: [] });
    out.at(-1).days.push(d);
  }
  return out;
}

// One note per date: saving a date that already has a note replaces it.
export function upsertNote(notes, date, text) {
  const rest = notes.filter((n) => n.date !== date);
  const next = text.trim() ? [...rest, { date, text: text.trim() }] : rest;
  return next.sort((a, b) => b.date.localeCompare(a.date));
}

export const prettyDate = (iso, opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) =>
  new Date(toUTC(iso)).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
