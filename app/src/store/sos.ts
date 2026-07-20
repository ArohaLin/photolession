/** 小朋友求救訊息：純本機（localStorage），家長在家長區檢視與管理。不上傳。 */

export interface SosCtx {
  lessonId?: string
  lessonTitle?: string
  stepIndex?: number
  stepCount?: number
  hash?: string
  device?: string
}

export type SosStatus = 'open' | 'resolved'

export interface SosRecord {
  id: string
  at: number
  reason: string
  note?: string
  ctx?: SosCtx
  /** 處理狀態；缺省（舊資料）一律視為待處理 'open' */
  status?: SosStatus
  /** 家長回覆 */
  reply?: string
  repliedAt?: number
}

/** 待處理＝非 resolved（含缺省的舊資料） */
export function isOpen(r: SosRecord): boolean {
  return r.status !== 'resolved'
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

/** 待處理筆數（badge 用） */
export function openSosCount(): number {
  return read().filter(isOpen).length
}

/** 設定處理狀態：待處理 / 已解決 */
export function setSosStatus(id: string, status: SosStatus): void {
  write(read().map((r) => (r.id === id ? { ...r, status } : r)))
}

/** 家長回覆（空字串＝清除回覆） */
export function replySos(id: string, reply: string): void {
  const text = reply.trim()
  write(
    read().map((r) =>
      r.id === id
        ? { ...r, reply: text || undefined, repliedAt: text ? Date.now() : undefined }
        : r,
    ),
  )
}

export function clearSos(): void {
  write([])
}
