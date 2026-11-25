#!/usr/bin/env bash
# Pull new render releases from GitHub into /var/renders/<tag>/.
# Runs from cron on the VPS; see VPS-SETUP.md.
set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

REPO="Mirajgithub24/motion-projects"
ENV_FILE="/etc/renders.env"
DEST="/var/renders"
STATE="$DEST/.downloaded"

log() { printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

if [ ! -r "$ENV_FILE" ]; then
  log "ERROR cannot read $ENV_FILE"
  exit 1
fi
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a
if [ -z "${GH_TOKEN:-}" ]; then
  log "ERROR GH_TOKEN is not set in $ENV_FILE"
  exit 1
fi
export GH_TOKEN GH_PROMPT_DISABLED=1

mkdir -p "$DEST"
touch "$STATE"

# Only one run at a time: a slow download must not overlap the next cron tick.
exec 9>"$DEST/.lock"
flock -n 9 || exit 0

if ! tags="$(gh release list --repo "$REPO" --limit 30 --json tagName --jq '.[].tagName')"; then
  log "ERROR could not list releases of $REPO"
  exit 1
fi

failed=0
# gh lists newest first; download oldest first.
while IFS= read -r tag; do
  [ -n "$tag" ] || continue
  grep -Fxq -- "$tag" "$STATE" && continue

  # The tag becomes a directory name, so refuse anything that is not a plain name.
  if [[ ! "$tag" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
    log "SKIP $tag (unsafe tag name)"
    echo "$tag" >> "$STATE"
    continue
  fi

  # Download to a temp dir first so a broken transfer never looks finished.
  tmp="$DEST/.tmp-$tag"
  rm -rf "$tmp"
  mkdir -p "$tmp"
  if gh release download "$tag" --repo "$REPO" --pattern '*.mp4' --dir "$tmp" >/dev/null 2>"$tmp/.err"; then
    rm -f "$tmp/.err"
    mkdir -p "$DEST/$tag"
    mv -f "$tmp"/*.mp4 "$DEST/$tag/"
    rmdir "$tmp"
    echo "$tag" >> "$STATE"
    log "DOWNLOADED $tag -> $DEST/$tag/ ($(du -sh "$DEST/$tag" | cut -f1))"
    # Optional post-download steps (delete release, notify) go here; see VPS-SETUP.md.
  else
    log "ERROR download failed for $tag: $(tr '\n' ' ' < "$tmp/.err")"
    rm -rf "$tmp"
    failed=1
  fi
done < <(printf '%s\n' "$tags" | tac)

exit "$failed"
