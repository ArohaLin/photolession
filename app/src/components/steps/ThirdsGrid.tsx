import { useRef, useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { RichInline, RichText } from '../../ui/RichText'
import type { StepProps } from './types'

const SCALE = 1.6
const THIRDS = [1 / 3, 2 / 3]
const INTERSECTIONS: [number, number][] = [
  [1 / 3, 1 / 3],
  [2 / 3, 1 / 3],
  [1 / 3, 2 / 3],
  [2 / 3, 2 / 3],
]

/** C5 井字魔法：拖動照片，把主角放到三分交叉點上 */
export function ThirdsGrid({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]
  const photo = usePhoto(pid)
  const bbox = ann?.subject?.bbox
  const focus = ann?.subject?.focus
  const scx = focus?.[0] ?? (bbox ? bbox[0] + bbox[2] / 2 : 0.5)
  const scy = focus?.[1] ?? (bbox ? bbox[1] + bbox[3] / 2 : 0.5)

  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const clampPan = (v: number) => Math.max(1 - SCALE, Math.min(0, v))
  const [pan, setPan] = useState(() => ({
    x: clampPan(0.5 - scx * SCALE),
    y: clampPan(0.5 - scy * SCALE),
  }))
  const [shot, setShot] = useState<number | null>(null)

  const screenX = scx * SCALE + pan.x
  const screenY = scy * SCALE + pan.y
  // pan 範圍 [1-SCALE, 0] → 主角可及區間；搆不到的交叉點直接隱藏（C-Y2 死路）
  const reachable = (ix: number, iy: number) =>
    ix >= scx * SCALE - (SCALE - 1) - 0.07 &&
    ix <= scx * SCALE + 0.07 &&
    iy >= scy * SCALE - (SCALE - 1) - 0.07 &&
    iy <= scy * SCALE + 0.07
  let best = 2
  let bestI = 0
  INTERSECTIONS.forEach(([ix, iy], k) => {
    const d = Math.hypot(screenX - ix, screenY - iy)
    if (d < best) {
      best = d
      bestI = k
    }
  })
  const grade = best < 0.06 ? 'great' : best < 0.13 ? 'good' : 'retry'
  const onTarget = grade === 'great'

  const onDown = (e: React.PointerEvent) => {
    if (shot !== null) return
    drag.current = { x: e.clientX, y: e.clientY }
    ref.current?.setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const r = ref.current!.getBoundingClientRect()
    const dx = (e.clientX - drag.current.x) / r.width
    const dy = (e.clientY - drag.current.y) / r.height
    drag.current = { x: e.clientX, y: e.clientY }
    setPan((p) => ({ x: clampPan(p.x + dx), y: clampPan(p.y + dy) }))
  }
  const onUp = () => (drag.current = null)

  return (
    <div>
      <SayBar text={step.prompt ?? step.say} />
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="relative mx-auto max-w-md cursor-move touch-none select-none overflow-hidden rounded-2xl bg-slate-200"
        style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
      >
        <img
          src={photoUrl(pid)}
          alt=""
          draggable={false}
          className="absolute"
          style={{
            width: `${SCALE * 100}%`,
            height: `${SCALE * 100}%`,
            left: `${pan.x * 100}%`,
            top: `${pan.y * 100}%`,
            maxWidth: 'none',
          }}
        />
        <div className="pointer-events-none absolute inset-0">
          {THIRDS.map((t, i) => (
            <div key={`v${i}`} className="absolute bottom-0 top-0 w-px bg-white/70" style={{ left: `${t * 100}%` }} />
          ))}
          {THIRDS.map((t, i) => (
            <div key={`h${i}`} className="absolute left-0 right-0 h-px bg-white/70" style={{ top: `${t * 100}%` }} />
          ))}
          {INTERSECTIONS.map(([ix, iy], k) =>
            reachable(ix, iy) ? (
              <div
                key={k}
                className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition ${
                  onTarget && k === bestI ? 'scale-150 bg-green-400' : 'bg-white/50'
                }`}
                style={{ left: `${ix * 100}%`, top: `${iy * 100}%` }}
              />
            ) : null,
          )}
          <div
            className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xl ring-4 ${
              onTarget ? 'ring-green-400' : 'ring-amber-300'
            } ${grade === 'retry' ? 'animate-pulse' : ''}`}
            style={{ left: `${screenX * 100}%`, top: `${screenY * 100}%` }}
          >
            💛
          </div>
        </div>
      </div>
      <p className="mt-1 text-center text-sm text-slate-500">拖動照片，把主角 💛 移到白點（交叉點）上</p>

      {shot === null ? (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShot(3)}
            disabled={!onTarget}
            className={`min-h-12 rounded-full px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95 ${
              onTarget ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            📸 就拍這張！
          </button>
          {!onTarget && (
            <p className="mt-2 text-sm font-bold text-amber-600">
              <RichInline text={grade === 'good' ? '快到了！再靠近白點一點～' : step.feedback?.hint1 ?? '把主角拖到其中一個白點上。'} />
            </p>
          )}
        </div>
      ) : (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <div className="text-lg font-black text-green-700">
            <RichText text={step.feedback?.great ?? '主角放在交叉點，畫面更有魔法！'} />
          </div>
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
