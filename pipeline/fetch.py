#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pexels 候選圖抓取（PhotoLession 素材管線）

用法：
  python fetch.py --concept A1          抓單一主題候選（large 940px 審圖版）
  python fetch.py --concept all         抓全部主題
  python fetch.py --refetch-approved    依 content/annotations 重抓核准圖的原始解析度
"""
import argparse
import json
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent
WORK = ROOT / "work"
CONTENT = ROOT.parent / "content"
TZ = timezone(timedelta(hours=8))
API = "https://api.pexels.com/v1/search"
PER_PAGE = 12  # 每組關鍵字取前 N 張

# 各課程主題的搜尋關鍵字（由 Claude 依課程概念客製）
# ⚠️ 2026-07 課號重編（四軌化）後，這裡的 key 是「素材批次名」＝舊課號，
#    對應 pipeline/work/ 既有資料夾，勿改名。新舊對照：
#    舊 A1→新 B1、A2→B2、A6→B6；舊 B12（B1+B2 池）→新 C1/C2；
#    舊 B3→C3、B4→C4、B6→C6、B7→C7、B8→C8。新批次請直接用新課號命名。
QUERIES: dict[str, list[str]] = {
    # A1 光是照片的顏料：順光／側光／逆光、黃金時刻、剪影、長影子
    "A1": [
        "golden hour park people",
        "backlit silhouette sunset",
        "side window light portrait",
        "long shadows afternoon street",
        "cat window light",
        "silhouette child playing sunset",
    ],
    # A2 光圈與景深：主體清楚可去背（模擬用，背景要清晰有距離感）＋少量真實淺景深（示範用）
    "A2": [
        "dog sitting park path",
        "toy dinosaur on table",
        "child standing park",
        "bird on fence garden",
        "portrait bokeh outdoor",
        "dog portrait blurry background",
    ],
    # B1+B2 共用池：主角明確的日常場景＋少量「太亂找不到主角」反例
    "B12": [
        "dog in park grass",
        "cat on sofa home",
        "kid playing playground",
        "red bicycle street",
        "duck in pond",
        "teddy bear picnic",
        "busy flea market stalls",
        "messy kids room toys",
    ],
    # B3 邊邊乾淨：主角清楚但邊緣有路人/雜物搶鏡
    "B3": [
        "child portrait tourists background",
        "dog park crowd behind",
        "kid playground people background",
    ],
    # B4 直的橫的：適合直幅的高主體＋適合橫幅的寬場景
    "B4": [
        "tall lighthouse blue sky",
        "giraffe full body standing",
        "wide mountain lake panorama",
        "long empty beach horizon",
    ],
    # B6 神奇引導線：道路/棧道/鐵軌/棧橋把視線帶向遠方
    "B6": [
        "empty road vanishing point",
        "wooden boardwalk path nature",
        "railway tracks perspective",
        "long pier over sea",
    ],
    # B7 框中框：門/窗/拱門/樹枝形成天然畫框
    "B7": [
        "view through stone arch",
        "window frame looking out",
        "framed by tree branches",
        "tunnel light at the end",
    ],
    # B8 呼吸空間：主角朝一個方向看/走，前方留白
    "B8": [
        "child profile looking side",
        "dog running across field",
        "person walking away path",
        "car on empty road side view",
    ],
    # A6 手機祕密武器：人像散景、夜景燈光（示範手機魔法）
    "A6": [
        "city night lights bokeh",
        "portrait blurred city lights",
    ],
    # ═══ 以下為 2026-07 擴充批（新課號命名）═══
    # B7 窗邊的光
    "B7": [
        "cat sitting by window light indoor",
        "window light portrait indoor soft",
        "silhouette against bright window indoor",
    ],
    # B8 天氣與時間的光
    "B8": [
        "harsh midday sun hard shadows street",
        "overcast cloudy day soft light park",
        "blue hour twilight city skyline",
    ],
    # B9 晚上與室內
    "B9": [
        "night market street food lights",
        "city street at night neon signs",
        "cozy dim room warm lamp light",
    ],
    # C9 視角高低（蟲視/鳥瞰/同高）
    "C9": [
        "looking up tall trees from below",
        "skyscrapers looking up low angle",
        "top view flat lay breakfast table",
        "aerial top down beach umbrellas",
        "dog portrait eye level grass",
    ],
    # C10 置中對稱留白
    "C10": [
        "mountain reflection lake symmetry",
        "building symmetrical facade architecture",
        "minimalist lone tree open field",
        "minimal object empty background sky",
    ],
    # C11 圖案與破格
    "C11": [
        "colorful umbrellas pattern sky",
        "red umbrella among black umbrellas",
        "pattern tiles colorful wall",
        "row identical colorful doors",
    ],
    # C12 色彩對比
    "C12": [
        "red coat green forest",
        "orange blue complementary colors",
        "yellow monochrome still life",
        "colorful wall portrait contrast",
    ],
    # D1 拍人自然
    "D1": [
        "children laughing candid playing",
        "formal family portrait posed",
        "backlit golden hour portrait",
    ],
    # D2 孩子與寵物
    "D2": [
        "dog jumping catching ball action",
        "cat nose close up whiskers",
        "children blowing bubbles playing",
    ],
    # D3 食物與玩具
    "D3": [
        "breakfast flat lay top down",
        "cake dessert on table cafe",
        "toy figurines scene outdoors",
    ],
    # D4 出去玩（大景可裁三層＋錯位）
    "D4": [
        "beach wide scene people umbrellas",
        "forced perspective pinching sun",
        "town square travel wide view",
    ],
    # D5 風景前景層次
    "D5": [
        "wildflowers foreground mountain landscape",
        "lake rocks foreground sunset",
        "path fence landscape depth",
    ],
    # ═══ 批次五：QA 延後項補圖 ═══
    # B3 真實快門照（絲綢瀑布／車軌光軌）
    "B3X": [
        "silky waterfall long exposure",
        "light trails cars night long exposure road",
    ],
    # B1 純順光（光打在臉上、攝影師背對光）
    "B1F": [
        "front lit child face sunlight park",
        "portrait sunlight on face bright day",
    ],
    # B8 色溫滑桿中性白日底圖
    "B8N": [
        "green meadow blue sky sunny day landscape",
        "neutral daylight countryside field",
    ],
    # === 去重補充：C/D 軌真實照片 ===
    "DEDUP_PORTRAIT": ["candid child laughing natural light", "kid portrait outdoor golden hour", "child looking away window light"],
    "DEDUP_PET": ["dog running action shot", "cat close up whiskers", "child playing with puppy park"],
    "DEDUP_FOOD": ["ice cream cone kid hand", "birthday cake table window light", "healthy breakfast flatlay top view"],
    "DEDUP_TRAVEL": ["train ticket flatlay travel", "street sign landmark travel", "kid backpack travel wide landscape"],
    "DEDUP_LANDSCAPE": ["mountain lake foreground flowers", "sunset silhouette person beach", "wide open field big sky"],
    "DEDUP_LEADLINE": ["road leading lines vanishing point", "staircase leading lines architecture", "bridge railing perspective lines"],
    "DEDUP_FRAME": ["framing archway person doorway", "window frame portrait", "tree branches framing subject"],
    "DEDUP_SYMMETRY": ["symmetrical reflection lake mountain", "symmetrical architecture building center", "puddle reflection city symmetry"],
    "DEDUP_PATTERN": ["repeating pattern colorful umbrellas", "row of colored doors pattern", "one red among green break pattern"],
    "DEDUP_COLOR": ["complementary colors red green subject", "bright colorful wall portrait", "yellow flower blue sky contrast"],
    "DEDUP_NEGSPACE": ["minimal negative space single subject sky", "lone tree large empty field", "small boat vast sea minimal"],
    "DEDUP_VIEWPOINT": ["low angle looking up child", "bird eye view top down people", "worm eye view tall tree"],
}


def load_key() -> str:
    env = ROOT / ".env"
    if not env.exists():
        sys.exit("缺 pipeline/.env（內容：PEXELS_API_KEY=...）")
    for line in env.read_text(encoding="utf-8-sig").splitlines():
        if line.strip().startswith("PEXELS_API_KEY="):
            key = line.split("=", 1)[1].strip()
            if key:
                return key
    sys.exit("pipeline/.env 內沒有 PEXELS_API_KEY")


def read_meta(path: Path) -> list[dict]:
    if not path.exists():
        return []
    out = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return out


def fetch_concept(client: httpx.Client, key: str, concept: str) -> None:
    outdir = WORK / concept
    outdir.mkdir(parents=True, exist_ok=True)
    meta_path = outdir / "meta.jsonl"
    seen = {rec["id"] for rec in read_meta(meta_path)}
    n_new = 0
    with meta_path.open("a", encoding="utf-8") as meta:
        for q in QUERIES[concept]:
            try:
                r = client.get(API, params={"query": q, "per_page": PER_PAGE},
                               headers={"Authorization": key}, timeout=30)
                r.raise_for_status()
                photos = r.json().get("photos", [])
            except Exception as e:
                print(f"[{concept}] 搜尋失敗 '{q}': {e}")
                continue
            print(f"[{concept}] '{q}' -> {len(photos)} 張")
            for p in photos:
                pid = f"px-{p['id']}"
                if pid in seen:
                    continue
                seen.add(pid)
                img_path = outdir / f"{pid}.jpg"
                try:
                    data = client.get(p["src"]["large"], timeout=60).content
                    img_path.write_bytes(data)
                except Exception as e:
                    print(f"  ! 下載失敗 {pid}: {e}")
                    continue
                rec = {
                    "id": pid,
                    "source": "pexels",
                    "source_id": p["id"],
                    "author": p.get("photographer", ""),
                    "author_url": p.get("photographer_url", ""),
                    "page_url": p.get("url", ""),
                    "license": "Pexels License",
                    "query": q,
                    "downloaded_at": datetime.now(TZ).isoformat(timespec="seconds"),
                    "w": p.get("width"),
                    "h": p.get("height"),
                    "alt": p.get("alt", ""),
                    "src_original": p["src"]["original"],
                    "concept_batch": concept,
                }
                meta.write(json.dumps(rec, ensure_ascii=False) + "\n")
                n_new += 1
                time.sleep(0.12)
            time.sleep(0.3)
    print(f"[{concept}] 新增 {n_new} 張，共 {len(seen)} 張候選")


def refetch_approved(client: httpx.Client) -> None:
    """依 annotations（usable=true）下載原始解析度到 content/photos，並更新 photos.json。"""
    ann_dir = CONTENT / "annotations"
    if not ann_dir.exists():
        sys.exit("content/annotations 不存在，先完成審圖標註")
    all_meta: dict[str, dict] = {}
    for meta_path in WORK.glob("*/meta.jsonl"):
        for rec in read_meta(meta_path):
            all_meta[rec["id"]] = rec

    photos_json = CONTENT / "photos.json"
    photos: list[dict] = []
    if photos_json.exists():
        photos = json.loads(photos_json.read_text(encoding="utf-8-sig"))
    have = {p["id"] for p in photos}

    (CONTENT / "photos").mkdir(parents=True, exist_ok=True)
    n = 0
    for ann_path in sorted(ann_dir.glob("*.json")):
        ann = json.loads(ann_path.read_text(encoding="utf-8-sig"))
        if not ann.get("usable"):
            continue
        pid = ann["photo"]
        rec = all_meta.get(pid)
        if rec is None:
            print(f"! {pid} 找不到 meta（不在任何 work/*/meta.jsonl）")
            continue
        dst = CONTENT / "photos" / f"{pid}.jpg"
        if not dst.exists():
            print(f"下載原圖 {pid} ...")
            try:
                data = client.get(rec["src_original"], timeout=120).content
                dst.write_bytes(data)
                n += 1
                time.sleep(0.2)
            except Exception as e:
                print(f"  ! 失敗: {e}")
                continue
        if pid not in have:
            photos.append({k: rec[k] for k in (
                "id", "source", "source_id", "author", "author_url",
                "page_url", "license", "query", "downloaded_at", "w", "h")})
            have.add(pid)
    photos.sort(key=lambda p: p["id"])
    photos_json.write_text(json.dumps(photos, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"完成：新下載 {n} 張原圖；photos.json 共 {len(photos)} 筆")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--concept", choices=[*QUERIES.keys(), "all"])
    ap.add_argument("--refetch-approved", action="store_true")
    args = ap.parse_args()
    key = load_key()
    with httpx.Client(follow_redirects=True) as client:
        if args.refetch_approved:
            refetch_approved(client)
        elif args.concept:
            concepts = list(QUERIES) if args.concept == "all" else [args.concept]
            for c in concepts:
                fetch_concept(client, key, c)
        else:
            ap.print_help()


if __name__ == "__main__":
    main()
