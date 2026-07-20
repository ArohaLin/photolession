import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEV_UNLOCK_KEY,
  isDevUnlocked,
  PIN_KEY,
  TEST_MODE_EVENT,
  TEST_MODE_KEY,
} from '../store/testerContext'
import { loadPhotos } from '../content'
import { clearAllProgress } from '../store/progress'
import {
  clearAllWorks,
  effectiveStatus,
  listWorks,
  reviewWork,
  type Work,
} from '../store/works'
import { WorkReview } from '../components/WorkReview'
import { clearSos, listSos, removeSos, SOS_EVENT, type SosRecord } from '../store/sos'

export default function Parent() {
  const [authors, setAuthors] = useState<string[]>([])
  const [pending, setPending] = useState<Work[]>([])
  const [sos, setSos] = useState<SosRecord[]>([])
  const [, force] = useState(0)
  const [devUnlocked, setDevUnlocked] = useState(() => isDevUnlocked())
  const tapRef = useRef(0)

  // 隱私標題連點 10 下 → 誘導彈窗 → 伺服器驗證後才解鎖開發區塊
  const onPrivacyTap = () => {
    tapRef.current += 1
    if (tapRef.current < 10) return
    tapRef.current = 0
    const name = window.prompt('請輸入開發者的名字以啟動開發者模式')
    if (name == null) return
    const value = name.trim()
    if (!value) return
    fetch('/api/issues', { headers: { 'x-pin': value } })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem(PIN_KEY, value)
          localStorage.setItem(DEV_UNLOCK_KEY, '1')
          setDevUnlocked(true)
        } else {
          window.alert('查無此開發者，請再確認名字。')
        }
      })
      .catch(() => window.alert('查無此開發者，請再確認名字。'))
  }

  const lockDev = () => {
    localStorage.removeItem(DEV_UNLOCK_KEY)
    localStorage.setItem(TEST_MODE_KEY, '0')
    window.dispatchEvent(new Event(TEST_MODE_EVENT))
    setDevUnlocked(false)
  }

  useEffect(() => {
    const load = () => setSos(listSos())
    load()
    window.addEventListener(SOS_EVENT, load)
    return () => window.removeEventListener(SOS_EVENT, load)
  }, [])

  const loadWorks = useCallback(() => {
    listWorks()
      .then((ws) => setPending(ws.filter((w) => effectiveStatus(w) === 'pending')))
      .catch(() => setPending([]))
  }, [])

  const review = async (id: string, status: 'approved' | 'redo', note?: string) => {
    await reviewWork(id, status, note)
    loadWorks()
  }

  useEffect(() => {
    loadWorks()
    loadPhotos()
      .then((map) => {
        const set = new Set<string>()
        for (const p of Object.values(map)) if (p.author) set.add(p.author)
        setAuthors([...set].sort())
      })
      .catch(() => setAuthors([]))
  }, [loadWorks])

  const clearAll = async () => {
    if (!window.confirm('確定要清除所有學習進度與作品照片嗎？此動作無法復原。')) return
    clearAllProgress()
    await clearAllWorks()
    loadWorks()
    force((n) => n + 1)
    window.alert('已清除完畢。')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">🔑 家長區</h2>

      {/* 求救訊息 */}
      <section className="rounded-3xl bg-white p-5 shadow">
        <h3 className="mb-2 flex items-center gap-2 font-black text-slate-700">
          🙋 求救訊息
          {sos.length > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-black text-white">
              {sos.length}
            </span>
          )}
        </h3>
        {sos.length === 0 ? (
          <p className="text-sm text-slate-400">小朋友目前沒有求救 🎉</p>
        ) : (
          <>
            <div className="space-y-2">
              {sos.map((s) => (
                <div key={s.id} className="rounded-2xl bg-rose-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-rose-700">{s.reason}</p>
                    <button
                      type="button"
                      onClick={() => removeSos(s.id)}
                      aria-label="刪除"
                      className="shrink-0 text-lg text-rose-300 active:scale-90"
                    >
                      🗑️
                    </button>
                  </div>
                  {s.note && <p className="mt-1 text-sm text-slate-600">💬 {s.note}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {s.ctx?.lessonId
                      ? `${s.ctx.lessonTitle ?? s.ctx.lessonId}・第 ${s.ctx.stepIndex}/${s.ctx.stepCount} 步`
                      : '非課程頁'}
                    ・{new Date(s.at).toLocaleString('zh-TW', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('確定清空所有求救訊息？')) clearSos()
              }}
              className="mt-3 text-xs text-rose-400 underline"
            >
              🗑️ 清空全部
            </button>
          </>
        )}
      </section>

      {/* 作品審核 */}
      <section className="rounded-3xl bg-white p-5 shadow">
        <h3 className="mb-2 flex items-center gap-2 font-black text-slate-700">
          📸 作品審核
          {pending.length > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-black text-white">
              {pending.length}
            </span>
          )}
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400">目前沒有待審核的作品 🎉</p>
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-400">
              小朋友的作品要通過審核，該課「作品」區才會點亮。可以通過，或請他重拍。
            </p>
            <div className="space-y-3">
              {pending.map((w) => (
                <WorkReview
                  key={w.id}
                  work={w}
                  onApprove={() => review(w.id, 'approved')}
                  onRedo={(note) => review(w.id, 'redo', note)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 素材授權 */}
      <section className="rounded-3xl bg-white p-5 shadow">
        <h3 className="mb-2 font-black text-slate-700">📷 教材來源與授權</h3>
        <p className="text-sm leading-relaxed text-slate-600">
          所有教學照片皆取自{' '}
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-sky-600 underline"
          >
            Pexels
          </a>{' '}
          免費圖庫，採 Pexels License，可免費使用於個人與教育用途。
        </p>
        {authors.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-bold text-slate-500">
              攝影師名單（{authors.length} 位）
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{authors.join('、')}</p>
          </details>
        )}
      </section>

      {/* 測試開發模式（隱藏；解鎖後才顯示） */}
      {devUnlocked && (
        <section className="rounded-3xl bg-white p-5 shadow">
          <h3 className="mb-2 font-black text-slate-700">🛠️ 測試開發模式（開發用）</h3>
          <TestModeToggle />
          <button
            type="button"
            onClick={lockDev}
            className="mt-4 text-xs text-slate-400 underline"
          >
            🔒 鎖回開發模式
          </button>
        </section>
      )}

      {/* 隱私與資料 */}
      <section className="rounded-3xl bg-white p-5 shadow">
        <h3
          className="mb-2 select-none font-black text-slate-700"
          onClick={onPrivacyTap}
        >
          🔒 隱私與資料
        </h3>
        <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>小朋友拍的照片只存在這台裝置（瀏覽器 IndexedDB），永不上傳。</li>
          <li>學習進度只存在這台裝置（localStorage），不做任何追蹤。</li>
          <li>這個 App 不收集任何個人資料，也沒有廣告或分析工具。</li>
        </ul>
        <button
          type="button"
          onClick={clearAll}
          className="min-h-12 rounded-full bg-rose-500 px-6 py-3 font-bold text-white shadow active:scale-95"
        >
          🗑️ 清除所有進度與作品
        </button>
      </section>

      {/* 作者專區 */}
      <section className="rounded-3xl bg-white p-5 shadow">
        <h3 className="mb-2 font-black text-slate-700">👩‍💻 作者專區</h3>
        <div className="space-y-2 text-sm leading-relaxed text-slate-600">
          <p>
            這個 App 由 <span className="font-bold text-slate-700">ArohaLin</span>{' '}
            設計製作，是一個開源專案（MIT 授權），歡迎自由使用與分享。
          </p>
          <p>
            原始碼與說明：
            <br />
            <a
              href="https://github.com/ArohaLin/photolession"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-sky-600 underline break-all"
            >
              github.com/ArohaLin/photolession
            </a>
          </p>
          <p>
            追蹤作者 Threads：
            <br />
            <a
              href="https://www.threads.com/@arohalin"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-sky-600 underline break-all"
            >
              @arohalin
            </a>
          </p>
          <p className="pt-1 text-xs text-slate-400">
            📱 同時支援 iPhone 與 iPad，<span className="font-bold">推薦用 iPad</span>
            （大螢幕操作互動最舒服）。本程式目前只在 iPhone 與 iPad 上測試過，其他裝置或瀏覽器不保證顯示正常。
          </p>
        </div>
      </section>
    </div>
  )
}

/** 測試模式：開啟後全站出現 🐞 回報鈕；PIN 用來驗證回報 API */
function TestModeToggle() {
  const [on, setOn] = useState(() => localStorage.getItem(TEST_MODE_KEY) === '1')
  const [pin, setPin] = useState(() => localStorage.getItem(PIN_KEY) ?? '')

  const toggle = () => {
    const next = !on
    setOn(next)
    localStorage.setItem(TEST_MODE_KEY, next ? '1' : '0')
    window.dispatchEvent(new Event(TEST_MODE_EVENT))
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-600">顯示 🐞 回報鈕</span>
        <button
          type="button"
          onClick={toggle}
          className={`h-8 w-14 rounded-full p-1 transition ${on ? 'bg-green-400' : 'bg-slate-300'}`}
          aria-label="切換測試模式"
        >
          <span
            className={`block h-6 w-6 rounded-full bg-white shadow transition ${on ? 'translate-x-6' : ''}`}
          />
        </button>
      </div>
      {on && (
        <>
          <label className="flex items-center gap-2">
            <span className="shrink-0 font-bold text-slate-600">PIN</span>
            <input
              type="text"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                localStorage.setItem(PIN_KEY, e.target.value.trim())
              }}
              placeholder="輸入回報 PIN"
              className="w-28 rounded-xl border-2 border-slate-200 px-3 py-2 outline-none focus:border-sky-400"
            />
          </label>
          <p>
            <Link to="/issues" className="font-bold text-sky-600 underline">
              📋 查看回報與處理狀態
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
