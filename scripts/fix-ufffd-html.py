"""Replace UTF-8 replacement char U+FFFD in HTML with sensible punctuation."""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def fix_text(t: str) -> str:
    # Breadcrumb separators (was corrupted ›)
    t = t.replace("<span> \ufffd </span>", "<span>›</span>")
    t = t.replace("<span>\ufffd</span>", "<span>›</span>")
    # Common mojibake: lone replacement between words → en dash
    t = t.replace(" \ufffd ", " – ")
    t = t.replace("\ufffd", "")
    return t


def main() -> int:
    changed = 0
    for p in sorted(ROOT.rglob("*.html")):
        if "vendor" in p.parts:
            continue
        raw = p.read_bytes()
        if b"\xef\xbf\xbd" not in raw:
            continue
        t = raw.decode("utf-8")
        new = fix_text(t)
        if new != t:
            p.write_text(new, encoding="utf-8", newline="\n")
            changed += 1
            print("fixed", p.relative_to(ROOT))
    print("total files updated:", changed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
