"use client";
// <OneWeight /> — one weight from the side: gradient vs update, Step, learning-rate slider.
import { useEffect, useRef } from "react";

// One weight, seen from the side. Drag the weight along the floor; the red arrow (gradient) points to the
// higher wall, the amber arrow (update) points the other way. Step applies the update; the slider sets η.
// mountOneWeight(el). No dependencies.
function mountOneWeight(root) {
  const C = { text: "#1f2328", dim: "#6b7280", blue: "#2b7bb9", red: "#d93f3f", amber: "#d48a00", green: "#2f9e44", grid: "#e5e7eb" };
  const NS = "http://www.w3.org/2000/svg";
  const f = (w) => (w - 3) ** 2, g = (w) => 2 * (w - 3);
  const L = 80, R = 840, T = 60, B = 360, wmin = -1, wmax = 7, lmax = 16;
  const X = (w) => L + (w - wmin) / (wmax - wmin) * (R - L);
  const Y = (l) => B - Math.min(l, lmax * 1.2) / lmax * (B - T);
  const GK = 0.12; // gradient arrow: w-units per unit of gradient (drawing scale)
  let w = 0, eta = 0.1, trail = [];

  root.innerHTML = "";
  root.style.cssText = "background:#fff;color:#1f2328;font-family:system-ui,-apple-system,Segoe UI,sans-serif;border:1px solid #e5e7eb;border-radius:10px;padding:12px;max-width:900px";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 900 470");
  svg.style.cssText = "width:100%;display:block;touch-action:none;user-select:none";
  root.appendChild(svg);
  const el = (tag, a, txt, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; parent.appendChild(e); return e; };
  const T_ = (x, y, s, a = {}) => el("text", { x, y, fill: C.text, "font-size": 13, ...a }, s);

  const defs = el("defs", {});
  [["r", C.red], ["a", C.amber]].forEach(([n, c]) => {
    const m = el("marker", { id: "ow" + n, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, undefined, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: c }, undefined, m);
  });
  const cp = el("clipPath", { id: "owclip" }, undefined, defs);
  el("rect", { x: L - 40, y: T - 10, width: R - L + 80, height: 420 }, undefined, cp);

  T_(L, 30, "One weight, seen from the side. Drag the black dot on the floor.", { "font-size": 17 });
  el("line", { x1: L, y1: B, x2: R, y2: B, stroke: C.text, "stroke-width": 1.5 });
  T_(R + 14, B + 20, "w", { fill: C.dim, "font-size": 14 });
  T_(L - 10, T + 10, "loss", { "text-anchor": "end", fill: C.dim });
  for (let v = -1; v <= 7; v++) T_(X(v), B + 20, String(v), { "text-anchor": "middle", fill: C.dim, "font-size": 12 });
  let d = ""; for (let i = 0; i <= 200; i++) { const v = wmin + i * (wmax - wmin) / 200; d += `${X(v).toFixed(1)},${Y(f(v)).toFixed(1)} `; }
  el("polyline", { points: d, fill: "none", stroke: C.blue, "stroke-width": 3 });
  el("circle", { cx: X(3), cy: Y(0), r: 6, fill: C.green });
  T_(X(3), Y(0) - 12, "lowest loss", { "text-anchor": "middle", fill: C.green });

  const g_ = el("g", { "clip-path": "url(#owclip)" });
  const trailPath = el("polyline", { fill: "none", stroke: C.amber, "stroke-width": 1.5, "stroke-dasharray": "3 3" }, undefined, g_);
  const drop = el("line", { stroke: C.grid, "stroke-dasharray": "3 3" }, undefined, g_);
  const ball = el("circle", { r: 9, fill: C.text }, undefined, g_);
  const gradArrow = el("line", { stroke: C.red, "stroke-width": 3, "marker-end": "url(#owr)" }, undefined, g_);
  const updArrow = el("line", { stroke: C.amber, "stroke-width": 3, "marker-end": "url(#owa)" }, undefined, g_);
  const floorDot = el("circle", { r: 9, fill: C.text, stroke: "#fff", "stroke-width": 2, style: "cursor:grab" }, undefined, g_);
  const gradTxt = T_(0, 0, "", { fill: C.red, "font-size": 12 });
  const updTxt = T_(0, 0, "", { fill: C.amber, "font-size": 12 });
  const readout = T_(450, 430, "", { "text-anchor": "middle", "font-size": 15 });
  const note = T_(450, 455, "", { "text-anchor": "middle", fill: C.dim });
  const hit = el("rect", { x: L, y: B - 25, width: R - L, height: 50, fill: "transparent", style: "cursor:pointer" });

  function render() {
    const gr = g(w), step = -eta * gr, x0 = X(w);
    const inView = w > wmin - 0.5 && w < wmax + 0.5;
    floorDot.setAttribute("cx", x0); floorDot.setAttribute("cy", B);
    ball.setAttribute("cx", x0); ball.setAttribute("cy", Y(f(w)));
    drop.setAttribute("x1", x0); drop.setAttribute("x2", x0); drop.setAttribute("y1", Y(f(w))); drop.setAttribute("y2", B);
    const flat = Math.abs(gr) < 0.05;
    [gradArrow, updArrow, gradTxt, updTxt].forEach((e) => (e.style.display = flat || !inView ? "none" : ""));
    const gx = X(w + Math.max(-2.5, Math.min(2.5, gr * GK)));
    gradArrow.setAttribute("x1", x0); gradArrow.setAttribute("x2", gx); gradArrow.setAttribute("y1", B - 16); gradArrow.setAttribute("y2", B - 16);
    const ux = X(w + step);
    updArrow.setAttribute("x1", x0); updArrow.setAttribute("x2", ux); updArrow.setAttribute("y1", B + 40); updArrow.setAttribute("y2", B + 40);
    gradTxt.setAttribute("x", gx + (gr > 0 ? 6 : -6)); gradTxt.setAttribute("y", B - 12); gradTxt.setAttribute("text-anchor", gr > 0 ? "start" : "end");
    gradTxt.textContent = `gradient ${gr >= 0 ? "+" : ""}${gr.toFixed(1)}`;
    updTxt.setAttribute("x", ux + (step > 0 ? 6 : -6)); updTxt.setAttribute("y", B + 44); updTxt.setAttribute("text-anchor", step > 0 ? "start" : "end");
    updTxt.textContent = `update ${step >= 0 ? "+" : "−"}${Math.abs(step).toFixed(2)}`;
    trailPath.setAttribute("points", trail.concat([w]).map((v) => `${X(v)},${Y(f(v))}`).join(" "));
    readout.textContent = `w = ${w.toFixed(2)}   ·   loss = ${f(w).toFixed(2)}   ·   gradient = ${gr.toFixed(2)}   ·   η = ${eta.toFixed(2)}`;
    note.textContent = !inView ? "The weight flew off the chart: the learning rate is too big. Press Reset." :
      flat ? "At the bottom: the gradient is 0, so the update is 0." :
      (gr < 0 ? "Higher wall on the left → gradient points left → update goes right." : "Higher wall on the right → gradient points right → update goes left.");
  }

  let dragging = false;
  const toW = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); return Math.max(wmin, Math.min(wmax, wmin + (p.x - L) / (R - L) * (wmax - wmin))); };
  const start = (e) => { dragging = true; trail = []; w = toW(e); render(); e.preventDefault(); };
  floorDot.addEventListener("pointerdown", start); hit.addEventListener("pointerdown", start);
  svg.addEventListener("pointermove", (e) => { if (dragging) { w = toW(e); render(); } });
  window.addEventListener("pointerup", () => (dragging = false));

  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:6px;font-size:14px";
  root.appendChild(bar);
  const btn = (t, fn) => { const b = document.createElement("button"); b.textContent = t; b.onclick = fn; b.style.cssText = "background:#f5f7fa;border:1px solid #d0d5dd;border-radius:6px;padding:6px 12px;font-size:14px;cursor:pointer"; bar.appendChild(b); };
  btn("Step", () => { trail.push(w); w = w - eta * g(w); render(); });
  btn("Reset", () => { w = 0; trail = []; render(); });
  const lab = document.createElement("span"); lab.textContent = "learning rate η";
  const slider = document.createElement("input");
  Object.assign(slider, { type: "range", min: 0.05, max: 1.1, step: 0.05, value: eta });
  slider.style.width = "200px";
  const etaTxt = document.createElement("span");
  slider.oninput = () => { eta = +slider.value; etaTxt.textContent = eta.toFixed(2); render(); };
  etaTxt.textContent = eta.toFixed(2);
  bar.append(lab, slider, etaTxt);

  render();
}

export default function OneWeight() {
  const ref = useRef(null);
  useEffect(() => mountOneWeight(ref.current), []);
  return <div ref={ref} />;
}
