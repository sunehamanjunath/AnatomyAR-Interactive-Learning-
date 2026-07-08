# AnatomyAR - Learn anatomy in Augmented Reality

A mobile-friendly web app built from the *AR Anatomy Learning Platform* brief. The core request
was simple:

> **Scan an image → show the basic 3D model of that organ.**

That works - and the app goes well beyond it, into something genuinely demo-worthy.

No app store, no Unity, no Android Studio. It runs in the phone's web browser.

---

## Features

- **AR scanner** - point the camera at a card and the matching 3D organ appears, anchored on it.
  Pinch to zoom, drag to rotate, and tap **📸** to capture an AR photo. A live info card shows
  the organ's name, system and a key fact.
- **Immersive 3D study pages** - each organ opens in a full viewer with numbered **tap-to-learn
  hotspots** (parts + what they do), key-fact cards and a fun fact.
- **Voice explanations** - a narrator reads any organ or part aloud, plus a hands-free **guided
  tour** that rotates the model while explaining each part.
- **AI Anatomy Assistant** - a chat that answers questions about organs and body systems. Works
  **offline** out of the box; optionally connect a Claude API key (🔑 in the chat) for full AI answers.
- **Quiz mode** - per-organ or mixed multiple-choice quizzes with scoring and feedback.
- **Progress dashboard** - the home page tracks which organs you've studied and your best quiz score,
  saved locally on your device (`js/progress.js`).
- **Quiz score history** - every quiz result is saved, with a "recent scores" list and a
  new-best-score callout on the results screen.
- **Compare mode** - pick any two organs on the new **Compare** page and see their facts, parts and
  fun facts side by side.
- **Organ search** - filter the home page gallery live by organ name or body system.
- **Installable app (PWA)** - "Add to Home screen" and it works offline after the first visit.
- **Fast** - models are Draco-compressed (~7× smaller) so they load in a second or two.

## Organs & scan-card mapping

| Card | Organ | System |
|------|-------|--------|
| 0 | Heart | Circulatory |
| 1 | Brain | Nervous |
| 2 | Lungs | Respiratory |
| 3 | Kidney | Urinary |
| 4 | Pelvis | Skeletal |
| 5 | Liver | Digestive |

---

## Run it

The camera **only works over HTTPS or `localhost`** (a browser rule).

### On your phone (recommended for the demo)
- **Netlify Drop** - go to https://app.netlify.com/drop and drag the whole `IDT` folder in.
  You instantly get an HTTPS link. Open it on the phone.
- **GitHub Pages** - push the folder to a repo → Settings → Pages → deploy from `main`.

Then: open the link → **AR Scanner** → allow the camera → point at a printed scan card
(print `Scan_Cards.pdf` or open `markers.html` on another screen).

### Quick local check (gallery + study pages; camera needs the phone)
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

> Dev note: this is a PWA with a cache-first service worker. While editing, append `?nosw=1`
> to the URL (or clear site data) so you always get fresh files. The `sw.js` cache version
> (`anatomyar-vN`) is bumped to push updates to returning users.

---

## Project structure

```
index.html        Home + 3D gallery + progress dashboard + search
organ.html        Immersive study page (?id=heart …)
scan.html         AR scanner
quiz.html         Quizzes + score history
markers.html      On-screen scan cards
compare.html      Side-by-side organ comparison
css/style.css     Design system
js/
  organs.js       All organ content (facts, parts, quizzes) - edit here
  home.js study.js quiz.js compare.js   Page logic
  progress.js     Studied-organs + quiz-history tracking (localStorage)
  assistant.js    AI assistant (offline KB + optional Claude API)
  ar-components.js  AR.js components (auto-fit, gestures, info card)
  ui.js markers.js
models/           Draco-compressed .glb organ models
markers/          Barcode marker images
manifest.webmanifest, sw.js, icons/   PWA
Scan_Cards.pdf    Printable cards
Project_Guide.pdf What it is + how to deploy & present
make_pdfs.py      Regenerates the two PDFs
```

## Add or change an organ
1. Drop a `.glb` in `models/`.
2. Add an entry in `js/organs.js` (copy an existing one; fill in facts, parts, quiz; use the next free `marker` number).
3. Copy an `<a-marker>` block in `scan.html`, set its `value` and model `src`.
4. Re-run `python make_pdfs.py` to refresh the scan cards.

## Credits / licensing
- 3D models: **HuBMAP Consortium - CCF 3D Reference Object Library**, **CC BY 4.0**.
  https://hubmapconsortium.github.io/ccf/pages/ccf-3d-reference-library.html
- AR: **AR.js** + **A-Frame**. 3D viewer: **Google `<model-viewer>`**. Voice: **Web Speech API**.

Keep the CC BY 4.0 attribution (it's in the app footer and the guide) if you publish or submit this.
