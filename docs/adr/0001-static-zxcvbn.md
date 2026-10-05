# 0001 — Static site, zxcvbn, score-only history

Date: 2026-10-05
Status: accepted

## Context

Portfolio + learning project. Must be hostable on GitHub Pages (static). Passwords must never be stored anywhere.

## Decision

- Plain `index.html` + `styles.css` + `app.js`, zero build. zxcvbn 4.4.2 via CDN with offline fallback message.
- Pure explainer mapping in `explain.js` (no DOM), tested in node with hand-made zxcvbn-like results.
- Tracker persists History entries in localStorage, score-only, capped at 50. No password or hash ever written.
- Motion: meter fill via `scaleX` transform 150–200ms strong ease-out; history rows stagger 40ms; hover gated; `prefers-reduced-motion` keeps opacity only.
- Mobile baseline: `viewport-fit=cover`, `100dvh`, 16px inputs, tap-highlight off, dual theme-color.

## Consequences

- No backend, no accounts, no sync.
- CDN required for scoring; page explains when offline.
