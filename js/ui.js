/* Shared UI helpers: scroll reveal, text-to-speech, PWA registration. */
(function () {
  // --- reveal on scroll ---
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  // --- active nav link ---
  function markNav() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      if (a.getAttribute("href") === path) a.classList.add("active");
    });
  }

  // --- PWA ---
  function registerSW() {
    if (location.search.indexOf("nosw") > -1) return;
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    markNav();
    registerSW();
  });
})();

/* Global text-to-speech helper. */
window.Speech = (function () {
  var supported = "speechSynthesis" in window;
  var current = null;
  function speak(text, onEnd) {
    if (!supported) { if (onEnd) onEnd(); return false; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98; u.pitch = 1.0;
    var voices = window.speechSynthesis.getVoices();
    var pref = voices.filter(function (v) { return /en[-_]/i.test(v.lang); })[0];
    if (pref) u.voice = pref;
    if (onEnd) u.onend = onEnd;
    current = u;
    window.speechSynthesis.speak(u);
    return true;
  }
  function stop() { if (supported) window.speechSynthesis.cancel(); current = null; }
  return { speak: speak, stop: stop, supported: supported };
})();
