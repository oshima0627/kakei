#!/usr/bin/env python3
"""記事の引用行が、一次情報の原文に本当にそう書かれているかを機械的に照合する。

**なぜリポジトリに置くか**: 2026-09-01 の照合はスクラッチパッドで走らせて捨てたため、
再実行できなかった。その結果、ふるさと納税の記事の引用が `(3)'` → `(3)` と1文字ずれていた
のを、翌日のレビューまで誰も見つけられなかった（引き継ぎには「37/37 一致」と記録されていた）。

**照合できるのは「引用が原文にあるか」だけ。** 引用の選び方が原文の趣旨を曲げていないか、
表の内容が事実と合っているかは見ていない。そこは source-verifier か人間の仕事。

つまずいた点（このスクリプトが吸収しているもの）:

  - **実体参照**: 総務省の式は `&times;` `&#39;` で書かれている。戻さないと正しい引用が
    不一致に見え、逆に本物の不一致が埋もれる
  - **HTMLコメント**: 国税庁 No.1180 の（注2）は `<!-- -->` の中にあり画面に出ていない。
    除かないと、読者が見られない文言に一致してしまう
  - **文字コード**: 総務省は Shift_JIS、国税庁・文科省は UTF-8
  - **画像の代替テキスト**: 総務省の式番号 (1)(2)(3)(3)' は画像。alt を本文に差し込む
  - **PDF**: 文科省の金額は HTML に無く予算資料の PDF にしかない（PyMuPDF で抽出）

使い方:

    python tools/verify-quotes.py            # 全記事
    python tools/verify-quotes.py zeikin-fuyou-no-kabe.md
"""
import html as _html
import os
import re
import sys
import unicodedata
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTICLES = os.path.join(ROOT, "site", "content", "articles")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_sources")
UA = "Mozilla/5.0 (kakei source verification)"


def fetch(url):
    """出典を取得して本文テキストにする。取得済みならキャッシュを使う。"""
    os.makedirs(CACHE, exist_ok=True)
    name = re.sub(r"[^A-Za-z0-9]+", "_", url)[-120:]
    is_pdf = url.lower().endswith(".pdf")
    path = os.path.join(CACHE, name + (".pdf" if is_pdf else ".html"))
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            raw, ctype = r.read(), r.headers.get("Content-Type", "")
        open(path, "wb").write(raw)
        open(path + ".ctype", "w", encoding="utf-8").write(ctype)
    raw = open(path, "rb").read()

    if is_pdf:
        import fitz  # PyMuPDF

        return "".join(p.get_text() for p in fitz.open(stream=raw, filetype="pdf"))

    ctype = ""
    if os.path.exists(path + ".ctype"):
        ctype = open(path + ".ctype", encoding="utf-8").read()
    m = re.search(r"charset=([\w-]+)", ctype, re.I) or re.search(
        rb'charset=["\']?([\w-]+)', raw[:4000], re.I
    )
    enc = m.group(1) if m else "utf-8"
    if isinstance(enc, bytes):
        enc = enc.decode()
    if enc.lower() in ("shift_jis", "shift-jis", "sjis", "x-sjis"):
        enc = "cp932"
    doc = raw.decode(enc, errors="replace")

    doc = re.sub(r"(?s)<!--.*?-->", " ", doc)                       # 画面に出ないので本文に含めない
    doc = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", doc)
    doc = re.sub(r'(?is)<img[^>]*\balt="([^"]*)"[^>]*>', r" \1 ", doc)  # 式番号などの alt を本文へ
    doc = re.sub(r"(?s)<[^>]*>", " ", doc)
    return _html.unescape(doc)


def norm(s):
    """空白・全半角・記号のゆれを吸収する。意味を変える文字は落とさない。"""
    s = unicodedata.normalize("NFKC", s)
    for a, b in [("−", "-"), ("－", "-"), ("‐", "-"), ("―", "-"),
                 ("、", ","), ("×", "x"), ("✕", "x"), ("＝", "=")]:
        s = s.replace(a, b)
    return re.sub(r"\s+", "", s)


def main(argv):
    targets = argv[1:] or sorted(f for f in os.listdir(ARTICLES) if f.endswith(".md"))
    total = bad_total = 0
    for fn in targets:
        text = open(os.path.join(ARTICLES, fn), encoding="utf-8").read()
        fm = text.split("---")[1]
        urls = [u.strip() for u in re.search(r"^sources:(.*)$", fm, re.M).group(1).split("|")]
        corpus = norm(" ".join(fetch(u) for u in urls))
        # 「> ⚠️」で始まる行は原文の引用ではなく、推論であることの注記なので除く。
        quotes = [l[2:].strip() for l in text.splitlines() if l.startswith("> ")]
        quotes = [q for q in quotes if not q.startswith("⚠️")]
        bad = [q for q in quotes if norm(q) not in corpus]
        total += len(quotes)
        bad_total += len(bad)
        print(f"{fn}: 引用行 {len(quotes)} / 一致 {len(quotes) - len(bad)} / 不一致 {len(bad)}")
        for b in bad:
            print("   × " + b)
    print(f"\n合計: {total} 行 / 一致 {total - bad_total} / 不一致 {bad_total}")
    # 不一致が出たら原文を読み直して**記事のほうを直す**。原文に合わせる。逆はしない。
    return 1 if bad_total else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main(sys.argv))
