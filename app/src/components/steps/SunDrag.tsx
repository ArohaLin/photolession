import { useRef, useState } from 'react'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { gradeRange } from '../../engine/geometry'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

const C = 120 // 舞台中心
const R = 88 // 太陽軌道半徑

/** A1 拖太陽：俯視舞台，把太陽拖到小熊後面做出剪影 */
export function SunDrag({ step, onDone }: StepProps) {
  const target = (step.goal?.sun_angle ?? [150, 210]) as [number, number]
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [angle, setAngle] = useState(35)
  const [shot, setShot] = useState<number | null>(null)

  const rad = (angle * Math.PI) / 180
  const sunx = C + R * Math.sin(rad)
  const suny = C + R * Math.cos(rad)
  const frontness = (1 + Math.cos(rad)) / 2 // 1＝順光(亮)，0＝逆光(暗)
  const brightness = 0.15 + frontness // 0.15–1.15
  const isBack = gradeRange(angle, target) === 'great'

  const setFromPointer = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 240 - C
    const y = ((e.clientY - r.top) / r.height) * 240 - C
    let a = (Math.atan2(x, y) * 180) / Math.PI
    if (a < 0) a += 360
    setAngle(a)
  }
  const onDown = (e: React.PointerEvent) => {
    if (shot !== null) return
    dragging.current = true
    ref.current?.setPointerCapture(e.pointerId)
    setFromPointer(e)
  }
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) setFromPointer(e)
  }
  const onUp = () => (dragging.current = false)

  const shadowDx = -(sunx - C) * 0.42
  const shadowDy = -(suny - C) * 0.42
  const lightLabel = isBack ? '逆光 → 剪影！' : frontness > 0.78 ? '順光（正面亮亮）' : '側光'

  return (
    <div>
      <SayBar text={[step.say, step.goal?.say].filter(Boolean).join(' ')} />

      <div className="gap-4 sm:flex sm:items-start">
        {/* 俯視舞台（可拖太陽） */}
        <div
          ref={ref}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className="relative mx-auto max-w-xs flex-1 touch-none select-none"
        >
          <svg viewBox="0 0 240 240" className="w-full cursor-grab active:cursor-grabbing">
            <defs>
              <radialGradient id="sd-grass" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#dcfce7" />
                <stop offset="100%" stopColor="#86efac" />
              </radialGradient>
              <radialGradient id="sd-sun" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="116" fill="url(#sd-grass)" />
            <line
              x1={sunx}
              y1={suny}
              x2={C}
              y2={C}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeDasharray="5 4"
              opacity="0.7"
            />
            <ellipse cx={C + shadowDx} cy={C + shadowDy} rx="27" ry="17" fill="#0f172a" opacity="0.22" />
            <g style={{ filter: `brightness(${brightness})` }}>
              <text x={C} y={C + 15} textAnchor="middle" fontSize="46">
                🧸
              </text>
            </g>
            <text x={C} y="233" textAnchor="middle" fontSize="20">
              📷
            </text>
            <circle cx={sunx} cy={suny} r="17" fill="url(#sd-sun)" />
            <text x={sunx} y={suny + 6} textAnchor="middle" fontSize="17">
              ☀️
            </text>
          </svg>
        </div>

        {/* 拍出來的結果 */}
        <div className="mx-auto mt-4 max-w-xs flex-1 sm:mt-0">
          <p className="mb-1 text-center text-sm font-bold text-slate-500">📸 拍出來會長這樣</p>
          <div
            className="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-700"
            style={{
              background: isBack
                ? 'linear-gradient(#fde68a,#f59e0b)'
                : 'linear-gradient(#bae6fd,#7dd3fc)',
            }}
          >
            {isBack && <div className="absolute h-24 w-24 rounded-full bg-yellow-100 blur-xl" />}
            <span
              className="relative text-7xl"
              style={{ filter: `brightness(${brightness}) contrast(${isBack ? 1.5 : 1})` }}
            >
              🧸
            </span>
          </div>
          <p
            className="mt-2 text-center text-lg font-black"
            style={{ color: isBack ? '#b45309' : '#0369a1' }}
          >
            {lightLabel}
          </p>
        </div>
      </div>

      {shot === null ? (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShot(3)}
            disabled={!isBack}
            className={`min-h-12 rounded-full px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95 ${
              isBack ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            📸 拍下剪影！
          </button>
          {!isBack && (
            <p className="mt-2 text-sm font-bold text-amber-600">
              <RichInline text={step.feedback?.hint1 ?? '把太陽拖到小熊正後方（上面）～'} />
            </p>
          )}
        </div>
      ) : null}
      {shot !== null && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '太陽在後面，小熊變成黑影子，這就是剪影！'} />
          </p>
          <button
            type="button"
            onClick={() => onDone(shot)}
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
