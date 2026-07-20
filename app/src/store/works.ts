/**
 * 作品集：小朋友「拍一拍」任務的照片。
 * 只存在本機 IndexedDB，永不上傳（隱私鐵則）。
 */

export type WorkStatus = 'pending' | 'approved' | 'redo'

export interface Work {
  id: string
  lessonId: string
  blob: Blob
  takenAt: number
  checklist?: string[]
  /** 這張照片是為了什麼任務拍的（任務卡文字） */
  purpose?: string
  /** 家長審核狀態；未設定（舊資料）一律視為已通過 */
  status?: WorkStatus
  /** 家長退件/通過時的留言 */
  reviewNote?: string
}

/** 舊資料沒有 status 欄位時，視為已通過（不強迫回頭補審） */
export function effectiveStatus(w: Work): WorkStatus {
  return w.status ?? 'approved'
}

const DB = 'slp-works'
const STORE = 'works'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = fn(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
        t.oncomplete = () => db.close()
      }),
  )
}

function makeId(lessonId: string, takenAt: number): string {
  return `${lessonId}-${takenAt}-${Math.floor(takenAt % 100000)}`
}

export async function addWork(
  lessonId: string,
  blob: Blob,
  checklist?: string[],
  purpose?: string,
): Promise<Work> {
  const takenAt = Date.now()
  const work: Work = {
    id: makeId(lessonId, takenAt),
    lessonId,
    blob,
    takenAt,
    checklist,
    purpose,
    status: 'pending',
  }
  await tx('readwrite', (s) => s.put(work))
  return work
}

/** 家長審核：通過或退件（可附留言） */
export async function reviewWork(id: string, status: WorkStatus, note?: string): Promise<void> {
  const w = await tx<Work | undefined>('readonly', (s) => s.get(id) as IDBRequest<Work | undefined>)
  if (!w) return
  await tx('readwrite', (s) => s.put({ ...w, status, reviewNote: note ?? w.reviewNote }))
}

/** 有「已通過」作品的課 id 集合（作品區點亮的依據） */
export async function approvedLessonIds(): Promise<Set<string>> {
  const all = await listWorks()
  return new Set(all.filter((w) => effectiveStatus(w) === 'approved').map((w) => w.lessonId))
}

export async function listWorks(): Promise<Work[]> {
  const all = await tx<Work[]>('readonly', (s) => s.getAll() as IDBRequest<Work[]>)
  return all.sort((a, b) => b.takenAt - a.takenAt)
}

export function deleteWork(id: string): Promise<void> {
  return tx('readwrite', (s) => s.delete(id)) as unknown as Promise<void>
}

/** 課號重編一次性遷移用：把作品的 lessonId 換成新代號（見 store/migrate.ts） */
export async function remapWorkLessons(map: Record<string, string>): Promise<void> {
  const all = await tx<Work[]>('readonly', (s) => s.getAll() as IDBRequest<Work[]>)
  for (const w of all) {
    const to = map[w.lessonId]
    if (to) await tx('readwrite', (s) => s.put({ ...w, lessonId: to }))
  }
}

export function clearAllWorks(): Promise<void> {
  return tx('readwrite', (s) => s.clear()) as unknown as Promise<void>
}
