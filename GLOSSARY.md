# Glossary — pass-lab

Single-context. Use these terms everywhere.

- **Password**: the secret the user types. Never stored, never logged, never leaves the page. Only the live `zxcvbn` result is read.
- **Score**: 0–4 from zxcvbn. The single number everything derives from.
- **Label**: plain word for a Score (Very weak / Weak / Fair / Strong / Very strong).
- **Crack time**: human display of offline-slow-hashing crack estimate (e.g. "3 hours").
- **Feedback**: zxcvbn warning + suggestions, rewritten as one plain-English sentence.
- **History entry**: `{id, label, score, crackDisplay, length, createdAt}`. Score-only: no password, no hash.
- **Tracker**: the local-only list of History entries (localStorage, cap 50).
