/* Offline quiz: choose a topic, answer MCQs, get scored. */
(function () {
  var card = document.getElementById("quiz-card");
  var sub = document.getElementById("q-sub");
  var questions = [], cur = 0, score = 0, topic = "";

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ----- start screen -----
  function historyHTML() {
    if (!window.Progress) return "";
    var history = window.Progress.getHistory();
    if (!history.length) return "";
    var rows = history.slice(0, 5).map(function (h) {
      var pct = Math.round((h.score / h.total) * 100);
      var when = h.date ? new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
      var color = pct >= 70 ? "#2ecc71" : pct >= 40 ? "var(--accent-2)" : "var(--muted)";
      return '<div class="history-row">' +
        '<span class="history-topic">' + h.topic + '</span>' +
        '<span class="history-when">' + when + '</span>' +
        '<span class="history-score" style="color:' + color + '">' + h.score + '/' + h.total + ' (' + pct + '%)</span>' +
        '</div>';
    }).join("");
    return '<div class="quiz-history"><h4>Recent scores</h4>' + rows + '</div>';
  }

  function start() {
    sub.textContent = "Pick a topic to begin.";
    var html = '<h3 style="margin-top:0">Choose a topic</h3><div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">';
    window.ORGANS.forEach(function (o) {
      html += '<button class="opt" data-id="' + o.id + '" style="margin:0">' + o.emoji + " " + o.name +
        '<span style="float:right;color:var(--muted);font-size:.85rem">' + o.system.split(" ")[0] + "</span></button>";
    });
    html += '</div><button class="btn primary" id="mix" style="width:100%;margin-top:14px;justify-content:center">🎲 Mixed quiz - one from each organ</button>';
    html += historyHTML();
    card.innerHTML = html;
    card.querySelectorAll(".opt[data-id]").forEach(function (b) {
      b.onclick = function () { begin(b.getAttribute("data-id")); };
    });
    card.querySelector("#mix").onclick = function () { begin("mix"); };
  }

  function begin(id) {
    cur = 0; score = 0;
    if (id === "mix") {
      topic = "Mixed";
      questions = shuffle(window.ORGANS.map(function (o) {
        var q = o.quiz[Math.floor(Math.random() * o.quiz.length)];
        return { q: q.q, options: q.options, answer: q.answer, organ: o.name };
      }));
    } else {
      var o = window.getOrgan(id);
      topic = o.name;
      questions = shuffle(o.quiz.map(function (q) { return { q: q.q, options: q.options, answer: q.answer, organ: o.name }; }));
    }
    render();
  }

  // ----- question -----
  function render() {
    var q = questions[cur];
    sub.textContent = topic + " quiz";
    var pct = (cur / questions.length) * 100;
    var html =
      '<div class="qprogress"><i style="width:' + pct + '%"></i></div>' +
      '<div class="qmeta"><span>Question ' + (cur + 1) + " of " + questions.length + "</span><span>Score: " + score + "</span></div>" +
      '<div class="qtext">' + q.q + "</div><div id='opts'></div>" +
      '<div id="q-next"></div>';
    card.innerHTML = html;
    var opts = card.querySelector("#opts");
    q.options.forEach(function (opt, i) {
      var b = document.createElement("button");
      b.className = "opt"; b.textContent = opt;
      b.onclick = function () { answer(i, b); };
      opts.appendChild(b);
    });
  }

  function answer(i, btn) {
    var q = questions[cur];
    var all = card.querySelectorAll(".opt");
    all.forEach(function (b, k) {
      b.disabled = true;
      if (k === q.answer) b.classList.add("correct");
      if (k === i && i !== q.answer) b.classList.add("wrong");
    });
    if (i === q.answer) { score++; window.Speech && window.Speech.supported && null; }
    var nextWrap = card.querySelector("#q-next");
    var msg = i === q.answer ? '<span style="color:#2ecc71">✓ Correct!</span>' : '<span style="color:var(--accent-2)">✗ The answer is "' + q.options[q.answer] + '"</span>';
    nextWrap.innerHTML = '<div style="margin:14px 0 6px;font-weight:600">' + msg + "</div>" +
      '<button class="btn primary" id="nextbtn" style="width:100%;justify-content:center">' + (cur + 1 < questions.length ? "Next question →" : "See results →") + "</button>";
    card.querySelector("#nextbtn").onclick = function () {
      cur++;
      if (cur < questions.length) render(); else results();
    };
  }

  // ----- results -----
  function results() {
    var pct = Math.round((score / questions.length) * 100);
    var emoji = pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "💪" : "📚";
    var msg = pct === 100 ? "Perfect score! You know your anatomy." :
      pct >= 70 ? "Great work - almost there!" :
      pct >= 40 ? "Good effort. Review and try again!" : "Keep studying - you've got this.";

    var prevBest = window.Progress ? window.Progress.getBestScore(topic) : null;
    var isNewBest = !prevBest || pct > prevBest.pct;
    if (window.Progress) {
      window.Progress.saveQuizResult({ topic: topic, score: score, total: questions.length, date: new Date().toISOString() });
    }
    var bestLine = isNewBest
      ? '<div class="best-note new">🌟 New best score for ' + topic + '!</div>'
      : (prevBest ? '<div class="best-note">Your best for ' + topic + ' is still ' + prevBest.pct + '%.</div>' : "");

    sub.textContent = "Results";
    card.innerHTML =
      '<div class="quiz-result">' +
      '<div style="font-size:3rem">' + emoji + "</div>" +
      '<div class="score-ring" style="color:' + (pct >= 70 ? "#2ecc71" : "var(--accent-2)") + '">' + score + "/" + questions.length + "</div>" +
      "<p style='color:var(--muted);margin-top:0'>" + msg + " (" + pct + "%)</p>" +
      bestLine +
      '<button class="btn primary" id="again" style="justify-content:center">↻ Try another quiz</button>' +
      ' <a class="btn ghost" href="index.html">Explore organs</a>' +
      "</div>";
    card.querySelector("#again").onclick = start;
  }

  start();
})();
