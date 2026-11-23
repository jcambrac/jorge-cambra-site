"use client";
// <GradientMap /> — drag a point on a loss map; see the gradient and take steps downhill.
import { useEffect, useRef } from "react";

// Interactive gradient map: drag the point; the gradient (uphill), minus the gradient (downhill)
// and the two partial derivatives update. "Step downhill" takes one gradient descent step.
// mountGradientMap(el). No dependencies.
function mountGradientMap(root) {
  const C = { text: "#1f2328", dim: "#6b7280", blue: "#2b7bb9", red: "#d93f3f", amber: "#d48a00", green: "#2f9e44", grid: "#e5e7eb" };
  const NS = "http://www.w3.org/2000/svg";
  const f = (a, b) => a * a + 3 * b * b;
  const g = (a, b) => [2 * a, 6 * b];
  const CX = 330, CY = 300, S = 105, K = 0.15, LR = 0.1; // K = arrow scale, LR = step size
  const P = (a, b) => [CX + a * S, CY - b * S];
  let w = [1, 1], trail = [];

  root.innerHTML = "";
  root.style.cssText = "background:#fff;color:#1f2328;font-family:system-ui,-apple-system,Segoe UI,sans-serif;border:1px solid #e5e7eb;border-radius:10px;padding:12px;max-width:900px";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 900 560");
  svg.style.cssText = "width:100%;display:block;touch-action:none;user-select:none";
  root.appendChild(svg);
  const el = (tag, a, txt, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; parent.appendChild(e); return e; };
  const T = (x, y, s, a = {}) => el("text", { x, y, fill: C.text, "font-size": 13, ...a }, s);

  const defs = el("defs", {});
  [["r", C.red], ["g", C.amber], ["d", C.dim]].forEach(([n, c]) => {
    const m = el("marker", { id: "gm" + n, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, undefined, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: c }, undefined, m);
  });
  const cp = el("clipPath", { id: "gmclip" }, undefined, defs);
  el("rect", { x: CX - 2.2 * S, y: 70, width: 4.4 * S, height: 480 }, undefined, cp);

  T(40, 30, "The gradient, seen from above. Drag the black dot.", { "font-size": 17 });
  T(40, 52, "A loss with two weights: L = w₁² + 3·w₂². Each ring is one height, like a hiking map.", { fill: C.dim });

  const map = el("g", { "clip-path": "url(#gmclip)" });
  [0.25, 1, 2.25, 4, 6.25, 9].forEach((c, i) => el("ellipse", { cx: CX, cy: CY, rx: Math.sqrt(c) * S, ry: Math.sqrt(c / 3) * S, fill: "none", stroke: C.blue, "stroke-opacity": 0.25 + 0.1 * i, "stroke-width": 1.5 }, undefined, map));
  el("line", { x1: CX - 2.2 * S, y1: CY, x2: CX + 2.2 * S, y2: CY, stroke: C.grid }, undefined, map);
  el("line", { x1: CX, y1: 70, x2: CX, y2: 550, stroke: C.grid }, undefined, map);
  // invisible hit area so you can click/drag anywhere on the map
  const hit = el("rect", { x: CX - 2.2 * S, y: 70, width: 4.4 * S, height: 480, fill: "transparent" });
  T(CX + 2.2 * S - 4, CY + 18, "w₁ →", { "text-anchor": "end", fill: C.dim });
  T(CX + 8, 88, "w₂ ↑", { fill: C.dim });
  el("circle", { cx: CX, cy: CY, r: 5, fill: C.green });
  T(CX - 8, CY + 18, "lowest loss", { "text-anchor": "end", fill: C.green, "font-size": 12 });

  const trailLine = el("polyline", { fill: "none", stroke: C.amber, "stroke-width": 1.5, "stroke-dasharray": "3 3", opacity: 0.8 });
  const partX = el("line", { stroke: C.dim, "stroke-width": 1.6, "stroke-dasharray": "4 3", "marker-end": "url(#gmd)" });
  const partY = el("line", { stroke: C.dim, "stroke-width": 1.6, "stroke-dasharray": "4 3", "marker-end": "url(#gmd)" });
  const up = el("line", { stroke: C.red, "stroke-width": 3, "marker-end": "url(#gmr)" });
  const down = el("line", { stroke: C.amber, "stroke-width": 3, "marker-end": "url(#gmg)" });
  const dot = el("circle", { r: 9, fill: C.text, stroke: "#fff", "stroke-width": 2, style: "cursor:grab" });

  // legend + readout
  const LX = 600;
  [[C.red, "gradient", "the steepest way uphill"], [C.amber, "minus the gradient", "downhill: where training goes"], [C.dim, "its two parts", "uphill moving only w₁, or only w₂"]].forEach(([c, t1, t2], i) => {
    const y = 120 + i * 62;
    el("line", { x1: LX, y1: y, x2: LX + 36, y2: y, stroke: c, "stroke-width": 3, ...(i === 2 ? { "stroke-dasharray": "5 4" } : {}) });
    T(LX + 46, y + 5, t1, { fill: c, "font-size": 15 });
    T(LX + 46, y + 24, t2, { fill: C.dim });
  });
  const rows = [0, 1, 2, 3].map((i) => T(LX, 330 + i * 24, "", { "font-size": 15, "font-family": "ui-monospace,Menlo,monospace" }));
  const note = T(LX, 440, "", { fill: C.dim });

  function render() {
    const [a, b] = w, [ga, gb] = g(a, b);
    const [x0, y0] = P(a, b);
    dot.setAttribute("cx", x0); dot.setAttribute("cy", y0);
    const [hx] = P(a + ga * K, b), [ux, uy] = P(a + ga * K, b + gb * K), [dx, dy] = P(a - ga * K, b - gb * K);
    partX.setAttribute("x1", x0); partX.setAttribute("y1", y0); partX.setAttribute("x2", hx); partX.setAttribute("y2", y0);
    partY.setAttribute("x1", hx); partY.setAttribute("y1", y0); partY.setAttribute("x2", ux); partY.setAttribute("y2", uy);
    up.setAttribute("x1", x0); up.setAttribute("y1", y0); up.setAttribute("x2", ux); up.setAttribute("y2", uy);
    down.setAttribute("x1", x0); down.setAttribute("y1", y0); down.setAttribute("x2", dx); down.setAttribute("y2", dy);
    const tiny = Math.hypot(ga, gb) < 0.15;
    [partX, partY, up, down].forEach((l) => (l.style.display = tiny ? "none" : ""));
    trailLine.setAttribute("points", trail.concat([w]).map(([p, q]) => P(p, q).join(",")).join(" "));
    rows[0].textContent = `w₁ = ${a.toFixed(2)}   w₂ = ${b.toFixed(2)}`;
    rows[1].textContent = `L = ${f(a, b).toFixed(2)}`;
    rows[2].textContent = `∂L/∂w₁ = 2·w₁ = ${ga.toFixed(2)}`;
    rows[3].textContent = `∂L/∂w₂ = 6·w₂ = ${gb.toFixed(2)}`;
    note.textContent = tiny ? "At the bottom: the gradient is (almost) zero." : "Each step moves along the amber arrow.";
  }

  let dragging = false;
  const toW = (e) => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [Math.max(-2.1, Math.min(2.1, (p.x - CX) / S)), Math.max(-2.2, Math.min(2.2, (CY - p.y) / S))];
  };
  const startDrag = (e) => { dragging = true; trail = []; w = toW(e); render(); e.preventDefault(); };
  dot.addEventListener("pointerdown", startDrag);
  hit.addEventListener("pointerdown", startDrag);
  svg.addEventListener("pointermove", (e) => { if (dragging) { w = toW(e); render(); } });
  window.addEventListener("pointerup", () => (dragging = false));

  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:6px";
  root.appendChild(bar);
  const btn = (t, fn) => { const b = document.createElement("button"); b.textContent = t; b.onclick = fn; b.style.cssText = "background:#f5f7fa;border:1px solid #d0d5dd;border-radius:6px;padding:6px 12px;font-size:14px;cursor:pointer"; bar.appendChild(b); };
  btn("Step downhill", () => { const [ga, gb] = g(...w); trail.push(w); w = [w[0] - LR * ga, w[1] - LR * gb]; render(); });
  btn("Reset", () => { w = [1, 1]; trail = []; render(); });

  render();
}

export default function GradientMap() {
  const ref = useRef(null);
  useEffect(() => mountGradientMap(ref.current), []);
  return <div ref={ref} />;
}
