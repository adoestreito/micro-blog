#!/usr/bin/env python3
import json
import re
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POSTS_JSON = ROOT / "posts.json"
OUT_MD = ROOT / "ai" / "posts.md"


def html_to_markdown(s: str) -> str:
    # Minimal HTML → Markdown conversion for the tags we allow in posts.
    s = s.replace("\r\n", "\n")

    # <br> and paragraphs
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.IGNORECASE)
    s = re.sub(r"</p\s*>", "\n\n", s, flags=re.IGNORECASE)
    s = re.sub(r"<p(\s+[^>]*)?>", "", s, flags=re.IGNORECASE)

    # Links: <a href="...">text</a> → [text](url)
    def repl_link(m):
        href = (m.group(1) or "").strip()
        text = (m.group(2) or "").strip()
        if not href:
            return text
        return f"[{text}]({href})"

    s = re.sub(r"<a\s+[^>]*href=[\"']([^\"']+)[\"'][^>]*>(.*?)</a\s*>", repl_link, s, flags=re.IGNORECASE | re.DOTALL)

    # Emphasis/basic formatting
    s = re.sub(r"</?(strong|b)\s*>", "**", s, flags=re.IGNORECASE)
    s = re.sub(r"</?(em|i)\s*>", "_", s, flags=re.IGNORECASE)
    s = re.sub(r"</?code\s*>", "`", s, flags=re.IGNORECASE)

    # Audio: emit a small marker with sources
    def repl_audio(m):
        audio_html = m.group(0)
        srcs = re.findall(r"<source\s+[^>]*src=[\"']([^\"']+)[\"'][^>]*>", audio_html, flags=re.IGNORECASE)
        if not srcs:
            return ""
        lines = ["\n\n[Audio]"]
        for src in srcs:
            lines.append(f"- {src}")
        lines.append("")
        return "\n".join(lines)

    s = re.sub(r"<audio\b[^>]*>.*?</audio\s*>", repl_audio, s, flags=re.IGNORECASE | re.DOTALL)

    # Strip any remaining tags (keep text)
    s = re.sub(r"<[^>]+>", "", s)

    # Normalize whitespace
    s = re.sub(r"\n{3,}", "\n\n", s).strip()
    return s


def main() -> int:
    posts = json.loads(POSTS_JSON.read_text(encoding="utf-8"))
    posts.sort(key=lambda p: datetime.fromisoformat(p["date"]), reverse=True)

    lines = []
    lines.append("---")
    lines.append("title: AI Export")
    lines.append("format: markdown")
    lines.append(f"generated_at: {datetime.utcnow().isoformat(timespec='seconds')}Z")
    lines.append("---")
    lines.append("")
    lines.append("This file is generated from `posts.json`.")
    lines.append("")
    lines.append("## Posts")
    lines.append("")

    for p in posts:
        pid = str(p.get("id", "")).strip()
        title = str(p.get("title", "")).strip()
        date = str(p.get("date", "")).strip()
        content = str(p.get("content", "") or "")

        lines.append(f"### {title}")
        lines.append("")
        lines.append(f"- id: `{pid}`")
        lines.append(f"- date: `{date}`")
        lines.append("")
        lines.append(html_to_markdown(content))
        lines.append("")
        lines.append("---")
        lines.append("")

    OUT_MD.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

