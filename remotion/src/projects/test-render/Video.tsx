import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BgMesh, Grade, Grain, Vignette } from "../../lib/layers";
import { clamp, ease, springs } from "../../lib/motion";
import { theme } from "./theme";

const STAGES = ["Brief", "Build", "Render", "Release"];
const TRACK_WIDTH = 1080;

// Timeline in seconds; converted to frames with fps inside the components.
const T = {
  rule: 0.1,
  word1: 0.25,
  word2: 0.55,
  track: 1.3,
  nodeGap: 0.13,
  pulse: 2.0,
  pulseLength: 1.5,
  meta: 2.3,
  exit: 0.4, // length of the exit, measured back from the end
};

// A word that rises out of a clipping mask: translate + skew + opacity together.
const MaskedWord: React.FC<{ text: string; at: number; color: string; glow?: boolean }> = ({
  text,
  at,
  color,
  glow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at * fps, fps, config: springs.smooth });
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {/* The glow sits outside the clipping mask so it is never cut into a box. */}
      {glow ? (
        <span
          style={{
            position: "absolute",
            inset: "-10% -25%",
            opacity: interpolate(p, [0.5, 1], [0, 0.55], clamp),
            background: `radial-gradient(ellipse at center, ${theme.colors.primary}55, transparent 68%)`,
            filter: "blur(30px)",
          }}
        />
      ) : null}
      <span
        style={{
          position: "relative",
          display: "inline-block",
          overflow: "hidden",
          padding: "0 10px 26px",
        }}
      >
      <span
        style={{
          display: "inline-block",
          color,
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
          transform: `translateY(${interpolate(p, [0, 1], [230, 0])}px) skewY(${interpolate(p, [0, 1], [7, 0])}deg)`,
        }}
      >
        {text}
      </span>
      </span>
    </span>
  );
};

const Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const draw = interpolate(frame, [T.track * fps, (T.track + 0.8) * fps], [0, 1], {
    ...clamp,
    easing: ease.out,
  });
  const travel = interpolate(
    frame,
    [T.pulse * fps, (T.pulse + T.pulseLength) * fps],
    [0, 1],
    { ...clamp, easing: ease.inOut },
  );
  const pulseOn = interpolate(travel, [0, 0.06, 0.94, 1], [0, 1, 1, 0], clamp);

  return (
    <div style={{ position: "relative", width: TRACK_WIDTH, height: 110 }}>
      <div
        style={{
          position: "absolute",
          top: 9,
          left: 0,
          width: TRACK_WIDTH,
          height: 2,
          background: theme.colors.textDim,
          opacity: 0.4,
          transformOrigin: "0 50%",
          transform: `scaleX(${draw})`,
        }}
      />
      {/* travelling pulse */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: travel * TRACK_WIDTH - 90,
          width: 90,
          height: 8,
          borderRadius: 8,
          opacity: pulseOn,
          background: `linear-gradient(90deg, transparent, ${theme.colors.accent})`,
          filter: "blur(1px)",
        }}
      />
      {STAGES.map((label, i) => {
        const x = (i / (STAGES.length - 1)) * TRACK_WIDTH;
        const at = (T.track + 0.2 + i * T.nodeGap) * fps;
        const p = spring({ frame: frame - at, fps, config: springs.bouncy });
        // Node lights up as the pulse passes it, then settles.
        const reached = travel - i / (STAGES.length - 1);
        const lit = interpolate(reached, [-0.04, 0.02, 0.3], [0, 1, 0.35], clamp);
        const align = i === 0 ? "0%" : i === STAGES.length - 1 ? "-100%" : "-50%";
        return (
          <React.Fragment key={label}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: x - 10,
                width: 20,
                height: 20,
                borderRadius: 20,
                boxSizing: "border-box",
                border: `2px solid ${theme.colors.textDim}`,
                background: theme.colors.bg,
                opacity: Math.min(1, p),
                transform: `scale(${p * (1 + lit * 0.35)})`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 3,
                  borderRadius: 20,
                  background: theme.colors.accent,
                  opacity: lit,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: 48,
                left: x,
                fontFamily: theme.fonts.mono,
                fontWeight: 500,
                fontSize: 26,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: theme.colors.textDim,
                opacity: Math.min(1, p) * (0.6 + lit * 0.4),
                transform: `translateX(${align}) translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
              }}
            >
              {label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const TestRender: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const exitStart = durationInFrames - T.exit * fps;
  const exit = interpolate(frame, [exitStart, durationInFrames - 2], [0, 1], {
    ...clamp,
    easing: ease.in,
  });

  const rule = interpolate(frame, [T.rule * fps, (T.rule + 0.7) * fps], [0, 1], {
    ...clamp,
    easing: ease.out,
  });
  const meta = spring({ frame: frame - T.meta * fps, fps, config: springs.smooth });
  const breathe = 1 + Math.sin(frame / 22) * 0.006;
  const float = Math.sin(frame / 30) * 3;

  return (
    <AbsoluteFill>
      <BgMesh theme={theme} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - exit,
          transform: `translateY(${exit * -46}px) scale(${1 - exit * 0.03})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${float}px) scale(${breathe})`,
          }}
        >
          <div
            style={{
              width: 150,
              height: 4,
              borderRadius: 4,
              marginBottom: 40,
              background: theme.colors.textDim,
              opacity: rule,
              transform: `scaleX(${rule})`,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 30,
              fontFamily: theme.fonts.display,
              fontWeight: 700,
              fontSize: 190,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
            }}
          >
            <MaskedWord text="Pipeline" at={T.word1} color={theme.colors.text} />
            <MaskedWord text="test" at={T.word2} color={theme.colors.primary} glow />
          </div>

          <div style={{ marginTop: 56 }}>
            <Pipeline />
          </div>

          <div
            style={{
              marginTop: 44,
              fontFamily: theme.fonts.mono,
              fontWeight: 500,
              fontSize: 24,
              letterSpacing: "0.1em",
              color: theme.colors.textDim,
              opacity: meta * 0.75,
              transform: `translateY(${interpolate(meta, [0, 1], [20, 0])}px) scale(${interpolate(meta, [0, 1], [0.96, 1])})`,
            }}
          >
            {width}×{height} · {fps} fps · H.264 / AAC
          </div>
        </div>
      </AbsoluteFill>

      <Grade theme={theme} />
      <Grain />
      <Vignette />

      {/* SFX start 2 frames before the visual lands */}
      <Sequence from={Math.max(0, Math.round(T.word1 * fps) - 2)}>
        <Audio src={staticFile("assets/sfx/whoosh.wav")} volume={0.55} />
      </Sequence>
      <Sequence from={Math.round(T.word2 * fps) + 8}>
        <Audio src={staticFile("assets/sfx/thump.wav")} volume={0.7} />
      </Sequence>
      {STAGES.map((s, i) => (
        <Sequence
          key={s}
          from={Math.round((T.pulse + (i / (STAGES.length - 1)) * T.pulseLength) * fps) - 2}
        >
          <Audio src={staticFile("assets/sfx/tick.wav")} volume={0.45} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
