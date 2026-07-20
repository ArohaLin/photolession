/** 小朋友求救訊息：純本機（localStorage），家長在家長區檢視與管理。不上傳。 */

export interface SosCtx {
  lessonId?: string
  lessonTitle?: string
  stepIndex?: number
  stepCount?: number
  hash?: string
  device?: string
}

export interface SosRecord {
  id: string
  at: number
  reason: string
  note?: string
  ctx?: SosCtx
}

const KEY = 'slp.sos.v1'
/** 新增/刪除時廣播，讓家長區即時更新 */
export const SOS_EVENT = 'slp:sos'

function read(): SosRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as SosRecord[]
  } catch {
    /* ignore */
  }
  return []
}

function write(list: SosRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(SOS_EVENT))
  } catch {
    /* 隱私模式或空間不足時靜默失敗 */
  }
}

/** 最新在前 */
export function listSos(): SosRecord[] {
  return read().sort((a, b) => b.at - a.at)
}

export function addSos(reason: string, note: string | undefined, ctx: SosCtx): void {
  const list = read()
  list.push({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    reason,
    note: note?.trim() || undefined,
    ctx,
  })
  write(list)
}

export function removeSos(id: string): void {
  write(read().filter((r) => r.id !== id))
}

export function clearSos(): void {
  write([])
}
