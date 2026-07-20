#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批次四審圖標註：QA 修復用 8 張入庫（來源＝落選池，評測員推薦＋主控覆核）。

px-7794427 磁磚紅格為 tap 目標，bbox 需 overlay 自檢校正。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ANN = ROOT.parent / "content" / "annotations"

# pid -> (concepts, teachability, label, bbox, kid_prompt, note)
CURATION = {
    "px-7794427": (["C11"], 9, "紅磚搗蛋鬼", [0.603, 0.590, 0.090, 0.120],
                   "整片一樣的磁磚裡，只有一塊紅色的！",
                   "C11 破格最純示範：磁磚陣＋唯一紅格（bbox 待 overlay 校正）。"),
    "px-14455168": (["C6"], 8, "長廊盡頭走路的人", [0.42, 0.45, 0.16, 0.30],
                    "長廊的線一路把眼睛帶到走路的人身上。",
                    "C6 結構性補圖：全庫唯一「線指向人物」示範。"),
    "px-19595725": (["B1"], 8, "滑板車小孩剪影", [0.30, 0.30, 0.40, 0.50],
                    "背對夕陽，小朋友變成黑黑的剪影。",
                    "B1 測驗新剪影（換掉與示範重複的照片）。"),
    "px-32697461": (["D2"], 9, "躍起接球的狗", [0.30, 0.15, 0.40, 0.60],
                    "狗狗跳得好高接球——連拍才抓得到！",
                    "D2 連拍挑格素材（與 A6 區隔）。"),
    "px-156141": (["D1"], 8, "髮絲光少女", [0.25, 0.15, 0.50, 0.70],
                  "傍晚背對太陽，頭髮邊邊會發金光。",
                  "D1 適齡髮絲光示範（替換成人時尚照）。"),
    "px-7929549": (["D6"], 8, "樹幹上的兩個小玩偶", [0.35, 0.40, 0.30, 0.25],
                   "主角好小好遠，要用腳走近一點！",
                   "D6 tiny 病例：主角天然又小又遠，effect none。"),
    "px-5710796": (["D3"], 8, "鬆餅俯拍", [0.15, 0.15, 0.70, 0.70],
                   "從正上方拍，早餐變成一幅畫。",
                   "D3 俯拍新題組。"),
    "px-31251571": (["D3"], 8, "千層蛋糕 45 度", [0.25, 0.25, 0.50, 0.50],
                    "45 度拍才看得到一層一層的側面！",
                    "D3 45° 新題組（層次＝考點）。"),
}

REMAP = {}


def main() -> None:
    ANN.mkdir(parents=True, exist_ok=True)
    n = 0
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
        n += 1
    print(f"批次四標註完成：寫入 {n} 筆 annotations")


if __name__ == "__main__":
    main()
