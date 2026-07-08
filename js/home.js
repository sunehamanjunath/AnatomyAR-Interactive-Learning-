/* Home page: hero model, progress dashboard, organ grid + search. */
(function () {
  // hero model
  var hero = document.getElementById("hero-model");
  if (hero) hero.setAttribute("src", window.getOrgan("heart").model);

  // ----- progress dashboard -----
  function renderProgress() {
    var panel = document.getElementById("progress-panel");
    if (!panel || !window.Progress || !window.ORGANS) return;
    var studied = window.Progress.getStudied();
    var total = window.ORGANS.length;
    var pct = Math.round((studied.length / total) * 100);
    var history = window.Progress.getHistory();
    var bestPct = history.length
      ? Math.max.apply(null, history.map(function (h) { return Math.round((h.score / h.total) * 100); }))
      : null;

    panel.innerHTML =
      '<div class="progress-head">' +
      '  <div><span class="eyebrow">Your progress</span><h3>' + studied.length + ' / ' + total + ' organs explored</h3></div>' +
      (bestPct !== null ? '<div class="progress-best">🏆 Best quiz score: ' + bestPct + '%</div>' : '') +
      '</div>' +
      '<div class="progress-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="progress-dots" id="progress-dots"></div>';

    var dots = panel.querySelector("#progress-dots");
    window.ORGANS.forEach(function (o) {
      var done = studied.indexOf(o.id) !== -1;
      var d = document.createElement("span");
      d.className = "progress-dot" + (done ? " done" : "");
      d.title = o.name + (done ? " - studied" : " - not studied yet");
      d.textContent = o.emoji;
      dots.appendChild(d);
    });
  }
  renderProgress();

  // ----- organ grid -----
  var grid = document.getElementById("organ-grid");
  if (!grid || !window.ORGANS) return;

  var studiedIds = window.Progress ? window.Progress.getStudied() : [];

  function cardHTML(o) {
    var studiedBadge = studiedIds.indexOf(o.id) !== -1 ? '<span class="studied-badge" title="Studied">✓</span>' : "";
    return (
      '<div class="viz">' +
      '  <div class="glow"></div>' +
      studiedBadge +
      '  <model-viewer src="' + o.model + '" camera-controls auto-rotate auto-rotate-delay="0"' +
      '    rotation-per-second="26deg" interaction-prompt="none" disable-zoom disable-pan' +
      '    shadow-intensity="0.8" exposure="1.05" loading="lazy"></model-viewer>' +
      '</div>' +
      '<div class="go">→</div>' +
      '<div class="body">' +
      '  <h3>' + o.emoji + " " + o.name + '</h3>' +
      '  <span class="sys">' + o.system + '</span>' +
      '  <p>' + o.tagline + '</p>' +
      '</div>'
    );
  }

  function buildCards(list, animate) {
    grid.innerHTML = "";
    list.forEach(function (o, i) {
      var a = document.createElement("a");
      a.className = "card reveal" + (animate ? "" : " in"); // skip fade-in wait once page has already loaded
      a.href = "organ.html?id=" + o.id;
      a.style.setProperty("--card-color", o.color);
      a.style.transitionDelay = (i * 40) + "ms";
      a.innerHTML = cardHTML(o);
      grid.appendChild(a);
    });
  }

  buildCards(window.ORGANS, true);

  // ----- search -----
  var input = document.getElementById("organ-search");
  var countEl = document.getElementById("search-count");
  var noResults = document.getElementById("no-results");
  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var filtered = !q ? window.ORGANS : window.ORGANS.filter(function (o) {
        return o.name.toLowerCase().indexOf(q) !== -1 ||
          o.system.toLowerCase().indexOf(q) !== -1 ||
          o.tagline.toLowerCase().indexOf(q) !== -1;
      });
      buildCards(filtered, false);
      grid.hidden = filtered.length === 0;
      noResults.hidden = filtered.length !== 0;
      countEl.textContent = q ? filtered.length + " match" + (filtered.length === 1 ? "" : "es") : "";
    });
  }
})();
