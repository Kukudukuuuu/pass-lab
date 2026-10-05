/* app.js — DOM wiring only. Scoring via zxcvbn global; mapping via PassLab (explain.js). */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const pw = $("pw"), show = $("show"), idle = $("idle"), result = $("result");
  const meter = $("meter"), fill = $("fill"), label = $("label");
  const crack = $("crack"), why = $("why"), offline = $("offline");
  const entryLabel = $("entry-label"), save = $("save");
  const list = $("list"), empty = $("empty"), count = $("count");

  const store = PassLab.createStore({
    getItem: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setItem: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    removeItem: (k) => { try { localStorage.removeItem(k); } catch (e) {} },
  });

  let current = null; // {score, crackDisplay, length} — never the password

  function offlineMode() {
    return typeof zxcvbn !== "function";
  }

  function render() {
    const v = pw.value;
    if (!v) {
      idle.hidden = false;
      result.hidden = true;
      save.disabled = true;
      current = null;
      return;
    }
    if (offlineMode()) {
      offline.hidden = false;
      idle.hidden = false;
      idle.textContent = "Scoring unavailable offline — tracking below still works.";
      result.hidden = true;
      save.disabled = true;
      current = null;
      return;
    }
    offline.hidden = true;
    const r = zxcvbn(v.slice(0, 256));
    const score = PassLab.clampScore(r.score);
    const crackDisplay = PassLab.formatCrackTime(r.crack_times_seconds.offline_slow_hashing_1e4_per_second);
    current = { score, crackDisplay, length: Math.min(v.length, 256) };

    idle.hidden = true;
    result.hidden = false;
    save.disabled = false;
    fill.style.setProperty("--p", (score + 1) / 5);
    fill.style.setProperty("--fill", PassLab.colorFor(score));
    meter.setAttribute("aria-valuenow", String(score));
    meter.setAttribute("aria-valuetext", PassLab.labelFor(score) + ", " + crackDisplay);
    label.textContent = PassLab.labelFor(score);
    crack.textContent = crackDisplay;
    why.textContent = PassLab.feedbackSentence(r.feedback, score);
  }

  function row(entry) {
    const li = document.createElement("li");
    li.className = "row";
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.setProperty("--c", PassLab.colorFor(entry.score));
    const meta = document.createElement("div");
    meta.className = "meta";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = entry.label;
    const detail = document.createElement("div");
    detail.className = "detail";
    detail.textContent = PassLab.labelFor(entry.score) + " · " + entry.crackDisplay + " · " + entry.length + " chars";
    meta.appendChild(name);
    meta.appendChild(detail);
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "delete";
    del.setAttribute("aria-label", "Delete " + entry.label);
    del.addEventListener("click", () => {
      renderList(store.remove(entry.id));
    });
    li.appendChild(dot);
    li.appendChild(meta);
    li.appendChild(del);
    return li;
  }

  function renderList(entries) {
    list.textContent = "";
    empty.hidden = entries.length > 0;
    count.textContent = PassLab.pluralizeEntries(entries.length);
    entries.forEach((e) => list.appendChild(row(e)));
  }

  let raf = 0;
  pw.addEventListener("input", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(render);
  });
  show.addEventListener("click", () => {
    const showing = pw.type === "text";
    pw.type = showing ? "password" : "text";
    show.textContent = showing ? "show" : "hide";
    show.setAttribute("aria-pressed", String(!showing));
    pw.focus();
  });
  save.addEventListener("click", () => {
    if (!current) return;
    renderList(store.add(PassLab.buildEntry({
      label: entryLabel.value,
      score: current.score,
      crackDisplay: current.crackDisplay,
      length: current.length,
    })));
    entryLabel.value = "";
    pw.focus();
  });

  renderList(store.list());
  render();
})();
