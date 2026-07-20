import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PIN_KEY } from '../store/testerContext'

interface Issue {
  id: string
  at: number
  text: string
  ctx?: {
    lessonId?: string
    lessonTitle?: string
    stepIndex?: number
    stepCount?: number
    stepTool?: string
    device?: string
    viewport?: string
    errors?: string[]
  }
  status: 'open' | 'fixed' | 'dismissed'
  note?: string
}

const fmt = (t: number) =>
  new Date(t).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

/** 驗收回報管理頁：看狀態、看 Claude 的處理說明 */
export default function Issues() {
  const [issues, setIssues] = useState<Issue[] | null>(null)
  const [err, setErr] = useState('')

  const reload = useCallback(async () => {
    setErr('')
    try {
      const res = await fetch('/api/issues', {
        headers: { 'x-pin': localStorage.getItem(PIN_KEY) ?? '' },
      })
      if (!res.ok) throw new Error(res.status === 401 ? 'PIN 不對，到家長區重新輸入' : `HTTP ${res.status}`)
      setIssues(((await res.json()).issues as Issue[]).sort((a, b) => b.at - a.at))
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e))
      setIssues([])
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const dismiss = async (id: string) => {
    await fetch('/api/issues', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-pin': localStorage.getItem(PIN_KEY) ?? '' },
      body: JSON.stringify({ id, status: 'dismissed' }),
    })
    void reload()
  }

  const remove = async (id: string) => {
    if (!window.confirm('確定刪除這筆回報？刪了就沒有了喔。')) return
    await fetch('/api/issues', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-pin': localStorage.getItem(PIN_KEY) ?? '' },
      body: JSON.stringify({ id }),
    })
    setIssues((cur) => (cur ?? []).filter((i) => i.id !== id))
  }

  const clearDone = async () => {
    if (!window.confirm('確定清空所有「已處理」的回報？')) return
    await fetch('/api/issues', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-pin': localStorage.getItem(PIN_KEY) ?? '' },
      body: JSON.stringify({ scope: 'done' }),
    })
    setIssues((cur) => (cur ?? []).filter((i) => i.status === 'open'))
  }

  const open = issues?.filter((i) => i.status === 'open') ?? []
  const rest = issues?.filter((i) => i.status !== 'open') ?? []

  const Row = ({ i }: { i: Issue }) => (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ${i.status !== 'open' ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-slate-700">{i.text}</p>
        <span className="flex shrink-0 items-center gap-2">
          {i.status === 'open' ? (
            <button type="button" onClick={() => dismiss(i.id)} className="text-xs text-slate-400 underline">
              不用修了
            </button>
          ) : (
            <span className="text-lg">{i.status === 'fixed' ? '✅' : '🚫'}</span>
          )}
          <button
            type="button"
            onClick={() => void remove(i.id)}
            aria-label="刪除"
            className="text-lg text-rose-300 active:scale-90"
          >
            🗑️
          </button>
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {i.ctx?.lessonId
          ? `${i.ctx.lessonId} ${i.ctx.lessonTitle ?? ''}・第 ${i.ctx.stepIndex}/${i.ctx.stepCount} 步`
          : '非課程頁'}
        ・{i.ctx?.device} {i.ctx?.viewport}・{fmt(i.at)}
      </p>
      {i.note && (
        <p className="mt-2 rounded-xl bg-green-50 p-2 text-sm text-green-800">💬 {i.note}</p>
      )}
    </div>
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">🐞 測試回報</h2>
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow"
        >
          🔄 重新整理
        </button>
      </div>
      {err && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{err}</p>}
      {issues === null ? (
        <p className="text-center text-slate-400">載入中…</p>
      ) : (
        <div className="space-y-5">
          <section>
            <p className="mb-2 text-sm font-black text-slate-500">⏳ 待處理（{open.length}）</p>
            <div className="space-y-2">
              {open.map((i) => <Row key={i.id} i={i} />)}
              {open.length === 0 && <p className="text-sm text-slate-400">目前沒有待處理的回報 🎉</p>}
            </div>
          </section>
          {rest.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-black text-slate-500">已處理（{rest.length}）</p>
                <button type="button" onClick={() => void clearDone()} className="text-xs text-rose-400 underline">
                  🗑️ 清空已處理
                </button>
              </div>
              <div className="space-y-2">{rest.map((i) => <Row key={i.id} i={i} />)}</div>
            </section>
          )}
        </div>
      )}
      <p className="mt-6 text-center">
        <Link to="/parent" className="text-sm text-slate-400 underline">回家長區</Link>
      </p>
    </div>
  )
}
