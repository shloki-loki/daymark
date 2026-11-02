import { test } from "node:test";
import assert from "node:assert/strict";
import { countdown, months, upsertNote } from "./model.js";

test("1 Nov 2026 to 31 Dec 2027 is 426 days; 2 Nov is day 2", () => {
  assert.deepEqual(countdown("2026-11-02"), { total: 426, day: 2, left: 424 });
  assert.deepEqual(countdown("2027-12-31"), { total: 426, day: 426, left: 0 });
  assert.deepEqual(countdown("2026-10-20"), { total: 426, day: 0, left: 426 });
  assert.deepEqual(countdown("2028-02-01"), { total: 426, day: 426, left: 0 });
});

test("months cover every day, Nov 2026 through Dec 2027", () => {
  const m = months();
  assert.equal(m.length, 14);
  assert.equal(m[0].days.length, 30);
  assert.equal(m.reduce((s, x) => s + x.days.length, 0), 426);
});

test("one note per date, newest first, empty text removes", () => {
  let n = upsertNote([], "2026-11-01", "first");
  n = upsertNote(n, "2026-11-02", "second");
  n = upsertNote(n, "2026-11-01", " edited ");
  assert.deepEqual(n, [
    { date: "2026-11-02", text: "second" },
    { date: "2026-11-01", text: "edited" },
  ]);
  assert.equal(upsertNote(n, "2026-11-02", "  ").length, 1);
});
