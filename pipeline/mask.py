#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""主體去背（rembg）——產生模擬器用主體圖層

用法：
  python mask.py px-123 px-456 ...   指定圖片 id
  python mask.py --all-marked        處理所有 annotations 中有 "mask" 欄位的圖

輸出：content/masks/<id>-mask.png（透明背景主體層，尺寸與 content/photos 同）
需先安裝：pip install rembg onnxruntime（首次執行會下載約 170MB 模型）
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT.parent / "content"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--all-marked", action="store_true")
    args = ap.parse_args()

    try:
        from rembg import remove  # noqa: 延遲載入，避免未安裝時整支掛掉
    except ImportError:
        sys.exit("需先安裝：pipeline\\.venv\\Scripts\\pip install rembg onnxruntime")

    ids = list(args.ids)
    if args.all_marked:
        for ann_path in sorted((CONTENT / "annotations").glob("*.json")):
            ann = json.loads(ann_path.read_text(encoding="utf-8-sig"))
            if ann.get("usable") and ann.get("mask"):
                ids.append(ann["photo"])
    if not ids:
        ap.print_help()
        return

    out_dir = CONTENT / "masks"
    out_dir.mkdir(parents=True, exist_ok=True)
    for pid in dict.fromkeys(ids):  # 去重保序
        src = CONTENT / "photos" / f"{pid}.jpg"
        if not src.exists():
            print(f"! 找不到 {src}（先跑 fetch.py --refetch-approved）")
            continue
        dst = out_dir / f"{pid}-mask.png"
        print(f"去背 {pid} ...")
        dst.write_bytes(remove(src.read_bytes()))
    print("完成")


if __name__ == "__main__":
    main()
