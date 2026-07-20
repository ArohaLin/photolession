#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MVP 策展資料 → 產生 content/annotations/*.json

集中存放 Claude 審圖的策展判斷（選圖、bbox 標註、可教性、給家長的評語）。
執行後產生各張圖的 annotation JSON。overlay 自檢後若要修 bbox，改這裡重跑即可。

用法：python curate_mvp.py
bbox / rect 皆為 0–1 相對座標 [x, y, w, h]。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT.parent / "content"
ANN = CONTENT / "annotations"

# 每張圖的策展資料。已細看原圖精標者標 (精標)，其餘為 contact sheet 估、待 overlay 修正。
CURATION: dict[str, dict] = {
    # ═══════════ A1 光是照片的顏料（光線方向，展示用；light_type 為主）═══════════
    "px-33614191": {
        "teachability": 7, "concepts": ["A1"], "light_type": "front",
        "subject": {"label": "貓", "bbox": [0.30, 0.28, 0.45, 0.62]},
        "kid_prompt": "太陽從我們這邊照過去，貓咪的臉是不是很清楚、很亮？",
        "curator_note": "順光範例：光從相機方向照向主角，臉部明亮、顏色鮮豔。",
    },
    "px-17695167": {
        "teachability": 8, "concepts": ["A1"], "light_type": "side",
        "subject": {"label": "紅髮女孩", "bbox": [0.34, 0.16, 0.42, 0.80]},
        "kid_prompt": "光從側邊來，一半臉亮、一半臉暗，是不是很有立體感？",
        "curator_note": "側光範例：光從側面來，明暗各半，立體、有戲劇感。",
    },
    "px-12963205": {
        "teachability": 7, "concepts": ["A1"], "light_type": "side",
        "subject": {"label": "橘白貓", "bbox": [0.30, 0.40, 0.34, 0.52]},
        "kid_prompt": "窗戶的光在貓咪身上畫出一條一條的影子，好特別！",
        "curator_note": "側光＋光影：百葉窗側光在主角身上形成光影條紋。",
    },
    "px-16513358": {
        "teachability": 9, "concepts": ["A1"], "light_type": "backlight",
        "subject": {"label": "男子側臉", "bbox": [0.30, 0.14, 0.44, 0.62]},
        "kid_prompt": "太陽在他後面，人就變成黑黑的影子，這叫「剪影」。",
        "curator_note": "逆光剪影經典：夕陽在主角背後，主角變全黑輪廓。",
    },
    "px-34771338": {
        "teachability": 9, "concepts": ["A1"], "light_type": "backlight",
        "subject": {"label": "舉球的小孩", "bbox": [0.32, 0.30, 0.34, 0.60]},
        "kid_prompt": "背對太陽，小朋友也變成剪影了！你也可以這樣拍。",
        "curator_note": "逆光剪影，孩子能模仿：背對夕陽舉手，變黑色輪廓。",
    },
    "px-1291489": {
        "teachability": 8, "concepts": ["A1"], "light_type": "backlight",
        "subject": {"label": "花叢與夕陽", "bbox": [0.30, 0.30, 0.45, 0.55]},
        "kid_prompt": "傍晚的陽光暖暖的、金金的，這叫「黃金時刻」。",
        "curator_note": "黃金時刻逆光氛圍：傍晚暖光穿過花叢，光線最美的時段。",
    },
    "px-19042931": {
        "teachability": 8, "concepts": ["A1"], "light_type": "longshadow",
        "subject": {"label": "地上的長影子", "bbox": [0.30, 0.55, 0.40, 0.42]},
        "kid_prompt": "太陽低低的時候，影子會被拉得好長好長！",
        "curator_note": "長影子範例：低角度陽光把人的影子拉長，趣味構圖。",
    },

    # ═══════════ A2 光圈與景深（去背主體 + 對照組）═══════════
    "px-13062658": {
        "teachability": 9, "concepts": ["A2"], "mask": True,
        "subject": {"label": "柴犬", "bbox": [0.30, 0.18, 0.40, 0.74]},
        "kid_prompt": "小狗好清楚，後面的樹木糊糊的，主角就跳出來了！",
        "curator_note": "A2 去背主體：柴犬正面清楚、背景森林有深度，景深模擬最佳範例。",
    },
    "px-18201403": {
        "teachability": 9, "concepts": ["A2"], "mask": True,
        "subject": {"label": "牧羊犬", "bbox": [0.30, 0.34, 0.40, 0.54]},
        "kid_prompt": "小狗坐在路中間，後面的路糊掉了，眼睛只看得到牠。",
        "curator_note": "A2 去背主體：澳洲牧羊犬正面坐小徑，背景本身已虛化，示範清楚。",
    },
    "px-8014461": {
        "teachability": 8, "concepts": ["A2"], "mask": True,
        "subject": {"label": "恐龍玩具", "bbox": [0.22, 0.34, 0.54, 0.36]},
        "kid_prompt": "在家裡也可以拍！把玩具放桌上，後面放遠一點。",
        "curator_note": "A2 去背主體（玩具主題，孩子可在家模仿）：恐龍玩具、桌面乾淨。",
    },
    "px-1437146": {
        "teachability": 8, "concepts": ["A2"],
        "subject": {"label": "女孩", "bbox": [0.30, 0.14, 0.42, 0.82]},
        "kid_prompt": "看！這張的背景本來就糊糊的，主角好突出。",
        "curator_note": "A2 對照組（真實淺景深，不去背）：竹林人像，示範「大光圈」效果長怎樣。",
    },
    "px-8014601": {
        "teachability": 7, "concepts": ["A2"],
        "subject": {"label": "一排恐龍", "bbox": [0.10, 0.45, 0.80, 0.45]},
        "kid_prompt": "想要每一隻都清楚，就要用「小光圈」喔。",
        "curator_note": "A2 對照組（大景深需求）：多隻恐龍在不同距離，示範「要全部清楚」的情境。",
    },

    # ═══════════ B1 誰是主角（明確主角 + 反例）═══════════
    "px-16256623": {
        "teachability": 9, "concepts": ["B1", "B2"],
        "subject": {"label": "黑白貓", "bbox": [0.16, 0.30, 0.53, 0.50]},  # 精標
        "kid_prompt": "一眼就看到貓咪！這就是清楚的主角。",
        "curator_note": "B1 明確主角：黑白貓占畫面大、背景乾淨，一眼認出主角。",
    },
    "px-13222073": {
        "teachability": 8, "concepts": ["B1", "B6"],
        "subject": {"label": "拉繩的男孩", "bbox": [0.20, 0.08, 0.42, 0.88]},  # 精標
        "kid_prompt": "主角是這個用力拉繩子的小朋友！",
        "curator_note": "B1 明確主角（繩子日後可作 B6 引導線）：男孩占比大、表情生動。",
    },
    "px-16850890": {
        "teachability": 7, "concepts": ["B1"], "no_single_subject": True,
        "distractions": [],
        "kid_prompt": "咦，這張的主角是誰呢？好多人喔，有點難找！",
        "curator_note": "B1 反例（主角不明）：遊樂場好多小孩，沒有單一主角，示範「先決定主角」。",
    },
    "px-17296469": {
        "teachability": 7, "concepts": ["B1"], "no_single_subject": True,
        "kid_prompt": "這張好熱鬧，可是找不到一個主角對不對？",
        "curator_note": "B1 反例（太亂）：跳蚤市場人群，畫面滿滿、沒有焦點。",
    },
    "px-1745747": {
        "teachability": 6, "concepts": ["B1"], "no_single_subject": True,
        "kid_prompt": "東西太多了，眼睛不知道要看哪裡！",
        "curator_note": "B1 反例（太雜）：市集攤販商品堆滿，示範「沒有主角的照片會亂」。",
    },

    # ═══════════ B2 靠近一點（主角太小 → 靠近變大）═══════════
    "px-11792684": {
        "teachability": 9, "concepts": ["B2"],
        "subject": {"label": "小男孩", "bbox": [0.63, 0.52, 0.12, 0.44]},  # 精標
        "suggested_crops": [
            {"concept": "B2", "rect": [0.52, 0.50, 0.36, 0.45], "why": "靠近後主角約占畫面 1/3，看得清楚表情"}
        ],
        "kid_prompt": "小朋友好小喔，走近一點讓他變大！",
        "curator_note": "B2 完美 before：主角只占 5%，示範「用腳靠近」讓主角變大。",
    },
    "px-34005705": {
        "teachability": 8, "concepts": ["B2"],
        "subject": {"label": "白狗", "bbox": [0.28, 0.62, 0.25, 0.11]},  # 精標
        "suggested_crops": [
            {"concept": "B2", "rect": [0.22, 0.54, 0.40, 0.26], "why": "靠近後小狗變成明顯主角"}
        ],
        "kid_prompt": "草地好大，小狗好小，我們靠近牠一點！",
        "curator_note": "B2 before：白狗躺在大草地只占一點點，靠近後才看得清楚。",
    },
    "px-11444586": {
        "teachability": 8, "concepts": ["B1", "B2", "B3"],
        "subject": {"label": "牧羊犬", "bbox": [0.36, 0.37, 0.49, 0.38]},  # 精標
        "distractions": [
            {"label": "後面的人", "bbox": [0.50, 0.03, 0.13, 0.22]},
            {"label": "後面的狗", "bbox": [0.60, 0.13, 0.25, 0.22]},
            {"label": "左邊的狗", "bbox": [0.31, 0.15, 0.10, 0.10]},
        ],
        "suggested_crops": [
            {"concept": "B2", "rect": [0.34, 0.34, 0.44, 0.44], "why": "只框主角狗，後面的人和狗就不入鏡了"}
        ],
        "kid_prompt": "前面這隻大狗是主角，後面還有小狗和人喔。",
        "curator_note": "一圖三用：B1 主角明確、B2 可再靠近、B3 背景有干擾物（人與其他狗）。",
    },
    "px-2364296": {
        "teachability": 8, "concepts": ["B2"],
        "subject": {"label": "小狗", "bbox": [0.35, 0.36, 0.33, 0.48]},  # overlay 修正
        "suggested_crops": [
            {"concept": "B2", "rect": [0.30, 0.30, 0.44, 0.58], "why": "靠近讓吐舌頭的小狗填滿畫面"}
        ],
        "kid_prompt": "小狗趴在草地上吐舌頭，靠近拍牠開心的樣子。",
        "curator_note": "B2：傑克羅素梗趴草地、旁邊有網球，主角討喜，示範靠近。",
    },
    "px-131416": {
        "teachability": 7, "concepts": ["B1", "B2"],
        "subject": {"label": "綠頭鴨", "bbox": [0.33, 0.54, 0.26, 0.27]},  # overlay 修正（鴨在左側）
        "distractions": [
            {"label": "水面上的第二隻鴨", "bbox": [0.55, 0.47, 0.11, 0.09]}
        ],
        "suggested_crops": [
            {"concept": "B2", "rect": [0.27, 0.47, 0.40, 0.42], "why": "靠近讓前景的鴨子成為明顯主角"}
        ],
        "kid_prompt": "前面這隻漂亮的綠頭鴨是主角，靠近拍拍牠！",
        "curator_note": "B1/B2：前景綠頭鴨為主角，後方水面另有一隻鴨可作干擾對比。",
    },
}


# 2026-07 課號重編（四軌化）：CURATION 內寫的是舊課號，輸出時換成新課號。
# 舊 A1–A6（光）→ B1–B6；舊 B1–B8（構圖）→ C1–C8。
REMAP = {"A1": "B1", "A2": "B2", "A3": "B3", "A4": "B4", "A5": "B5", "A6": "B6",
         "B1": "C1", "B2": "C2", "B3": "C3", "B4": "C4",
         "B5": "C5", "B6": "C6", "B7": "C7", "B8": "C8"}


def main() -> None:
    ANN.mkdir(parents=True, exist_ok=True)
    for pid, data in CURATION.items():
        ann = {
            "photo": pid,
            "usable": True,
            "teachability": data.get("teachability", 7),
            "concepts": [REMAP.get(c, c) for c in data.get("concepts", [])],
            "safety": {"brands": False, "text": False, "risky": False},
        }
        for key in ("subject", "distractions", "lines", "suggested_crops",
                    "light_type", "no_single_subject", "kid_prompt", "curator_note"):
            if key in data:
                ann[key] = data[key]
        if data.get("mask"):
            ann["mask"] = f"{pid}-mask.png"
        (ANN / f"{pid}.json").write_text(
            json.dumps(ann, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"寫出 {len(CURATION)} 個 annotation -> {ANN}")
    # 統計
    by_concept: dict[str, int] = {}
    n_mask = 0
    for data in CURATION.values():
        if data.get("mask"):
            n_mask += 1
        for c in data.get("concepts", []):
            by_concept[c] = by_concept.get(c, 0) + 1
    print("各課程涵蓋張數：", dict(sorted(by_concept.items())))
    print(f"需去背（mask）：{n_mask} 張")


if __name__ == "__main__":
    main()
