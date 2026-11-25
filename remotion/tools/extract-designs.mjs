// Turns the scene designs (projects/<name>/assets/S*.dc.html) into data the
// Remotion scenes animate, and saves every inline SVG as a standalone file.
//
//   node remotion/tools/extract-designs.mjs percel-video
//
// Output:
//   remotion/src/projects/<name>/designs/<ID>.json   processed markup + layer list
//   projects/<name>/assets/extracted/<ID>_<n>.svg    each inline SVG, as designed
//
// What it changes, following brief.md (design wins for layout/content/text/
// illustrations; brief wins for background, colors, fonts, motion):
//   - expands the design tool's <sc-for> templates by running each file's own
//     Component.renderVals() data generator (needed for S3A/S3B/S3C/S3E/S5G)
//   - drops the page background (the video's green gradient shows through) and
//     shifts cream "ground" fills in background layers to light greens
//   - maps UI/text colors to the brand palette; character and prop colors stay
//   - Manrope -> Poppins (headings) / Nunito (small body); Hind Siliguri stays
//     as the Bengali fallback because Poppins and Nunito have no Bengali glyphs
//   - removes the design's own grain layer (the video adds a 2.5% grain)
//   - tags every animatable element with data-l="<n>" and lists it in "layers"
import { parse } from "node-html-parser";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const name = process.argv[2] || "percel-video";
const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const assets = join(repo, "projects", name, "assets");
const outDir = join(repo, "remotion", "src", "projects", name, "designs");
const svgDir = join(assets, "extracted");
mkdirSync(outDir, { recursive: true });
mkdirSync(svgDir, { recursive: true });

// ---------- colors ----------
const BRAND = {
  text: "#1E3A26",
  textMuted: "#3E5A46",
  hero: "#3FAE5A",
  heroText: "#237A3B", // darker brand green, >= 4.5:1 on the light ground
  accent: "#F5B83D",
};

// Text and UI colors (HTML styles, SVG <text>). Illustration shapes are untouched.
const UI_MAP = {
  "#0f1b2d": BRAND.text, // Night Navy, "text only" in the palette
  "#3a4658": BRAND.textMuted,
  "#d95400": BRAND.heroText, // deep orange text
  "#a84700": BRAND.heroText, // eyebrow labels
  "#c92f35": "#B3261E", // deep red text stays red (loss/risk), slightly darker
};
// UI fills inside HTML (buttons, swatches, chips, card grounds)
const UI_FILL_MAP = {
  "#ff7a1a": BRAND.hero,
  "#ffe3c7": "#E3F4DC",
  "#fff8ea": "#FBFEF9",
  "#fdf6e9": "#F7FCF4",
  "#f6efe3": "#F2FAEE",
  "#fbefd9": "#F2FAEE",
  "#fbe6c4": "#E4F5DC",
  "#ffe9d2": "#E6F6DF",
};

const hexToHsl = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let s = 0, hue = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue *= 60;
  }
  return [hue, s, l];
};
const hslToHex = (h, s, l) => {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
};
// Cream / peach / butter grounds -> the same lightness in the brand's green.
const isCream = (hex) => {
  const [h, s, l] = hexToHsl(hex);
  return l >= 0.86 && h >= 15 && h <= 60 && s > 0.15;
};
const toGreen = (hex) => {
  const [, s, l] = hexToHsl(hex);
  return hslToHex(102, Math.min(0.55, s * 0.8 + 0.1), Math.max(l, 0.9));
};
// Saturated orange used as a UI/data color -> the brand green at the same lightness.
const isOrange = (hex) => {
  const [h, s, l] = hexToHsl(hex);
  return h >= 12 && h <= 38 && s > 0.5 && l >= 0.35 && l <= 0.85;
};
const orangeToGreen = (hex) => {
  const [, s, l] = hexToHsl(hex);
  return hslToHex(134, Math.min(0.55, s * 0.6), Math.max(0.3, Math.min(l, 0.82) - 0.04));
};
// SVG layers that are graphics (charts, frames, pins, arrows), not characters or props
const UI_LAYER = /(Frame|Bar_|Slice|Card|Graph|Marker|Stops|Pins|SortCenters|Calc|Step_|ForceArrow|Arrow|Bracket|QuestionMarks|RouteLine|Leaders|Split|BG_Shapes|ExtraBracket|Map)/;
const CHARACTER = /(Rahim|Rider|Worker|Nusrat|Hasan|Sohel|Jamal|Kamal|Crowd|Customer|Person|People|Five|FrontRow)/;
const HEX = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
const mapUi = (str) => str.replace(HEX, (m) => UI_MAP[m.toLowerCase()] || m);
const mapUiFill = (str) =>
  str.replace(HEX, (m) =>
    UI_MAP[m.toLowerCase()] || UI_FILL_MAP[m.toLowerCase()] || (isCream(m) ? toGreen(m) : isOrange(m) ? orangeToGreen(m) : m));

// ---------- templates ----------
function expandTemplates(html) {
  const m = html.match(/<script[^>]*>\s*(class Component extends DCLogic[\s\S]*?)<\/script>/);
  if (!m || !/<sc-for/.test(html)) return html;
  const ctx = { out: null };
  vm.createContext(ctx);
  vm.runInContext(`class DCLogic {}\n${m[1]}\nout = new Component().renderVals();`, ctx, { timeout: 5000 });
  const vals = ctx.out;
  const get = (path, scope) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), scope);
  const interp = (s, scope) => s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, p) => {
    const v = get(p, scope);
    return v == null ? "" : String(v);
  });
  // innermost-first expansion handles nesting
  let prev;
  do {
    prev = html;
    html = html.replace(/<sc-for\s+list="\{\{\s*([\w.]+)\s*\}\}"\s+as="(\w+)"[^>]*>((?:(?!<sc-for)[\s\S])*?)<\/sc-for>/, (_, list, as, body) => {
      const arr = get(list, vals) || [];
      return arr.map((item, i) => interp(body, { ...vals, [as]: item, index: i })).join("");
    });
  } while (html !== prev);
  return interp(html, vals);
}

// ---------- fonts ----------
function mapFonts(style) {
  if (!/font-family/.test(style)) return style;
  return style.replace(/font-family:\s*([^;]+)/g, (_, fam) => {
    const small = (() => {
      const size = style.match(/font-size:\s*(\d+)px/);
      const weight = style.match(/font-weight:\s*(\d+)/);
      return size && Number(size[1]) <= 24 && (!weight || Number(weight[1]) <= 600);
    })();
    const latin = small ? "'Nunito'" : "'Poppins'";
    return `font-family: ${latin}, 'Hind Siliguri', sans-serif`;
  });
}

// ---------- depth classification ----------
const depthOf = (id = "") => {
  if (/grain/i.test(id)) return "grain";
  if (/_FX_|^FX_|_FX$/i.test(id)) return "fx";
  if (/(^|_)(BG|Sky|Far|Wall|Ground|Floor|Road|Backdrop|Soft)(_|$)/i.test(id)) return "bg";
  if (/(^|_)(FG|Prop|Rahim|Rider|Worker|Crowd|Nusrat|Hasan|Sohel|Jamal|Kamal|Truck|Van|Bike|Vehicle|Hand|Arm|Customer|Person|People)(_|$)/i.test(id)) return "fg";
  return "mid";
};

// ---------- main ----------
// Scene designs plus the style frame (Main), which is a complete scene too.
const files = readdirSync(assets).filter((f) => /^(S\d[A-Z]_.*|Main)\.dc\.html$/.test(f)).sort();
const index = [];
// identical SVGs (e.g. S5G's repeated rider icon) are saved once
const savedSvgs = new Map();
const saveSvg = (file, markup) => {
  const xml = markup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  if (savedSvgs.has(xml)) return false;
  savedSvgs.set(xml, file);
  writeFileSync(join(svgDir, file), xml);
  return true;
};
for (const file of files) {
  const id = file === "Main.dc.html" ? "Main" : file.split("_")[0] + (file.includes("S2G_Village") ? "v" : "");
  const raw = readFileSync(join(assets, file), "utf8");
  const doc = parse(expandTemplates(raw), { comment: false });
  const xdc = doc.querySelector("x-dc");
  const root = xdc.childNodes.find((n) => n.nodeType === 1 && n.tagName === "DIV");
  const rootStyle = root.getAttribute("style") || "";
  const designBg = (rootStyle.match(/background:\s*([^;]+)/) || [])[1] || "";
  const title = (doc.querySelector("title")?.text || "").trim();
  // the design's own CSS (template item styles); body reset dropped, colors mapped
  const css = [...raw.matchAll(/<helmet>([\s\S]*?)<\/helmet>/g)]
    .flatMap((h) => [...h[1].matchAll(/<style>([\s\S]*?)<\/style>/g)].map((x) => x[1]))
    .join("\n")
    .replace(/body\s*\{[^}]*\}/g, "")
    .replace(/font-family:[^;}]+/g, (f) => mapFonts(f + ";").replace(/;$/, ""));
  const cssMapped = mapUiFill(css).trim();

  const layers = [];
  let n = 0;
  const tag = (el, meta) => {
    el.setAttribute("data-l", String(n));
    layers.push({ l: n, ...meta });
    n++;
  };

  let svgCount = 0;
  for (const child of root.childNodes.filter((c) => c.nodeType === 1)) {
    if (child.tagName === "SVG") {
      svgCount++;
      saveSvg(`${id}_${svgCount}.svg`, child.toString());
      // drop the design grain; it is replaced by the video's lighter grain
      for (const g of child.querySelectorAll("g")) if (/grain/i.test(g.id || "")) g.remove();
      for (const g of child.childNodes.filter((c) => c.nodeType === 1 && c.tagName === "G")) {
        const depth = depthOf(g.id);
        // background layers: cream grounds become light green
        if (depth === "bg") {
          for (const el of [g, ...g.querySelectorAll("*")]) {
            for (const attr of ["fill", "stop-color"]) {
              const v = el.getAttribute(attr);
              if (v && /^#/.test(v) && isCream(v) && !/Sky/i.test(g.id)) el.setAttribute(attr, toGreen(v));
            }
          }
        }
        if (UI_LAYER.test(g.id || "") && !CHARACTER.test(g.id || "")) {
          for (const el of [g, ...g.querySelectorAll("*")]) {
            for (const attr of ["fill", "stroke", "stop-color"]) {
              const v = el.getAttribute(attr);
              if (v && /^#/.test(v) && isOrange(v)) el.setAttribute(attr, orangeToGreen(v));
            }
            const st = el.getAttribute("style");
            if (st && HEX.test(st)) el.setAttribute("style", st.replace(HEX, (m) => (isOrange(m) ? orangeToGreen(m) : m)));
          }
        }
        for (const t of g.querySelectorAll("text, tspan")) {
          const f = t.getAttribute("fill");
          if (f) t.setAttribute("fill", mapUi(f));
          const st = t.getAttribute("style");
          if (st) t.setAttribute("style", mapFonts(mapUi(st)));
          const ff = t.getAttribute("font-family");
          if (ff) t.setAttribute("font-family", /Hind/.test(ff) ? "'Poppins', 'Hind Siliguri', sans-serif" : "'Poppins', 'Hind Siliguri', sans-serif");
        }
        // animate a wrapper: a CSS transform on the group itself would replace
        // its own transform="..." attribute
        layers.push({ l: n, kind: "svg", id: g.id || "", depth });
        g.replaceWith(`<g data-l="${n}">${g.toString()}</g>`);
        n++;
      }
      // full-canvas defs gradients (e.g. page washes) shift with the ground
      for (const stop of child.querySelectorAll("defs stop")) {
        const v = stop.getAttribute("stop-color");
        if (v && isCream(v)) stop.setAttribute("stop-color", toGreen(v));
      }
      continue;
    }
    // HTML block (titles, cards, labels, phone UI)
    const peopleBlock = CHARACTER.test(child.id || "") || /Crowd/.test(child.id || "");
    const restyle = (el) => {
      const st = el.getAttribute && el.getAttribute("style");
      if (st) el.setAttribute("style", mapFonts(peopleBlock ? mapUi(st) : mapUiFill(st)));
      for (const k of el.childNodes || []) if (k.nodeType === 1) restyle(k);
    };
    restyle(child);
    for (const s of child.querySelectorAll("svg")) {
      if (saveSvg(`${id}_${svgCount + 1}.svg`, s.toString())) svgCount++;
      // icons of people (S5G's crowd, riders) keep their uniform colors
      const people = CHARACTER.test(child.id || "") || /Crowd/.test(child.id || "");
      for (const el of s.querySelectorAll("*")) {
        for (const attr of ["fill", "stroke", "stop-color"]) {
          const v = el.getAttribute(attr);
          if (v && /^#/.test(v)) el.setAttribute(attr, people ? mapUi(v) : mapUiFill(v));
        }
      }
    }
    const text = child.text.replace(/\s+/g, " ").trim().slice(0, 160);
    const parentL = n;
    tag(child, { kind: "html", id: child.id || "", depth: "text", text });
    // children of a block animate as a stagger group
    const kids = child.childNodes.filter((c) => c.nodeType === 1);
    if (kids.length > 1 && kids.length <= 12) {
      for (const k of kids) {
        tag(k, { kind: "html-child", id: k.id || "", depth: "text", parent: parentL, text: k.text.replace(/\s+/g, " ").trim().slice(0, 100) });
      }
    }
  }

  // root: keep layout, drop the background (the video's gradient replaces it)
  const style = mapFonts(rootStyle.replace(/background:[^;]+;?/, "background: transparent;"))
    .replace(/color:\s*#0F1B2D/i, `color: ${BRAND.text}`);
  // design-board annotations ("SCENE 3A · HUB MAP", "STYLE FRAME 01 · ...") label
  // the storyboard; they are not on-screen copy
  for (const el of root.querySelectorAll("div, span")) {
    if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 &&
        /^\s*(SCENE\s+\d[A-Z]?|STYLE FRAME\s+\d+)\s*·/i.test(el.text)) {
      el.setAttribute("style", (el.getAttribute("style") || "") + "; display: none");
    }
  }
  for (const t of root.querySelectorAll("text")) {
    if (/^\s*(SCENE\s+\d[A-Z]?|STYLE FRAME\s+\d+)\s*·/i.test(t.text)) t.setAttribute("display", "none");
  }
  const html = root.innerHTML.replace(/<script[\s\S]*?<\/script>/g, "");
  if (/<sc-|\{\{/.test(html)) throw new Error(`${file}: unexpanded template left`);
  const out = { id, file, title, designBg: designBg.trim(), style, css: cssMapped, html, layers };
  writeFileSync(join(outDir, `${id}.json`), JSON.stringify(out));
  index.push({ id, file, title, layers: layers.length, svgs: svgCount, kb: Math.round(html.length / 1024) });
}
writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 1));
writeFileSync(
  join(outDir, "..", "designs.ts"),
  "// Generated by remotion/tools/extract-designs.mjs. Do not edit.\n" +
    'import type { Design } from "./types";\n' +
    index.map((r) => `import ${r.id} from "./designs/${r.id}.json";`).join("\n") +
    `\n\nexport const DESIGNS: Record<string, Design> = {\n${index.map((r) => `  ${r.id}: ${r.id} as Design,`).join("\n")}\n};\n`,
);
for (const r of index) console.log(`${r.id.padEnd(5)} layers=${String(r.layers).padStart(3)} svgs=${r.svgs} ${String(r.kb).padStart(4)}KB  ${r.title}`);
