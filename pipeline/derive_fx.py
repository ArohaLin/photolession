# -*- coding: utf-8 -*-
"""從既有照片衍生「概念示範照」：手震糊/曝光不足/過曝/歪/雜訊/裁切。
一張來源 → 多張教學用途、彼此不同的圖，用來解決「同課不重複」。
用法：python derive_fx.py  （依 JOBS 產生，寫入 content/photos/ 並更新 photos.json）
"""
import json
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "content" / "photos"
META = ROOT / "content" / "photos.json"

def op_blur(im):      # 手震/慢快門糊掉
    return im.filter(ImageFilter.GaussianBlur(radius=max(im.size) / 220))
def op_dark(im):      # 曝光不足
    return ImageEnhance.Brightness(im).enhance(0.42)
def op_bright(im):    # 過曝
    return ImageEnhance.Brightness(im).enhance(1.7)
def op_tilt(im):      # 歪掉（轉 7 度後裁回滿版）
    r = im.rotate(-7, resample=Image.BICUBIC, expand=False)
    w, h = r.size; m = int(min(w, h) * 0.1)
    return r.crop((m, m, w - m, h - m))
def op_grain(im):     # ISO 雜訊（暗＋顆粒）
    import random
    im = ImageEnhance.Brightness(im).enhance(0.7)
    px = im.load(); w, h = im.size
    random.seed(7)
    for _ in range((w * h) // 90):
        x, y = random.randint(0, w - 1), random.randint(0, h - 1)
        v = random.randint(-45, 45)
        r, g, b = im.getpixel((x, y))
        px[x, y] = (max(0, min(255, r + v)), max(0, min(255, g + v)), max(0, min(255, b + v)))
    return im
def op_tight(im):     # 靠近/填滿（中央裁 45%）
    w, h = im.size; s = int(min(w, h) * 0.45)
    cx, cy = w // 2, int(h * 0.45)
    return im.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2))

OPS = {"blur": op_blur, "dark": op_dark, "bright": op_bright,
       "tilt": op_tilt, "grain": op_grain, "tight": op_tight}

# (來源 id, 效果, 新 id)
JOBS = [
    ("px-13062658", "blur",   "px-fx-blur-dog"),      # A4 手震
    ("px-13062658", "dark",   "px-fx-dark-dog"),      # A3 曝光不足
    ("px-16111164", "bright", "px-fx-bright-street"),  # A3 過曝
    ("px-16111164", "tilt",   "px-fx-tilt-street"),    # 歪
    ("px-16111164", "grain",  "px-fx-grain-street"),   # ISO 雜訊
]

def main():
    meta = json.loads(META.read_text(encoding="utf-8"))
    by_id = {m["id"]: m for m in meta}
    added = 0
    for src, op, out in JOBS:
        srcp = PHOTOS / f"{src}.jpg"
        if not srcp.exists():
            print("缺來源", src); continue
        im = Image.open(srcp).convert("RGB")
        res = OPS[op](im)
        res.save(PHOTOS / f"{out}.jpg", quality=87)
        if out not in by_id:
            meta.append({"id": out, "w": res.size[0], "h": res.size[1],
                         "source": "derived", "derived_from": src, "fx": op,
                         "license": "derived"})
            added += 1
        print("✓", out, res.size, f"(<-{src} {op})")
    META.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"新增 {added} 張，photos.json 共 {len(meta)} 張")

if __name__ == "__main__":
    main()
