import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { CalculateMetadataFunction, staticFile } from "remotion";

// Sets the composition length to the length of projects/<name>/voiceover.mp3
// (plus an optional tail for the exit animation).
export const voiceoverMetadata =
  (tailSeconds = 0.5): CalculateMetadataFunction<Record<string, unknown>> =>
  async () => {
    const fps = 30;
    const seconds = await getAudioDurationInSeconds(staticFile("voiceover.mp3"));
    return { fps, durationInFrames: Math.ceil((seconds + tailSeconds) * fps) };
  };
