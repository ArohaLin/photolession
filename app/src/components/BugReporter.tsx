import { useEffect, useRef, useState } from 'react'
import { getTesterCtx, isTestMode, OUTBOX_KEY, PIN_KEY, TEST_MODE_EVENT } from '../store/testerContext'

async function send(text: string, ctx: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-pin': localStorage.getItem(PIN_KEY) ?? '' },
      body: JSON.stringify({ text, ctx }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** 沒送出去的回報存本機，下次開 App 補傳 */
export async function flushOutbox(): Promise<void> {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY)
    if (!raw) return
    const items: { text: string; ctx: unknown }[] = JSON.parse(raw)
    const left: typeof items = []
    for (const it of items) if (!(await send(it.text, it.ctx))) left.push(it)
    if (left.length) localStorage.setItem(OUTBOX_KEY, JSON.stringify(left))
    else localStorage.removeItem(OUTBOX_KEY)
  } catch {
    /* ignore */
  }
}

/** 🐞 驗收回報鈕：測試模式才顯示；點開→打字→送出，位置資訊全自動 */
export function BugReporter() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [toast, setToast] = useState('')
  const [enabled, setEnabled] = useState(isTestMode)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) window.setTimeout(() => taRef.current?.focus(), 60)
  }, [open])

  // 家長區切開關時即時反應（不必重新整理）
  useEffect(() => {
    const sync = () => setEnabled(isTestMode())
    window.addEventListener(TEST_MODE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(TEST_MODE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (!enabled) return null

  const ctx = getTesterCtx()
  const where = ctx.lessonId
    ? `${ctx.lessonId} ${ctx.lessonTitle}・第 ${ctx.stepIndex}/${ctx.stepCount} 步${ctx.stepTool ? `（${ctx.stepTool}）` : ''}`
    : ctx.hash || '首頁'

  const submit = async () => {
    const t = text.trim()
    if (!t) return
    setOpen(false)
    setText('')
    const ok = await send(t, ctx)
    if (!ok) {
      const raw = localStorage.getItem(OUTBOX_KEY)
      const items = raw ? JSON.parse(raw) : []
      items.push({ text: t, ctx })
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(items))
    }
    setToast(ok ? '已回報 ✓' : '已存本機，連線後補傳')
    window.setTimeout(() => setToast(''), 1800)
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="回報問題"
          className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/70 text-2xl shadow-lg active:scale-90"
        >
          🐞
        </button>
      )}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-800 px-5 py-2 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-full rounded-t-3xl bg-white p-4 pb-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-black text-slate-700">🐞 回報問題</p>
              <p className="text-xs text-slate-400">
                {where}・{ctx.device} {ctx.viewport}
              </p>
            </div>
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="哪裡怪怪的？打幾個字就好，位置我已經記下來了。"
              className="w-full rounded-2xl border-2 border-slate-200 p-3 text-base outline-none focus:border-sky-400"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={!text.trim()}
                className={`min-h-12 flex-1 rounded-full text-lg font-black text-white shadow active:scale-95 ${
                  text.trim() ? 'bg-rose-500' : 'bg-slate-300'
                }`}
              >
                送出
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-12 rounded-full bg-slate-100 px-6 font-bold text-slate-500 active:scale-95"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
