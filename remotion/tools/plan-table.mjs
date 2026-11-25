// Prints the brief.md Part B scene table from plan.ts.
//   node --experimental-strip-types tools/plan-table.mjs
import { readFileSync } from "node:fs";
const { SHOTS, TOTAL_SECONDS } = await import("../src/projects/percel-video/plan.ts");
const idx = JSON.parse(readFileSync(new URL("../src/projects/percel-video/designs/index.json", import.meta.url), "utf8"));
const file = Object.fromEntries(idx.map((r) => [r.id, r.file]));
const LEAD = 0.5;
const fmt = (s) => { const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`; };
const scenes = [];
SHOTS.forEach((s, i) => {
  const prev = scenes[scenes.length - 1];
  const start = i === 0 ? 0 : s.start + LEAD;
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1].start + LEAD : TOTAL_SECONDS;
  if (prev && prev.design === s.design) { prev.end = end; prev.shots++; return; }
  scenes.push({ design: s.design, start, end, shots: 1, meta: s.scene });
});
const rows = scenes.map((sc, i) =>
  `| ${i + 1} | ${fmt(sc.start)}–${fmt(sc.end)} | ${sc.meta.section} | ${sc.meta.cueWord} | ${sc.meta.text} | ${file[sc.design]} | ${sc.meta.camera} |`);
console.log("| # | Time (video) | Section | Voiceover cue (VO seconds) | On-screen text | Assets to use | Camera |");
console.log("|---|---|---|---|---|---|---|");
console.log(rows.join("\n"));
console.error(`${scenes.length} scenes, ${SHOTS.length} shots, ${TOTAL_SECONDS.toFixed(2)} s`);
