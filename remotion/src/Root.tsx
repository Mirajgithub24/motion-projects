import React from "react";
import { Composition } from "remotion";
import { TestRender } from "./projects/test-render/Video";

// One <Composition> per project. The id must equal the folder name in projects/.
// For videos with a voiceover, set the length from the audio:
//   calculateMetadata={voiceoverMetadata()}   (see lib/voiceover.ts)
export const Root: React.FC = () => (
  <>
    <Composition
      id="test-render"
      component={TestRender}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={150}
    />
  </>
);
