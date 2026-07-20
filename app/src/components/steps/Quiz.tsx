import { useMemo, useState } from 'react'
import type { QuizQuestion } from '../../types'
import { RichInline, RichText } from '../../ui/RichText'
import { Media } from '../ConceptArt'

/** 課後小考／驗收：一題一題作答，答錯可無限重試，全部答對才算通過。 */
export function Quiz({
  quiz,
  title = '課後小考',
  onPass,
  onSkip,
}: {
  quiz: QuizQuestion[]
  title?: string
  onPass: () => void
  onSkip?: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [result, setResult] = useState<'none' | 'right' | 'wrong'>('none')

  const q = quiz[idx]
  const multi = Array.isArray(q.answer)
  // 選項每題洗牌（Fisher–Yates），答案位置隨機分佈；重試同一題時順序不變
  const order = useMemo(() => {
    const arr = q.options.map((_, k) => k)
    for (let a = arr.length - 1; a > 0; a--) {
      const b = Math.floor(Math.random() * (a + 1))
      ;[arr[a], arr[b]] = [arr[b], arr[a]]
    }
    return arr
  }, [q])
  const correctSet = useMemo(() => {
    const a = Array.isArray(q.answer) ? q.answer : [q.answer]
    return new Set(a)
  }, [q])
  /** 顯示位置 i 是否為正解 */
  const isCorrect = (i: number) => correctSet.has(order[i])

  const toggle = (i: number) => {
    if (result === 'right') return
    setResult('none')
    if (multi) setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))
    else setPicked([i])
  }

  const check = () => {
    const ok =
      picked.length === correctSet.size && picked.every((i) => isCorrect(i))
    setResult(ok ? 'right' : 'wrong')
  }

  const next = () => {
    if (idx < quiz.length - 1) {
      setIdx(idx + 1)
      setPicked([])
      setResult('none')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      onPass()
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-black text-slate-700">📝 {title}</p>
        <span className="text-sm font-bold text-slate-400">
          第 {idx + 1} / {quiz.length} 題
        </span>
      </div>

      {(q.art || q.photo) && <Media art={q.art} photo={q.photo} className="mb-3" />}
      <div className="rounded-2xl bg-sky-50 p-4 text-[1.05rem] font-bold text-slate-700">
        <RichText text={q.q} />
        {multi && <p className="mt-1 text-sm font-bold text-sky-500">（可複選）</p>}
      </div>

      <div className="mt-4 space-y-2">
        {order.map((oi, i) => {
          const opt = q.options[oi]
          const on = picked.includes(i)
          const showRight = result !== 'none' && isCorrect(i)
          const showWrong = result === 'wrong' && on && !isCorrect(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={result === 'right'}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[1.02rem] font-bold transition active:scale-[0.98] ${
                showRight
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : showWrong
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : on
                      ? 'border-sky-400 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <span className="text-xl">
                {showRight ? '✅' : showWrong ? '❌' : on ? (multi ? '☑️' : '🔘') : multi ? '⬜' : '⚪'}
              </span>
              <span className="flex-1"><RichInline text={opt} /></span>
            </button>
          )
        })}
      </div>

      {result === 'wrong' && (
        <p className="mt-3 rounded-xl bg-rose-50 p-3 font-bold text-rose-600">
          再想想看，換一個試試！{q.explain ? <span className="font-medium text-rose-500">提示：<RichInline text={q.explain} /></span> : null}
        </p>
      )}
      {result === 'right' && q.explain && (
        <div className="mt-3 rounded-xl bg-green-50 p-3 font-medium text-green-800">
          <RichText text={q.explain} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {result === 'right' ? (
          <button
            type="button"
            onClick={next}
            className="min-h-12 rounded-full bg-green-500 px-8 py-3 text-lg font-black text-white shadow active:scale-95"
          >
            {idx < quiz.length - 1 ? '下一題 →' : '完成小考 🎉'}
          </button>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={picked.length === 0}
            className={`min-h-12 rounded-full px-8 py-3 text-lg font-black text-white shadow active:scale-95 ${
              picked.length === 0 ? 'bg-slate-300' : 'bg-sky-500'
            }`}
          >
            送出答案
          </button>
        )}
      </div>

      {onSkip && result !== 'right' && (
        <p className="mt-3 text-center">
          <button type="button" onClick={onSkip} className="text-sm text-slate-400 underline">
            先跳過小考
          </button>
        </p>
      )}
    </div>
  )
}
