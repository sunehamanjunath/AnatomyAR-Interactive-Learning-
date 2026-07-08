/* ============================================================
   AI Anatomy Assistant
   - If a Claude API key is saved (localStorage 'anatomy_ai_key'), it answers
     with the real Claude API directly from the browser.
   - Otherwise it falls back to a built-in knowledge base so it ALWAYS responds,
     even fully offline. Great for a live demo with no internet.
   ============================================================ */
(function () {
  var KEY_LS = "anatomy_ai_key";
  var MODEL = "claude-haiku-4-5-20251001";

  // ---------- build & inject UI ----------
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  var fab = el('<button id="assistant-fab" title="Ask the Anatomy Assistant">💬</button>');
  var chat = el(
    '<div class="chat" id="chat">' +
    '  <div class="chat-head">' +
    '    <div class="avatar">🧠</div>' +
    '    <div><div class="t">Anatomy Assistant</div><div class="s" id="chat-status">Ask me about any organ</div></div>' +
    '    <button class="x" id="chat-close">×</button>' +
    '  </div>' +
    '  <div class="chat-body" id="chat-body"></div>' +
    '  <div class="chips" id="chat-chips"></div>' +
    '  <div class="settings-row"><a id="chat-key">🔑 Connect Claude API for smarter answers</a></div>' +
    '  <div class="chat-input">' +
    '    <input id="chat-text" placeholder="e.g. What does the liver do?" autocomplete="off" />' +
    '    <button id="chat-send">➤</button>' +
    '  </div>' +
    '</div>'
  );
  document.body.appendChild(fab);
  document.body.appendChild(chat);

  var body = chat.querySelector("#chat-body");
  var input = chat.querySelector("#chat-text");
  var status = chat.querySelector("#chat-status");
  var chips = chat.querySelector("#chat-chips");
  var history = [];

  function addMsg(text, who) {
    var m = el('<div class="msg ' + who + '"></div>');
    m.innerHTML = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }
  function typing() {
    var m = el('<div class="msg bot typing"><span></span><span></span><span></span></div>');
    body.appendChild(m); body.scrollTop = body.scrollHeight; return m;
  }

  var SUGGESTIONS = [
    "What does the heart do?",
    "Explain how we breathe",
    "Parts of the brain",
    "What is a nephron?"
  ];
  function renderChips() {
    chips.innerHTML = "";
    SUGGESTIONS.forEach(function (s) {
      var c = el('<button class="chip"></button>'); c.textContent = s;
      c.onclick = function () { input.value = s; send(); };
      chips.appendChild(c);
    });
  }

  // ---------- offline knowledge base ----------
  function kbAnswer(q) {
    var t = q.toLowerCase();
    var organs = window.ORGANS || [];

    // direct organ match
    var hit = null;
    organs.forEach(function (o) {
      if (t.indexOf(o.id) > -1 || t.indexOf(o.name.toLowerCase()) > -1) hit = o;
    });

    // topical keywords -> organ
    var map = [
      ["breath", "lungs"], ["respir", "lungs"], ["oxygen", "lungs"], ["alveoli", "lungs"],
      ["circulat", "heart"], ["blood", "heart"], ["pump", "heart"], ["pulse", "heart"], ["beat", "heart"],
      ["think", "brain"], ["nerv", "brain"], ["neuron", "brain"], ["memory", "brain"],
      ["filter", "kidney"], ["urine", "kidney"], ["nephron", "kidney"], ["waste", "kidney"],
      ["bile", "liver"], ["toxin", "liver"], ["digest", "liver"],
      ["bone", "pelvis"], ["skelet", "pelvis"], ["hip", "pelvis"]
    ];
    if (!hit) {
      for (var i = 0; i < map.length; i++) {
        if (t.indexOf(map[i][0]) > -1) { hit = window.getOrgan(map[i][1]); break; }
      }
    }

    if (hit) {
      var ans = "<b>" + hit.name + "</b> - " + hit.overview;
      // part-specific?
      var partHit = (hit.parts || []).filter(function (p) { return t.indexOf(p.name.toLowerCase().split(" ")[0]) > -1; })[0];
      if (partHit) ans = "<b>" + partHit.name + "</b> (" + hit.name + "): " + partHit.text;
      else if (t.indexOf("part") > -1 || t.indexOf("structure") > -1) {
        ans += "<br><br><b>Main parts:</b> " + hit.parts.map(function (p) { return p.name; }).join(", ") + ".";
      } else if (t.indexOf("function") > -1 || t.indexOf("do") > -1 || t.indexOf("job") > -1) {
        ans = "<b>" + hit.name + "</b>: " + hit.facts.map(function (f) { return f.text; }).slice(0, 2).join(" ");
      }
      return ans + '<br><br><a href="organ.html?id=' + hit.id + '">Open the 3D ' + hit.name + " →</a>";
    }

    // general topics
    if (/(hello|hi|hey)\b/.test(t)) return "Hi! I'm your anatomy assistant. Ask me about the heart, brain, lungs, kidney, liver or pelvis - or how a body system works.";
    if (t.indexOf("system") > -1) {
      return "This app covers six body systems: <b>Circulatory</b> (heart), <b>Nervous</b> (brain), <b>Respiratory</b> (lungs), <b>Urinary</b> (kidney), <b>Skeletal</b> (pelvis) and <b>Digestive</b> (liver). Ask about any one!";
    }
    if (t.indexOf("quiz") > -1 || t.indexOf("test") > -1) return 'Try the <a href="quiz.html">Quiz</a> - pick an organ and test yourself!';

    return "I can explain the <b>heart, brain, lungs, kidney, liver</b> and <b>pelvis</b> - their parts and what they do. Try asking \"what does the kidney do?\" or \"parts of the lungs\". " +
      "For open-ended questions, connect a Claude API key with the 🔑 link below for full AI answers.";
  }

  // ---------- real Claude API ----------
  function claudeAnswer(q, cb) {
    var key = localStorage.getItem(KEY_LS);
    var sys = "You are a friendly anatomy tutor inside an AR learning app for medical, nursing and biology students. " +
      "Answer clearly and concisely (2-5 sentences) in simple language. Focus on the heart, brain, lungs, kidney, liver, pelvis and human body systems. " +
      "Use plain text, no markdown headers.";
    history.push({ role: "user", content: q });
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: MODEL, max_tokens: 400, system: sys,
        messages: history.slice(-8)
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.content && data.content[0] && data.content[0].text) {
          var txt = data.content[0].text;
          history.push({ role: "assistant", content: txt });
          cb(txt.replace(/\n/g, "<br>"));
        } else {
          cb(null, (data && data.error && data.error.message) || "API error");
        }
      })
      .catch(function (e) { cb(null, e.message); });
  }

  // ---------- send ----------
  function send() {
    var q = input.value.trim();
    if (!q) return;
    addMsg(q, "me");
    input.value = "";
    chips.style.display = "none";
    var t = typing();
    var hasKey = !!localStorage.getItem(KEY_LS);
    status.textContent = hasKey ? "Claude is thinking…" : "Thinking…";

    function finish(html) { t.remove(); addMsg(html, "bot"); status.textContent = hasKey ? "Powered by Claude" : "Ask me about any organ"; }

    if (hasKey) {
      claudeAnswer(q, function (txt, err) {
        if (txt) finish(txt);
        else finish("(Claude API: " + (err || "failed") + ")<br><br>" + kbAnswer(q));
      });
    } else {
      // small delay so the typing indicator reads naturally
      setTimeout(function () { finish(kbAnswer(q)); }, 380);
    }
  }

  // ---------- key management ----------
  chat.querySelector("#chat-key").onclick = function () {
    var existing = localStorage.getItem(KEY_LS);
    var v = prompt(
      "Paste a Claude API key to enable full AI answers (stored only in this browser).\n" +
      "Leave blank and press OK to remove it and use the offline assistant.",
      existing || ""
    );
    if (v === null) return;
    v = v.trim();
    if (v) { localStorage.setItem(KEY_LS, v); status.textContent = "Powered by Claude"; addMsg("✅ Connected to Claude. Ask me anything about anatomy!", "bot"); }
    else { localStorage.removeItem(KEY_LS); status.textContent = "Offline assistant"; addMsg("Switched to the built-in offline assistant.", "bot"); }
  };

  // ---------- wire up ----------
  function open() {
    chat.classList.add("open");
    if (!body.children.length) {
      addMsg("👋 Hi! I'm your <b>Anatomy Assistant</b>. Ask me what an organ does, its parts, or how a body system works.", "bot");
      renderChips();
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { chat.classList.remove("open"); }
  fab.onclick = function () { chat.classList.contains("open") ? close() : open(); };
  chat.querySelector("#chat-close").onclick = close;
  chat.querySelector("#chat-send").onclick = send;
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
})();
