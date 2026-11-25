import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { beat, clamp, ease, enter, XFADE } from "./motion";
import type { CamShot, Cue, Design, LayerMeta } from "./types";

// Renders one scene design (extracted from assets/S*.dc.html) and animates its
// layers frame by frame. The markup is mounted once; per-frame motion is applied
// to the tagged elements ([data-l]) in a layout effect, so it is deterministic.
//
// Times here are in frames relative to the design's first appearance
// ("design time"), so a design shown as two shots keeps one continuous build.

type Props = {
  design: Design;
  cues: Cue[]; // design-time frames
  shots: CamShot[]; // camera moves, chained: each starts where the last ended
  seqStart: number; // design-time frame where this Sequence begins (fade-in)
  blockEnd: number; // design-time frame of the cut to the next design
  holdEnd?: boolean; // last design: no exit, everything holds to the end
};

const W = 1920;
const H = 1080;
type Cam = { s: number; tx: number; ty: number; px: number };
const IDENTITY: Cam = { s: 1, tx: 0, ty: 0, px: 0 };

// Camera state at design time t. Each shot animates from the state the previous
// shot ended in, so a design shown as several shots is one continuous camera.
function cameraAt(t: number, shots: CamShot[], seqStart: number, blockEnd: number): Cam {
  const first = shots[0].camera;
  let state: Cam = IDENTITY;
  if (first.type === "pull") {
    const s0 = 1 + (first.amount ?? 0.12);
    const [fx, fy] = first.focus ?? [0.5, 0.5];
    state = { s: s0, tx: fx * W * (1 - s0), ty: fy * H * (1 - s0), px: 0 };
  } else if (first.type === "panL" || first.type === "panR") {
    const s0 = 1 + (first.amount ?? 0.05) + 0.01;
    state = { s: s0, tx: (W / 2) * (1 - s0), ty: (H / 2) * (1 - s0), px: 0 };
  }
  for (let k = 0; k < shots.length; k++) {
    const shot = shots[k];
    const a = k === 0 ? seqStart : shot.start;
    const b = k === shots.length - 1 ? blockEnd + XFADE / 2 : shot.end;
    const e = interpolate(t, [a, Math.max(a + 1, b)], [0, 1], { ...clamp, easing: ease.inOut });
    const from = state;
    let to: Cam = from;
    const cam = shot.camera;
    const [fx, fy] = cam.focus ?? [0.5, 0.5];
    const P = [fx * W, fy * H];
    if (cam.type === "push" || (cam.type === "pull" && k > 0 && from.s < 1.03)) {
      // zoom toward the focus point, keeping that point fixed on screen
      const s1 = from.s * (1 + (cam.amount ?? 0.06) * (cam.type === "pull" ? 0.5 : 1));
      const wx = (P[0] - from.tx) / from.s;
      const wy = (P[1] - from.ty) / from.s;
      const s = from.s + (s1 - from.s) * e;
      state = { s, tx: P[0] - wx * s, ty: P[1] - wy * s, px: from.px };
      to = { s: s1, tx: P[0] - wx * s1, ty: P[1] - wy * s1, px: from.px };
    } else if (cam.type === "pull") {
      to = k === 0 ? IDENTITY : { ...IDENTITY, px: from.px };
      state = mix(from, to, e);
    } else if (cam.type === "panL" || cam.type === "panR") {
      // truck sideways: layers shift by depth (parallax); overscan hides edges
      const d = (cam.amount ?? 0.05) * W;
      const s1 = Math.max(from.s, 1 + (cam.amount ?? 0.05) + 0.01);
      const lim = ((s1 - 1) * W) / 2 - 4;
      const dir = cam.type === "panL" ? 1 : -1;
      const p0 = k === 0 ? -dir * Math.min(d / 2, lim) : from.px;
      let p1 = Math.max(-lim, Math.min(lim, p0 + dir * d));
      if (Math.abs(p1 - p0) < d * 0.5) p1 = Math.max(-lim, Math.min(lim, p0 - dir * d));
      const base = { s: s1, tx: (W / 2) * (1 - s1) + (from.tx - (W / 2) * (1 - from.s)), ty: (H / 2) * (1 - s1) + (from.ty - (H / 2) * (1 - from.s)) };
      to = { ...base, px: p1 };
      state = mix({ ...from, px: p0 }, to, e);
    }
    if (t < b) return state;
    state = to;
  }
  return state;
}

const mix = (a: Cam, b: Cam, e: number): Cam => ({
  s: a.s + (b.s - a.s) * e,
  tx: a.tx + (b.tx - a.tx) * e,
  ty: a.ty + (b.ty - a.ty) * e,
  px: a.px + (b.px - a.px) * e,
});

type Plan = {
  at: number; // entrance start (design time); -Infinity = always visible
  hero: boolean;
  amp: number; // entrance travel (px)
  ambient: "none" | "float" | "drift" | "glow" | "ride";
  phase: number;
  beatAt: number[];
  count?: { from: number; to: number; frames?: number };
  parallax: number;
  exit: boolean;
};

const AMBIENT_FLOAT = /(Prop|Parcel|Float|Coin|Note|Icon|Badge|Pin|Leaf|Leaves|Bird|Balloon|Cash|Money|Box|Bubble|Sparkle|Callout|Card)/i;
const AMBIENT_DRIFT = /(Cloud|Smoke|Steam|Mist|Haze)/i;
// vehicles and riders in motion get a small road bob
const AMBIENT_RIDE = /(Bike|Van|Truck|Rickshaw|Vehicle|Riding|Rider_Hero|Rider_Mid)/i;
const PARALLAX: Record<LayerMeta["depth"], number> = { bg: 0.3, mid: 0.6, fg: 1, fx: 0.6, text: 1, grain: 0 };

function matchLayer(layers: LayerMeta[], target: string): LayerMeta | undefined {
  if (target.startsWith("l:")) return layers.find((x) => x.l === Number(target.slice(2)));
  if (target.startsWith("text:")) {
    const needle = target.slice(5);
    const hits = layers.filter((x) => x.text && x.text.includes(needle));
    // prefer the smallest element that contains the text (a child over its block)
    return hits.sort((a, b) => (a.text!.length - b.text!.length))[0];
  }
  return layers.find((x) => x.id === target);
}

function buildPlans(design: Design, cues: Cue[]): Map<number, Plan> {
  const plans = new Map<number, Plan>();
  const cueFor = new Map<number, Cue[]>();
  for (const c of cues) {
    const hit = matchLayer(design.layers, c.target);
    if (!hit) {
      // eslint-disable-next-line no-console
      console.warn(`[${design.id}] cue target not found: ${c.target}`);
      continue;
    }
    cueFor.set(hit.l, [...(cueFor.get(hit.l) || []), c]);
  }
  const objects = design.layers.filter((x) => x.kind === "svg" && (x.depth === "mid" || x.depth === "fg" || x.depth === "fx"));
  const stagger = objects.length > 6 ? Math.max(1, Math.floor(18 / objects.length)) : 3;
  let objIndex = 0;
  let blockIndex = 0;
  const childIndex = new Map<number, number>();

  for (const layer of design.layers) {
    const own = cueFor.get(layer.l) || [];
    const entry = own.find((c) => !c.beatOnly);
    const plan: Plan = {
      at: -Infinity,
      hero: false,
      amp: 0,
      ambient: "none",
      phase: (layer.l * 37) % 100,
      beatAt: own.filter((c) => c.beat || c.beatOnly).map((c) => c.at),
      parallax: PARALLAX[layer.depth],
      exit: layer.depth === "text",
    };
    if (layer.kind === "svg") {
      if (layer.depth === "bg" || layer.depth === "grain") {
        plan.at = -Infinity;
      } else {
        plan.at = 3 + objIndex * stagger;
        plan.amp = 40;
        objIndex++;
        if (layer.depth === "fx") plan.ambient = "glow";
        else if (AMBIENT_DRIFT.test(layer.id)) plan.ambient = "drift";
        else if (AMBIENT_RIDE.test(layer.id)) plan.ambient = "ride";
        else if (AMBIENT_FLOAT.test(layer.id)) plan.ambient = "float";
      }
    } else if (layer.kind === "html") {
      plan.hero = true;
      plan.amp = 30;
      plan.at = 12 + blockIndex * 5;
      blockIndex++;
      if (AMBIENT_FLOAT.test(layer.id)) plan.ambient = "float";
    } else {
      // child of an html block: staggered after its parent
      const parent = plans.get(layer.parent!);
      const i = childIndex.get(layer.parent!) ?? 0;
      childIndex.set(layer.parent!, i + 1);
      plan.hero = false;
      plan.amp = 22;
      plan.at = (parent?.at ?? 12) + 3 + i * 3;
    }
    if (entry) {
      // land on the spoken cue: the spring reaches ~90% about 5 frames after it starts
      plan.at = entry.at - 5;
      plan.hero = entry.hero ?? plan.hero;
      if (plan.amp === 0) plan.amp = 30;
      if (entry.count) plan.count = entry.count;
      // a cued block's children follow it instead of their own schedule
      design.layers
        .filter((x) => x.parent === layer.l)
        .forEach((x, i) => {
          const p = plans.get(x.l);
          if (p && !cueFor.has(x.l)) p.at = entry.at - 5 + 3 + i * 3;
        });
    }
    plans.set(layer.l, plan);
  }
  // children planned before a later-cued parent: re-anchor them
  for (const layer of design.layers) {
    if (layer.kind !== "html-child" || cueFor.has(layer.l)) continue;
    const parentCue = (cueFor.get(layer.parent!) || []).find((c) => !c.beatOnly);
    if (parentCue) {
      const siblings = design.layers.filter((x) => x.parent === layer.parent);
      plans.get(layer.l)!.at = parentCue.at - 5 + 3 + siblings.indexOf(layer) * 3;
    }
  }
  // an uncued child follows the nearest cued sibling before it, so a sub-caption
  // never appears before the line it belongs to is spoken
  for (const layer of design.layers) {
    if (layer.kind !== "html-child" || cueFor.has(layer.l)) continue;
    const siblings = design.layers.filter((x) => x.parent === layer.parent);
    const i = siblings.indexOf(layer);
    for (let j = i - 1; j >= 0; j--) {
      const c = (cueFor.get(siblings[j].l) || []).find((x) => !x.beatOnly);
      if (c) {
        plans.get(layer.l)!.at = c.at - 5 + 3 * (i - j);
        break;
      }
    }
  }
  return plans;
}

// "7,50,000" / "৳11,700" / "≈ ৳16,700" / "95%" / "1,761.50" -> counted value, same format
function formatLike(template: string, value: number): string {
  const m = template.match(/\d[\d,]*(\.\d+)?/);
  if (!m) return template;
  const raw = m[0];
  const decimals = m[1] ? m[1].length - 1 : 0;
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split(".");
  let grouped = int;
  if (raw.includes(",")) {
    const indian = /^\d{1,2}(,\d{2})+,\d{3}/.test(raw);
    if (indian && int.length > 3) {
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      grouped = `${rest},${last3}`;
    } else {
      grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
  return template.replace(raw, dec ? `${grouped}.${dec}` : grouped);
}

function firstNumberTextNode(el: Element): Text | null {
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n = walker.nextNode();
  while (n) {
    if (/\d/.test(n.textContent || "")) return n as Text;
    n = walker.nextNode();
  }
  return null;
}

export const DesignScene: React.FC<Props> = ({ design, cues, shots, seqStart, blockEnd, holdEnd }) => {
  const frame = useCurrentFrame(); // Sequence-local
  const t = seqStart + frame; // design time
  const root = useRef<HTMLDivElement>(null);
  const originals = useRef(new Map<Element, { transform: string; text?: string; box?: [number, number, number, number] }>());
  const plans = useMemo(() => buildPlans(design, cues), [design, cues]);
  const markup = useMemo(() => ({ __html: design.html }), [design.html]);
  const base = cameraAt(t, shots, seqStart, blockEnd);
  // ambient breath (0.6% scale, slow) so no frame ever sits still for a second;
  // the end card stays locked so its title holds still
  const b = holdEnd ? 1 : 1 + 0.006 * Math.sin(t / 48);
  const cam = { ...base, s: base.s * b, tx: (W / 2) * (1 - b) + b * base.tx, ty: (H / 2) * (1 - b) + b * base.ty };

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const exitStart = blockEnd - 10; // design time
    for (const node of Array.from(el.querySelectorAll<HTMLElement | SVGElement>("[data-l]"))) {
      const l = Number(node.getAttribute("data-l"));
      const plan = plans.get(l);
      if (!plan) continue;
      if (!originals.current.has(node)) {
        const html = node as HTMLElement;
        const box: [number, number, number, number] | undefined =
          html.offsetParent === el ? [html.offsetLeft, html.offsetTop, html.offsetWidth, html.offsetHeight] : undefined;
        originals.current.set(node, { transform: html.style.transform || "", box });
        if (node instanceof SVGElement) {
          node.style.transformBox = "fill-box";
          node.style.transformOrigin = "center";
        }
      }
      const orig = originals.current.get(node)!;

      let p = 1;
      if (plan.at !== -Infinity) p = t < plan.at ? 0 : enter(t, plan.at, plan.hero);
      let opacity = interpolate(p, [0, 0.6], [0, 1], clamp);
      let ty = (1 - p) * plan.amp;
      let s = plan.amp ? 0.94 + 0.06 * p : 1;

      if (plan.ambient === "float") ty += Math.sin((t + plan.phase * 3) / 42) * 3;
      if (plan.ambient === "ride") ty += Math.abs(Math.sin((t + plan.phase) / 4.5)) * -2.2;
      let tx = (plan.ambient === "drift" ? Math.sin((t + plan.phase) / 90) * 14 : 0) + cam.px * plan.parallax;
      if (plan.ambient === "glow") opacity *= 0.86 + 0.14 * Math.sin((t + plan.phase) / 48);

      for (const b of plan.beatAt) s *= 1 + 0.08 * beat(t, b);

      // keep text blocks inside the frame: the camera may not push them past the
      // 6% safe margin, or past where the design itself put them
      if (orig.box) {
        const [left, top, w, h] = orig.box;
        const mL = Math.max(0, Math.min(0.06 * W, left));
        const mR = Math.max(0, Math.min(0.06 * W, W - left - w));
        const mT = Math.max(0, Math.min(0.06 * H, top));
        const mB = Math.max(0, Math.min(0.06 * H, H - top - h));
        const sl = cam.tx + cam.s * (left + tx);
        const sr = cam.tx + cam.s * (left + w + tx);
        const st = cam.ty + cam.s * (top + ty);
        const sb = cam.ty + cam.s * (top + h + ty);
        if (sr - sl > W - mL - mR) tx += ((mL + W - mR) / 2 - (sl + sr) / 2) / cam.s;
        else if (sl < mL) tx += (mL - sl) / cam.s;
        else if (sr > W - mR) tx -= (sr - (W - mR)) / cam.s;
        if (sb - st > H - mT - mB) ty += ((mT + H - mB) / 2 - (st + sb) / 2) / cam.s;
        else if (st < mT) ty += (mT - st) / cam.s;
        else if (sb > H - mB) ty -= (sb - (H - mB)) / cam.s;
      }

      if (plan.exit && !holdEnd && t >= exitStart) {
        const e = interpolate(t, [exitStart, exitStart + 10], [0, 1], { ...clamp, easing: ease.in });
        opacity *= 1 - e;
        ty -= 16 * e;
      }

      if (plan.count) {
        const textNode = firstNumberTextNode(node);
        if (textNode) {
          if (orig.text === undefined) orig.text = textNode.textContent || "";
          const k = interpolate(t, [plan.at, plan.at + (plan.count.frames ?? 24)], [0, 1], { ...clamp, easing: ease.out });
          textNode.textContent = formatLike(orig.text, plan.count.from + (plan.count.to - plan.count.from) * k);
        }
      }

      node.style.opacity = String(opacity);
      node.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)}) ${orig.transform}`.trim();
      node.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
    }
  });

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${cam.tx.toFixed(2)}px, ${cam.ty.toFixed(2)}px) scale(${cam.s.toFixed(5)})`,
        transformOrigin: "0 0",
      }}
    >
      {design.css ? <style>{design.css}</style> : null}
      <div
        ref={root}
        style={styleFromString(design.style)}
        dangerouslySetInnerHTML={markup}
      />
    </AbsoluteFill>
  );
};

function styleFromString(css: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (!k) continue;
    out[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out as React.CSSProperties;
}
