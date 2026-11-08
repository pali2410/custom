import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createNetwork,
  forward,
  train,
  loss,
  samples,
} from "../src/utils/network.js";
test("backpropagation learns all XOR cases", () => {
  const n = createNetwork(),
    trained = train(n, 3000);
  assert.ok(loss(trained) < 0.03);
  assert.ok(loss(trained) < loss(n));
  for (const [a, b, y] of samples)
    assert.equal(Number(forward(trained, [a, b]).output > 0.5), y);
  assert.equal(n.epoch, 0);
});
