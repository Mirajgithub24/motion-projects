import { Easing } from "remotion";

// Shared curves and spring presets. Linear easing is not used anywhere.
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // entrances
  inOut: Easing.bezier(0.83, 0, 0.17, 1), // moves
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits
};

export const springs = {
  snappy: { damping: 14, stiffness: 160, mass: 0.6 },
  smooth: { damping: 20, stiffness: 90, mass: 1 },
  bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Shape every project's theme.ts follows (colors and fonts come from brief.md).
export type Theme = {
  colors: {
    bg: string;
    bgAlt: string;
    primary: string; // hero color: one element per frame
    accent: string;
    text: string;
    textDim: string;
  };
  fonts: { display: string; mono: string };
};
