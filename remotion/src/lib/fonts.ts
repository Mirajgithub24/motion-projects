import { loadFont } from "@remotion/fonts";
import grotesk from "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2";
import mono from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2";

// Fonts are bundled from npm, so renders need no network access to a font CDN.
// loadFont() holds the render until the font is ready.
export const fonts = { display: "Space Grotesk", mono: "JetBrains Mono" };

loadFont({ family: fonts.display, url: grotesk, weight: "700" });
loadFont({ family: fonts.mono, url: mono, weight: "500" });
