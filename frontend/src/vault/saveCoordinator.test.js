import test from "node:test";
import assert from "node:assert/strict";
import { createSerialQueue, isRevisionCurrent } from "./saveCoordinator.js";

test("Vault save operations run in order and the queue recovers after a failed save", async () => {
  const enqueue = createSerialQueue();
  const order = [];
  let releaseFirst;
  const gate = new Promise((resolve) => { releaseFirst = resolve; });
  const first = enqueue(async () => { order.push("first-start"); await gate; order.push("first-end"); });
  const second = enqueue(async () => { order.push("second"); });
  await Promise.resolve();
  assert.deepEqual(order, ["first-start"]);
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(order, ["first-start", "first-end", "second"]);

  await assert.rejects(enqueue(async () => { throw new Error("disk write failed"); }), /disk write failed/);
  assert.equal(await enqueue(async () => "recovered"), "recovered");
});

test("Only the unchanged Vault revision may be marked clean after saving", () => {
  assert.equal(isRevisionCurrent(7, 7), true);
  assert.equal(isRevisionCurrent(7, 8), false);
});
