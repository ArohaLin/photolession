/** 教材與課程的資料型別（對應 content/ 下的 JSON schema） */

/** [x, y, w, h]，全部是相對 0–1 座標 */
export type Rect = [number, number, number, number]

export interface Subject {
  label: string
  bbox: Rect
  /** 互動標記（如 thirds 愛心）該對準的點，0–1 相對座標；沒有就用 bbox 中心 */
  focus?: [number, number]
}

export interface Distraction {
  label: string
  bbox: Rect
}

export interface SuggestedCrop {
  concept: string
  rect: Rect
  why?: string
}

export interface Annotation {
  photo: string
  usable: boolean
  teachability?: number
  concepts?: string[]
  subject?: Subject
  distractions?: Distraction[]
  suggested_crops?: SuggestedCrop[]
  kid_prompt?: string
  curator_note?: string
  /** A2 去背遮罩檔名（存在表示可做景深模擬） */
  mask?: string
  light_type?: string
}

export interface Photo {
  id: string
  source?: string
  source_id?: number
  author?: string
  author_url?: string
  page_url?: string
  license?: string
  query?: string
  w: number
  h: number
}

export interface Feedback {
  great?: string
  good?: string
  hint1?: string
  hint2?: string
}

export interface Goal {
  say?: string
  /** 主角應占畫面比例 [下限, 上限] */
  subject_coverage?: [number, number]
  /** 太陽角度目標 [下限, 上限]，度 */
  sun_angle?: [number, number]
  /** 光圈 f 值目標 [下限, 上限] */
  aperture?: [number, number]
  /** 快門「慢度」目標 [下限, 上限]，0＝最快、1＝最慢 */
  shutter?: [number, number]
  /** 曝光值目標 [下限, 上限]，1＝剛剛好 */
  exposure?: [number, number]
}

export type StepType = 'example' | 'play' | 'sim' | 'compare' | 'quest'
export type Tool =
  | 'tap-target'
  | 'ab-choice'
  | 'viewfinder'
  | 'sun-drag'
  | 'aperture-sim'
  | 'shutter-sim'
  | 'iso-sim'
  | 'exposure-sim'
  | 'thirds'
  // A 軌 相機駕訓班
  | 'camera-tour'
  | 'tap-focus'
  | 'sun-slider'
  | 'steady'
  | 'zoom-lens'
  | 'frame-picker'
  | 'pano'
  // B/C/D 軌擴充
  | 'temp-slider'
  | 'zoom-degrade'
  | 'color-wheel'
  | 'diagnose'
export type ExampleLayout =
  | 'single'
  | 'compare'
  | 'analogy'
  | 'phone-reality'
  /** 名詞登場卡：大字名詞＋白話定義 */
  | 'term'
  /** 怎麼做步驟卡：真手機操作的編號步驟 */
  | 'howto'

export interface Step {
  type: StepType
  layout?: ExampleLayout
  tool?: Tool
  /** sim 的子模式，如 shutter-sim 的 "freeze"／"silk" */
  mode?: string
  photo?: string
  photos?: string[]
  /** 對應 photos 的裁切名稱："full" | "suggested" */
  crops?: string[]
  /** ab-choice 各選項的裁切矩形（同一張圖比較不同取景時用） */
  rects?: Rect[]
  labels?: string[]
  say?: string
  prompt?: string
  feedback?: Feedback
  goal?: Goal
  /** ab-choice 正解索引 */
  answer?: number
  why?: string
  /** compare 比較對象 */
  versus?: 'suggested' | 'self'
  /** analogy 素材代號，如 "pupil" */
  asset?: string
  /** quest 任務卡文字 */
  card?: string
  /** quest 任務需要拍幾張（顯示已拍/還需計數） */
  shots?: number
  checklist?: string[]
  /** diagnose 病例選項與藥方 */
  options?: string[]
  remedy?: string
  /** diagnose 病例加工效果：blur | dark | tiny | tilt | none */
  effect?: string
  /** viewfinder 初始框大小（0.2–0.95；D4 用 0.95 全景起步，防零互動過關） */
  start?: number
  /** term 名詞登場卡：名詞本身 */
  term?: string
  /** term 名詞登場卡：給小朋友的白話定義（支援 RichText 標記） */
  kid_def?: string
  /** howto 步驟卡：標題（如「怎麼打開格線？」） */
  title?: string
  /** howto 步驟卡：編號步驟，每步一句（支援 RichText 標記） */
  howto?: string[]
  /** howto 步驟卡：擬真 iPhone 示意圖代號（settings-grid｜portrait-mode｜natural-light｜ae-af-lock） */
  mock?: string
  /** 概念示意圖代號（ConceptArt）——可用在任何教學/任務頁補圖 */
  art?: string
}

/** 課後小考／驗收題 */
export interface QuizQuestion {
  /** 題型：choice＝單/複選（預設）。order／match 供大章驗收擴充 */
  kind?: 'choice' | 'order' | 'match'
  q: string
  options: string[]
  /** 單選＝number；複選＝number[]（choice）。order＝正確排序的索引陣列 */
  answer: number | number[]
  explain?: string
  /** 配圖：概念示意圖代號（ConceptArt） */
  art?: string
  /** 配圖：真實照片 id（擇一，art 優先） */
  photo?: string
}

/** 每課的輕鬆小品（小故事／歷史／笑話／冷知識） */
export interface FunFact {
  emoji?: string
  title?: string
  body: string
  /** 顯目類別徽章：小知識｜小故事｜冷笑話｜攝影歷史 */
  kind?: '小知識' | '小故事' | '冷笑話' | '攝影歷史'
  /** 配圖：概念示意圖代號 */
  art?: string
  /** 配圖：真實照片 id */
  photo?: string
}

export interface Lesson {
  id: string
  track: 'A' | 'B' | 'C' | 'D'
  title: string
  big_idea: string
  icon: string
  steps: Step[]
  /** 課後小考（3–5 題） */
  quiz?: QuizQuestion[]
  /** 輕鬆小品 */
  funfact?: FunFact
  /** 大章驗收單元（AX/BX/CX/DX）為 true */
  assessment?: boolean
}
