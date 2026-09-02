#!/usr/bin/env python3
"""PDFの表を、座標つきで行・列に組み直して表示する。

**なぜ要るか**: 文科省の支援額のように、**金額が HTML に無く PDF にしかない**ことがある。
PyMuPDF の素のテキスト抽出はレイアウトを保たないので、

    35万円 46万円 80万円 91万円 54万円 70万円 28万円 26万円

のように数字だけが並び、**どの数字がどの区分か確定できない**。
**列の取り違えは過去に実際に起きた誤り**なので、目視で対応づけない。

このスクリプトは各語の x 座標を保ったまま、y 座標で行に束ね直す。
出力の `語@x` の x を見れば、見出しの列とデータの列が同じかを確かめられる。

使い方:

    python tools/pdf-table.py <PDFのURL> <ページ番号> [y許容幅]

例（令和8年度版リーフレットの支援額の表）:

    python tools/pdf-table.py https://www.mext.go.jp/content/20260206-mxt_gakushi01-100001062-1-2gakusei.pdf 1 3
"""
import io
import sys
import urllib.request

import fitz  # PyMuPDF


def main(argv):
    if len(argv) < 3:
        print(__doc__)
        return 2
    url, page_no = argv[1], int(argv[2])
    y_tol = float(argv[3]) if len(argv) > 3 else 4.0
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (kakei source verification)"})
    raw = urllib.request.urlopen(req, timeout=60).read()
    doc = fitz.open(stream=raw, filetype="pdf")
    print(f"ページ数: {doc.page_count}")
    rows = {}
    for x0, y0, x1, y1, word, *_ in doc[page_no].get_text("words"):
        rows.setdefault(round(y0 / y_tol), []).append((x0, word))
    for key in sorted(rows):
        line = sorted(rows[key])
        print(f"[y={key * y_tol:6.1f}] " + " | ".join(f"{w}@{int(x)}" for x, w in line))
    return 0


if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.exit(main(sys.argv))
