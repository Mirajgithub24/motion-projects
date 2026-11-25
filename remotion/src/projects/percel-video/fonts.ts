import { loadFont } from "@remotion/fonts";
import poppins600 from "@fontsource/poppins/files/poppins-latin-600-normal.woff2";
import poppins700 from "@fontsource/poppins/files/poppins-latin-700-normal.woff2";
import nunito400 from "@fontsource/nunito/files/nunito-latin-400-normal.woff2";
import nunito600 from "@fontsource/nunito/files/nunito-latin-600-normal.woff2";
import nunito700 from "@fontsource/nunito/files/nunito-latin-700-normal.woff2";
import hind500 from "@fontsource/hind-siliguri/files/hind-siliguri-bengali-500-normal.woff2";
import hind600 from "@fontsource/hind-siliguri/files/hind-siliguri-bengali-600-normal.woff2";
import hind700 from "@fontsource/hind-siliguri/files/hind-siliguri-bengali-700-normal.woff2";

// Brief: Poppins (headings) + Nunito (body). Neither has Bengali glyphs, so
// Hind Siliguri (the designs' Bengali face, same foundry as Poppins) is the
// fallback for Bengali characters only. Bundled from npm: no font CDN at render.
const BENGALI = "U+0964-0965, U+0980-09FE, U+200C-200D, U+25CC";
const fonts: [string, string, string, string?][] = [
  ["Poppins", poppins600, "600"],
  ["Poppins", poppins700, "700"],
  ["Poppins", poppins700, "800"],
  ["Nunito", nunito400, "400"],
  ["Nunito", nunito600, "600"],
  ["Nunito", nunito700, "700"],
  ["Hind Siliguri", hind500, "500", BENGALI],
  ["Hind Siliguri", hind600, "600", BENGALI],
  ["Hind Siliguri", hind700, "700", BENGALI],
  ["Hind Siliguri", hind700, "800", BENGALI],
];
for (const [family, url, weight, unicodeRange] of fonts) {
  loadFont({ family, url, weight, ...(unicodeRange ? { unicodeRange } : {}) });
}
