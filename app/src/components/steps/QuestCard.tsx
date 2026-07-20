import { useCallback, useEffect, useRef, useState } from 'react'
import { SayBar } from '../SayBar'
import { Media } from '../ConceptArt'
import { RichInline } from '../../ui/RichText'
import { addWork, deleteWork, effectiveStatus, listWorks, type Work } from '../../store/works'
import type { StepProps } from './types'

interface Shown extends Work {
  url: string
}

const STATUS_BADGE: Record<string, { text: string; cls: string }> = {
  pending: { text: '⏳ 等家長看', cls: 'bg-amber-100 text-amber-700' },
  approved: { text: '✅ 通過', cls: 'bg-green-100 text-green-700' },
  redo: { text: '🔄 要重拍', cls: 'bg-rose-100 text-rose-600' },
}

/** 拍一拍任務卡：出任務、拍照存到本機作品集、勾選檢查表。
 * 已拍的照片（含之前拍的）會顯示在這裡，可刪除；有目標張數時顯示已拍/還需。 */
export function QuestCard({ step, onDone, lessonId }: StepProps) {
  const checklist = step.checklist ?? []
  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => false))
  const [saved, setSaved] = useState<Shown[]>([])
  const [saving, setSaving] = useState(false)
  const urlsRef = useRef<string[]>([])

  const reload = useCallback(async () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = []
    const all = await listWorks()
    const mine = all
      .filter((w) => w.lessonId === lessonId)
      .map((w) => {
        const url = URL.createObjectURL(w.blob)
        urlsRef.current.push(url)
        return { ...w, url }
      })
    setSaved(mine)
  }, [lessonId])

  useEffect(() => {
    void reload()
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      urlsRef.current = []
    }
  }, [reload])

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setSaving(true)
    try {
      const done = checklist.filter((_, i) => checked[i])
      // 從相簿可一次選多張；拍照一次一張
      for (const file of files) await addWork(lessonId, file, done, step.card)
      await reload()
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('確定刪除這張照片？')) return
    await deleteWork(id)
    await reload()
  }

  const toggle = (i: number) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))

  const target = step.shots ?? 0
  const taken = saved.length
  const left = Math.max(0, target - taken)

  return (
    <div>
      <SayBar text={step.say} />

      <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-orange-100 p-5 shadow-inner">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-lg font-black text-orange-700">
            <span className="text-2xl">📸</span> 拍一拍任務
          </div>
          {target > 0 && (
            <span className="shrink-0 rounded-full bg-white/80 px-3 py-1 text-sm font-black text-orange-700">
              目標 {target} 張
            </span>
          )}
        </div>
        <p className="mt-2 text-base font-medium leading-relaxed text-slate-700">
          <RichInline text={step.card} />
        </p>
        {(step.art || step.photo) && <Media art={step.art} photo={step.photo} className="mt-3" />}
      </div>

      {checklist.length > 0 && (
        <ul className="mt-4 space-y-2">
          {checklist.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition active:scale-[0.98] ${
                  checked[i]
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="text-xl">{checked[i] ? '✅' : '⬜'}</span>
                <span><RichInline text={item} /></span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 拍照 / 選照片：都存到本機。相機直接拍；相簿可一次選多張 */}
      <div className="mt-4">
        {saving ? (
          <div className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-lg font-black text-white shadow-lg">
            收藏中…
          </div>
        ) : (
          <div className="flex gap-3">
            <label className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-base font-black text-white shadow-lg active:scale-95">
              📷 拍照
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFile}
                className="hidden"
              />
            </label>
            <label className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-violet-500 px-4 py-3 text-base font-black text-white shadow-lg active:scale-95">
              🖼️ 選照片
              <input type="file" accept="image/*" multiple onChange={onFile} className="hidden" />
            </label>
          </div>
        )}
        <p className="mt-2 text-center text-xs text-slate-400">
          🔒 照片只會存在這台裝置，不會上傳到網路。
        </p>
      </div>

      {/* 已拍的照片（含之前拍的），可刪除 */}
      {(taken > 0 || target > 0) && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-black text-slate-600">
            {target > 0 ? (
              left > 0 ? (
                <>
                  📷 已拍 <span className="text-sky-600">{taken}</span> / {target} 張，還差{' '}
                  <span className="text-orange-600">{left}</span> 張！
                </>
              ) : (
                <>🎉 已拍 {taken} / {target} 張，目標達成！</>
              )
            ) : (
              <>📷 這一課已拍 {taken} 張</>
            )}
          </p>
          {taken > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {saved.map((w) => {
                const b = STATUS_BADGE[effectiveStatus(w)]
                return (
                  <figure key={w.id} className="relative">
                    <img src={w.url} alt="" className="aspect-square w-full rounded-xl object-cover shadow" />
                    <span
                      className={`absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[0.65rem] font-black shadow ${b.cls}`}
                    >
                      {b.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => void remove(w.id)}
                      aria-label="刪除這張"
                      className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-base text-white shadow-lg active:scale-90"
                    >
                      ✕
                    </button>
                  </figure>
                )
              })}
            </div>
          )}
          {taken > 0 && (
            <p className="mt-2 rounded-xl bg-amber-50 p-2 text-center text-sm font-bold text-amber-700">
              ⏳ 照片等家長按「通過」後，這一課的 📸 作品才會點亮喔！
            </p>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        {(() => {
          // 完課門檻（A-O6）：檢查清單要全勾（照片仍為選拍——尊重隱私與情境）
          const allChecked = checklist.length === 0 || checked.every(Boolean)
          return (
            <>
              <button
                type="button"
                onClick={() => onDone(3)}
                disabled={!allChecked}
                className={`min-h-12 rounded-full px-10 py-3 text-lg font-black text-white shadow-lg active:scale-95 ${
                  allChecked ? 'bg-green-500' : 'bg-slate-300'
                }`}
              >
                🏅 完成這一課！
              </button>
              {!allChecked && (
                <p className="mt-2 text-sm font-bold text-amber-600">
                  ☝️ 做完之後，把上面的檢查清單都勾一勾，才能領獎章喔！
                </p>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}
