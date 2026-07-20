#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""候選圖去重（dHash 感知雜湊，純 Pillow 實作，不需 imagehash/scipy）

用法：python dedup.py [--threshold 6]
掃描 work/<concept>/*.jpg，近似圖移到 work/<concept>/_dupes/（保留檔案較大者）。
"""
import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
WORK = ROOT / "work"


def dhash(path: Path, size: int = 8) -> int:
    with Image.open(path) as im:
        g = im.convert("L").resize((size + 1, size), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for r in range(size):
        for c in range(size):
            bits = (bits << 1) | (1 if px[r * (size + 1) + c] > px[r * (size + 1) + c + 1] else 0)
    return bits


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def dedup_dir(d: Path, threshold: int) -> tuple[int, int]:
    imgs = sorted(d.glob("px-*.jpg"), key=lambda p: p.stat().st_size, reverse=True)
    kept: list[tuple[Path, int]] = []
    dupes: list[Path] = []
    for p in imgs:
        try:
            h = dhash(p)
        except Exception as e:
            print(f"  ! 無法讀 {p.name}: {e}")
            continue
        if any(hamming(h, kh) <= threshold for _, kh in kept):
            dupes.append(p)
        else:
            kept.append((p, h))
    if dupes:
        dupe_dir = d / "_dupes"
        dupe_dir.mkdir(exist_ok=True)
        for p in dupes:
            p.rename(dupe_dir / p.name)
    return len(kept), len(dupes)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--threshold", type=int, default=6)
    args = ap.parse_args()
    for d in sorted(WORK.iterdir()):
        if d.is_dir() and not d.name.startswith("_"):
            kept, moved = dedup_dir(d, args.threshold)
            print(f"[{d.name}] 保留 {kept} 張，移除近似 {moved} 張")


if __name__ == "__main__":
    main()
