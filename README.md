# Daymark

One page for a 426-day run, 1 Nov 2026 → 31 Dec 2027: a dot per day (lived, today, ahead), goals for the whole run (left), goals for the current month (right; past months fold into collapsible folders), and a journal under the dots with one note per date, newest first. Notes can be edited, deleted, or back-filled for a missed day.

No sign-in. Everything is saved in the browser's localStorage. Use **Export** for a JSON backup and **Import** to restore it or move to another device. Days roll over at midnight Asia/Kolkata. Change the range in `src/model.js` (`START`, `END`).

## Develop

`npm ci`, `npm run dev`, `npm test`, `npm run build`. Hosted on Vercel (Vite preset, output `dist`).
