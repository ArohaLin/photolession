import { useRef, useState } from 'react'
import { photoUrl } from '../../content'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/** A6 全景模擬：按住 📱 從左往右「平穩地」掃過去；太快畫面會裂開 */
export function PanoDrag({ step, onDone }: StepProps) {
  const pid = step.photo!
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [state, setState] = useState<'idle' | 'dragging' | 'fail' | 'short' | 'done'>('idle')
  const last = useRef<{ x: number; t: number } | null>(null)

  const reset = () => {
    setProgress(0)
    setState('idle')
    last.current = null
  }

  const onDown = (e: React.PointerEvent) => {
    if (state === 'done') return
    reset()
    setState('dragging')
    last.current = { x: e.clientX, t: performance.now() }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (state !== 'dragging' || !last.current) return
    const r = ref.current!.getBoundingClientRect()
    const now = performance.now()
    const dx = e.clientX - last.current.x
    const dt = Math.max(1, now - last.current.t)
    const speed = dx / dt // px/ms
    last.current = { x: e.clientX, t: now }
    if (speed > 1.1) {
      setState('fail')
      return
    }
    setProgress((p) => Math.max(0, Math.min(1, p + dx / r.width)))
  }
  const onUp = () => {
    if (state !== 'dragging') return
    if (progress >= 0.92) setState('done')
    else if (progress > 0.08) setState('short') // 掃到一半放手（A-O3）
    else reset()
  }

  return (
    <div>
      <SayBar text={step.say ?? '按住手機，從左邊「慢慢地、穩穩地」掃到右邊，拍一張全景！'} />

      <div ref={ref} className="relative mx-auto max-w-md touch-none select-none">
        {/* 全景畫布：由左往右逐漸顯示 */}
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-slate-800">
          <img
            src={photoUrl(pid)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              clipPath: `inset(0 ${(1 - Math.max(progress, 0.04)) * 100}% 0 0)`,
              filter: state === 'fail' ? 'none' : undefined,
            }}
            draggable={false}
          />
          {/* 掃太快的裂開效果 */}
          {state === 'fail' && (
            <div
              className="absolute inset-y-0 w-10 bg-slate-900"
              style={{
                left: `${progress * 100}%`,
                transform: 'skewX(-14deg)',
                boxShadow: '-6px 0 0 rgba(255,255,255,0.5)',
              }}
            />
          )}
          {/* 進度箭頭軌道 */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center">
            <div className="h-1.5 flex-1 rounded bg-white/30">
              <div className="h-full rounded bg-yellow-300" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="ml-2 text-xs font-black text-white">→</span>
          </div>
          {/* 可拖的手機 */}
          {state !== 'done' && (
            <button
              type="button"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              aria-label="拖曳手機掃全景"
              className="absolute top-1/2 -translate-y-1/2 cursor-grab p-2 text-5xl active:cursor-grabbing"
              style={{ left: `calc(${progress * 100}% - 26px)` }}
            >
              📱
            </button>
          )}
        </div>
      </div>

      {(state === 'fail' || state === 'short') && (
        <AutoScroll>
          <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-center">
            <p className="font-black text-amber-700">
              {state === 'fail'
                ? '哎呀掃太快，畫面裂開了！全景要「慢～慢～移」。'
                : '還沒掃到最右邊就放手啦～再來一次，要一路掃到底喔！'}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 min-h-12 rounded-full bg-amber-400 px-8 py-3 font-black text-white shadow active:scale-95"
            >
              再掃一次
            </button>
          </div>
        </AutoScroll>
      )}
      {state !== 'fail' && state !== 'short' && state !== 'done' && (
        <p className="mt-2 text-center text-sm font-bold text-slate-500">
          {state === 'dragging' ? '穩穩地往右移…' : '按住 📱 開始掃'}
        </p>
      )}
      {state === 'done' && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '好寬的全景！記住：速度平穩、畫面裡的人不要動。'} />
          </p>
          <button
            type="button"
            onClick={() => onDone(3)}
            className="mt-3 min-h-12 rounded-full bg-sky-500 px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95"
          >
            繼續 →
          </button>
        </div>
        </AutoScroll>
      )}
    </div>
  )
}
