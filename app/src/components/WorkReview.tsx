import { useEffect, useState } from 'react'
import { lessonTitle } from '../config'
import type { Work } from '../store/works'

/** 家長端單張作品審核卡：看大圖 → 通過 / 請重拍（可留言） */
export function WorkReview({
  work,
  onApprove,
  onRedo,
}: {
  work: Work
  onApprove: () => void
  onRedo: (note?: string) => void
}) {
  const [url, setUrl] = useState('')
  const [redoing, setRedoing] = useState(false)
  const [note, setNote] = useState('')
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    const u = URL.createObjectURL(work.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [work.blob])

  return (
    <div className="rounded-2xl border-2 border-slate-100 p-3">
      <div className="flex gap-3">
        <button type="button" onClick={() => setZoom(true)} className="shrink-0 active:scale-95">
          {url && <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-700">
            {lessonTitle(work.lessonId) || work.lessonId}
          </p>
          {work.purpose && (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">📋 {work.purpose}</p>
          )}
        </div>
      </div>

      {redoing ? (
        <div className="mt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="想跟小朋友說什麼？（例：背景有點亂，換個角度再拍一張！）可留白"
            className="w-full rounded-xl border-2 border-slate-200 p-2 text-sm outline-none focus:border-amber-400"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onRedo(note.trim() || undefined)}
              className="min-h-10 flex-1 rounded-full bg-amber-500 px-4 font-bold text-white active:scale-95"
            >
              送出「請重拍」
            </button>
            <button
              type="button"
              onClick={() => setRedoing(false)}
              className="min-h-10 rounded-full bg-slate-100 px-4 font-bold text-slate-500 active:scale-95"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="min-h-10 flex-1 rounded-full bg-green-500 px-4 font-black text-white active:scale-95"
          >
            ✅ 通過
          </button>
          <button
            type="button"
            onClick={() => setRedoing(true)}
            className="min-h-10 flex-1 rounded-full bg-amber-100 px-4 font-bold text-amber-700 active:scale-95"
          >
            🔄 請重拍
          </button>
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3"
          onClick={() => setZoom(false)}
        >
          <img src={url} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  )
}
