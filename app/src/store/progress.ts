/** 學習進度：純 localStorage，不上傳、不追蹤。
 * v2 改為「三區完成度」：學習（走完教學）、測驗（小考全對）、作品（有交照片）。
 * 作品區來自 IndexedDB（works store），由 UI 端把「有作品的課 id 集合」傳進來判斷。
 */

export interface Progress {
  /** 已走完教學步驟的課 id */
  learned: string[]
  /** 小考／驗收全對的課 id */
  quizzed: string[]
  /** 每課「最後停在第幾步」，下次進來續看 */
  last: Record<string, number>
  /** 每課「曾到過的最遠步數」，用來限制下一步不能超過 */
  reached: Record<string, number>
  /** 每課「已完成的教學步數」（不含作品/quest 那步） */
  learnDone: Record<string, number>
  /** 每課「教學總步數」（不含作品/quest 那步） */
  learnTotal: Record<string, number>
}

/** 進度佔比：課程 80%、測驗 10%、作品 10% */
export const WEIGHT = { learn: 80, quiz: 10, work: 10 }

export interface Sections {
  learn: boolean
  quiz: boolean
  work: boolean
}

const KEY = 'slp.progress.v2'

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<Progress>
      return {
        learned: p.learned ?? [],
        quizzed: p.quizzed ?? [],
        last: p.last ?? {},
        reached: p.reached ?? {},
        learnDone: p.learnDone ?? {},
        learnTotal: p.learnTotal ?? {},
      }
    }
  } catch {
    /* ignore */
  }
  return { learned: [], quizzed: [], last: {}, reached: {}, learnDone: {}, learnTotal: {} }
}

function write(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* 隱私模式或空間不足時靜默失敗 */
  }
}

function addOnce(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id]
}

export function getProgress(): Progress {
  return read()
}

/** 走完一課的教學步驟 */
export function markLearned(lessonId: string): void {
  const p = read()
  const next = addOnce(p.learned, lessonId)
  if (next !== p.learned) write({ ...p, learned: next })
}

/** 小考／驗收全對 */
export function markQuizPassed(lessonId: string): void {
  const p = read()
  const next = addOnce(p.quizzed, lessonId)
  if (next !== p.quizzed) write({ ...p, quizzed: next })
}

/** 記錄目前停在第幾步：更新 last，並把 reached 提高到曾到過的最遠 */
export function recordLessonStep(lessonId: string, step: number): void {
  const p = read()
  const reachedNow = Math.max(p.reached[lessonId] ?? 0, step)
  if (p.last[lessonId] === step && p.reached[lessonId] === reachedNow) return
  write({
    ...p,
    last: { ...p.last, [lessonId]: step },
    reached: { ...p.reached, [lessonId]: reachedNow },
  })
}

/** 這課上次停在第幾步（沒紀錄回 0） */
export function lessonResume(lessonId: string): number {
  return read().last[lessonId] ?? 0
}

/** 這課曾到過的最遠步數（下一步不能超過它） */
export function lessonReached(lessonId: string): number {
  return read().reached[lessonId] ?? 0
}

/** 記錄教學步數進度（done＝已完成教學步數、total＝教學總步數，皆不含作品步）。done 只增不減。 */
export function recordLearn(lessonId: string, done: number, total: number): void {
  const p = read()
  const nextDone = Math.max(p.learnDone[lessonId] ?? 0, done)
  if (p.learnDone[lessonId] === nextDone && p.learnTotal[lessonId] === total) return
  write({
    ...p,
    learnDone: { ...p.learnDone, [lessonId]: nextDone },
    learnTotal: { ...p.learnTotal, [lessonId]: total },
  })
}

export function isLearned(lessonId: string): boolean {
  return read().learned.includes(lessonId)
}

export function isQuizPassed(lessonId: string): boolean {
  return read().quizzed.includes(lessonId)
}

/** 某課三區狀態；workIds＝有作品的課 id 集合（由 IndexedDB 撈出後傳入） */
export function lessonSections(lessonId: string, workIds: Set<string>): Sections {
  const p = read()
  return {
    learn: p.learned.includes(lessonId),
    quiz: p.quizzed.includes(lessonId),
    work: workIds.has(lessonId),
  }
}

/** 課程學習部分的完成比例 0–1（已完成教學步數／教學總步數，不含作品步）。走完全部教學＝1。 */
export function learnRatio(lessonId: string): number {
  const p = read()
  if (p.learned.includes(lessonId)) return 1
  const total = p.learnTotal[lessonId] ?? 0
  if (total <= 0) return 0
  return Math.min(1, (p.learnDone[lessonId] ?? 0) / total)
}

/**
 * 加權完成度百分比：課程 80%＋測驗 10%＋作品 10%。
 * 驗收單元（assessment）沒有教學步與作品，改為「測驗全對＝100%」。
 */
export function lessonPercent(
  lessonId: string,
  workIds: Set<string>,
  assessment = false,
): number {
  const p = read()
  if (assessment) return p.quizzed.includes(lessonId) ? 100 : 0
  const learn = learnRatio(lessonId) * WEIGHT.learn
  const quiz = p.quizzed.includes(lessonId) ? WEIGHT.quiz : 0
  const work = workIds.has(lessonId) ? WEIGHT.work : 0
  return Math.round(learn + quiz + work)
}

/** 完全完成（100%） */
export function isLessonComplete(lessonId: string, workIds: Set<string>, assessment = false): boolean {
  return lessonPercent(lessonId, workIds, assessment) === 100
}

export function clearAllProgress(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
