"""Fix common mojibake and normalize shared footer text."""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

REPLACEMENTS = [
    (
        "?? Mauritius's Trusted Home Care Goods Distributor",
        "🏠 Mauritius's Trusted Home care Goods Distributor",
    ),
    ("|&nbsp; ?? Fast Dispatch", "|&nbsp; 🚚 Fast Dispatch"),
    ("|&nbsp; ?? Wholesale", "|&nbsp; 📦 Wholesale"),
    ("|&nbsp; ? 4.9 Star Rated", "|&nbsp; ⭐ 4.9 Star Rated"),
    ("<li>?? Royal Road", "<li>📍 Royal Road"),
    ("<li>?? Orders:", "<li>📦 Orders:"),
    ("<li>?? Enquiries:", "<li>✉️ Enquiries:"),
    ("<li>?? Mon – Sat:", "<li>🕐 Mon–Sat:"),
    ('aria-label="Close menu">?</button>', 'aria-label="Close menu">✕</button>'),
    ("<p> – 2025 Super Distribution Ltd.", "<p>© 2025 Super Distribution Ltd."),
    # Submenu indicator (was broken when special chars were lost)
    (
        '<span class="mm-chevron" aria-hidden="true">?</span>',
        '<span class="mm-chevron" aria-hidden="true">▼</span>',
    ),
    (
        '<span class="mm-chevron">?</span>',
        '<span class="mm-chevron" aria-hidden="true">▼</span>',
    ),
]

POWERED_LINK = (
    '© 2026 Super Distribution Ltd. All rights reserved. | Powered by '
    '<a href="https://www.theflashgroups.com/" target="_blank" '
    'rel="noopener noreferrer">Flash Communications Ltd.</a>'
)


def main() -> int:
    targets = list((ROOT / "products-innerpage").glob("*.html"))
    for p in ROOT.glob("*.html"):
        targets.append(p)
    p404 = ROOT / "404.html"
    if p404.exists() and p404 not in targets:
        targets.append(p404)
    targets = sorted(set(targets))
    changed = 0
    for p in targets:
        t = p.read_text(encoding="utf-8")
        new = t
        for old, rep in REPLACEMENTS:
            new = new.replace(old, rep)
        new = re.sub(
            r'(<div class="footer-bottom">\s*<p>)(.*?)(</p>\s*</div>)',
            rf"\1{POWERED_LINK}\3",
            new,
            flags=re.DOTALL,
        )
        if new != t:
            p.write_text(new, encoding="utf-8", newline="\n")
            changed += 1
            print("fixed", p.relative_to(ROOT))
    print("files updated:", changed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
