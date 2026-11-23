"use client";
// <LinregTrain /> — drag the size weight (or press Step) and the error bowl and the fitted line move together.
import { useEffect, useRef } from "react";

// Minimal interactive: drag the size weight or press Step; the bowl dot and the line move together.
// mountLinregTrain(el). No dependencies.
function mountLinregTrain(root) {
  const pts = [[32,420],[38,560],[44,540],[50,700],[55,640],[61,800],[66,760],[72,800],[78,960],[83,930],[88,1080],[92,1000]];
  const BIAS = 140, n = pts.length;
  const mse = (w) => pts.reduce((a, [s, y]) => a + (w * s + BIAS - y) ** 2, 0) / n;
  const grad = (w) => pts.reduce((a, [s, y]) => a + 2 * (w * s + BIAS - y) * s, 0) / n;
  const LR = 0.5 / (2 * pts.reduce((a, [s]) => a + s * s, 0) / n);
  const C = { text: "#1f2328", dim: "#6b7280", blue: "#2b7bb9", amber: "#d48a00", red: "#d93f3f", grid: "#e5e7eb" };
  const NS = "http://www.w3.org/2000/svg";
  let w = 6;

  root.innerHTML = "";
  root.style.cssText = "background:#fff;color:#1f2328;font-family:system-ui,-apple-system,Segoe UI,sans-serif;border:1px solid #e5e7eb;border-radius:10px;padding:12px;max-width:1000px";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 1000 470");
  svg.style.cssText = "width:100%;display:block";
  root.appendChild(svg);
  const el = (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; svg.appendChild(e); return e; };
  const T = (x, y, s, a = {}) => el("text", { x, y, fill: C.text, "font-size": 13, ...a }, s);

  // left: bowl
  const L = 90, R = 450, Tp = 40, B = 400, wmin = 5, wmax = 14, emax = mse(5) * 1.05;
  const X = (v) => L + (v - wmin) / (wmax - wmin) * (R - L), Y = (e) => B - Math.min(e, emax) / emax * (B - Tp);
  T(L, 26, "How wrong the model is, for each size weight", { fill: C.dim, "font-size": 14 });
  el("line", { x1: L, y1: B, x2: R, y2: B, stroke: C.dim }); el("line", { x1: L, y1: Tp, x2: L, y2: B, stroke: C.dim });
  for (let v = 5; v <= 14; v++) T(X(v), B + 18, String(v), { "text-anchor": "middle", fill: C.dim, "font-size": 12 });
  T((L + R) / 2, B + 40, "size weight ($ per m²)", { "text-anchor": "middle", fill: C.dim, "font-size": 14 });
  let d = ""; for (let i = 0; i <= 200; i++) { const v = wmin + i * (wmax - wmin) / 200; d += `${X(v).toFixed(1)},${Y(mse(v)).toFixed(1)} `; }
  el("polyline", { points: d, fill: "none", stroke: C.text, "stroke-width": 2.5 });
  const tangent = el("line", { stroke: C.amber, "stroke-width": 2 });
  const dot = el("circle", { r: 8, fill: C.blue, stroke: C.text });
  const slopeTxt = T(0, 0, "", { fill: C.amber });

  // right: data + line
  const L2 = 560, R2 = 960, T2 = 40, B2 = 400, xmin = 25, xmax = 95, ymin = 200, ymax = 1200;
  const X2 = (v) => L2 + (v - xmin) / (xmax - xmin) * (R2 - L2), Y2 = (v) => B2 - (v - ymin) / (ymax - ymin) * (B2 - T2);
  T(L2, 26, "The line for that weight", { fill: C.dim, "font-size": 14 });
  for (let v = 400; v <= 1200; v += 200) { el("line", { x1: L2, y1: Y2(v), x2: R2, y2: Y2(v), stroke: C.grid }); T(L2 - 8, Y2(v) + 4, "$" + v, { "text-anchor": "end", fill: C.dim, "font-size": 12 }); }
  el("line", { x1: L2, y1: B2, x2: R2, y2: B2, stroke: C.dim }); el("line", { x1: L2, y1: T2, x2: L2, y2: B2, stroke: C.dim });
  for (let v = 30; v <= 90; v += 20) T(X2(v), B2 + 18, String(v), { "text-anchor": "middle", fill: C.dim, "font-size": 12 });
  T((L2 + R2) / 2, B2 + 40, "size (m²)", { "text-anchor": "middle", fill: C.dim, "font-size": 14 });
  const defs = el("defs", {}); const cp = document.createElementNS(NS, "clipPath"); cp.setAttribute("id", "lrclip"); defs.appendChild(cp);
  const cr = document.createElementNS(NS, "rect"); for (const [k, v] of Object.entries({ x: L2, y: T2, width: R2 - L2, height: B2 - T2 })) cr.setAttribute(k, v); cp.appendChild(cr);
  const misses = pts.map(() => el("line", { stroke: C.red, "stroke-width": 1.4, "clip-path": "url(#lrclip)" }));
  const line = el("line", { stroke: C.blue, "stroke-width": 3, "clip-path": "url(#lrclip)" });
  pts.forEach(([s, y]) => el("circle", { cx: X2(s), cy: Y2(y), r: 5, fill: C.text }));
  const readout = T(500, 462, "", { "text-anchor": "middle", "font-size": 15 });

  // controls
  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:6px;font-size:14px";
  root.appendChild(bar);
  const slider = document.createElement("input");
  Object.assign(slider, { type: "range", min: 5, max: 14, step: 0.01, value: w });
  slider.style.width = "260px";
  slider.oninput = () => { w = +slider.value; render(); };
  const lab = document.createElement("span"); lab.textContent = "size weight";
  const btn = (t, f) => { const b = document.createElement("button"); b.textContent = t; b.onclick = f; b.style.cssText = "background:#f5f7fa;border:1px solid #d0d5dd;border-radius:6px;padding:6px 12px;font-size:14px;cursor:pointer"; return b; };
  bar.append(lab, slider, btn("Step", () => { w = Math.max(wmin, Math.min(wmax, w - LR * grad(w))); render(); }), btn("Reset", () => { w = 6; render(); }));

  function render() {
    slider.value = w;
    const e = mse(w), g = grad(w), dw = 0.8;
    dot.setAttribute("cx", X(w)); dot.setAttribute("cy", Y(e));
    tangent.setAttribute("x1", X(w - dw)); tangent.setAttribute("y1", Y(e - g * dw));
    tangent.setAttribute("x2", X(w + dw)); tangent.setAttribute("y2", Y(e + g * dw));
    const right = g < 0;
    slopeTxt.setAttribute("x", X(w) + (right ? 14 : -14));
    slopeTxt.setAttribute("y", Y(e) - 14);
    slopeTxt.setAttribute("text-anchor", right ? "start" : "end");
    slopeTxt.textContent = Math.abs(g) < 300 ? "slope ≈ 0: at the bottom" : right ? "slope negative → move right" : "slope positive → move left";
    line.setAttribute("x1", X2(xmin)); line.setAttribute("y1", Y2(w * xmin + BIAS));
    line.setAttribute("x2", X2(xmax)); line.setAttribute("y2", Y2(w * xmax + BIAS));
    pts.forEach(([s, y], i) => { const m = misses[i]; m.setAttribute("x1", X2(s)); m.setAttribute("x2", X2(s)); m.setAttribute("y1", Y2(y)); m.setAttribute("y2", Y2(Math.max(ymin, Math.min(ymax, w * s + BIAS)))); });
    readout.textContent = `weight ${w.toFixed(2)} $/m²   ·   mean squared error ${Math.round(e).toLocaleString("en-US")}   ·   slope ${Math.round(g).toLocaleString("en-US")}`;
  }
  render();
}

export default function LinregTrain() {
  const ref = useRef(null);
  useEffect(() => { mountLinregTrain(ref.current); }, []);
  return <div ref={ref} />;
}
