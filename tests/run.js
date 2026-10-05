/* Seam tests: explain.js pure functions only. Hand-made fixtures, no zxcvbn lib. */
const assert = require("node:assert/strict");
const E = require("../explain.js");

let passed = 0;
function t(name, fn) {
  fn();
  passed++;
  console.log("ok - " + name);
}

// label map 0-4 + clamping
t("labels 0-4", () => {
  assert.equal(E.labelFor(0), "Very weak");
  assert.equal(E.labelFor(1), "Weak");
  assert.equal(E.labelFor(2), "Fair");
  assert.equal(E.labelFor(3), "Strong");
  assert.equal(E.labelFor(4), "Very strong");
});
t("score clamps", () => {
  assert.equal(E.labelFor(99), "Very strong");
  assert.equal(E.labelFor(-2), "Very weak");
  assert.equal(E.labelFor(NaN), "Very weak");
  assert.equal(E.colorFor(4), "#12a594");
});

// crack time formatting incl. huge
t("crack time units", () => {
  assert.equal(E.formatCrackTime(0.2), "less than a second");
  assert.equal(E.formatCrackTime(45), "45 seconds");
  assert.equal(E.formatCrackTime(180), "3 minutes");
  assert.equal(E.formatCrackTime(7200), "2 hours");
  assert.equal(E.formatCrackTime(86400 * 5), "5 days");
  assert.equal(E.formatCrackTime(31536000 * 3), "3 years");
  assert.equal(E.formatCrackTime(31536000 * 400), "4 centuries");
  assert.equal(E.formatCrackTime(1e30), "many millions of years");
  assert.equal(E.formatCrackTime(NaN), "unknown");
});

// feedback sentences
t("feedback warning + suggestion", () => {
  const s = E.feedbackSentence({ warning: "this is similar to a commonly used password", suggestions: ["Add more words."] }, 1);
  assert.match(s, /commonly used/i);
  assert.match(s, /Add more words/);
});
t("feedback suggestion only", () => {
  assert.equal(E.feedbackSentence({ warning: "", suggestions: ["Use a longer keyboard pattern."] }, 2), "Use a longer keyboard pattern.");
});
t("feedback empty falls back per score", () => {
  assert.match(E.feedbackSentence(null, 4), /Nothing guessable/);
  assert.match(E.feedbackSentence({}, 0), /Too guessable/);
});

// score-only entry: no password key survives
t("entry drops password keys", () => {
  const e = E.buildEntry({ label: "email", score: 3, crackDisplay: "3 hours", length: 12, password: "s3cret!", hash: "abc" }, 1000);
  assert.equal(e.label, "email");
  assert.equal(e.score, 3);
  assert.ok(!("password" in e) && !("hash" in e), "password/hash must not be stored");
  assert.deepEqual(Object.keys(e).sort(), ["crackDisplay", "createdAt", "id", "label", "length", "score"]);
});
t("entry label truncates + defaults", () => {
  const e = E.buildEntry({ label: "x".repeat(200), score: 2, crackDisplay: "1 day", length: 200 }, 1000);
  assert.equal(e.label.length, E.MAX_LABEL);
  assert.equal(E.buildEntry({ label: "   ", score: 1, crackDisplay: "1 min", length: 4 }, 5).label, "untitled");
});

// store: cap 50 drops oldest, pluralize, reload, delete
function mem() {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
}
t("store caps at 50 oldest-first", () => {
  const s = E.createStore(mem());
  for (let i = 0; i < 55; i++) s.add(E.buildEntry({ label: "l" + i, score: 1, crackDisplay: "1 min", length: 6 }, i));
  const list = s.list();
  assert.equal(list.length, 50);
  assert.equal(list[0].label, "l54");
  assert.equal(list[49].label, "l5");
});
t("store delete + pluralize", () => {
  const a = mem();
  const s = E.createStore(a);
  const [only] = [E.buildEntry({ label: "bank", score: 4, crackDisplay: "centuries", length: 20 }, 1)];
  s.add(only);
  assert.equal(E.pluralizeEntries(s.list().length), "1 entry");
  s.add(E.buildEntry({ label: "mail", score: 2, crackDisplay: "days", length: 10 }, 2));
  assert.equal(E.pluralizeEntries(s.list().length), "2 entries");
  s.remove(only.id);
  assert.equal(s.list().length, 1);
  // reload from same adapter restores
  assert.equal(E.createStore(a).list().length, 1);
});
t("store survives corrupt json", () => {
  const a = mem();
  a.setItem("passlab.history.v1", "{broken");
  assert.deepEqual(E.createStore(a).list(), []);
});

console.log("\n" + passed + " passed");
