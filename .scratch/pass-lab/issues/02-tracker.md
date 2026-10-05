# 02: Score-only tracker

**What to build:** save current score under a label; newest-first list with delete + empty state; persists in localStorage; never stores password or hash.

**Blocked by:** 01: Live meter + explainer

**Status:** ready-for-agent

- [ ] Saved entry contains score/label/length/time, no password field anywhere
- [ ] List caps at 50 (oldest dropped), count text pluralises (1 entry / N entries)
- [ ] Reload restores the list; delete removes one entry
