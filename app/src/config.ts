export const APP_NAME = '小小攝影師'

export interface LessonInfo {
  id: string
  /** 主標（術語，2–4 字） */
  term: string
  /** 副標（白話） */
  sub: string
}

export interface TrackInfo {
  id: 'A' | 'B' | 'C' | 'D'
  /** 章節序號，如「（一）」 */
  ordinal: string
  /** 大章節主標（術語） */
  term: string
  /** 大章節副標 */
  sub: string
  icon: string
  lessons: LessonInfo[]
  /** 大章驗收單元 */
  assessment: LessonInfo
}

export const TRACKS: TrackInfo[] = [
  {
    id: 'A',
    ordinal: '(A)',
    term: '操作',
    sub: '先學會手上的相機',
    icon: '🤳',
    lessons: [
      { id: 'A1', term: '相機介面', sub: '認識你的相機' },
      { id: 'A2', term: '對焦', sub: '點一下的魔法' },
      { id: 'A3', term: '曝光補償', sub: '小太陽調亮度' },
      { id: 'A4', term: '防手震', sub: '拿穩不晃' },
      { id: 'A5', term: '變焦', sub: '鏡頭的遠近' },
      { id: 'A6', term: '配件', sub: '相機小道具' },
    ],
    assessment: { id: 'AX', term: '驗收', sub: '相機操作綜合關' },
  },
  {
    id: 'B',
    ordinal: '(B)',
    term: '曝光',
    sub: '光和相機怎麼工作',
    icon: '💡',
    lessons: [
      { id: 'B1', term: '光線', sub: '照片的顏料' },
      { id: 'B2', term: '光圈', sub: '背景模糊的祕密' },
      { id: 'B3', term: '快門', sub: '時間的開關' },
      { id: 'B4', term: 'ISO', sub: '感光度高低' },
      { id: 'B5', term: '曝光三角', sub: '三兄弟合作' },
      { id: 'B6', term: '計算攝影', sub: '手機的祕密武器' },
      { id: 'B7', term: '窗光', sub: '窗邊的柔光' },
      { id: 'B8', term: '色溫', sub: '天氣與時間的光' },
      { id: 'B9', term: '弱光', sub: '晚上與室內' },
    ],
    assessment: { id: 'BX', term: '驗收', sub: '光線曝光綜合關' },
  },
  {
    id: 'C',
    ordinal: '(C)',
    term: '構圖',
    sub: '選出好看的畫面',
    icon: '🎯',
    lessons: [
      { id: 'C1', term: '主體', sub: '誰是主角' },
      { id: 'C2', term: '填滿畫面', sub: '靠近一點' },
      { id: 'C3', term: '淨化背景', sub: '邊邊乾淨' },
      { id: 'C4', term: '直幅橫幅', sub: '直的還是橫的' },
      { id: 'C5', term: '三分法', sub: '井字魔法' },
      { id: 'C6', term: '引導線', sub: '帶著眼睛走' },
      { id: 'C7', term: '框景', sub: '框中框' },
      { id: 'C8', term: '留白', sub: '呼吸空間' },
      { id: 'C9', term: '視角', sub: '蹲下爬高' },
      { id: 'C10', term: '對稱', sub: '置中與平衡' },
      { id: 'C11', term: '重複與破格', sub: '圖案與搗蛋鬼' },
      { id: 'C12', term: '色彩', sub: '顏色的魔法' },
    ],
    assessment: { id: 'CX', term: '驗收', sub: '構圖綜合關' },
  },
  {
    id: 'D',
    ordinal: '(D)',
    term: '實戰',
    sub: '把學到的拿去拍真的',
    icon: '🎒',
    lessons: [
      { id: 'D1', term: '人像', sub: '自然最好看' },
      { id: 'D2', term: '抓拍', sub: '小孩與寵物' },
      { id: 'D3', term: '靜物', sub: '食物與玩具' },
      { id: 'D4', term: '旅拍', sub: '出去玩怎麼拍' },
      { id: 'D5', term: '風景', sub: '天空與遠景' },
      { id: 'D6', term: '診斷', sub: '照片醫生' },
    ],
    assessment: { id: 'DX', term: '驗收', sub: '實戰綜合關' },
  },
]

/** 已上線可玩的課程（其餘顯示鎖頭）。驗收單元逐一開放。 */
export const READY_LESSONS = new Set([
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'AX',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'BX',
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'CX',
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'DX',
])

const LESSON_INDEX: Record<string, LessonInfo> = {}
for (const t of TRACKS) {
  for (const l of t.lessons) LESSON_INDEX[l.id] = l
  LESSON_INDEX[t.assessment.id] = t.assessment
}

export function findLesson(id: string | undefined): LessonInfo | undefined {
  return id ? LESSON_INDEX[id] : undefined
}

/** 是否為大章驗收單元（AX/BX/CX/DX） */
export function isAssessment(id: string | undefined): boolean {
  return !!id && TRACKS.some((t) => t.assessment.id === id)
}

/** 完整標題「術語 — 副標」；找不到回空字串 */
export function lessonTitle(id: string | undefined): string {
  const l = findLesson(id)
  return l ? `${l.term} — ${l.sub}` : ''
}

export function lessonTerm(id: string | undefined): string {
  return findLesson(id)?.term ?? ''
}

export function lessonSub(id: string | undefined): string {
  return findLesson(id)?.sub ?? ''
}

/** 某課所屬大章節 */
export function trackOf(id: string | undefined): TrackInfo | undefined {
  if (!id) return undefined
  return TRACKS.find(
    (t) => t.assessment.id === id || t.lessons.some((l) => l.id === id),
  )
}
