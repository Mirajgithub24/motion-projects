export type LayerMeta = {
  l: number;
  kind: "svg" | "html" | "html-child";
  id: string;
  depth: "bg" | "mid" | "fg" | "fx" | "text" | "grain";
  parent?: number;
  text?: string;
};

export type Design = {
  id: string;
  file: string;
  title: string;
  style: string;
  css: string;
  html: string;
  layers: LayerMeta[];
};

// target: a layer id, "text:<substring>" or "l:<n>"
export type Cue = {
  target: string;
  at: number; // frames; global in plan.ts, design-time inside DesignScene
  hero?: boolean;
  beat?: boolean; // also give it a scale beat when it lands
  beatOnly?: boolean; // only a beat (element is already on screen)
  count?: { from: number; to: number; frames?: number };
};

// a shot inside a design block, in design-time frames
export type CamShot = { start: number; end: number; camera: Camera };

export type Camera = {
  type: "push" | "pull" | "panL" | "panR" | "static";
  focus?: [number, number]; // 0..1 of the frame
  amount?: number;
};
