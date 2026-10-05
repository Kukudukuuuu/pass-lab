/* explain.js — pure password-explainer logic. No DOM, no storage.
 * Shared between the page (script tag) and node tests (module.exports). */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PassLab = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const COLORS = ["#e5484d", "#f76b15", "#f5a524", "#46a758", "#12a594"];
  const MAX_LABEL = 40;
  const MAX_ENTRIES = 50;

  function clampScore(s) {
    if (typeof s !== "number" || Number.isNaN(s)) return 0;
    return Math.min(4, Math.max(0, Math.floor(s)));
  }

  function labelFor(score) {
    return LABELS[clampScore(score)];
  }

  function colorFor(score) {
    return COLORS[clampScore(score)];
  }

  function formatCrackTime(seconds) {
    if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds < 0) return "unknown";
    if (seconds < 1) return "less than a second";
    const minute = 60, hour = 3600, day = 86400, month = 2592000, year = 31536000;
    if (seconds < minute) return Math.floor(seconds) + " seconds";
    if (seconds < hour) return Math.floor(seconds / minute) + " minutes";
    if (seconds < day) return Math.floor(seconds / hour) + " hours";
    if (seconds < month) return Math.floor(seconds / day) + " days";
    if (seconds < year) return Math.floor(seconds / month) + " months";
    const years = seconds / year;
    if (years < 100) return Math.floor(years) + " years";
    if (years < 1e6) return Math.floor(years / 100) + " centuries";
    return "many millions of years";
  }

  function feedbackSentence(feedback, score) {
    const fb = feedback || {};
    const warning = (fb.warning || "").trim();
    const suggestions = (fb.suggestions || []).map((s) => (s || "").trim()).filter(Boolean);
    if (warning && suggestions.length) return warning.charAt(0).toUpperCase() + warning.slice(1) + ". " + suggestions[0];
    if (warning) return warning.charAt(0).toUpperCase() + warning.slice(1) + ".";
    if (suggestions.length) return suggestions[0];
    const s = clampScore(score);
    if (s >= 4) return "Nothing guessable about it — length and randomness are doing the work.";
    if (s === 3) return "Solid, but a few more random characters would make it much harder.";
    return "Too guessable — add length first, then randomness.";
  }

  function makeId(now) {
    return "e" + now.toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  // Score-only entry. Never accepts a password field: extra keys are dropped.
  function buildEntry(input, now) {
    const t = now == null ? Date.now() : now;
    const label = String(input && input.label != null ? input.label : "").trim().slice(0, MAX_LABEL) || "untitled";
    return {
      id: makeId(t),
      label,
      score: clampScore(input && input.score),
      crackDisplay: String((input && input.crackDisplay) || "unknown"),
      length: Math.max(0, (input && input.length) | 0),
      createdAt: t,
    };
  }

  function pluralizeEntries(n) {
    try {
      const rule = new Intl.PluralRules("en", { type: "cardinal" }).select(n);
      return rule === "one" ? "1 entry" : n + " entries";
    } catch (e) {
      return n === 1 ? "1 entry" : n + " entries";
    }
  }

  function createStore(adapter, key) {
    const k = key || "passlab.history.v1";
    function load() {
      try {
        const raw = adapter.getItem(k);
        if (!raw) return [];
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list.filter((e) => e && typeof e.id === "string") : [];
      } catch (e) {
        return [];
      }
    }
    function persist(list) {
      try {
        adapter.setItem(k, JSON.stringify(list));
      } catch (e) { /* private-mode: keep in memory only */ }
    }
    return {
      list: load,
      add(entry) {
        const list = [entry].concat(load()).slice(0, MAX_ENTRIES);
        persist(list);
        return list;
      },
      remove(id) {
        const list = load().filter((e) => e.id !== id);
        persist(list);
        return list;
      },
    };
  }

  return {
    LABELS, COLORS, MAX_LABEL, MAX_ENTRIES,
    clampScore, labelFor, colorFor, formatCrackTime,
    feedbackSentence, buildEntry, pluralizeEntries, createStore,
  };
});
