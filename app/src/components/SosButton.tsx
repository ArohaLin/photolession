import { useState } from 'react'
import { getTesterCtx } from '../store/testerContext'
import { addSos, type SosCtx } from '../store/sos'

/** 小朋友可選的求救原因 */
const REASONS = [
  { emoji: '😵', text: '太難了，看不懂' },
  { emoji: '🚧', text: '卡住了，不能繼續' },
  { emoji: '🔍', text: '找不到要點的地方' },
  { emoji: '🐛', text: '這裡怪怪的' },
  { emoji: '🙋', text: '其他（想說的事）' },
]

/** 🙋 求救鈕：全站右下角，小朋友遇到困難按一下告訴家長。訊息只存本機。 */
export function SosButton() {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [toast, setToast] = useState('')

  const close = () => {
    setOpen(false)
    setReason(null)
    setNote('')
  }

  const submit = () => {
    if (!reason) return
    const c = getTesterCtx()
    const ctx: SosCtx = {
      lessonId: c.lessonId,
      lessonTitle: c.lessonTitle,
      stepIndex: c.stepIndex,
      stepCount: c.stepCount,
      hash: c.hash,
      device: c.device,
    }
    addSos(reason, note, ctx)
    close()
    setToast('已經告訴爸爸媽媽了 👍')
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="求救"
          className="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400/80 text-3xl shadow-lg backdrop-blur active:scale-90"
        >
          🙋
        </button>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-800 px-6 py-3 text-base font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={close}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative m-3 w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xl font-black text-rose-500">🙋 我要求救</p>
              <button
                type="button"
                onClick={close}
                aria-label="關閉"
                className="text-3xl leading-none text-slate-400 active:scale-90"
              >
                ×
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-500">怎麼了嗎？選一個告訴爸媽 👇</p>

            <div className="space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r.text}
                  type="button"
                  onClick={() => setReason(r.text)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[1.05rem] font-bold transition active:scale-[0.98] ${
                    reason === r.text
                      ? 'border-rose-400 bg-rose-50 text-rose-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="flex-1">{r.text}</span>
                  {reason === r.text && <span className="text-xl">✓</span>}
                </button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="想多說一點嗎？（可以不寫）"
              className="mt-3 w-full rounded-2xl border-2 border-slate-200 p-3 text-base outline-none focus:border-rose-400"
            />

            <button
              type="button"
              onClick={submit}
              disabled={!reason}
              className={`mt-3 min-h-12 w-full rounded-full text-lg font-black text-white shadow active:scale-95 ${
                reason ? 'bg-rose-500' : 'bg-slate-300'
              }`}
            >
              送出求救 🆘
            </button>
          </div>
        </div>
      )}
    </>
  )
}
