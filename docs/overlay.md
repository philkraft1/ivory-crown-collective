# TikTok Live game overlays

## Wheel of Fortune

- **URL:** `https://ivorycrowncollective.com/overlay/wheel.html`
  (local preview only: `http://localhost:3000/overlay/wheel.html` — TikTok rejects this)
- **File:** `public/overlay/wheel.html` — self-contained, no site nav/footer,
  no fixed-size stage.

TikTok LIVE Studio rejects `localhost` and `127.0.0.1`. Paste the public
overlay, not the host console. The host page builds that address and adds
the query parameters below. A generated HTTPS tunnel, when one is running,
points at this same file.

### Add it in TikTok LIVE Studio / OBS

1. Add a **Link / Browser source** and paste the URL above.
2. Set the source to the full canvas (portrait **1080 × 1920** for a 9:16
   live). The overlay itself fills whatever box it is given — do not shrink
   it into a centred column; stretch the source edge-to-edge.
3. Optional URL parameters:
   - `?transparent=1` — transparent background, composites over your camera.
   - `?title=Your%20Title`, `?subtitle=...` — customise the banner text.
   - `?spin=1` — spin once on load. A host page can also trigger a spin with
     `postMessage({ type: "spin" })`.

### Why it fills the screen

The overlay is pinned with `position: fixed; inset: 0` at
`100dvw × 100dvh`, sized with responsive `clamp()` / `vmin`-style units and
safe-area padding. There is no `max-width` column, no 1080×1920 stage scaled
with `transform: scale()`, and no dimming layer — the wheel is a CSS
conic-gradient rendered at the device's own resolution, so it stays vivid
and sharp. The wheel diameter uses the smaller viewport axis
(`min(94vw, 58dvh)`), so it is always a true circle, never squashed.

`/overlay/*` also gets embed-friendly headers in `next.config.ts`
(`frame-ancestors *`, no `X-Frame-Options: DENY`); all other routes keep the
site's strict framing policy.
