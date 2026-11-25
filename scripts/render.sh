#!/usr/bin/env bash
# Render projects/<name> to out/<name>.mp4 (H.264, CRF 20, veryfast, AAC).
# Usage: scripts/render.sh <name>
set -euo pipefail

name="${1:?usage: scripts/render.sh <project-name>}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -d "$root/projects/$name" ] || { echo "No such project: projects/$name" >&2; exit 1; }

cd "$root/remotion"
[ -d node_modules ] || npm install --no-fund --no-audit

# Use a preinstalled headless shell when there is one (cloud sessions); otherwise
# Remotion downloads its own.
browser="${REMOTION_BROWSER:-}"
if [ -z "$browser" ]; then
  browser="$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | tail -n1 || true)"
fi

mkdir -p "$root/out"
npx remotion render src/index.ts "$name" "$root/out/$name.raw.mp4" \
  --public-dir "$root/projects/$name" \
  --codec h264 --crf 20 --x264-preset veryfast --pixel-format yuv420p \
  --audio-codec aac --audio-bitrate 192k \
  --overwrite ${browser:+--browser-executable "$browser"}

# +faststart (index at the front, so playback starts before the download ends).
# Remotion ships its own ffmpeg, so this works where ffmpeg is not installed.
npx remotion ffmpeg -v error -y -i "$root/out/$name.raw.mp4" -c copy -movflags +faststart "$root/out/$name.mp4"
rm -f "$root/out/$name.raw.mp4"

# Remotion ships its own ffprobe, so this works where ffmpeg is not installed.
npx remotion ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$root/out/$name.mp4" || true
