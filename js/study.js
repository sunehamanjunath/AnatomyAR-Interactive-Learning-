/* Immersive organ study page: model + hotspots + facts + narration + guided tour. */
(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get("id") || "heart";
  var organ = window.getOrgan(id) || window.ORGANS[0];
  var idx = window.ORGANS.indexOf(organ);
  document.title = "AnatomyAR - " + organ.name;
  if (window.Progress) window.Progress.markStudied(organ.id);

  var mv = document.getElementById("mv");
  mv.setAttribute("src", organ.model);

  // ----- header / text -----
  document.getElementById("o-title").innerHTML = organ.emoji + " " + organ.name;
  var sys = document.getElementById("o-sys");
  sys.textContent = organ.system;
  sys.style.background = "rgba(255,255,255,.06)";
  sys.style.color = organ.color;
  sys.style.border = "1px solid " + organ.color;
  document.getElementById("o-overview").textContent = organ.overview;
  document.documentElement.style.setProperty("--accent", organ.color);

  // facts
  var fg = document.getElementById("o-facts");
  organ.facts.forEach(function (f) {
    var d = document.createElement("div");
    d.className = "fact";
    d.innerHTML = '<div class="k">' + f.label + '</div><div class="v">' + f.text + "</div>";
    fg.appendChild(d);
  });

  // parts list
  var pl = document.getElementById("o-parts");
  organ.parts.forEach(function (p, i) {
    var row = document.createElement("div");
    row.className = "part";
    row.innerHTML =
      '<div class="num">' + (i + 1) + "</div>" +
      '<div class="ptxt"><div class="pt">' + p.name + '</div><div class="pd">' + p.text + "</div></div>" +
      '<div class="spk">🔊</div>';
    row.onclick = function () {
      highlight(i);
      setSpin(false);
      focusPart(i);
      window.Speech.speak(p.name + ". " + p.text);
    };
    pl.appendChild(row);
  });

  document.getElementById("o-fun").innerHTML = "<b>Did you know?</b> " + organ.funFact;

  // nav
  var prev = window.ORGANS[(idx - 1 + window.ORGANS.length) % window.ORGANS.length];
  var next = window.ORGANS[(idx + 1) % window.ORGANS.length];
  document.getElementById("o-prev").href = "organ.html?id=" + prev.id;
  document.getElementById("o-prev").innerHTML = "← " + prev.name;
  document.getElementById("o-next").href = "organ.html?id=" + next.id;
  document.getElementById("o-next").innerHTML = next.name + " →";

  // ----- hotspots (numbered pins distributed around the model) -----
  var DIRS = [
    [0, 1, 0.25], [0.95, 0.25, 0.3], [-0.95, 0.2, 0.35],
    [0.45, -0.8, 0.5], [-0.45, -0.35, 0.95], [0.35, 0.65, -0.85],
    [-0.6, 0.7, -0.4], [0.7, -0.4, -0.6]
  ];
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0]/l, v[1]/l, v[2]/l]; }

  // Rotate the camera so the chosen part's pin faces the viewer.
  function focusPart(i) {
    var d = norm(DIRS[i % DIRS.length]);
    var clampY = Math.max(-1, Math.min(1, d[1]));
    var phi = Math.acos(clampY) * 180 / Math.PI;          // polar angle from +Y
    var theta = Math.atan2(d[0], d[2]) * 180 / Math.PI;   // azimuth around Y
    // keep a slight downward tilt so it never looks straight up/down
    phi = Math.max(25, Math.min(120, phi));
    mv.cameraOrbit = theta.toFixed(1) + "deg " + phi.toFixed(1) + "deg auto";
  }

  var hotspotsDone = false;
  function addHotspots() {
    if (!mv.loaded || hotspotsDone) return;
    hotspotsDone = true;
    // clear old
    mv.querySelectorAll(".hs").forEach(function (n) { n.remove(); });
    var dim = mv.getDimensions();           // {x,y,z}
    var c = mv.getCameraTarget();           // bbox centre
    var cx = c.x, cy = c.y, cz = c.z;
    var rx = dim.x / 2, ry = dim.y / 2, rz = dim.z / 2;

    organ.parts.forEach(function (p, i) {
      var d = norm(DIRS[i % DIRS.length]);
      var px = cx + d[0] * rx * 1.05;
      var py = cy + d[1] * ry * 1.05;
      var pz = cz + d[2] * rz * 1.05;
      var btn = document.createElement("button");
      btn.className = "hs";
      btn.setAttribute("slot", "hotspot-" + i);
      btn.setAttribute("data-position", px + "m " + py + "m " + pz + "m");
      btn.setAttribute("data-normal", d[0] + " " + d[1] + " " + d[2]);
      btn.setAttribute("data-visibility-attribute", "visible");
      btn.style.setProperty("--pin", organ.color);
      btn.title = p.name;
      btn.innerHTML =
        '<span class="hs-dot">' + (i + 1) + "</span>" +
        '<span class="hs-label"><b>' + (i + 1) + ". " + p.name + "</b>" + p.text + "</span>";
      (function (idx, part) {
        btn.onclick = function () { highlight(idx); setSpin(false); focusPart(idx); window.Speech.speak(part.name + ". " + part.text); };
      })(i, p);
      mv.appendChild(btn);
    });
  }
  mv.addEventListener("load", addHotspots);
  // Bulletproof against event-timing races: poll until the model reports loaded.
  var _t = 0;
  var _poll = setInterval(function () {
    if (mv.loaded) { clearInterval(_poll); addHotspots(); }
    else if (++_t > 100) { clearInterval(_poll); }
  }, 150);

  function highlight(i) {
    mv.querySelectorAll(".hs").forEach(function (pin, k) { pin.classList.toggle("on", k === i); });
    pl.querySelectorAll(".part").forEach(function (r, k) { r.classList.toggle("on", k === i); });
  }

  // ----- tools -----
  var spinning = true;
  var tRotate = document.getElementById("t-rotate");
  function setSpin(on) {
    spinning = on;
    if (on) { mv.setAttribute("auto-rotate", ""); tRotate.textContent = "⏸ Spin"; tRotate.classList.add("active"); }
    else { mv.removeAttribute("auto-rotate"); tRotate.textContent = "▶ Spin"; tRotate.classList.remove("active"); }
  }
  tRotate.onclick = function () { setSpin(!spinning); };

  var tListen = document.getElementById("t-listen");
  tListen.onclick = function () {
    if (tListen.classList.contains("active")) { window.Speech.stop(); tListen.classList.remove("active"); tListen.textContent = "🔊 Listen"; return; }
    tListen.classList.add("active"); tListen.textContent = "⏹ Stop";
    window.Speech.speak(
      organ.name + ", part of the " + organ.system + ". " + organ.overview + " " + organ.funFact,
      function () { tListen.classList.remove("active"); tListen.textContent = "🔊 Listen"; }
    );
  };

  var tTour = document.getElementById("t-tour");
  var touring = false;
  tTour.onclick = function () {
    if (touring) { stopTour(); return; }
    touring = true; tTour.classList.add("active"); tTour.textContent = "⏹ Stop tour";
    setSpin(false);
    var i = 0;
    function step() {
      if (!touring || i >= organ.parts.length) { stopTour(); return; }
      highlight(i);
      focusPart(i);   // orbit so the highlighted pin faces the viewer
      window.Speech.speak(organ.parts[i].name + ". " + organ.parts[i].text, function () {
        i++; if (touring) setTimeout(step, 350);
      });
    }
    step();
  };
  function stopTour() {
    touring = false; tTour.classList.remove("active"); tTour.textContent = "✨ Guided tour";
    window.Speech.stop();
    highlight(-1);
  }

  document.getElementById("t-reset").onclick = function () {
    mv.cameraOrbit = "0deg 75deg auto";
    mv.resetTurntableRotation && mv.resetTurntableRotation();
    highlight(-1);
    if (!spinning) tRotate.onclick();
  };
})();
