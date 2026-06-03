#!/usr/bin/env python3
"""Generate xparq.me legal HTML from Flutter legal_documents.dart."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DART = (
    Path(__file__).resolve().parents[2]
    / "xparq_mobile"
    / "apps"
    / "mobile"
    / "lib"
    / "features"
    / "profile"
    / "data"
    / "legal_documents.dart"
)
OUT = ROOT / "legal"
CSS = "/assets/css/legal.css"
JS = "/assets/js/legal.js"

DOCS = [
    ("privacyPolicyEn", "privacy-policy", "en", "Privacy Policy"),
    ("privacyPolicyTh", "privacy-policy", "th", "นโยบายความเป็นส่วนตัว"),
    ("termsOfServiceEn", "terms", "en", "Terms of Service"),
    ("termsOfServiceTh", "terms", "th", "เงื่อนไขการให้บริการ"),
    ("communityGuidelinesEn", "community-guidelines", "en", "Community Guidelines"),
    ("communityGuidelinesTh", "community-guidelines", "th", "แนวทางปฏิบัติของชุมชน"),
]


def extract_const(name: str, text: str) -> str:
    pattern = rf"static const String {name} = '''(.*?)''';"
    m = re.search(pattern, text, re.DOTALL)
    if not m:
        raise SystemExit(f"Missing const: {name}")
    return m.group(1).strip()


def md_to_html(md: str) -> str:
    lines = md.split("\n")
    out: list[str] = []
    in_ul = False

    def close_ul():
        nonlocal in_ul
        if in_ul:
            out.append("</ul>")
            in_ul = False

    for raw in lines:
        line = raw.rstrip()
        if line == "---":
            close_ul()
            out.append("<hr>")
            continue
        if line.startswith("### "):
            close_ul()
            out.append(f"<h3>{inline(line[4:])}</h3>")
            continue
        if line.startswith("## "):
            close_ul()
            out.append(f"<h2>{inline(line[3:])}</h2>")
            continue
        if line.startswith("# "):
            close_ul()
            out.append(f"<h1>{inline(line[2:])}</h1>")
            continue
        if line.startswith("* ") or line.startswith("- "):
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{inline(line[2:])}</li>")
            continue
        if not line.strip():
            close_ul()
            continue
        close_ul()
        out.append(f"<p>{inline(line)}</p>")

    close_ul()
    return "\n".join(out)


def inline(s: str) -> str:
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    return s


def page(slug: str, lang: str, title: str, body_html: str) -> str:
    other = "th" if lang == "en" else "en"
    other_label = "ไทย" if lang == "en" else "English"
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — XPARQ</title>
<meta name="description" content="{title} for the XPARQ platform and mobile app.">
<link rel="canonical" href="https://xparq.me/legal/{slug}.html?lang={lang}">
<link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/global.css">
<link rel="stylesheet" href="/assets/css/components.css">
<link rel="stylesheet" href="{CSS}">
</head>
<body>
<nav class="legal-nav">
  <a href="/" class="nav-logo">
    <svg class="logo-bolt" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="58,5 20,55 48,55 42,95 80,45 52,45" fill="#2d9cff"/>
    </svg>
    <span class="logo-text">XPARQ</span>
  </a>
  <div class="legal-nav-links">
    <a href="/legal/privacy-policy.html">Privacy</a>
    <a href="/legal/terms.html">Terms</a>
    <a href="/legal/community-guidelines.html">Guidelines</a>
    <a class="lang-switch" href="/legal/{slug}.html?lang={other}">{other_label}</a>
  </div>
</nav>
<main class="legal-page">
  <article class="legal-doc" data-lang="{lang}">
{body_html}
  </article>
  <p class="legal-sync-note">Synced from XPARQ mobile app legal documents. Run <code>scripts/sync_legal_from_mobile.py</code> after policy updates.</p>
</main>
<footer class="legal-footer">
  <span>© 2024–2026 XPARQ Holdings Corp.</span>
  <a href="mailto:contact@xparq.me">contact@xparq.me</a>
</footer>
<script src="{JS}"></script>
</body>
</html>
"""


def main() -> None:
    dart = DART.read_text(encoding="utf-8")
    OUT.mkdir(parents=True, exist_ok=True)

    bundles: dict[str, dict[str, str]] = {}
    for const, slug, lang, title in DOCS:
        md = extract_const(const, dart)
        bundles.setdefault(slug, {})[lang] = page(slug, lang, title, md_to_html(md))

    for slug, langs in bundles.items():
        # Default file = English; Thai via ?lang=th
        (OUT / f"{slug}.html").write_text(langs["en"], encoding="utf-8")
        (OUT / f"{slug}.th.html").write_text(langs["th"], encoding="utf-8")

    print(f"Wrote {len(bundles)} legal pages to {OUT}")


if __name__ == "__main__":
    main()
