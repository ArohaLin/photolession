import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonTitle } from '../config'
import { deleteWork, effectiveStatus, listWorks, type Work } from '../store/works'

interface Shown extends Work {
  url: string
}

const STATUS_BADGE: Record<string, { text: string; cls: string }> = {
  pending: { text: '⏳ 等家長看', cls: 'bg-amber-100 text-amber-700' },
  approved: { text: '✅ 通過', cls: 'bg-green-100 text-green-700' },
  redo: { text: '🔄 要重拍', cls: 'bg-rose-100 text-rose-600' },
}

export default function Works() {
  const [works, setWorks] = useState<Shown[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<Shown | null>(null)

  useEffect(() => {
    let urls: string[] = []
    listWorks()
      .then((list) => {
        const shown = list.map((w) => {
          const url = URL.createObjectURL(w.blob)
          urls.push(url)
          return { ...w, url }
        })
        setWorks(shown)
      })
      .finally(() => setLoading(false))
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const remove = async (id: string) => {
    await deleteWork(id)
    setWorks((ws) => ws.filter((w) => w.id !== id))
    setViewing((v) => (v?.id === id ? null : v))
  }

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 text-center text-slate-400 shadow">載入中…</div>
  }

  if (works.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow">
        <div className="text-5xl">🖼️</div>
        <h2 className="mt-3 text-xl font-black">我的作品集</h2>
        <p className="mt-2 text-slate-500">
          完成課程最後的「拍一拍」任務，拍的照片就會收藏在這裡。
        </p>
        <p className="mt-1 text-xs text-slate-400">🔒 只存在這台裝置上，不會上傳。</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-sky-500 px-6 py-3 font-bold text-white"
        >
          去上課
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-black">🖼️ 我的作品集</h2>
      <p className="mb-4 text-xs text-slate-400">
        🔒 這些照片只存在這台裝置上，不會上傳到網路。點照片可以看大圖。
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {works.map((w) => (
          <figure key={w.id} className="overflow-hidden rounded-2xl bg-white shadow">
            <button
              type="button"
              onClick={() => setViewing(w)}
              className="relative block w-full active:scale-[0.98]"
              aria-label="看大圖"
            >
              <img src={w.url} alt="" className="aspect-square w-full object-cover" />
              {(() => {
                const b = STATUS_BADGE[effectiveStatus(w)]
                return (
                  <span
                    className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-black shadow ${b.cls}`}
                  >
                    {b.text}
                  </span>
                )
              })()}
            </button>
            <figcaption className="flex items-center justify-between px-3 py-2">
              <span className="truncate text-xs font-bold text-slate-500">
                {lessonTitle(w.lessonId) || w.lessonId}
              </span>
              <button
                type="button"
                onClick={() => remove(w.id)}
                aria-label="刪除"
                className="shrink-0 text-lg text-rose-400 active:scale-90"
              >
                🗑️
              </button>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* 全螢幕燈箱：看原圖 */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={() => setViewing(null)}
        >
          <div className="p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="truncate font-bold">
                {lessonTitle(viewing.lessonId) || viewing.lessonId}
              </span>
              <button
                type="button"
                onClick={() => setViewing(null)}
                aria-label="關閉"
                className="text-3xl leading-none active:scale-90"
              >
                ×
              </button>
            </div>
            {viewing.purpose && (
              <p
                className="mt-1 rounded-xl bg-white/15 p-2 text-sm leading-relaxed text-white/90"
                onClick={(e) => e.stopPropagation()}
              >
                📋 任務：{viewing.purpose}
              </p>
            )}
            {viewing.reviewNote && effectiveStatus(viewing) === 'redo' && (
              <p
                className="mt-1 rounded-xl bg-rose-500/30 p-2 text-sm leading-relaxed text-white"
                onClick={(e) => e.stopPropagation()}
              >
                🔄 家長說：{viewing.reviewNote}
              </p>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
            <img
              src={viewing.url}
              alt=""
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex justify-center p-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                void remove(viewing.id)
              }}
              className="min-h-12 rounded-full bg-rose-500/90 px-6 py-3 font-bold text-white active:scale-95"
            >
              🗑️ 刪除這張
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
