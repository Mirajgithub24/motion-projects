# Brief: <project name>

Copy `projects/_template/` to `projects/<name>/`, fill in **Part B**, add your files to
`assets/` and drop the narration in as `voiceover.mp3`.

**Part A is the house style.** It applies to every video. Don't edit it per project.
If Part B conflicts with Part A, Part B wins for that video only. Say so in Notes.

---

# PART A: Universal style rules (every video)

## A1. Tools and skills to load before writing any code

1. **Official Remotion Agent Skills** (required): `npx skills add remotion-dev/skills`
   - Load `remotion-best-practices` first. It routes to the other skills (markup,
     animations, fonts, audio, captions, rendering).
2. **Reference libraries.** Use them for patterns and ideas. Copy into the project only
   if the license allows it:
   - `Remocn/remocn`: ready-made Remotion transitions, backgrounds and scenes.
   - `Vincentwei1021/video-shotcraft`: shot recipe cards for cinematic product shots
     and camera moves.
   - `digitalsamba/claude-code-video-toolkit`: full pipeline patterns (Remotion, FFmpeg,
     voiceover).
   - `charlie947/motion-graphics-skills` and `iart-ai/motion-skills`: kinetic
     typography, explainer and social-video techniques.
3. **Whisper or another speech-to-text tool** with **word-level timestamps** for
   `voiceover.mp3`. Timing comes from the transcript, never from guesses.

## A2. Background and color: light only

- **Never use a dark or black background.** Every scene uses a light base: white,
  off-white (`#FAFAF7`), or a very light tint of the brand color (lightness ≥ 92%).
- Depth comes from soft layers, not darkness:
  - subtle gradients (≤ 6% lightness difference)
  - soft shadows (`0 20px 60px rgba(0,0,0,0.08)`)
  - light grain at most (opacity ≤ 3%)
- **Text color:** dark (`#111` to `#2B2B2B`) or the brand's darkest color. Contrast
  must be at least **4.5:1** against its background, and at least 3:1 for headings 48 px
  and up.
- **One hero color per scene** plus at most one accent. Neutrals fill the rest.
  No rainbow layouts.
- **Footage or photos that are dark:** put them inside a framed card or rounded panel
  on the light background. Never full-bleed dark footage.
- The brand colors in Part B override these defaults. The light-background rule stays.

## A3. Layout and composition

- **Canvas:** 1080×1920 (9:16) or 1920×1080 (16:9) at **30 fps** unless Part B says
  otherwise.
- **Safe area:**
  - Keep all text and logos inside a 6% margin.
  - For 9:16, also keep the top 12% and bottom 18% clear of key text, so platform UI
    doesn't cover it.
- Use an **8-pt spacing grid**. Align everything to a column grid: 12 columns for
  16:9, 6 for 9:16.
- **One focal point per scene.** Use size, color and motion to make the viewer's eye go
  there first.
- Use rule-of-thirds placement for hero elements. Center only for logo and title cards.
- Leave at least 30% of every frame as negative space. Don't crowd the frame.

## A4. Typography

- **At most 2 font families:** headings and body. Load them with `@remotion/google-fonts`,
  or from `assets/fonts/`.
- **Minimum on-screen size at 1080p:**
  - headings 72 px (9:16) or 64 px (16:9)
  - body 40 px
  - captions 44 px
- **Line length:** at most 32 characters per line for 9:16, 45 for 16:9.
  At most 3 lines per text block.
- **Animate text by word or line** (stagger 2–4 frames). Never letter-by-letter typing,
  unless the brief asks for it.
- **Reading time:** every text block stays fully readable for at least
  **0.4 s per word + 0.5 s**.

## A5. Motion principles

- Every move must have a reason: reveal, direct attention, or show change.
  Nothing moves just to fill time.
- **Easing:**
  - Use `spring({ damping: 200 })` or ease-out cubic for entrances, and ease-in for
    exits.
  - Never use linear motion, except for continuous drift.
- **Timing (at 30 fps):**

  | Animation | Duration |
  |---|---|
  | Small elements in | 10–15 frames |
  | Hero elements in | 15–24 frames |
  | Exits | 8–12 frames |
  | Hold after an entrance, before the next change | at least 20 frames |

- Always clamp interpolations (`extrapolateLeft/Right: 'clamp'`). No overshoot jitter.
- **Ambient life:** each held scene gets subtle continuous motion (drift ≤ 2% or a slow
  scale) so the frame never looks frozen.
- **Consistency:** use the same easing, durations and direction language in every
  scene. Define these once as shared constants and reuse them.

## A6. Virtual camera

Treat each scene as a shot taken with a virtual camera. Animate a parent "camera"
container, not individual elements.

| Shot | Use for | Settings |
|---|---|---|
| Slow push-in | Default for holds and emphasis | Scale 1.00 → 1.06 over the scene |
| Pull-out / reveal | Showing context, ending on a full layout | Scale 1.12 → 1.00 |
| Lateral pan / truck | Moving between related items | ≤ 15% of frame width, eased |
| Parallax | Depth on layered scenes | Background 0.3×, mid 0.6×, foreground 1.0× speed |
| Rack focus | Shifting attention | Blur the non-focus layer 0 → 6 px |
| Match cut / zoom-through | Scene-to-scene continuity | Zoom into an element that becomes the next scene |

**Rules:**
- At most **one** camera move per scene.
- No camera shake, no Dutch angles (rotation ≤ 2°), and no whip pans faster than 8 frames.
- Add motion blur to fast moves (`@remotion/motion-blur`), kept subtle.
- 3D (React Three Fiber) only when the brief asks for it. Keep a light environment,
  soft key light and no harsh shadows.

## A7. Scene structure and transitions

- **Scene length:** 2.5–6 s. One idea per scene. Split anything longer.
- **Every scene's anatomy:** enter, then hold with ambient motion, then exit or transition.
- **Transitions:**
  - Use `@remotion/transitions` (fade, slide, wipe) or a match cut.
  - Keep them 10–18 frames, and use the same family throughout one video.
- **The opening hook:** the first 1.5 s must show motion and the key message or visual.
  No slow logo intro at the start.
- **The closing:** logo plus call to action, held for at least 2 s. The logo stays still
  for its final second.

## A8. Voiceover sync (the voiceover drives the edit)

1. **Transcribe `voiceover.mp3` first** to get word-level timestamps. Save them as
   `projects/<name>/transcript.json`.
2. **Total length** = voiceover length + 0.5 s lead-in + 1.5 s tail.
3. **Scene cuts** fall on sentence or phrase boundaries, in natural pauses.
   Never cut mid-word.
4. **Text timing:**
   - Each on-screen text lands on its **Voiceover cue** word from Part B, within
     ±3 frames.
   - Text never appears more than 0.3 s **before** the word is spoken.
5. **Key nouns and numbers** spoken aloud get a visual beat at that moment: a scale pop,
   a highlight or a counter.
6. **Music:**
   - Duck to −18 dB under speech, −10 dB in gaps, with 0.3 s ramps.
   - Final mix around −14 LUFS, true peak ≤ −1 dBTP.
7. Never change the speed of the voiceover, or cut it, to fit the visuals.
   Change the visuals instead.

## A9. Design asset consistency

- **Use only the files in `assets/`.** No stock images, no AI-generated people, and no
  invented logos.
- **If something is missing,** build it from simple shapes, type and brand colors,
  and list it under "Assumptions" in the final report.
- **Logos:**
  - Never stretch, recolor, rotate, crop or add effects.
  - Clear space around the logo is at least the height of its main letter or mark.
  - On a light background, use the full-color or dark version.
- **Images:** keep the original aspect ratio (`object-fit: cover` inside frames).
  No upscaling beyond 120% of native size.
- **Treat every asset the same way:** one corner radius (for example 24 px), one shadow
  style and one border style across the whole video.
- **Icons:** one icon style per video (all outline or all filled) with a consistent
  stroke width.

## A10. Quality check before the final render

1. Render stills at the start, middle and end of every scene, plus every voiceover cue
   frame, and inspect them.
2. **Fail and fix if any of these happen:**
   - a dark background anywhere
   - text outside the safe area, or clipped
   - contrast below the minimums in A2
   - overlapping elements
   - a text block that's readable for less than the A4 minimum
   - a cue that's off by more than 3 frames
   - a distorted logo
   - an empty or frozen frame longer than 1 s
3. **Render a low-res check copy and watch it end to end.** Confirm:
   - the audio is in sync
   - nothing pops in without easing
   - the transitions are consistent
4. **Final render:** H.264, CRF 18–20, yuv420p, AAC 192 kbps, `+faststart`.
5. **Final report:**
   - length, file size and scene list with timestamps
   - any assumptions made
   - anything in the brief that couldn't be done

---

# PART B: This video

## Format
- Aspect ratio: 16:9
- Resolution: 1920x1080, 30 fps
- Platform: general (YouTube / website / Facebook)

## Mood / style
Cheerful, bright, upbeat and friendly. The motion is bouncy but clean:
- Use springs with light overshoot for small elements (`damping: 12–15`). Hero text and
  logos stay smooth (`damping: 200`).
- Keep the pace lively: 2.5–4 s per scene, with playful pops on key words.
- Decorative touches: soft floating circles, leaves or sparkles in light greens,
  low opacity, slow drift.
- Never childish or cluttered. It should feel like a happy, polished brand video.

## Brand colors
- Background (light): soft green gradient from `#F4FBF1` (top-left) to `#DDF3D3`
  (bottom-right). It must stay a light base, never dark.
- Primary (hero): `#3FAE5A` (fresh green). Use it for shapes, highlights, underlines
  and icons. Don't use it for body text, because its contrast is too low.
- Accent: `#F5B83D` (sunny yellow). Use it sparingly for cheerful highlights and the
  call to action.
- Text (dark): `#1E3A26` (deep green-black).

## Fonts
No brand fonts provided. Use friendly, rounded Google Fonts:
- Headings: **Poppins** (SemiBold/Bold)
- Body: **Nunito** (Regular/SemiBold)

## On-screen text per section
**Claude plans this from the voiceover.** Steps:
1. Transcribe `voiceover.mp3` with word-level timestamps and save `transcript.json`.
2. Split the script into scenes at natural phrase or sentence pauses, one idea per scene
   (see A7).
3. For each scene, pick:
   - a short on-screen text: the key words, max 6–8 words, not the full sentence
   - the voiceover cue word it lands on
   - the assets from `assets/` to use
   - one camera move from A6
4. Write the plan into this table **before building**, commit it with the video,
   and list it in the final report.

| # | Section | Voiceover cue | On-screen text | Assets to use | Camera |
|---|---------|---------------|----------------|---------------|--------|
| 1 | Hook    | (from transcript) | (from transcript) | (best-fit asset) | Push-in |
| … | …       | …             | …              | …             | …      |
| N | Closing | (last line)   | Logo + call to action | logo | Pull-out |

## Music
- Music: yes if a music file is in `assets/`. Otherwise no music, just the voiceover.
- Feel, if music is added: light, upbeat, acoustic or ukulele-pop. Duck it under the
  voiceover (see A8).

## Captions
- Burned-in captions: no (key-word on-screen text only)

## Notes
- Every asset in `assets/` should appear at least once if it fits the script. If an
  asset doesn't fit anywhere, list it in the report instead of forcing it in.
- The call to action is taken from the last line of the voiceover.
- Overrides to Part A: bouncier springs for small elements, as described under
  Mood / style.
