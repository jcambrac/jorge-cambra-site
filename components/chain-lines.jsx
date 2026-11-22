"use client";
// <ChainLines /> — three number lines for the chain rule (x -> x² -> sin(x²)).
import { useEffect, useRef } from "react";

// Three number lines for the chain rule: x -> u = x² -> sin(u).
// Drag the dot on the x line (or press "Nudge x") and watch the others move.
// mountChainLines(el) draws into el. No dependencies.

function mountChainLines(root) {
  const C = { bg: "#ffffff", text: "#1f2328", dim: "#6b7280", line: "#c9ced6", blue: "#2b7bb9", amber: "#d48a00", red: "#d93f3f", green: "#2f9e44" };
  const NS = "http://www.w3.org/2000/svg";
  const X0 = 140, X1 = 840; // line pixel span
  const lines = [
    { name: "x", y: 90, min: 0, max: 4, ticks: [0, 1, 2, 3, 4], color: C.blue },
    { name: "u = x²", y: 215, min: 0, max: 16, ticks: [0, 4, 8, 12, 16], color: C.green },
    { name: "sin(u)", y: 340, min: -1, max: 1, ticks: [-1, -0.5, 0, 0.5, 1], color: C.red },
  ];
  const px = (L, v) => X0 + ((v - L.min) / (L.max - L.min)) * (X1 - X0);
  const DX = 0.1; // the nudge drawn on the lines

  let x = 3, anim = null;

  root.innerHTML = "";
  root.style.cssText = `background:${C.bg};color:${C.text};font-family:system-ui,-apple-system,Segoe UI,sans-serif;border:1px solid #e5e7eb;border-radius:10px;padding:12px;max-width:960px`;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 960 440");
  svg.style.cssText = "width:100%;display:block;touch-action:none;user-select:none";
  root.appendChild(svg);

  function el(tag, attrs, txt, parent = svg) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (txt !== undefined) e.textContent = txt;
    parent.appendChild(e);
    return e;
  }
  const T = (x, y, s, a = {}) => el("text", { x, y, fill: C.text, "font-size": 15, ...a }, s);

  T(20, 28, "Drag the blue dot. A small nudge dx on x (amber) becomes a nudge on x², which becomes a nudge on sin(x²).", { fill: C.dim, "font-size": 14 });

  const guides = el("polyline", { fill: "none", stroke: C.dim, "stroke-width": 1, "stroke-dasharray": "4 4" });

  const parts = lines.map((L) => {
    el("line", { x1: X0, y1: L.y, x2: X1, y2: L.y, stroke: C.line, "stroke-width": 3, "stroke-linecap": "round" });
    for (const t of L.ticks) {
      el("line", { x1: px(L, t), y1: L.y - 6, x2: px(L, t), y2: L.y + 6, stroke: C.line, "stroke-width": 2 });
      T(px(L, t), L.y + 26, String(t), { "text-anchor": "middle", fill: C.dim, "font-size": 12 });
    }
    T(X0 - 24, L.y + 5, L.name, { "text-anchor": "end", "font-size": 17, fill: L.color });
    const seg = el("line", { y1: L.y + 13, y2: L.y + 13, stroke: C.amber, "stroke-width": 6, "stroke-linecap": "round", opacity: 0.85 });
    const dot = el("circle", { cy: L.y, r: 9, fill: L.color, stroke: "#fff", "stroke-width": 2 });
    const val = T(0, L.y - 16, "", { "text-anchor": "middle", "font-size": 15, fill: L.color });
    const segLbl = T(0, L.y + 48, "", { "text-anchor": "middle", "font-size": 13, fill: C.amber });
    return { L, seg, dot, val, segLbl };
  });
  parts[0].dot.style.cursor = "grab";
  parts[0].dot.setAttribute("r", 12);

  // rate labels between lines
  const rate1 = T(880, 160, "", { "text-anchor": "middle", fill: C.text, "font-size": 15 });
  const rate1b = T(880, 180, "", { "text-anchor": "middle", fill: C.dim, "font-size": 13 });
  const rate2 = T(880, 285, "", { "text-anchor": "middle", fill: C.text, "font-size": 15 });
  const rate2b = T(880, 305, "", { "text-anchor": "middle", fill: C.dim, "font-size": 13 });
  el("text", { x: 880, y: 130, fill: C.dim, "font-size": 20, "text-anchor": "middle" }, "↓");
  el("text", { x: 880, y: 255, fill: C.dim, "font-size": 20, "text-anchor": "middle" }, "↓");
  const total = T(480, 418, "", { "text-anchor": "middle", "font-size": 16 });

  function render() {
    const u = x * x, s = Math.sin(u);
    const r1 = 2 * x, r2 = Math.cos(u);
    const vals = [x, u, s];
    const nudges = [DX, r1 * DX, r2 * r1 * DX];
    parts.forEach((p, i) => {
      const cx = px(p.L, vals[i]);
      p.dot.setAttribute("cx", cx);
      p.val.setAttribute("x", cx);
      p.val.textContent = vals[i].toFixed(2);
      const end = px(p.L, Math.max(p.L.min, Math.min(p.L.max, vals[i] + nudges[i])));
      p.seg.setAttribute("x1", cx);
      p.seg.setAttribute("x2", end);
      p.segLbl.setAttribute("x", (cx + end) / 2);
    });
    parts[0].segLbl.textContent = `dx = ${DX}`;
    parts[1].segLbl.textContent = `du = ${r1.toFixed(2)} × dx`;
    parts[2].segLbl.textContent = `d(sin) = ${r2.toFixed(2)} × du`;
    guides.setAttribute("points", parts.map((p, i) => `${px(p.L, vals[i])},${p.L.y}`).join(" "));
    rate1.textContent = `× 2x = ${r1.toFixed(2)}`;
    rate1b.textContent = "rate of x²";
    rate2.textContent = `× cos(u) = ${r2.toFixed(2)}`;
    rate2b.textContent = "rate of sin, at u";
    total.textContent = `Chain rule: d sin(x²)/dx = cos(x²) · 2x = ${r2.toFixed(2)} × ${r1.toFixed(2)} = ${(r2 * r1).toFixed(2)}`;
  }

  // dragging
  let dragging = false;
  const toX = (evt) => {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const L = lines[0];
    return Math.max(0.05, Math.min(3.95, L.min + ((p.x - X0) / (X1 - X0)) * (L.max - L.min)));
  };
  parts[0].dot.addEventListener("pointerdown", (e) => { dragging = true; stop(); parts[0].dot.style.cursor = "grabbing"; e.preventDefault(); });
  svg.addEventListener("pointermove", (e) => { if (dragging) { x = toX(e); render(); } });
  window.addEventListener("pointerup", () => { dragging = false; parts[0].dot.style.cursor = "grab"; });

  // controls
  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:6px";
  root.appendChild(bar);
  const btn = (label, fn) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.cssText = "background:#f5f7fa;color:#1f2328;border:1px solid #d0d5dd;border-radius:6px;padding:6px 12px;font-size:14px;cursor:pointer";
    b.onclick = fn;
    bar.appendChild(b);
  };
  function stop() { if (anim) cancelAnimationFrame(anim); anim = null; }
  btn("Nudge x", () => {
    stop();
    const start = x, t0 = performance.now(), D = 1400, amp = 0.15;
    const f = (now) => {
      const k = Math.min(1, (now - t0) / D);
      x = start + amp * Math.sin(Math.PI * k);
      render();
      if (k < 1) anim = requestAnimationFrame(f); else { x = start; render(); anim = null; }
    };
    anim = requestAnimationFrame(f);
  });
  btn("Back to x = 3", () => { stop(); x = 3; render(); });

  render();
  return () => stop();
}


export default function ChainLines() {
  const ref = useRef(null);
  useEffect(() => mountChainLines(ref.current), []);
  return <div ref={ref} />;
}
