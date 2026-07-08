/* Compare page: pick two organs, render their facts/parts/fun-fact side by side. */
(function () {
  if (!window.ORGANS) return;
  var params = new URLSearchParams(location.search);
  var selA = document.getElementById("pick-a");
  var selB = document.getElementById("pick-b");
  var grid = document.getElementById("compare-grid");

  function fillSelect(sel, defaultId) {
    window.ORGANS.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = o.emoji + " " + o.name;
      if (o.id === defaultId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  var idA = params.get("a") || window.ORGANS[0].id;
  var idB = params.get("b") || (window.ORGANS[1] ? window.ORGANS[1].id : window.ORGANS[0].id);
  fillSelect(selA, idA);
  fillSelect(selB, idB);

  function column(o) {
    var factsHTML = o.facts.map(function (f) {
      return '<div class="fact"><div class="k">' + f.label + '</div><div class="v">' + f.text + '</div></div>';
    }).join("");
    var partsHTML = o.parts.map(function (p) {
      return '<li><b>' + p.name + '</b> - ' + p.text + '</li>';
    }).join("");
    return (
      '<div class="compare-col" style="--card-color:' + o.color + '">' +
      '  <div class="compare-viz"><model-viewer src="' + o.model + '" camera-controls auto-rotate ' +
      '     rotation-per-second="24deg" shadow-intensity="0.9" exposure="1.05" loading="lazy"></model-viewer></div>' +
      '  <h3>' + o.emoji + ' ' + o.name + '</h3>' +
      '  <span class="sys" style="color:' + o.color + ';border-color:' + o.color + '">' + o.system + '</span>' +
      '  <p class="overview" style="font-size:.9rem">' + o.overview + '</p>' +
      '  <div class="fact-grid" style="grid-template-columns:1fr">' + factsHTML + '</div>' +
      '  <h4 style="margin:14px 0 6px">Parts</h4>' +
      '  <ul class="compare-parts">' + partsHTML + '</ul>' +
      '  <div class="funfact" style="margin-top:14px"><b>Did you know?</b> ' + o.funFact + '</div>' +
      '  <a class="btn ghost small" style="margin-top:14px" href="organ.html?id=' + o.id + '">Open full study page →</a>' +
      '</div>'
    );
  }

  function render() {
    var a = window.getOrgan(selA.value);
    var b = window.getOrgan(selB.value);
    grid.innerHTML = column(a) + column(b);
    var url = new URL(location.href);
    url.searchParams.set("a", a.id);
    url.searchParams.set("b", b.id);
    history.replaceState(null, "", url);
  }

  selA.addEventListener("change", render);
  selB.addEventListener("change", render);
  render();
})();
