# pass-lab

Why is my password weak? A strength **explainer** + local-only score tracker. Your passwords never leave this page.

## 60-second demo

```bash
python3 -m http.server 8000
# open http://localhost:8000 — type a password, watch the meter explain
node tests/run.js   # 11 passed
```

Deploy: push `main` to GitHub → Settings → Pages → Deploy from branch. Zero build.

## Privacy

- Scoring runs in-page via [zxcvbn](https://github.com/dropbox/zxcvbn) (CDN).
- Tracker saves `{label, score, crack time, length}` to `localStorage` — **never the password, never a hash** (asserted in tests).
- No accounts, no server, no analytics.
