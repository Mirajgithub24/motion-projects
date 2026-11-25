# VPS setup (Ubuntu / Debian)

The VPS polls GitHub Releases of `Mirajgithub24/motion-projects` every 5 minutes and saves
each new render to `/var/renders/<tag>/`. Run everything below as root (or prefix with `sudo`).

## 1. Install the latest gh CLI

From the official apt repository at cli.github.com:

```bash
(type -p wget >/dev/null || (apt update && apt install wget -y)) \
  && mkdir -p -m 755 /etc/apt/keyrings \
  && out=$(mktemp) && wget -nv -O"$out" https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat "$out" | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && mkdir -p -m 755 /etc/apt/sources.list.d \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt update \
  && apt install gh -y
```

```bash
gh --version
```

Later updates arrive with the normal `apt update && apt upgrade`.

## 2. Create a read-only token for this repo

1. Open <https://github.com/settings/personal-access-tokens/new> (Settings → Developer
   settings → Personal access tokens → Fine-grained tokens → Generate new token).
2. Token name: `vps-pull-renders`. Pick an expiration and put a reminder in your calendar;
   downloads stop when it expires.
3. Resource owner: `Mirajgithub24`.
4. Repository access: **Only select repositories** → `motion-projects`.
5. Permissions → Repository permissions → **Contents: Read-only**.
   (Metadata: Read-only is added automatically. Nothing else.)
6. Generate token and copy it (`github_pat_...`). It is shown once.

## 3. Save the token

```bash
install -m 600 -o root -g root /dev/null /etc/renders.env
```

```bash
nano /etc/renders.env
```

Put exactly one line in it, with no quotes and no spaces around `=`:

```
GH_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxx
```

```bash
chmod 600 /etc/renders.env
```

## 4. Install the script

Copy `scripts/pull-renders.sh` from this repo to the VPS, for example from your computer:

```bash
scp scripts/pull-renders.sh root@YOUR_VPS:/opt/pull-renders.sh
```

Then on the VPS:

```bash
chmod 755 /opt/pull-renders.sh
```

```bash
mkdir -p /var/renders
```

## 5. Test it by hand

```bash
/opt/pull-renders.sh
```

Expected: one line per new release, such as

```
2026-11-25 08:10:02 DOWNLOADED test-render-20261125-0805 -> /var/renders/test-render-20261125-0805/ (1.2M)
```

Check the result:

```bash
ls -lh /var/renders/*/ && cat /var/renders/.downloaded
```

Run it a second time: it should print nothing, because every tag is already in
`/var/renders/.downloaded`. To fetch a release again, delete its line from that file.

If something is wrong:

| Output | Cause |
|---|---|
| `ERROR cannot read /etc/renders.env` | File missing, or you are not running as root |
| `ERROR could not list releases` with `HTTP 401` | Token mistyped or expired |
| `ERROR could not list releases` with `HTTP 404` / `Could not resolve` | Token was not granted access to `motion-projects` |
| `ERROR download failed ... no assets match` | That release has no `.mp4`; it is retried each run until you add its tag to `.downloaded` |

## 6. Cron

```bash
crontab -e
```

Add:

```
*/5 * * * * /opt/pull-renders.sh >> /var/log/pull-renders.log 2>&1
```

```bash
tail -f /var/log/pull-renders.log
```

The script takes a lock, so a slow download never overlaps the next run.

## Optional extras

Both go in `/opt/pull-renders.sh` right after the `log "DOWNLOADED ..."` line (there is a
comment marking the spot).

### Delete the release after download

This needs a token with **Contents: Read and write** instead of Read-only (edit the token's
permissions on GitHub; the value in `/etc/renders.env` stays the same). The VPS can then
change the repo's contents, so only do this if you want GitHub kept empty.

```bash
gh release delete "$tag" --repo "$REPO" --yes --cleanup-tag \
  || log "WARN could not delete release $tag"
```

### Telegram notification

Create a bot with @BotFather, send it a message, and read your chat id from
`https://api.telegram.org/bot<TOKEN>/getUpdates`. Add to `/etc/renders.env`:

```
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
```

```bash
curl -fsS -m 15 "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=New render downloaded: ${tag}" >/dev/null \
  || log "WARN Telegram notification failed for $tag"
```

### Discord notification

Channel → Edit channel → Integrations → Webhooks → New webhook → copy URL. Add to
`/etc/renders.env`:

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

```bash
curl -fsS -m 15 -H 'Content-Type: application/json' \
  -d "{\"content\": \"New render downloaded: ${tag}\"}" \
  "$DISCORD_WEBHOOK_URL" >/dev/null \
  || log "WARN Discord notification failed for $tag"
```

The `|| log ...` on each keeps a failed delete or notification from stopping the script.
