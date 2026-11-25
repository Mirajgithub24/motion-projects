# Brief: percel-video

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


### Scene plan (filled in from the transcript)

Generated from `remotion/src/projects/percel-video/plan.ts` with
`node --experimental-strip-types remotion/tools/plan-table.mjs`. Times are video
time (voiceover + 0.5 s lead-in); cue times are voiceover seconds from
`transcript.json`. Cuts sit in measured pauses. Scenes longer than 6 s are split
into shots of the same design, one camera move each.

| # | Time (video) | Section | Voiceover cue (VO seconds) | On-screen text | Assets to use | Camera |
|---|---|---|---|---|---|---|
| 1 | 0:00.0–0:04.7 | Hook | টোকা (2.98) | (door 4-বি, শান্তি নীড়; the door jolts on the knock) | S1A_Door.dc.html | Push-in |
| 2 | 0:04.7–0:07.9 | Hook | ভাই, আপনার পার্সেল / এমন টোকা (4.4 / 7.15) | ঠক ঠক | S1B_Knock.dc.html | Push-in |
| 3 | 0:07.9–0:11.1 | Hook | সাড়ে সাত লাখ (8.81) | 7,50,000 প্রতিদিনের পার্সেল | S1C_Counter.dc.html | Pull-out |
| 4 | 0:11.1–0:22.6 | Question / title | মানুষটা (14.74) | পার্সেলের পেছনের মানুষ · The People Behind the Parcel | Main.dc.html | Push-in → pan → pull-out (3 shots) |
| 5 | 0:22.6–0:26.4 | Journey | ফেসবুকে / শাড়ি (24.00 / 24.68) | (Nusrat's home studio, Barishal) | S2A_NusratStudio.dc.html | Push-in |
| 6 | 0:26.4–0:31.5 | Journey | অর্ডার এলে / মার্চেন্ট প্যানেলে / বুকিং (26.1 / 29.08 / 30.16) | অর্ডার বুক করা হচ্ছে · ৳1,850 | S2B_MerchantApp.dc.html | Lateral pan |
| 7 | 0:31.5–0:34.3 | Journey | কাছের হাবে (33.27) | (local hub: রুট কোড board) | S2D_LocalHub.dc.html | Lateral pan |
| 8 | 0:34.3–0:37.9 | Journey | সর্টিং সেন্টারে (34.41) | (sorting center: cages for 8 divisions) | S2E_SortingCenter.dc.html | Pull-out |
| 9 | 0:37.9–0:49.2 | Last mile | হাতে দেন / টাকা নেন (41.98 / 43.34) | (handover: parcel out, cash in) | S2H_DoorstepHandover.dc.html | Push-in → pull-out |
| 10 | 0:49.2–0:56.1 | Money flow | delivery charge / 1% COD / seller (49.75 / 50.91 / 54.49) | টাকা কোথায় যায়? ৳1,850 − ৳70 − ৳18.50 = ৳1,761.50 | S2I_MoneyFlow.dc.html | Push-in → pan |
| 11 | 0:56.1–1:01.2 | Money flow | অর্থাৎ / চলমান ব্যাংক (55.56 / 58.64) | একটি পার্সেলের যাত্রা | S2J_JourneyMap.dc.html | Pull-out |
| 12 | 1:01.2–1:09.1 | Couriers | সাতশোর বেশি / একশো চোদ্দ (63.46 / 67.36) | 700+ কুরিয়ার প্রতিষ্ঠান vs 114 লাইসেন্সপ্রাপ্ত | S3B_700vs114.dc.html | Pull-out → push-in |
| 13 | 1:09.1–1:17.7 | Couriers | এর মধ্যে / পাঠাও (68.62 / 71.60) | দেশজুড়ে কুরিয়ার হাব | S3A_HubMap.dc.html | Push-in → pan |
| 14 | 1:17.7–1:22.4 | Couriers | তিনশো হাব / আটটি (78.85 / 79.89) | হাবের জাল · 300 স্থানীয় হাব · 8 আঞ্চলিক সর্টিং সেন্টার | S3C_HubNetwork.dc.html | Push-in |
| 15 | 1:22.4–1:40.7 | Daily math | সাড়ে সাত লাখ / গুণ আশি / ছয় কোটি / দুই হাজার কোটি (84.15 / 93.96 / 95.94 / 97.75) | 7,50,000 × ৳80 = ৳6 crore/day · ৳2,190 crore/year | S3D_Calculator.dc.html | Pull-out → push-in → pan → pull-out (4 shots) |
| 16 | 1:40.7–1:55.0 | Daily math | শুধু ডেলিভারি ফি / রাইডারের আয় (100.59 / 108.57) | 7,50,000 পার্সেল, প্রতিদিন · one rider | S3E_ParcelMountain.dc.html | Pull-out → push to the rider → hold (3 shots) |
| 17 | 1:55.0–2:04.9 | Rider's share | পনেরো টাকা / তিরিশটি / গুণ (120.50 / 122.24 / 124.66) | 30 parcels × ৳15 per parcel | S4C_DailyMath.dc.html | Push-in → pan |
| 18 | 2:04.9–2:08.2 | Rider's share | ৪৫০ টাকা (126.30) | দিনের শেষে, হাতে যা থাকে ৳450 | S4F_CountingNotes.dc.html | Push-in |
| 19 | 2:08.2–2:15.5 | Rider's share | ১১,৭০০ / ৫,০০০ / ১৬,৭০০ (129.32 / 131.54 / 133.21) | What a rider takes home · ≈ ৳16,700 | S4B_IncomeBar.dc.html | Push-in → pull-out |
| 20 | 2:15.5–2:22.8 | Rider's share | ৭০ টাকার মধ্যে / ১৫ টাকা / পাঁচ ভাগের এক ভাগ (136.49 / 139.37 / 140.49) | Where does ৳70 go? · Rider ৳15 | S4A_70Note.dc.html | Push-in → push to the rider slice |
| 21 | 2:22.8–2:38.3 | Commission | কমিশন / 95% / 90% / 85% (144.61 / 148.83 / 152.72 / 154.74) | সফলতা কমলে, কমিশনও কমে · 95% ৳16 · 90% ৳11 · ≤85% ৳7 | S4D_Staircase.dc.html | Push-in → pan → pan (3 shots) |
| 22 | 2:38.3–2:43.8 | Commission | ফোন না ধরলে (159.00) | No answer · কল ধরছে না | S4E_SplitScreen.dc.html | Push-in |
| 23 | 2:43.8–2:48.4 | Last five years | ২০২০ (163.31) | উত্থান, পতন, ঘুরে দাঁড়ানো | S5A_Timeline.dc.html | Lateral pan |
| 24 | 2:48.4–2:53.1 | Last five years | একশো ছেষট্টি (167.86) | 2020 লকডাউন · +166% | S5B_Lockdown2020.dc.html | Push-in |
| 25 | 2:53.1–2:57.6 | Last five years | আস্থায় বড় ধাক্কা (172.63) | 2021 আস্থার সংকট | S5C_TrustCrisis2021.dc.html | Pull-out |
| 26 | 2:57.6–3:02.9 | Last five years | ৯৫ শতাংশের বেশি (179.22) | >95% COD ক্যাশ অন ডেলিভারি | S5D_CODDominance.dc.html | Push-in |
| 27 | 3:02.9–3:07.5 | Last five years | বাংলাদেশ ব্যাংক / ব্যাংকিং চ্যানেলে (182.92 / 185.92) | নগদ টাকা এখন ব্যাংকিং চ্যানেলে | S5E_BankRule.dc.html | Lateral pan |
| 28 | 3:07.5–3:14.3 | Competition | প্রতিযোগিতার / বন্ধ / ছোট (187.68 / 191.08 / 193.00) | প্রতিযোগিতার ঝড় · CLOSED · SHRINKING · GROWING | S5F_Competition.dc.html | Push-in → pan |
| 29 | 3:14.3–3:21.8 | Competition | ২০১৬ / পাঁচ জন / স্টেডফাস্ট (194.40 / 196.00 / 198.02) | পাঁচজন থেকে হাজার হাজার · 5 → Thousands | S5G_RidersMultiply.dc.html | Push-in → pull-out |
| 30 | 3:21.8–3:30.2 | Competition | পাঠাও / দুই তৃতীয়াংশ (201.58 / 207.22) | পার্সেল যাচ্ছে ঢাকার বাইরে · 2/3 ঢাকার বাইরে | S5H_DhakaVsRest.dc.html | Push-in → pan |
| 31 | 3:30.2–3:34.7 | Competition | গ্রামই এখন বড় বাজার (211.35) | (village road; design has no on-screen text) | S2G_VillageRoad.dc.html | Push-in |
| 32 | 3:34.7–3:43.1 | 2030 | ২০৩০ (217.15) | 2030 | S6A_Street2030.dc.html | Lateral pan → push-in |
| 33 | 3:43.1–3:52.4 | 2030 | ৭.৫ লাখ / ১৫ লাখ / প্রশ্ন (224.04 / 226.10 / 228.07) | ~7.5 lakh → ~15 lakh · Who will carry the extra 7.5 lakh? | S6B_BarChart2030.dc.html | Push-in → pan |
| 34 | 3:52.4–4:10.9 | What changes | তিনটি পরিবর্তন / ডিজিটাল পেমেন্ট / ডেটা / রাইডারের অধিকার (232.12 / 236.95 / 242.98 / 248.41) | Three pillars · Digital payments · Data and automation · Rider rights | S6C_ThreePillars.dc.html | Push-in on each pillar in turn (5 shots) |
| 35 | 4:10.9–4:14.1 | What changes | দশ লাখেরও বেশি (251.27) | 1 million+ · ১০ লাখ+ গিগ কর্মী | S6D_GigMosaic.dc.html | Pull-out |
| 36 | 4:14.1–4:26.0 | What changes | শ্রম সংস্কার / শ্রমিক / সুপারিশ (254.31 / 256.59 / 259.19) | Labour reform · শ্রম সংস্কার · রাইডারও একজন শ্রমিক | S6E_LabourReform.dc.html | Push-in → pan → pull-out (3 shots) |
| 37 | 4:26.0–4:35.6 | Closing | এই খাত (265.28) | (aerial Dhaka at dusk; no on-screen text) | S7A_AerialDusk.dc.html | Pull-out → pan |
| 38 | 4:35.6–4:43.1 | Closing | মোটরসাইকেলে, সাইকেলে (279.21 / 280.11) | (district-town street: cargo cycle, CNG) | S2G_DistrictTown.dc.html | Lateral pan → push-in |
| 39 | 4:43.1–4:49.4 | Closing | ধন্যবাদ (287.38) | ধন্যবাদ, ভাই! · Thank you, brother! | S7B_RainDoorstep.dc.html | Push-in → push to the bubble |
| 40 | 4:49.4–4:54.4 | Closing | পার্সেলের পেছনে (290.62) | (Rahim close-up in the rain) | S7C_RahimCloseup.dc.html | Slow push-in |
| 41 | 4:54.4–4:58.1 | Closing | একজন মানুষ (294.95) | পার্সেলের পেছনের মানুষ · ফলো করুন / আপনার মতামত কমেন্টে জানান | S7D_EndCard.dc.html | Locked off: title holds still |

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

### Decisions made while building (2026-11-25)
- **Scene order follows the voiceover.** File order is kept except where the
  narration says things in a different order, so numbers never appear before they
  are spoken: S3B before S3A (700+/114 is said first), S4C → S4F → S4B → S4A
  (৳15 × 30 = ৳450, then the monthly total, then "৳15 of your ৳70"), S2Gv after
  S5H ("গ্রামই এখন বড় বাজার") and S2G at 4:35 ("মোটরসাইকেলে, সাইকেলে").
- **Main.dc.html (style frame) is used as the title scene** for "the person who
  brought it… how much does he get?" It is a complete scene with the video's title.
- **Not used:** S2C (Barishal street) and S2F (night highway). The journey
  narration (22–37 s) only has room for four scenes at the 2.5 s minimum.
  V4A–V4F are alternates of S4A–S4F. C1–C7, K1–K7 and Palette are reference
  sheets (characters, props, kit, palette), not scenes.
- **Fonts:** Poppins (headings) and Nunito (small body text) as briefed. Neither has
  Bengali glyphs, so Bengali falls back to Hind Siliguri, the designs' own Bengali
  face (same foundry as Poppins).
- **Colors:** page grounds are the soft green gradient; cream walls and grounds
  inside illustrations are shifted to light greens; orange UI graphics (frames,
  bars, graph lines, pins, buttons, deep-orange text) become brand green. People,
  uniforms, props and skies keep their design colors.
- **Design-board labels** such as "SCENE 3A · HUB MAP" are hidden; they annotate
  the storyboard and are not on-screen copy.
- **Text sizes** follow the designs, including small captions under 40 px (design
  wins for layout and text).
- **Music:** none (no music file in assets). **Captions:** none.
- **Audio:** the voiceover is gain-matched and peak-limited to −14.1 LUFS, true peak
  −1.3 dBTP (`assets/audio/voiceover_mix.m4a`); speed and edit are unchanged.
