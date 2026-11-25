import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "./motion";

// Brief B: soft green gradient (#F4FBF1 top-left -> #DDF3D3 bottom-right), with
// low-opacity floating circles and leaves in light greens drifting slowly.
// Uses the global frame so the drift is continuous across scene cuts.

const CIRCLES = [
  { x: 180, y: 160, r: 120, c: "#CDEBC2", o: 0.45, sx: 90, sy: 140 },
  { x: 1640, y: 220, r: 170, c: "#D4EFCB", o: 0.4, sx: 120, sy: 100 },
  { x: 1500, y: 860, r: 90, c: "#C5E7B9", o: 0.35, sx: 70, sy: 110 },
  { x: 320, y: 900, r: 150, c: "#D8F1D0", o: 0.4, sx: 100, sy: 80 },
  { x: 960, y: 120, r: 60, c: "#C9E9BE", o: 0.3, sx: 60, sy: 90 },
  { x: 1180, y: 980, r: 50, c: "#F7E3B0", o: 0.25, sx: 80, sy: 70 },
];
const LEAVES = [
  { x: 120, y: 520, s: 1.0, rot: -20, sx: 110 },
  { x: 1780, y: 560, s: 0.8, rot: 30, sx: 130 },
  { x: 760, y: 980, s: 0.7, rot: 70, sx: 90 },
  { x: 1300, y: 90, s: 0.6, rot: -60, sx: 150 },
];

export const Background: React.FC<{ globalFrame: number }> = ({ globalFrame: f }) => (
  <AbsoluteFill
    style={{ background: `linear-gradient(135deg, ${COLORS.bgTop} 0%, ${COLORS.bgBottom} 100%)` }}
  >
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      {CIRCLES.map((c, i) => (
        <circle
          key={i}
          cx={c.x + Math.sin(f / c.sx + i) * 18}
          cy={c.y + Math.cos(f / c.sy + i * 2) * 14}
          r={c.r}
          fill={c.c}
          opacity={c.o}
        />
      ))}
      {LEAVES.map((l, i) => (
        <path
          key={i}
          d="M0 0 C 18 -26, 52 -26, 70 0 C 52 26, 18 26, 0 0 Z M6 0 L 64 0"
          fill="#BFE3B2"
          stroke="#A9D89B"
          strokeWidth={2}
          opacity={0.35}
          transform={`translate(${l.x + Math.sin(f / l.sx + i) * 22} ${l.y + Math.cos(f / (l.sx * 1.3) + i) * 16}) rotate(${l.rot + Math.sin(f / 80 + i) * 8}) scale(${l.s})`}
        />
      ))}
    </svg>
  </AbsoluteFill>
);

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`;

// House style A2: light grain at most 3%.
export const Grain: React.FC<{ globalFrame: number }> = ({ globalFrame: f }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundImage: NOISE,
      backgroundSize: "220px",
      backgroundPosition: `${(f * 7) % 220}px ${(f * 13) % 220}px`,
      opacity: 0.025,
      mixBlendMode: "multiply",
    }}
  />
);
