// Builds printable scan cards: each shows the barcode marker + organ name.
(function () {
  var wrap = document.getElementById("cards");
  if (!wrap || !window.ORGANS) return;

  window.ORGANS.forEach(function (organ) {
    var card = document.createElement("div");
    card.className = "scan-card";
    card.innerHTML =
      '<img src="markers/' + organ.marker + '.png" alt="Marker ' + organ.marker + '" />' +
      '<div class="scan-name">' + organ.emoji + ' ' + organ.name + '</div>' +
      '<div class="scan-sys">' + organ.system + ' · Card #' + organ.marker + '</div>';
    wrap.appendChild(card);
  });
})();
