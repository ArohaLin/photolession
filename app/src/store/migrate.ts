import { remapWorkLessons } from './works'

/**
 * 2026-07 課號重編（四軌化）一次性遷移：
 * 舊 光的實驗室 A1–A6 → B1–B6；舊 構圖教室 B1–B8 → C1–C8。
 * 把 localStorage 進度與 IndexedDB 作品的課號換成新代號，星星不遺失。
 */
export const ID_MAP: Record<string, string> = {
  A1: 'B1', A2: 'B2', A3: 'B3', A4: 'B4', A5: 'B5', A6: 'B6',
  B1: 'C1', B2: 'C2', B3: 'C3', B4: 'C4', B5: 'C5', B6: 'C6', B7: 'C7', B8: 'C8',
}

const FLAG = 'slp.migrated.v2'
const PROGRESS_KEY = 'slp.progress.v1'

export function migrateLessonIds(): void {
  try {
    if (localStorage.getItem(FLAG)) return
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw) {
      const p = JSON.parse(raw) as { stars?: Record<string, number>; badges?: string[] }
      const stars: Record<string, number> = {}
      for (const [key, v] of Object.entries(p.stars ?? {})) {
        const i = key.indexOf(':')
        const lid = key.slice(0, i)
        stars[`${ID_MAP[lid] ?? lid}${key.slice(i)}`] = v
      }
      const badges = (p.badges ?? []).map((b) => ID_MAP[b] ?? b)
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ stars, badges }))
    }
    localStorage.setItem(FLAG, '1')
    void remapWorkLessons(ID_MAP).catch(() => {})
  } catch {
    /* 遷移失敗不擋 App 啟動 */
  }
}
