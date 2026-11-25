# Motion graphics pipeline

Videos are built with Remotion in cloud sessions and delivered to the VPS through
GitHub Releases (`Mirajgithub24/motion-projects`). These rules apply to every session.

## Project layout
- Each video lives in `projects/<name>/` with `assets/`, `voiceover.mp3` and `brief.md`.
  Start a new one by copying `projects/_template/`.
- Remotion lives in `remotion/` (set it up there if it is missing: `cd remotion && npm install`).
  - `remotion/src/projects/<name>/` holds that video's code; register it in
    `remotion/src/Root.tsx` with composition id `<name>`.
  - `remotion/src/lib/` holds shared pieces (easings/springs, background, grade, grain,
    entrances, font loading, voiceover-length helper).
- `scripts/render.sh <name>` renders with the required settings. It serves
  `projects/<name>/` as Remotion's public dir, so use `staticFile("voiceover.mp3")` and
  `staticFile("assets/...")`.

## Building a video
- Build the video with Remotion. Match the video length to the voiceover duration
  (`voiceoverMetadata()` in `remotion/src/lib/voiceover.ts` does this from the mp3) and
  sync key animations to the speech: get timings from the audio (transcribe it, or use
  `ffmpeg -af silencedetect`), don't guess.
- Use only that project's assets and follow `brief.md` for style, text and format.
- Avoid generic-looking motion: no linear easing, no lone fades, stagger entrances,
  animate exits, never a flat background, keep idle elements subtly moving.
- Before publishing, extract a few frames from the render and look at them. Fix what is off.

## Rendering
- Render to `out/<name>.mp4`: H.264, CRF 20, preset veryfast, 1080p unless `brief.md`
  says otherwise, AAC audio. Use:

      scripts/render.sh <name>

- Never commit `out/` or `node_modules/`.

## Publishing
- Cloud sessions are not allowed to create GitHub releases, so do not run
  `gh release create` from a session. The release is made by GitHub Actions
  (`.github/workflows/render.yml`), which re-renders with `scripts/render.sh` and runs:

      gh release create "<name>-$(date +%Y%m%d-%H%M)" out/<name>.mp4 --repo Mirajgithub24/motion-projects --title "<name>" --notes "Auto render"

- So after the local render looks right: commit the project (`projects/<name>/` and
  `remotion/src/projects/<name>/`, plus the `Root.tsx` registration) and push to `main`.
  Every project changed in that push is rendered and released. Use `[skip ci]` in the
  commit message to push work in progress without a release.
- Everything the render needs must be committed (assets, voiceover, fonts via npm);
  the runner only has the repo.
- Wait for the run to finish (`gh run list --repo Mirajgithub24/motion-projects --workflow render.yml --limit 1`,
  then `gh run watch <id> --repo Mirajgithub24/motion-projects --exit-status`), and check the release with
  `gh api "repos/Mirajgithub24/motion-projects/releases?per_page=1" --jq '.[0] | {tag_name, assets: [.assets[] | {name, size}]}'`
  (`gh release list` does not work inside cloud sessions). The video length is in the run log
  line starting with `Released`.
- Finish by reporting the release tag, video length and file size.
- If the workflow or its `gh release create` step fails, say so clearly (with the exact
  error from `gh run view <id> --log-failed`) and don't retry in a loop.
