// Deterministic 2 → 4 → 1 tanh/sigmoid network. Full-batch XOR training.
export function createNetwork() {
  return {
    w: [
      [0.8, -0.5],
      [-0.7, 0.9],
      [0.4, 0.6],
      [-0.9, -0.4],
    ],
    b: [0.1, -0.2, 0.3, -0.1],
    v: [0.6, -0.7, 0.8, -0.5],
    c: 0,
    epoch: 0,
  };
}
export function forward(n, x) {
  const hidden = n.w.map((w, i) =>
    Math.tanh(w[0] * x[0] + w[1] * x[1] + n.b[i]),
  );
  return {
    hidden,
    output:
      1 / (1 + Math.exp(-hidden.reduce((s, h, i) => s + h * n.v[i], n.c))),
  };
}
export const samples = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
];
export function loss(n) {
  return (
    samples.reduce((s, [a, b, y]) => {
      const p = Math.max(1e-9, Math.min(1 - 1e-9, forward(n, [a, b]).output));
      return s - y * Math.log(p) - (1 - y) * Math.log(1 - p);
    }, 0) / 4
  );
}
export function train(n, steps = 100, rate = 0.7) {
  let next = structuredClone(n);
  for (let step = 0; step < steps; step++) {
    const dw = next.w.map(() => [0, 0]),
      db = [0, 0, 0, 0],
      dv = [0, 0, 0, 0];
    let dc = 0;
    for (const [a, b, y] of samples) {
      const { hidden, output } = forward(next, [a, b]);
      const d = (output - y) / 4;
      dc += d;
      hidden.forEach((h, i) => {
        dv[i] += d * h;
        const dh = d * next.v[i] * (1 - h * h);
        db[i] += dh;
        dw[i][0] += dh * a;
        dw[i][1] += dh * b;
      });
    }
    next.w.forEach((w, i) => {
      w[0] -= rate * dw[i][0];
      w[1] -= rate * dw[i][1];
      next.b[i] -= rate * db[i];
      next.v[i] -= rate * dv[i];
    });
    next.c -= rate * dc;
    next.epoch++;
  }
  return next;
}
