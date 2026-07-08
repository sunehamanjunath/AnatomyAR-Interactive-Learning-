# Generates two PDFs in this folder:
#   1. Scan_Cards.pdf   - printable AR markers (one card per organ)
#   2. Project_Guide.pdf - what the project is, what was built, how to deploy & present
#
# Run:  python make_pdfs.py
import os
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image as RLImage, PageBreak, ListFlowable, ListItem, HRFlowable
)

HERE = os.path.dirname(os.path.abspath(__file__))

ORGANS = [
    ("Heart",  "Circulatory System", 0),
    ("Brain",  "Nervous System",     1),
    ("Lungs",  "Respiratory System", 2),
    ("Kidney", "Urinary System",     3),
    ("Pelvis", "Skeletal System",    4),
    ("Liver",  "Digestive System",   5),
]

ACCENT = colors.HexColor("#c1121f")
DARK   = colors.HexColor("#1b1f27")
MUTED  = colors.HexColor("#5b6270")

# ---------- shared: crisp upscaled markers ----------
TMP = os.path.join(HERE, "_tmp_markers")
os.makedirs(TMP, exist_ok=True)
def crisp_marker(n):
    src = os.path.join(HERE, "markers", f"{n}.png")
    out = os.path.join(TMP, f"{n}_big.png")
    img = Image.open(src).convert("RGB").resize((600, 600), Image.NEAREST)
    img.save(out)
    return out

# =========================================================
# 1) SCAN CARDS PDF
# =========================================================
def build_scan_cards():
    path = os.path.join(HERE, "Scan_Cards.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=14*mm, bottomMargin=14*mm,
                            leftMargin=14*mm, rightMargin=14*mm)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("t", parent=styles["Title"], fontSize=20, textColor=DARK)
    sub   = ParagraphStyle("s", parent=styles["Normal"], fontSize=10,
                           textColor=MUTED, alignment=TA_CENTER, spaceAfter=8)
    name  = ParagraphStyle("n", parent=styles["Normal"], fontSize=15,
                           alignment=TA_CENTER, textColor=DARK, spaceBefore=6, leading=18)
    sys   = ParagraphStyle("y", parent=styles["Normal"], fontSize=9.5,
                           alignment=TA_CENTER, textColor=ACCENT)
    cardn = ParagraphStyle("c", parent=styles["Normal"], fontSize=8.5,
                           alignment=TA_CENTER, textColor=MUTED, spaceBefore=2)

    story = [Paragraph("AnatomyAR - Scan Cards", title),
             Paragraph("Print this sheet. Open the AR Scanner on your phone and point the "
                       "camera at any card to see its 3D organ. Keep the whole black square "
                       "visible. Works best on white paper, ~6-8 cm wide.", sub),
             Spacer(1, 6)]

    cell_w = 82*mm
    img_sz = 58*mm
    def make_cell(organ):
        nm, sysname, n = organ
        inner = [
            RLImage(crisp_marker(n), width=img_sz, height=img_sz),
            Paragraph(nm, name),
            Paragraph(sysname, sys),
            Paragraph(f"Card #{n}", cardn),
        ]
        t = Table([[i] for i in inner], colWidths=[cell_w])
        t.setStyle(TableStyle([
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("TOPPADDING", (0,0), (-1,-1), 2),
            ("BOTTOMPADDING", (0,0), (-1,-1), 2),
            ("BOX", (0,0), (-1,-1), 0.8, colors.HexColor("#cccccc")),
            ("LEFTPADDING", (0,0), (-1,-1), 8),
            ("RIGHTPADDING", (0,0), (-1,-1), 8),
            ("TOPPADDING", (0,0), (0,0), 10),
            ("BOTTOMPADDING", (-1,-1), (-1,-1), 10),
        ]))
        return t

    rows = []
    for i in range(0, len(ORGANS), 2):
        pair = ORGANS[i:i+2]
        cells = [make_cell(o) for o in pair]
        if len(cells) == 1:
            cells.append("")
        rows.append(cells)
    grid = Table(rows, colWidths=[cell_w+6*mm, cell_w+6*mm], hAlign="CENTER")
    grid.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(grid)
    doc.build(story)
    print("wrote", path)

# =========================================================
# 2) PROJECT GUIDE PDF
# =========================================================
def build_guide():
    path = os.path.join(HERE, "Project_Guide.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=18*mm, bottomMargin=16*mm,
                            leftMargin=18*mm, rightMargin=18*mm,
                            title="AnatomyAR - Project Guide")
    styles = getSampleStyleSheet()
    H1 = ParagraphStyle("H1", parent=styles["Heading1"], textColor=ACCENT, fontSize=15, spaceBefore=14, spaceAfter=6)
    H0 = ParagraphStyle("H0", parent=styles["Title"], textColor=DARK, fontSize=24, spaceAfter=2)
    SUBT = ParagraphStyle("SUBT", parent=styles["Normal"], textColor=MUTED, fontSize=11, spaceAfter=4)
    BODY = ParagraphStyle("BODY", parent=styles["Normal"], fontSize=10.5, leading=15, spaceAfter=6)
    SMALL = ParagraphStyle("SMALL", parent=styles["Normal"], fontSize=8.5, textColor=MUTED, leading=12)
    STEP = ParagraphStyle("STEP", parent=styles["Normal"], fontSize=10.5, leading=15)
    CODE = ParagraphStyle("CODE", parent=styles["Code"], fontSize=9.5, textColor=DARK,
                          backColor=colors.HexColor("#f2f3f5"), borderPadding=6, leading=13, spaceAfter=6)

    def bullets(items, style=BODY):
        return ListFlowable(
            [ListItem(Paragraph(t, style), leftIndent=6) for t in items],
            bulletType="bullet", bulletColor=ACCENT, leftIndent=14, bulletFontSize=7)

    def numbered(items, style=STEP):
        return ListFlowable(
            [ListItem(Paragraph(t, style)) for t in items],
            bulletType="1", leftIndent=16, bulletColor=ACCENT)

    def simple_table(data, head=True, col_widths=None):
        t = Table(data, colWidths=col_widths, hAlign="LEFT")
        ts = [
            ("FONTSIZE", (0,0), (-1,-1), 9.5),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("TOPPADDING", (0,0), (-1,-1), 5),
            ("BOTTOMPADDING", (0,0), (-1,-1), 5),
            ("LEFTPADDING", (0,0), (-1,-1), 8),
            ("RIGHTPADDING", (0,0), (-1,-1), 8),
            ("LINEBELOW", (0,0), (-1,-1), 0.4, colors.HexColor("#dddddd")),
            ("GRID", (0,0), (-1,-1), 0.3, colors.HexColor("#e6e6e6")),
        ]
        if head:
            ts += [("BACKGROUND", (0,0), (-1,0), DARK),
                   ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                   ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold")]
        t.setStyle(TableStyle(ts))
        return t

    s = []
    # ---- Header ----
    s.append(Paragraph("AnatomyAR", H0))
    s.append(Paragraph("An Augmented Reality anatomy viewer - scan an image, see the 3D organ.", SUBT))
    s.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=6))

    # ---- 1. What this project is ----
    s.append(Paragraph("1. What this project is", H1))
    s.append(Paragraph(
        "AnatomyAR is a mobile-friendly web application that helps students learn human "
        "anatomy using Augmented Reality (AR). Instead of looking at flat textbook pictures, "
        "the student points their phone camera at a printed card and a real 3D model of that "
        "organ appears on the screen, floating over the card. The model can be rotated, "
        "zoomed and moved to study it from any angle.", BODY))
    s.append(Paragraph(
        "It is built from the original project brief, <i>“AR-Based Interactive Anatomy "
        "Learning Platform”</i>, focused on the single most important feature: "
        "<b>scan an image &rarr; show the basic 3D model of that organ.</b>", BODY))

    # ---- 2. Scope ----
    s.append(Paragraph("2. What was built", H1))
    s.append(Paragraph("The core request - <i>scan an image and see its 3D model</i> - is fully working, "
                       "and the app was then taken well beyond it:", BODY))
    s.append(bullets([
        "<b>AR Anatomy Viewer</b> - scan a card with the phone camera and the matching 3D organ appears, anchored on the card. Pinch to zoom, drag to rotate. A live info card shows its name, system and a key fact, and you can snap an <b>AR photo</b>.",
        "<b>Immersive 3D study pages</b> - every organ opens in a full interactive viewer with numbered <b>tap-to-learn hotspots</b> (parts and what they do), key-fact cards and a fun fact.",
        "<b>Voice explanations</b> - a built-in narrator reads any organ or part aloud, plus a hands-free <b>guided tour</b> that rotates the model while explaining each part.",
        "<b>AI Anatomy Assistant</b> - a chat that answers questions about organs and body systems. Works offline out of the box; optionally connect a Claude API key for full AI answers.",
        "<b>Quiz mode</b> - instant multiple-choice quizzes per organ or a mixed quiz, with scoring and feedback.",
        "<b>Six real organs:</b> Heart, Brain, Lungs, Kidney, Pelvis (skeletal) and Liver.",
        "<b>Installable app (PWA)</b> - can be added to the phone's home screen and keeps working offline after the first visit.",
        "<b>Fast loading</b> - the 3D models are compressed (about 7× smaller) so they appear in a second or two.",
        "<b>Printable scan cards</b> - one marker per organ (see Scan_Cards.pdf).",
    ]))
    s.append(Paragraph("Deliberately kept out (from the original brief) to stay focused:", BODY))
    s.append(bullets([
        "Layered body-system switching (peeling between skeletal / muscular / nervous, etc.).",
        "User accounts, login and long-term progress tracking / streaks.",
        "Saved notes, bookmarks and an admin upload panel.",
    ]))
    s.append(Paragraph("The structure leaves room for these later, but they aren't needed for a strong demo.", SMALL))

    # ---- 3. Files ----
    s.append(Paragraph("3. What is in the project folder", H1))
    s.append(simple_table([
        ["File / folder", "What it does"],
        ["index.html", "Home page + 3D gallery of every organ."],
        ["organ.html", "Immersive 3D study page (hotspots, facts, voice, guided tour)."],
        ["scan.html", "The AR scanner - the camera detects a card and shows the 3D organ."],
        ["quiz.html", "Multiple-choice quizzes with scoring."],
        ["markers.html", "On-screen version of the printable scan cards."],
        ["models/", "The six 3D organ models (compressed .glb files)."],
        ["markers/", "The barcode marker images used on the cards (0.png-5.png)."],
        ["css/ , js/", "Styling and the app code (data, pages, AI assistant, AR)."],
        ["manifest.webmanifest, sw.js, icons/", "Make it an installable, offline-capable app (PWA)."],
        ["Scan_Cards.pdf", "Printable cards - print this and scan the cards."],
        ["Project_Guide.pdf", "This document."],
        ["README.md", "The same information in plain text, for developers."],
    ], col_widths=[52*mm, 106*mm]))

    s.append(Paragraph("Organ &harr; card mapping", H1))
    s.append(simple_table(
        [["Card #", "Organ", "Body system"]] + [[str(n), nm, sysn] for (nm, sysn, n) in ORGANS],
        col_widths=[22*mm, 55*mm, 70*mm]))

    s.append(PageBreak())

    # ---- 4. Deploy ----
    s.append(Paragraph("4. How to put it online (needed for the phone)", H1))
    s.append(Paragraph(
        "<b>Important:</b> a phone camera only works on a web page served over <b>HTTPS</b> "
        "(a browser security rule). Opening the HTML files directly from the folder will "
        "<i>not</i> let the scanner use the camera. So the folder must be uploaded to a free "
        "host that provides an HTTPS link. The easiest option is Netlify Drop - no account "
        "or coding needed.", BODY))

    s.append(Paragraph("Option A - Netlify Drop (easiest, ~2 minutes)", ParagraphStyle(
        "h2a", parent=styles["Heading2"], fontSize=12, textColor=DARK, spaceBefore=8, spaceAfter=4)))
    s.append(numbered([
        "On a laptop, open <b>https://app.netlify.com/drop</b> in any browser.",
        "Drag the whole <b>IDT</b> project folder onto the page where it says ‘Drag and drop’.",
        "Wait a few seconds. Netlify gives you a link like "
        "<font face='Courier'>https://random-name-123.netlify.app</font>.",
        "Open that link on your phone (type it in, or send it to yourself / show a QR code).",
        "Tap <b>Open AR Scanner</b>, allow the camera, and point it at a printed card.",
    ]))
    s.append(Paragraph("To update it later, just drag the folder onto Netlify Drop again - you "
                       "get a fresh link each time, which is fine for a demo.", SMALL))

    s.append(Paragraph("Option B - GitHub Pages (free permanent link)", ParagraphStyle(
        "h2b", parent=styles["Heading2"], fontSize=12, textColor=DARK, spaceBefore=10, spaceAfter=4)))
    s.append(numbered([
        "Create a free GitHub account and a new public repository.",
        "Upload all the files from the IDT folder into the repository.",
        "In the repository: <b>Settings &rarr; Pages &rarr; Build from branch &rarr; main &rarr; Save</b>.",
        "After a minute GitHub gives a permanent <font face='Courier'>https://&lt;username&gt;.github.io/&lt;repo&gt;/</font> link.",
        "Open that link on the phone and use it exactly like Option A.",
    ]))

    s.append(Paragraph("Option C - Quick laptop preview only (no camera)", ParagraphStyle(
        "h2c", parent=styles["Heading2"], fontSize=12, textColor=DARK, spaceBefore=10, spaceAfter=4)))
    s.append(Paragraph("To check the gallery and 3D models on the laptop (not the camera "
                       "scanner), open a terminal inside the IDT folder and run:", BODY))
    s.append(Paragraph("python -m http.server 8000", CODE))
    s.append(Paragraph("Then open <font face='Courier'>http://localhost:8000</font> in the browser.", BODY))

    # ---- 5. Present ----
    s.append(Paragraph("5. How to present / demo it", H1))
    s.append(Paragraph("Before the presentation:", BODY))
    s.append(bullets([
        "Deploy it (Option A or B above) and confirm the link opens on your phone.",
        "Print <b>Scan_Cards.pdf</b>, or keep it open on a second screen/laptop to scan from.",
        "Test each card once so you know the models appear. Good, even lighting helps a lot.",
        "Charge the phone and connect to reliable Wi-Fi (the models download the first time).",
    ]))
    s.append(Paragraph("Suggested 3-minute demo flow:", BODY))
    s.append(numbered([
        "Explain the problem: anatomy is hard to understand from flat 2D textbook images.",
        "Open the deployed link on the phone and show the home gallery - tap the <b>Heart</b> to open its 3D study page.",
        "Tap a numbered <b>hotspot</b> on the heart to reveal a part and what it does, then press <b>🔊 Listen</b> or <b>✨ Guided tour</b> to let it explain itself out loud.",
        "Open the <b>AR Scanner</b>, point it at the Heart card - the 3D heart appears anchored on the card. Pinch to zoom, drag to rotate, and tap <b>📸</b> to capture an AR photo.",
        "Open the <b>AI Assistant</b> (💬) and ask “what does the liver do?” to show instant answers.",
        "Open the <b>Quiz</b>, answer a couple of questions to show scoring.",
        "Finish by <b>installing the app</b> to the home screen (‘Add to Home screen’) to show it behaves like a real native app.",
    ]))
    s.append(Paragraph("Optional: the AI Assistant works offline out of the box. For full conversational "
                       "answers, tap the 🔑 link inside the chat and paste a Claude API key (stored only on that "
                       "phone). Mention possible next steps: layered body-system peeling and saved progress.", SMALL))

    # ---- 6. Add / change organs ----
    s.append(Paragraph("6. Adding or changing an organ (optional)", H1))
    s.append(numbered([
        "Put a new model file (<font face='Courier'>name.glb</font>) into the <b>models/</b> folder.",
        "Add an entry in <font face='Courier'>js/organs.js</font> with the next free card number "
        "(copy an existing entry and fill in its name, system, facts, parts and quiz questions).",
        "Copy one <font face='Courier'>&lt;a-marker&gt;</font> block in <b>scan.html</b>, change its "
        "‘value’ to the new card number and its model ‘src’.",
        "Re-run <font face='Courier'>python make_pdfs.py</font> to refresh the scan cards.",
    ]))
    s.append(Paragraph("Models are automatically centred and resized to sit on the card, so they "
                       "do not need manual scaling.", SMALL))

    # ---- 7. Tech + credits ----
    s.append(Paragraph("7. Tech stack & credits", H1))
    s.append(simple_table([
        ["Part", "Technology"],
        ["AR engine", "AR.js + A-Frame (marker tracking in the browser)"],
        ["3D viewer & study pages", "Google <model-viewer> with hotspots"],
        ["Voice", "Browser Web Speech API (text-to-speech)"],
        ["AI assistant", "Offline knowledge base, optional Claude API"],
        ["3D models", "HuBMAP CCF 3D Reference Library (Draco-compressed)"],
        ["App / offline", "PWA - web manifest + service worker"],
        ["Runs on", "Any modern phone browser (Android Chrome / iOS Safari)"],
    ], col_widths=[52*mm, 106*mm]))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        "<b>Attribution (please keep this):</b> The 3D organ models are from the HuBMAP "
        "Consortium CCF 3D Reference Object Library and are licensed under "
        "Creative Commons Attribution 4.0 (CC BY 4.0). "
        "Source: https://hubmapconsortium.github.io/ccf/pages/ccf-3d-reference-library.html", SMALL))

    doc.build(s)
    print("wrote", path)

if __name__ == "__main__":
    build_scan_cards()
    build_guide()
    # clean temp
    for f in os.listdir(TMP):
        os.remove(os.path.join(TMP, f))
    os.rmdir(TMP)
    print("done")
