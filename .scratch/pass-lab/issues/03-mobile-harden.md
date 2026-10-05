# 03: Mobile + worst-case hardening + Pages

**What to build:** 320px-safe layout, 16px inputs, tap/highlight/safe-area baseline, reduced-motion variant, worst-case inputs (200-char, emoji, 1-char) render cleanly, README + GitHub Pages.

**Blocked by:** 02: Score-only tracker

**Status:** ready-for-agent

- [ ] No horizontal scroll at 320px; input focus doesn't zoom on iOS (16px)
- [ ] Crack-time/labels wrap cleanly for extreme inputs; history empty/one/many states read correctly
- [ ] README demo + served over `python3 -m http.server`, deployable to Pages as-is
