import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { lessonTitle } from '../config'
import { loadGlossary, type Glossary } from '../content'

/** 跨章連結的返回資訊 */
interface BackTo {
  fromId: string
  targetId: string
  /** 跳走時停在來源課的第幾步，返回時還原 */
  fromStep: number
}

interface NavCtxValue {
  currentLessonId: string | null
  backTo: BackTo | null
  jumpToLesson: (targetId: string) => void
  goBack: () => void
  /** 課程執行器回報目前在第幾步（跳轉時記下來） */
  reportStep: (n: number) => void
}

interface GlossaryCtxValue {
  glossary: Glossary
  openTerm: (term: string) => void
}

const NavCtx = createContext<NavCtxValue | null>(null)
const GlossaryCtx = createContext<GlossaryCtxValue | null>(null)

export function useNav(): NavCtxValue {
  const c = useContext(NavCtx)
  if (!c) throw new Error('useNav 必須在 AppUIProvider 內')
  return c
}

export function useGlossary(): GlossaryCtxValue {
  const c = useContext(GlossaryCtx)
  if (!c) throw new Error('useGlossary 必須在 AppUIProvider 內')
  return c
}

/** 全站 UI 情境：名詞表／名詞彈窗／跨章返回鈕。需放在 <HashRouter> 內。 */
export function AppUIProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  // 目前在哪一課，直接從網址判斷（避免用元件掛載/卸載追蹤的時序問題）
  const currentLessonId = useMemo(() => {
    const m = location.pathname.match(/^\/lesson\/([A-Za-z0-9]+)/)
    return m ? m[1] : null
  }, [location.pathname])
  const [backTo, setBackTo] = useState<BackTo | null>(null)
  const [glossary, setGlossary] = useState<Glossary>({})
  const [openName, setOpenName] = useState<string | null>(null)
  const stepRef = useRef(0)
  const reportStep = useCallback((n: number) => {
    stepRef.current = n
  }, [])

  useEffect(() => {
    loadGlossary()
      .then(setGlossary)
      .catch(() => setGlossary({}))
  }, [])

  // 換頁時關閉名詞彈窗
  useEffect(() => {
    setOpenName(null)
  }, [location.pathname])

  const jumpToLesson = useCallback(
    (targetId: string) => {
      setBackTo(
        currentLessonId && currentLessonId !== targetId
          ? { fromId: currentLessonId, targetId, fromStep: stepRef.current }
          : null,
      )
      navigate(`/lesson/${targetId}`)
      window.scrollTo({ top: 0 })
    },
    [currentLessonId, navigate],
  )

  const goBack = useCallback(() => {
    if (!backTo) return
    const { fromId, fromStep } = backTo
    setBackTo(null)
    navigate(`/lesson/${fromId}`, { state: { restoreStep: fromStep } })
    window.scrollTo({ top: 0 })
  }, [backTo, navigate])

  // 一旦離開目標課（換到別課或回首頁）就清除返回鈕
  useEffect(() => {
    setBackTo((prev) => (prev && currentLessonId !== prev.targetId ? null : prev))
  }, [currentLessonId])

  const nav = useMemo<NavCtxValue>(
    () => ({ currentLessonId, backTo, jumpToLesson, goBack, reportStep }),
    [currentLessonId, backTo, jumpToLesson, goBack, reportStep],
  )
  const gloss = useMemo<GlossaryCtxValue>(
    () => ({ glossary, openTerm: setOpenName }),
    [glossary],
  )

  return (
    <NavCtx.Provider value={nav}>
      <GlossaryCtx.Provider value={gloss}>
        {children}
        <GlossarySheet name={openName} onClose={() => setOpenName(null)} />
        <BackFloat />
      </GlossaryCtx.Provider>
    </NavCtx.Provider>
  )
}

/** 名詞彈窗：底部小卡，一句話解釋＋可回到教它的那一課 */
function GlossarySheet({ name, onClose }: { name: string | null; onClose: () => void }) {
  const { glossary } = useGlossary()
  const { currentLessonId, jumpToLesson } = useNav()
  if (!name) return null
  const entry = glossary[name]
  const canJump = entry?.home && entry.home !== currentLessonId
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative m-3 w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-black text-sky-700">📖 {name}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="shrink-0 text-2xl leading-none text-slate-400 active:scale-90"
          >
            ×
          </button>
        </div>
        <p className="mt-2 leading-relaxed text-slate-700">
          {entry ? entry.def : '（還沒有這個名詞的解釋）'}
        </p>
        {canJump && (
          <button
            type="button"
            onClick={() => {
              onClose()
              jumpToLesson(entry.home)
            }}
            className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-full bg-sky-100 px-4 py-2 font-bold text-sky-700 active:scale-95"
          >
            前往《{lessonTitle(entry.home)}》→
          </button>
        )}
      </div>
    </div>
  )
}

/** 跨章連結時右下角出現的半透明返回鈕 */
function BackFloat() {
  const { backTo, currentLessonId, goBack } = useNav()
  if (!backTo || currentLessonId !== backTo.targetId) return null
  return (
    <button
      type="button"
      onClick={goBack}
      className="fixed bottom-24 right-4 z-40 flex min-h-12 items-center gap-1 rounded-full bg-slate-800/70 px-5 py-3 font-bold text-white shadow-lg backdrop-blur active:scale-95"
    >
      ↩ 返回《{lessonTitle(backTo.fromId)}》
    </button>
  )
}
