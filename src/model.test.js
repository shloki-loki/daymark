import { test } from "node:test";
import assert from "node:assert/strict";
import { progress, status, toggleMilestone } from "./model.js";
const task = {
  type: "continuous",
  milestones: [
    { id: "a", done: false },
    { id: "b", done: false },
  ],
};
test("completion and undo recalculate progress without resetting other milestones", () => {
  let t = toggleMilestone(task, "a");
  assert.equal(progress(t), 50);
  assert.equal(status(t), "In progress");
  t = toggleMilestone(t, "b");
  assert.equal(progress(t), 100);
  assert.equal(status(t), "Completed");
  t = toggleMilestone(t, "a");
  assert.equal(progress(t), 50);
  assert.equal(t.milestones[1].done, true);
});
test("empty tasks and one-time completion", () => {
  assert.equal(progress({ ...task, milestones: [] }), 0);
  assert.equal(progress({ type: "once", done: true }), 100);
  assert.equal(status(task), "Not started");
});
