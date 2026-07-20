#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""教材圖衍生工具（PhotoLession 素材管線）

用法：
  python derive.py --sheets A1|A2|B12|all   候選圖拼成審圖表（contact sheets）
  python derive.py --overlay                依 annotations 畫標註框（自檢用）
  python derive.py --finalize               核准原圖壓到長邊 2400＋產 480px 縮圖
  python derive.py --gallery                產家長抽查圖廊 HTML
"""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
WORK = ROOT / "work"
CONTENT = ROOT.parent / "content"

COLS, ROWS = 3, 4
CELL_W, CELL_H, LABEL_H = 380, 260, 26


def _font(size: int = 16):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # 舊版 Pillow
        return ImageFont.load_default()


def make_sheets(concept: str) -> None:
    d = WORK / concept
    imgs = sorted(d.glob("px-*.jpg"))
    if not imgs:
        print(f"[{concept}] 沒有候選圖")
        return
    out_dir = d / "_sheets"
    out_dir.mkdir(exist_ok=True)
    for old in out_dir.glob("sheet-*.jpg"):
        old.unlink()
    per_sheet = COLS * ROWS
    font = _font(16)
    for si in range(0, len(imgs), per_sheet):
        batch = imgs[si:si + per_sheet]
        sheet = Image.new("RGB", (COLS * CELL_W, ROWS * (CELL_H + LABEL_H)), "white")
        draw = ImageDraw.Draw(sheet)
        for i, p in enumerate(batch):
            r, c = divmod(i, COLS)
            x0, y0 = c * CELL_W, r * (CELL_H + LABEL_H)
            try:
                with Image.open(p) as im:
                    im = im.convert("RGB")
                    im.thumbnail((CELL_W - 8, CELL_H - 8))
                    sheet.paste(im, (x0 + (CELL_W - im.width) // 2,
                                     y0 + (CELL_H - im.height) // 2))
            except Exception as e:
                draw.text((x0 + 10, y0 + 10), f"讀取失敗 {e}", fill="red", font=font)
            draw.text((x0 + 8, y0 + CELL_H + 4), p.stem, fill="black", font=font)
        n = si // per_sheet + 1
        out = out_dir / f"sheet-{n:02d}.jpg"
        sheet.save(out, quality=85)
        print(f"[{concept}] {out.name}（{len(batch)} 張）")


def _rect_px(box, w, h):
    x, y, bw, bh = box
    return [x * w, y * h, (x + bw) * w, (y + bh) * h]


def make_overlays() -> None:
    ann_dir = CONTENT / "annotations"
    out_dir = WORK / "_overlay"
    out_dir.mkdir(parents=True, exist_ok=True)
    font = _font(20)
    n = 0
    for ann_path in sorted(ann_dir.glob("*.json")):
        ann = json.loads(ann_path.read_text(encoding="utf-8-sig"))
        if not ann.get("usable"):
            continue
        pid = ann["photo"]
        src = CONTENT / "photos" / f"{pid}.jpg"
        if not src.exists():  # 還沒 refetch 原圖時退回候選圖
            hits = list(WORK.glob(f"*/{pid}.jpg")) + list(WORK.glob(f"*/_dupes/{pid}.jpg"))
            if not hits:
                print(f"! {pid} 找不到圖檔")
                continue
            src = hits[0]
        with Image.open(src) as im:
            im = im.convert("RGB")
            im.thumbnail((1200, 1200))
            draw = ImageDraw.Draw(im)
            w, h = im.size
            s = ann.get("subject")
            if s:
                draw.rectangle(_rect_px(s["bbox"], w, h), outline="#22c55e", width=4)
                draw.text((_rect_px(s["bbox"], w, h)[0], _rect_px(s["bbox"], w, h)[1] - 24),
                          s.get("label", "主角"), fill="#22c55e", font=font)
            for dis in ann.get("distractions", []):
                draw.rectangle(_rect_px(dis["bbox"], w, h), outline="#ef4444", width=3)
            for crop in ann.get("suggested_crops", []):
                draw.rectangle(_rect_px(crop["rect"], w, h), outline="#3b82f6", width=2)
            for line in ann.get("lines", []):
                draw.line([line["from"][0] * w, line["from"][1] * h,
                           line["to"][0] * w, line["to"][1] * h], fill="#eab308", width=4)
            im.save(out_dir / f"{pid}.jpg", quality=85)
            n += 1
    print(f"overlay 完成 {n} 張 -> {out_dir}")


def check_masks() -> None:
    """把去背主體合成到棋盤灰底，方便目檢去背品質。"""
    mask_dir = CONTENT / "masks"
    out_dir = WORK / "_maskcheck"
    out_dir.mkdir(parents=True, exist_ok=True)
    n = 0
    for m in sorted(mask_dir.glob("*-mask.png")):
        with Image.open(m) as fg:
            fg = fg.convert("RGBA")
            w, h = fg.size
            # 棋盤格底
            bg = Image.new("RGBA", (w, h), (200, 200, 200, 255))
            draw = ImageDraw.Draw(bg)
            step = max(16, w // 30)
            for yy in range(0, h, step):
                for xx in range(0, w, step):
                    if (xx // step + yy // step) % 2:
                        draw.rectangle([xx, yy, xx + step, yy + step], fill=(170, 170, 170, 255))
            comp = Image.alpha_composite(bg, fg)
            comp.convert("RGB").save(out_dir / f"{m.stem}.jpg", quality=85)
            n += 1
    print(f"去背檢查圖 {n} 張 -> {out_dir}")


def finalize() -> None:
    photo_dir = CONTENT / "photos"
    thumb_dir = photo_dir / "thumbs"
    thumb_dir.mkdir(parents=True, exist_ok=True)
    n = 0
    for p in sorted(photo_dir.glob("px-*.jpg")):
        with Image.open(p) as im:
            im = im.convert("RGB")
            if max(im.size) > 2400:
                im.thumbnail((2400, 2400))
                im.save(p, quality=85)
            t = im.copy()
            t.thumbnail((480, 480))
            t.save(thumb_dir / p.name, quality=80)
        n += 1
    print(f"finalize 完成 {n} 張（長邊≤2400＋縮圖）")


def make_gallery() -> None:
    import base64
    ann_dir = CONTENT / "annotations"
    photos = {}
    pj = CONTENT / "photos.json"
    if pj.exists():
        photos = {p["id"]: p for p in json.loads(pj.read_text(encoding="utf-8-sig"))}

    groups: dict[str, list[str]] = {}
    metas: dict[str, dict] = {}
    for ann_path in sorted(ann_dir.glob("*.json")):
        ann = json.loads(ann_path.read_text(encoding="utf-8-sig"))
        if not ann.get("usable"):
            continue
        metas[ann["photo"]] = ann
        primary = (ann.get("concepts") or ["其他"])[0]
        groups.setdefault(primary, []).append(ann["photo"])

    def data_uri(pid: str) -> str:
        for cand in [CONTENT / "photos" / "thumbs" / f"{pid}.jpg",
                     CONTENT / "photos" / f"{pid}.jpg",
                     *WORK.glob(f"*/{pid}.jpg")]:
            if cand.exists():
                return "data:image/jpeg;base64," + base64.b64encode(cand.read_bytes()).decode()
        return ""

    labels = {"A1": "A1 光是照片的顏料", "A2": "A2 光圈與景深",
              "B1": "B1 誰是主角", "B2": "B2 靠近一點"}
    total = sum(len(v) for v in groups.values())
    sections = []
    for key in sorted(groups):
        cards = []
        for pid in groups[key]:
            ann = metas[pid]
            note = ann.get("curator_note", "")
            subj = (ann.get("subject") or {}).get("label", "—")
            author = photos.get(pid, {}).get("author", "")
            cards.append(
                f'<figure class="card"><img src="{data_uri(pid)}" loading="lazy" alt="{pid}">'
                f'<figcaption><b>{pid}</b><br><span class="s">主角：{subj}'
                f'{"｜作者：" + author if author else ""}</span><br>{note}</figcaption></figure>')
        sections.append(f'<h2>{labels.get(key, key)}（{len(groups[key])} 張）</h2>'
                        f'<div class="grid">{"".join(cards)}</div>')

    html = f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>小小攝影師 · 素材抽查</title>
<style>
:root{{color-scheme:light dark}}
body{{font-family:system-ui,"Microsoft JhengHei",sans-serif;background:#f0f9ff;color:#0f172a;margin:0;padding:16px}}
@media(prefers-color-scheme:dark){{body{{background:#0b1220;color:#e2e8f0}}.card{{background:#1e293b!important}}}}
h1{{font-size:20px}}h2{{font-size:16px;margin:24px 0 8px;border-left:5px solid #0ea5e9;padding-left:8px}}
.lead{{font-size:14px;color:#64748b;line-height:1.6}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}}
.card{{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px #0002;margin:0}}
.card img{{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#e2e8f0}}
figcaption{{padding:8px 10px;font-size:13px;line-height:1.5}}
.s{{color:#64748b;font-size:12px}}
</style></head><body>
<h1>📷 小小攝影師 · MVP 素材抽查（{total} 張）</h1>
<p class="lead">這是四堂課要用的教材照片，都來自 Pexels 免費圖庫、已保留作者與授權資訊。<br>
請掃一眼有沒有不適合小朋友、或你不喜歡的：<b>要換掉哪張，跟我說編號（px-xxxxx）即可。</b></p>
{"".join(sections)}
<p class="lead" style="margin-top:32px">— 覺得都 OK 的話，回我「圖都可以」，我就進下一步做互動元件。</p>
</body></html>'''
    out = WORK / "review-gallery.html"
    out.write_text(html, encoding="utf-8")
    print(f"圖廊 -> {out}（自包含，{total} 張）")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheets")
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--maskcheck", action="store_true")
    ap.add_argument("--finalize", action="store_true")
    ap.add_argument("--gallery", action="store_true")
    args = ap.parse_args()
    if args.sheets:
        concepts = ([d.name for d in WORK.iterdir() if d.is_dir() and not d.name.startswith("_")]
                    if args.sheets == "all" else [args.sheets])
        for c in concepts:
            make_sheets(c)
    if args.overlay:
        make_overlays()
    if args.maskcheck:
        check_masks()
    if args.finalize:
        finalize()
    if args.gallery:
        make_gallery()
    if not any([args.sheets, args.overlay, args.maskcheck, args.finalize, args.gallery]):
        ap.print_help()


if __name__ == "__main__":
    main()
