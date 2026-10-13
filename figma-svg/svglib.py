"""Thu vien SVG cho bo khung Figma — PRM323 Lab 2.

De tai: He thong quan ly hoc vu / Review tai lieu cho giang vien.
Token BAM DUNG app nen (src/index.css cua AI-Review--ui), khong bia mau.
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Token — nguon: app/src/index.css khoi @theme
# ---------------------------------------------------------------------------
INK = "#24332D"
MUTED = "#66736D"
LINE = "#E1E7E3"
CANVAS = "#FAFBFA"
SUBTLE = "#F7F9F7"
BRAND = "#146B55"
BRAND_SOFT = "#EAF4ED"
BRAND_TINT = "#F2F7F3"
OLIVE = "#637344"
OLIVE_SOFT = "#F1F4E9"
AMBER = "#756534"
AMBER_SOFT = "#F5F2E7"
RUST = "#A65335"
RUST_SOFT = "#FBF0EA"
DANGER = "#A34343"
DANGER_SOFT = "#FAEEEE"
WHITE = "#FFFFFF"

FONT = "Inter"
FS_PRICE = 22
FS_TITLE = 20
FS_HEAD = 16
FS_BODY = 14
FS_SM = 13
FS_CAP = 12
FS_MICRO = 11

SP = {"xs": 4, "s": 8, "m": 12, "l": 16, "xl": 24, "xxl": 32, "huge": 48}
RAD = {"button": 8, "card": 12, "dialog": 16, "sheet": 24, "pill": 999, "chip": 6}
PAD = 20
HEADER_H = 56
BOTTOM_NAV_H = 64


def esc(s: str) -> str:
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def rect(x, y, w, h, fill=WHITE, rx=0, stroke=None, sw=1, opacity=None):
    a = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{sw}"'
    if opacity is not None:
        a += f' opacity="{opacity}"'
    return a + "/>"


def circle(cx, cy, r, fill=BRAND, opacity=None, stroke=None, sw=1):
    a = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{sw}"'
    if opacity is not None:
        a += f' opacity="{opacity}"'
    return a + "/>"


def line(x1, y1, x2, y2, stroke=LINE, sw=1):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"/>'


def poly(pts, fill=WHITE, stroke=None, sw=1):
    d = " ".join(f"{x},{y}" for x, y in pts)
    a = f'<polygon points="{d}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{sw}"'
    return a + "/>"


def path(d, fill="none", stroke=None, sw=1.6, cap="round"):
    a = f'<path d="{d}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}" stroke-linejoin="round"'
    return a + "/>"


def text(x, y, s, size=FS_BODY, fill=INK, weight=400, anchor="start", opacity=None):
    a = (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" '
         f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"')
    if opacity is not None:
        a += f' opacity="{opacity}"'
    return a + f'>{esc(s)}</text>'


def para(x, y, s, size=FS_BODY, fill=MUTED, weight=400, lh=20):
    out = []
    for i, ln in enumerate(s if isinstance(s, list) else [s]):
        out.append(text(x, y + i * lh, ln, size, fill, weight))
    return "".join(out)


def wrap(s: str, maxc: int) -> list:
    words, lines, cur = s.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 <= maxc:
            cur = f"{cur} {w}".strip()
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def wrap_chars(w_avail: float, size: int) -> int:
    return max(8, int(w_avail / (size * 0.52)))


# ---------------------------------------------------------------------------
# Icon — lucide-style, stroke 1.75
# ---------------------------------------------------------------------------
def icon(name, x, y, size=20, color=MUTED, sw=1.75):
    s = size / 24.0
    g = (f'<g transform="translate({x},{y}) scale({s})" fill="none" stroke="{color}" '
         f'stroke-width="{sw/s:.3f}" stroke-linecap="round" stroke-linejoin="round">')
    p = {
        "dashboard": '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
        "folder": '<path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z"/>',
        "check": '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M9 12l2 2 4-4"/>',
        "bell": '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
        "search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
        "filter": '<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
        "chevron-right": '<path d="m9 6 6 6-6 6"/>',
        "chevron-down": '<path d="m6 9 6 6 6-6"/>',
        "file": '<path d="M14 3v5h5"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/>',
        "filetext": '<path d="M14 3v5h5"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M9 13h6"/><path d="M9 17h4"/>',
        "sparkles": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.3 6.3 2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4"/>',
        "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
        "school": '<path d="M3 10 12 5l9 5-9 5Z"/><path d="M6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5"/>',
        "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
        "book": '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2Z"/><path d="M8 3v18"/>',
        "alert": '<path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/>',
        "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        "x": '<path d="M6 6l12 12M18 6 6 18"/>',
        "plus": '<path d="M12 5v14M5 12h14"/>',
        "grid": '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        "layers": '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
        "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
        "shield": '<path d="M12 3 5 6v6c0 5 3 8 7 9 4-1 7-4 7-9V6Z"/>',
        "arrowleft": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
        "download": '<path d="M12 3v12M7 11l5 5 5-5"/><path d="M5 21h14"/>',
        "message": '<path d="M21 12a8 8 0 0 1-8 8H7l-4 4V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/>',
        "refresh": '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
        "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 5-5"/>',
        "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
        "github": '<path d="M9 19c-4 1.5-4-2.5-6-3m12 6v-3.5c0-1 .1-1.4-.5-2 2.8-.3 4.5-1.5 4.5-5 0-1-.3-2-1-2.7.1-.3.4-1.5-.1-3 0 0-1.1-.3-3.5 1.3a9 9 0 0 0-5 0C7.1 5.3 6 5.6 6 5.6c-.5 1.5-.2 2.7-.1 3-.7.7-1 1.7-1 2.7 0 3.5 1.7 4.7 4.5 5-.6.6-.6 1.2-.5 2V21"/>',
        "logout": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
        "edit": '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        "eye": '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    }.get(name, "")
    return g + p + "</g>"


# ---------------------------------------------------------------------------
# Manh ghep UI
# ---------------------------------------------------------------------------
def status_bar(w):
    """Thanh trang thai iOS — vung an toan 54px theo token app."""
    y = 20
    out = [text(18, y + 6, "9:41", FS_SM, INK, 600)]
    out.append(rect(w - 34, y - 1, 16, 11, fill="none", rx=3, stroke=INK, sw=1.4))
    out.append(rect(w - 32, y + 1, 12, 7, fill=INK, rx=1, opacity=0.85))
    out.append(path(f"M{w-62} {y+8} v-5 m3 5 v-6 m3 6 v-4 m3 4 v-7",
                    stroke=INK, sw=1.4))
    return "".join(out)


def app_bar(w, title, subtitle=None, back=True, right_icon=None, y=54):
    """Header 56px, nen trang, vien duoi."""
    out = [rect(0, y, w, HEADER_H, fill=WHITE)]
    cx = 20
    if back:
        out.append(icon("arrowleft", cx, y + 18, 20, INK, 1.9))
        cx += 32
    tx = cx
    if subtitle:
        out.append(text(tx, y + 25, title, FS_HEAD, INK, 600))
        out.append(text(tx, y + 41, subtitle, FS_MICRO, MUTED))
    else:
        out.append(text(tx, y + 34, title, FS_HEAD, INK, 600))
    if right_icon:
        out.append(icon(right_icon, w - 40, y + 18, 20, MUTED))
    out.append(line(0, y + HEADER_H, w, y + HEADER_H, LINE))
    return "".join(out)


def bottom_nav(w, y, active="Tổng quan"):
    """Bottom nav 5 tab — theo BottomNavigation.tsx."""
    tabs = [("dashboard", "Tổng quan"), ("folder", "Project"), ("check", "Review"),
            ("bell", "Thông báo"), ("user", "Tài khoản")]
    out = [rect(0, y, w, BOTTOM_NAV_H, fill=WHITE), line(0, y, w, y, LINE)]
    tw = w / 5.0
    for i, (ic, label) in enumerate(tabs):
        cx = tw * i + tw / 2
        on = label == active
        col = BRAND if on else MUTED
        if on:
            out.append(rect(cx - 22, y + 6, 44, 30, fill=BRAND_SOFT, rx=8))
        out.append(icon(ic, cx - 10, y + 10, 20, col, 1.75))
        out.append(text(cx, y + 50, label, FS_MICRO, col, 600 if on else 400, "middle"))
    return "".join(out)


def chip(x, y, label, w=None, active=False, icon_name=None):
    tw = w if w else int(len(label) * 7.2 + 26)
    h = 30
    fill = BRAND_SOFT if active else WHITE
    stroke = BRAND if active else LINE
    col = BRAND if active else MUTED
    out = [rect(x, y, tw, h, fill=fill, rx=999, stroke=stroke)]
    tx = x + 13
    if icon_name:
        out.append(icon(icon_name, x + 10, y + 7, 16, col, 1.9))
        tx = x + 31
    out.append(text(tx, y + 20, label, FS_CAP, col, 600 if active else 500))
    return "".join(out), tw


def search_bar(x, y, w, placeholder):
    h = 40
    return (rect(x, y, w, h, fill=SUBTLE, rx=10, stroke=LINE) +
            icon("search", x + 12, y + 10, 20, MUTED) +
            text(x + 40, y + 25, placeholder, FS_SM, MUTED))


def page_heading(x, y, eyebrow, title, desc, w):
    out = [text(x, y, eyebrow, FS_MICRO, BRAND, 700)]
    out.append(text(x, y + 28, title, FS_PRICE, INK, 700))
    if desc:
        for i, ln in enumerate(wrap(desc, wrap_chars(w, FS_SM))):
            out.append(text(x, y + 52 + i * 18, ln, FS_SM, MUTED))
    return "".join(out)


def badge(x, y, label, tone="neutral", size=FS_MICRO):
    m = {"neutral": (SUBTLE, MUTED), "brand": (BRAND_SOFT, BRAND), "olive": (OLIVE_SOFT, OLIVE),
         "amber": (AMBER_SOFT, AMBER), "rust": (RUST_SOFT, RUST), "danger": (DANGER_SOFT, DANGER)}
    bg, fg = m.get(tone, (SUBTLE, MUTED))
    w = int(len(label) * 6.4 + 18)
    return rect(x, y, w, 22, fill=bg, rx=999) + text(x + 9, y + 15, label, size, fg, 600), w


def button(x, y, label, w=None, variant="primary", h=44):
    tw = w if w else int(len(label) * 8 + 32)
    if variant == "primary":
        return rect(x, y, tw, h, fill=BRAND, rx=8) + text(x + tw / 2, y + h / 2 + 5, label, FS_BODY, WHITE, 600, "middle"), tw
    if variant == "secondary":
        return rect(x, y, tw, h, fill=WHITE, rx=8, stroke=LINE) + text(x + tw / 2, y + h / 2 + 5, label, FS_BODY, BRAND, 600, "middle"), tw
    return rect(x, y, tw, h, fill=SUBTLE, rx=8, stroke=LINE) + text(x + tw / 2, y + h / 2 + 5, label, FS_BODY, MUTED, 500, "middle"), tw


def card(x, y, w, h, title=None, lines=None, tone="neutral", subtitle=None):
    out = [rect(x, y, w, h, fill=WHITE, rx=12, stroke=LINE)]
    yy = y + 18
    if tone != "neutral":
        m = {"brand": BRAND, "olive": OLIVE, "amber": AMBER, "rust": RUST, "danger": DANGER}
        out.append(rect(x, y, 4, h, fill=m.get(tone, BRAND), rx=0))
    if subtitle:
        out.append(text(x + 16, yy + 4, subtitle, FS_MICRO, MUTED, 500))
        yy += 20
    if title:
        out.append(text(x + 16, yy + 8, title, FS_HEAD, INK, 600))
        yy += 28
    for i, ln in enumerate(lines or []):
        out.append(text(x + 16, yy + i * 20, ln, FS_SM, MUTED))
    return "".join(out)


def shadow_stack(x, y, w, h, rx=12):
    """Bong do gia lap bang lop mo (Figma: doi sang Drop shadow)."""
    return (rect(x + 2, y + 3, w, h, fill=LINE, rx=rx, opacity=0.55) +
            rect(x + 1, y + 1, w, h, fill=LINE, rx=rx, opacity=0.35))


def photo_placeholder(x, y, w, h, label="Anh mau", rx=0):
    return (rect(x, y, w, h, fill=SUBTLE, rx=rx, stroke=LINE) +
            icon("file", x + w / 2 - 12, y + h / 2 - 20, 24, MUTED, 1.5) +
            text(x + w / 2, y + h / 2 + 20, label, FS_MICRO, MUTED, 500, "middle"))


def skeleton_row(x, y, w):
    out = [rect(x, y, w, 96, fill=WHITE, rx=12, stroke=LINE)]
    out.append(rect(x + 16, y + 18, w * 0.5, 12, fill=SUBTLE, rx=4))
    out.append(rect(x + 16, y + 40, w * 0.7, 10, fill=SUBTLE, rx=4))
    out.append(rect(x + 16, y + 60, w * 0.3, 20, fill=SUBTLE, rx=6))
    return "".join(out)


def empty_state(x, y, w, title, desc, action=None):
    out = [circle(x + w / 2, y + 40, 32, fill=SUBTLE)]
    out.append(icon("file", x + w / 2 - 16, y + 24, 32, MUTED, 1.5))
    out.append(text(x + w / 2, y + 98, title, FS_HEAD, INK, 600, "middle"))
    for i, ln in enumerate(wrap(desc, 34)):
        out.append(text(x + w / 2, y + 122 + i * 18, ln, FS_SM, MUTED, 400, "middle"))
    if action:
        b, bw = button(x + w / 2 - 70, y + 122 + len(wrap(desc, 34)) * 18 + 24, action, 140, "primary")
        out.append(b)
    return "".join(out)


def dialog(x, y, w, h, title, body, primary, secondary=None, icon_name="alert", tone="danger"):
    out = [rect(x - 400, y - 400, w + 800, h + 800, fill=INK, opacity=0.4)]
    out.append(rect(x, y, w, h, fill=WHITE, rx=16))
    m = {"danger": (DANGER_SOFT, DANGER), "brand": (BRAND_SOFT, BRAND), "amber": (AMBER_SOFT, AMBER)}
    bg, fg = m.get(tone, (BRAND_SOFT, BRAND))
    out.append(circle(x + w / 2, y + 44, 24, fill=bg))
    out.append(icon(icon_name, x + w / 2 - 12, y + 32, 24, fg, 1.9))
    out.append(text(x + w / 2, y + 96, title, FS_HEAD, INK, 600, "middle"))
    for i, ln in enumerate(wrap(body, 30)):
        out.append(text(x + w / 2, y + 120 + i * 18, ln, FS_SM, MUTED, 400, "middle"))
    by = y + h - 60
    if secondary:
        b1, bw1 = button(x + 16, by, secondary, (w - 44) / 2, "secondary", 44)
        out.append(b1)
        b2, _ = button(x + 32 + (w - 44) / 2, by, primary, (w - 44) / 2, "primary", 44)
        out.append(b2)
    else:
        b, _ = button(x + 16, by, primary, w - 32, "primary", 44)
        out.append(b)
    return "".join(out)


def toast(x, y, w, msg, tone="brand"):
    m = {"brand": BRAND, "danger": DANGER, "amber": AMBER}
    out = [shadow_stack(x, y, w, 52, 12)]
    out.append(rect(x, y, w, 52, fill=INK, rx=12))
    out.append(icon("check-circle" if tone == "brand" else "alert", x + 14, y + 16, 20, WHITE))
    for i, ln in enumerate(wrap(msg, wrap_chars(w - 60, FS_SM))):
        out.append(text(x + 44, y + 24 + i * 16, ln, FS_SM, WHITE, 500))
    return "".join(out)


def section_header(x, y, w, title, action=None):
    out = [text(x, y, title, FS_HEAD, INK, 600)]
    if action:
        aw = int(len(action) * 7 + 8)
        out.append(text(x + w - aw, y, action, FS_SM, BRAND, 600))
    return "".join(out)


# ---------------------------------------------------------------------------
# Khung board
# ---------------------------------------------------------------------------
def board_title(w, title, sub=None):
    out = [text(40, 64, title, FS_PRICE, INK, 700)]
    out.append(line(40, 84, w - 40, 84, LINE))
    y = 108
    if sub:
        for ln in wrap(sub, wrap_chars(w - 80, FS_BODY)):
            out.append(text(40, y, ln, FS_BODY, MUTED))
            y += 20
    return "".join(out), y + 26


def doc(w, h, body, bg=CANVAS):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}">' + rect(0, 0, w, h, fill=bg) + body + "</svg>")


MANIFEST = []


def save(out_dir, name, svg, page, w, h, label, note=""):
    from pathlib import Path
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{name}.svg").write_text(svg, encoding="utf-8")
    MANIFEST.append({"file": f"{name}.svg", "page": page, "w": w, "h": h,
                     "label": label, "note": note})
    return name


def device(w, h, title, body, sub=None, back=True, right=None, nav=None):
    """Khung dien thoai day du: status bar + app bar + noi dung (+ bottom nav)."""
    out = [rect(0, 0, w, h, fill=CANVAS)]
    out.append(status_bar(w))
    out.append(app_bar(w, title, sub, back, right))
    out.append(body)
    if nav:
        out.append(bottom_nav(w, h - BOTTOM_NAV_H, nav))
    return doc(w, h, "".join(out))
