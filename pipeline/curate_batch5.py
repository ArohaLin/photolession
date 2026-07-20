#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批次五審圖標註：QA 延後項補圖 4 張（B-R3 瀑布車軌／B-Y8 順光／B-O9 色溫底圖）。"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ANN = ROOT.parent / "content" / "annotations"

CURATION = {
    "px-29509673": (["B3"], 9, "絲綢瀑布", [0.25, 0.15, 0.5, 0.7],
                    "慢快門把流水拉成柔柔的絲綢！",
                    "B3 真實慢快門示範：白天明亮版絲綢瀑布。"),
    "px-1499539": (["B3"], 9, "車燈光軌", [0.1, 0.2, 0.8, 0.6],
                   "慢快門讓車燈變成一條條光的河流！",
                   "B3 真實慢快門示範：夜間車軌長曝。"),
    "px-10214732": (["B1"], 9, "順光的笑臉", [0.15, 0.1, 0.7, 0.8],
                    "太陽從你這邊照過去，她的臉又亮又清楚！",
                    "B1 純順光示範（替換原側窗光誤標圖），兒童大笑感染力強。"),
    "px-16805319": (["B8"], 8, "白天的草原", [0.1, 0.3, 0.8, 0.6],
                    "大白天的草原，顏色最正常。",
                    "B8 TempSlider 中性底圖：綠草藍天，冷暖色罩效果最清楚。"),
}


def main() -> None:
    ANN.mkdir(parents=True, exist_ok=True)
    for pid, (concepts, teach, label, bbox, prompt, note) in CURATION.items():
        ann = {
            "photo": pid,
            "usable": True,
            "teachability": teach,
            "concepts": concepts,
            "safety": {"brands": False, "text": False, "risky": False},
            "subject": {"label": label, "bbox": [round(v, 3) for v in bbox]},
            "kid_prompt": prompt,
            "curator_note": note,
        }
        (ANN / f"{pid}.json").write_text(
            json.dumps(ann, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(f"批次五標註完成：{len(CURATION)} 筆")


if __name__ == "__main__":
    main()
