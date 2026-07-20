import { useRef, useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { subjectCoverage, gradeCoverage, starsFor } from '../../engine/geometry'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { Rect } from '../../types'
import type { StepProps } from './types'

/** C2/D4 靠近：可拖曳／縮放的手機取景框，即時算主角占畫面比例 */
export function Viewfinder({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]
  const photo = usePhoto(pid)
  const subject = ann?.subject?.bbox
  const target = step.goal?.subject_coverage ?? [0.25, 0.6]
  // step.start 可指定初始框大小（D-R1：預設全景起步防零互動過關）
  // 有指定 start 的關卡＝嚴格模式：要 great 才能按快門
  const s0 = step.start ?? 0.7
  const strict = step.start !== undefined

  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(s0)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: (1 - s0) / 2, y: (1 - s0) / 2 })
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const [shot, setShot] = useState<number | null>(null)

  const frame: Rect = [pos.x, pos.y, scale, scale]
  const coverage = subject ? subjectCoverage(subject, frame) : 0
  const grade = gradeCoverage(coverage, target)
  const onTarget = grade === 'great'

  const clamp = (v: number) => Math.max(0, Math.min(1 - scale, v))

  const onDown = (e: React.PointerEvent) => {
    if (shot !== null) return
    const r = ref.current!.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width
    const cy = (e.clientY - r.top) / r.height
    drag.current = { dx: cx - pos.x, dy: cy - pos.y }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const r = ref.current!.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width
    const cy = (e.clientY - r.top) / r.height
    setPos({ x: clamp(cx - drag.current.dx), y: clamp(cy - drag.current.dy) })
  }
  const onUp = () => (drag.current = null)

  const onScale = (s: number) => {
    setScale(s)
    setPos((p) => ({ x: Math.max(0, Math.min(1 - s, p.x)), y: Math.max(0, Math.min(1 - s, p.y)) }))
  }

  const ring = onTarget ? 'ring-green-400' : 'ring-white'

  return (
    <div>
      <SayBar text={step.prompt ?? step.say} />
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="relative mx-auto max-w-lg touch-none select-none overflow-hidden rounded-2xl bg-slate-200"
        style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
      >
        <img src={photoUrl(pid)} alt="" className="h-full w-full object-cover" draggable={false} />
        {/* 取景框：框外變暗 */}
        <div
          onPointerDown={onDown}
          className={`absolute cursor-move rounded-lg ring-4 ${ring}`}
          style={{
            left: `${frame[0] * 100}%`,
            top: `${frame[1] * 100}%`,
            width: `${frame[2] * 100}%`,
            height: `${frame[3] * 100}%`,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
          }}
        >
          <div className="absolute inset-1 rounded border-2 border-white/70" />
        </div>
      </div>

      {shot === null ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl">🧍</span>
            <input
              type="range"
              min={0.2}
              max={0.95}
              step={0.01}
              value={1.15 - scale}
              onChange={(e) => onScale(1.15 - Number(e.target.value))}
              className="h-11 flex-1 accent-sky-500"
              aria-label="靠近或遠離"
            />
            <span className="text-2xl">🔎</span>
          </div>
          <p className="mt-1 text-center text-sm text-slate-500">滑桿往「右」＝靠近，讓主角變大</p>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShot(starsFor[grade])}
              disabled={strict ? !onTarget : grade === 'retry'}
              className={`min-h-12 rounded-full px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95 ${
                onTarget ? 'bg-green-500' : grade === 'good' ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              📸 就拍這張！
            </button>
            {grade === 'retry' && (
              <p className="mt-2 text-sm font-bold text-amber-600">
                {coverage < target[0] ? '主角還太小，再靠近一點～' : '太近囉，退後一點點～'}
              </p>
            )}
            {strict && grade === 'good' && (
              <p className="mt-2 text-sm font-bold text-amber-600">
                <RichInline text={step.feedback?.good ?? '快好了，再對準一點～'} />
              </p>
            )}
          </div>
        </>
      ) : (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={shot >= 3 ? step.feedback?.great : step.feedback?.good ?? step.feedback?.great} />
          </p>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onDone(shot)}
              className="min-h-12 rounded-full bg-sky-500 px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95"
            >
              繼續 →
            </button>
          </div>
        </div>
        </AutoScroll>
      )}
    </div>
  )
}
