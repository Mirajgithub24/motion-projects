import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import "./fonts";
import { Background, Grain } from "./Background";
import { DesignScene } from "./DesignScene";
import { DESIGNS } from "./designs";
import { clamp, LEAD_IN, sec, XFADE } from "./motion";
import { SHOTS, TOTAL_SECONDS } from "./plan";
import type { CamShot, Cue } from "./types";

export const durationInFrames = sec(TOTAL_SECONDS);

// Plan times are voiceover seconds; the picture starts LEAD_IN earlier.
const vo = (s: number) => sec(s + LEAD_IN);

type Block = {
  key: string;
  design: string;
  cut: number; // global frame of the cut into this design
  next: number; // global frame of the cut to the next design
  shots: CamShot[]; // design-time frames
  cues: Cue[]; // design-time frames
};

// Consecutive shots of the same design form one block: one build, one
// continuous camera. Crossfades only happen between different designs.
const BLOCKS: Block[] = (() => {
  const cuts = SHOTS.map((s, i) => (i === 0 ? 0 : vo(s.start)));
  const out: Block[] = [];
  SHOTS.forEach((s, i) => {
    const next = i + 1 < SHOTS.length ? cuts[i + 1] : durationInFrames;
    const prev = out[out.length - 1];
    if (prev && prev.design === s.design) {
      prev.next = next;
      prev.shots.push({ start: cuts[i] - prev.cut, end: next - prev.cut, camera: s.camera });
      prev.cues.push(...(s.cues || []).map((c) => ({ ...c, at: vo(c.at) - prev.cut })));
      return;
    }
    out.push({
      key: `${i}-${s.design}`,
      design: s.design,
      cut: cuts[i],
      next,
      shots: [{ start: 0, end: next - cuts[i], camera: s.camera }],
      cues: (s.cues || []).map((c) => ({ ...c, at: vo(c.at) - cuts[i] })),
    });
  });
  return out;
})();

export const PercelVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#F4FBF1" }}>
      {BLOCKS.map((b, i) => {
        // incoming shot fades in over the outgoing one (which stays opaque)
        const from = Math.max(0, b.cut - (i === 0 ? 0 : XFADE / 2));
        const to = Math.min(durationInFrames, b.next + XFADE / 2);
        const opacity =
          i === 0 ? 1 : interpolate(frame, [b.cut - XFADE / 2, b.cut + XFADE / 2], [0, 1], clamp);
        return (
          <Sequence key={b.key} from={from} durationInFrames={to - from} name={`${b.design} (${b.shots.length} shots)`}>
            <AbsoluteFill style={{ opacity }}>
              <Background globalFrame={frame} />
              <DesignScene
                design={DESIGNS[b.design]}
                cues={b.cues}
                shots={b.shots}
                seqStart={from - b.cut}
                blockEnd={b.next - b.cut}
                holdEnd={i === BLOCKS.length - 1}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Grain globalFrame={frame} />
      <Sequence from={sec(LEAD_IN)} name="voiceover">
        <Audio src={staticFile("assets/audio/voiceover_mix.m4a")} />
      </Sequence>
    </AbsoluteFill>
  );
};
