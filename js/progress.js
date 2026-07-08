/* ============================================================
   AnatomyAR - progress tracking (localStorage).
   Tracks which organs have been studied and quiz score history.
   No backend needed - everything lives on the user's device.
   ============================================================ */
window.Progress = (function () {
  var STUDIED_KEY = "anatomyar_studied";
  var HISTORY_KEY = "anatomyar_quiz_history";
  var MAX_HISTORY = 20;

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ }
  }

  // ----- studied organs -----
  function getStudied() { return readJSON(STUDIED_KEY, []); }

  function markStudied(id) {
    var studied = getStudied();
    if (studied.indexOf(id) === -1) {
      studied.push(id);
      writeJSON(STUDIED_KEY, studied);
    }
  }

  function isStudied(id) { return getStudied().indexOf(id) !== -1; }

  // ----- quiz history -----
  function getHistory() { return readJSON(HISTORY_KEY, []); }

  function saveQuizResult(entry) {
    // entry: { topic, score, total, date }
    var history = getHistory();
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    writeJSON(HISTORY_KEY, history);
    return history;
  }

  function getBestScore(topic) {
    var best = null;
    getHistory().forEach(function (h) {
      if (h.topic !== topic) return;
      var pct = Math.round((h.score / h.total) * 100);
      if (!best || pct > best.pct) best = { pct: pct, score: h.score, total: h.total };
    });
    return best;
  }

  function clearAll() {
    try { localStorage.removeItem(STUDIED_KEY); localStorage.removeItem(HISTORY_KEY); } catch (e) {}
  }

  return {
    getStudied: getStudied,
    markStudied: markStudied,
    isStudied: isStudied,
    getHistory: getHistory,
    saveQuizResult: saveQuizResult,
    getBestScore: getBestScore,
    clearAll: clearAll
  };
})();
