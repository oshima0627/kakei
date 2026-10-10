"""生成済みの site/public/img/eyecatch/<slug>.jpg がある記事だけ、front matter の eyecatch を差し替え ogImage 行を消す。本文には触れない。"""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
for md in sorted((ROOT / "site/content/articles").glob("*.md")):
    slug = md.stem
    if not (ROOT / f"site/public/img/eyecatch/{slug}.jpg").exists(): print("skip:", slug); continue
    t = md.read_text(); head, sep, body = t.partition("\n---\n")
    head = re.sub(r"(?m)^eyecatch:.*$", f"eyecatch: /img/eyecatch/{slug}.jpg", head)
    head = re.sub(r"(?m)^ogImage:.*\n", "", head)
    md.write_text(head + sep + body); print("ok:", slug)
