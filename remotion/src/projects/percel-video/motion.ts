import { Easing, interpolate, spring } from "remotion";

// Shared motion language for the whole video (brief Part A5 + Part B overrides).
export const FPS = 30;
export const LEAD_IN = 0.5; // seconds of picture before the voiceover starts
export const TAIL = 1.5; // seconds after it ends
export const XFADE = 12; // frames, one transition family for the whole video

export const COLORS = {
  bgTop: "#F4FBF1",
  bgBottom: "#DDF3D3",
  hero: "#3FAE5A",
  heroText: "#237A3B",
  accent: "#F5B83D",
  text: "#1E3A26",
};

export const ease = {
  out: Easing.bezier(0.33, 1, 0.68, 1), // ease-out cubic: entrances
  in: Easing.bezier(0.32, 0, 0.67, 0), // ease-in cubic: exits
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // camera moves
};

// Brief B: small elements bounce lightly; hero text and logos stay smooth.
export const SPRING_SMALL = { damping: 13, stiffness: 170, mass: 0.7 };
export const SPRING_HERO = { damping: 200, stiffness: 120, mass: 1 };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const enter = (frame: number, at: number, hero: boolean) =>
  spring({
    frame: frame - at,
    fps: FPS,
    config: hero ? SPRING_HERO : SPRING_SMALL,
    durationInFrames: hero ? 20 : 14,
  });

// A short scale "beat" on a spoken key word or number: 1 -> 1.08 -> 1.
export const beat = (frame: number, at: number) => {
  const t = frame - at;
  if (t < 0 || t > 14) return 0;
  return interpolate(t, [0, 5, 14], [0, 1, 0], { ...clamp, easing: ease.out });
};

export const sec = (s: number) => Math.round(s * FPS);
