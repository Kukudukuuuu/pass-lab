## Problem Statement

Password meters say "weak" with no reason, so users swap one bad password for another. I want a page that explains *why* in plain English and tracks my scores over time without my passwords ever being stored.

## Solution

A static page: type a password → live meter + Label + Crack time + one-sentence Feedback. Optional Tracker: save the score (never the password) under a short label, listed newest-first in localStorage.

## User Stories

1. As a user, I want a live meter as I type, so that I see strength change instantly.
2. As a user, I want a plain-English sentence for *why* (e.g. "common name + year — easy to guess"), so that I know what to change.
3. As a user, I want a crack-time estimate, so that the risk feels concrete.
4. As a user, I want to save a score under a label ("email", "bank") with no password stored, so that I can track progress.
5. As a user, I want to delete entries and see an empty state, so that the list stays mine.
6. As a phone user, I want full use at 320px with no zoom-into-input, so that it works one-handed.
7. As a keyboard/screen-reader user, I want meter updates announced politely, so that it stays accessible.

## Implementation Decisions

- Zero-build static: `index.html`, `styles.css`, `app.js`; pure mapping in `explain.js` (shared browser/node).
- zxcvbn 4.4.2 CDN; offline → scoring disabled with a notice, tracker still works.
- Score 0–4 → Label/colour map in one place; meter fill via `scaleX` transform (never `width`).
- History entry: `{id, label, score, crackDisplay, length, createdAt}`; label truncated to 40 chars; cap 50 (drop oldest); counts via `Intl.PluralRules`.
- Seam under test: `explain.js` pure functions + storage adapter (injected, in-memory in tests). DOM wiring untested.
- Motion: 150–200ms strong ease-out; rows stagger 40ms; `prefers-reduced-motion` drops transforms; hover gated.

## Testing Decisions

- Good test = pure function in, literal out; hand-made zxcvbn-like fixtures (no lib in tests).
- Assert: label map for 0–4, crack-time formatting incl. huge values, feedback sentence from warning/suggestions, entry never contains password, cap-at-50 drops oldest, empty input → empty state model.
- Worst cases: 200-char, emoji, single char, empty label, 1 vs 50 entries.

## Out of Scope

- Accounts, server, sync; password generation; paste-breach (HIBP) lookup; framework build; storing passwords or hashes anywhere.

## Further Notes

- Niche: explainer-first meter; most meters score without teaching.
