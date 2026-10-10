"""写真系アイキャッチ（1200x630 JPG）。記事ごとに別のベース写真 tools/photo-eyecatch/assets/<slug>-base.jpg を使う。
設定は photo_eyecatch.json（slug: kicker, lines, band）。ベース写真が無い記事はスキップ。
python3 tools/photo-eyecatch/photo_eyecatch.py [slug ...]"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[2]
ASSETS = Path(__file__).parent / "assets"
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
# slug: (kicker, title lines, band box (x0,y0,x1,y1) in 1200x630 output)
ITEMS = {k: (v["kicker"], v["lines"], tuple(v["band"])) for k, v in json.loads((Path(__file__).parent / "photo_eyecatch.json").read_text()).items()}
W, H = 1200, 630
def make(slug, kicker, lines, box):
    im = Image.open(ASSETS / f"{slug}-base.jpg").convert("RGB")
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    im = im.crop((0, im.height - H, W, im.height))
    x0, y0, x1, y1 = box
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.rectangle(box, fill=(28, 30, 34, 225)); d.rectangle((x0, y0, x0 + 12, y1), fill=(245, 200, 0, 255))
    im = Image.alpha_composite(im.convert("RGBA"), ov); d = ImageDraw.Draw(im)
    ks = 28
    while ks > 18 and d.textlength(kicker, font=ImageFont.truetype(FONT, ks)) > (x1 - x0) - 60: ks -= 1
    fk = ImageFont.truetype(FONT, ks)
    size = 52
    while size > 30:
        ft = ImageFont.truetype(FONT, size)
        if max(d.textlength(l, font=ft) for l in lines) <= (x1 - x0) - 60 and 40 + len(lines) * (size + 14) <= (y1 - y0) - 20: break
        size -= 2
    top = y0 + ((y1 - y0) - (40 + len(lines) * (size + 14))) // 2 - 6
    d.text((x0 + 40, top), kicker, font=fk, fill=(245, 200, 0))
    for i, l in enumerate(lines):
        d.text((x0 + 38, top + 40 + i * (size + 14)), l, font=ft, fill="white")
    fs = ImageFont.truetype(FONT, 22)
    for dx, dy in ((2, 2), (1, 1), (2, 1), (1, 2)):
        d.text((W - 24 + dx, H - 16 + dy), "家計の制度ログ", font=fs, fill=(0, 0, 0), anchor="rs")
    d.text((W - 24, H - 16), "家計の制度ログ", font=fs, fill="white", anchor="rs")
    (ROOT / "site/public/img/eyecatch").mkdir(parents=True, exist_ok=True)
    out = ROOT / "site/public/img/eyecatch" / f"{slug}.jpg"
    im.convert("RGB").save(out, quality=82, optimize=True, progressive=True); print(out)
for k, v in ITEMS.items():
    if sys.argv[1:] and k not in sys.argv[1:]: continue
    if not (ASSETS / f"{k}-base.jpg").exists(): print("skip (no base):", k); continue
    make(k, *v)
