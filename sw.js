/* AnatomyAR service worker - installable + offline after first visit. */
var CACHE = "anatomyar-v6";
var SHELL = [
  "index.html", "organ.html", "scan.html", "quiz.html", "markers.html", "compare.html",
  "css/style.css",
  "js/organs.js", "js/ui.js", "js/home.js", "js/study.js", "js/progress.js", "js/compare.js",
  "js/quiz.js", "js/assistant.js", "js/ar-components.js", "js/markers.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
  "models/heart.glb", "models/brain.glb", "models/lungs.glb",
  "models/kidney.glb", "models/pelvis.glb", "models/liver.glb",
  "markers/0.png", "markers/1.png", "markers/2.png", "markers/3.png", "markers/4.png", "markers/5.png"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // add individually so one failure doesn't abort the whole install
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  // Navigations: network-first, fall back to the cached page (offline support).
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match("index.html"); });
      })
    );
    return;
  }

  // Assets (js/css/glb/png/CDN): cache-first, then network. NEVER substitute HTML on failure.
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        var url = new URL(req.url);
        var cacheable = (url.origin === location.origin ||
          /jsdelivr\.net|gstatic\.com|modelviewer\.dev/.test(url.host)) &&
          res && res.status === 200 && res.type !== "opaque";
        if (cacheable) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
