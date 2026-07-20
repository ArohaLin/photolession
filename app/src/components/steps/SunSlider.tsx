import { useRef, useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { pointInBox, gradeCoverage, starsFor } from '../../engine/geometry'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { CameraShell } from '../camera/Shell'
import { ExposureMeter } from '../ExposureMeter'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/**
 * A3 小太陽：先點主角（出現對焦框＋☀️），再上下拖曳調亮度。
 * step.mode: 'dark'＝太暗要救亮；'bright'＝太亮要壓暗。
 */
export function SunSlider({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]
  const photo = usePhoto(pid)
  const box = ann?.subject?.bbox
  const dark = step.mode !== 'bright'
  const start = dark ? 0.4 : 1.5
  const target = (step.goal?.exposure ?? [0.85, 1.15]) as [number, number]

  const ref = useRef<HTMLDivElement>(null)
  const [tapped, setTapped] = useState<{ x: number; y: number } | null>(null)
  const [offset, setOffset] = useState(0) // -0.7 ~ +0.7
  const dragY = useRef<number | null>(null)
  const [shot, setShot] = useState<number | null>(null)

  const brightness = Math.max(0.15, Math.min(1.7, start + offset))
  const grade = gradeCoverage(brightness, target)
  const onTarget = grade === 'great'

  const onDown = (e: React.PointerEvent) => {
    if (shot !== null) return
    const r = ref.current!.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    if (!tapped) {
      // 第一步：點主角（bright 模式救的是整片天空，點哪裡都算，A-O2）
      if (!box || !dark || pointInBox(px, py, box, 0.06)) {
        setTapped({ x: px, y: py })
      }
      return
    }
    dragY.current = e.clientY
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (dragY.current === null || shot !== null) return
    const r = ref.current!.getBoundingClientRect()
    const dy = (dragY.current - e.clientY) / r.height // 往上滑＝變亮
    dragY.current = e.clientY
    setOffset((o) => Math.max(-0.9, Math.min(0.9, o + dy * 1.4)))
  }
  const onUp = () => (dragY.current = null)

  return (
    <div>
      <SayBar text={[step.say, step.goal?.say].filter(Boolean).join(' ')} />
      <CameraShell
        onShutter={tapped && onTarget && shot === null ? () => setShot(starsFor[grade]) : undefined}
        shutterGlow={!!tapped && onTarget}
      >
        <div
          ref={ref}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className="relative cursor-pointer touch-none select-none"
          style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
        >
          <img
            src={photoUrl(pid)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: `brightness(${brightness})` }}
            draggable={false}
          />
          {!tapped && (
            <p className="absolute bottom-2 left-0 right-0 animate-pulse text-center text-sm font-black text-white drop-shadow">
              👆 先點一下主角
            </p>
          )}
          {tapped && (
            <div
              className="pointer-events-none absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 border-2 border-yellow-300"
              style={{ left: `${tapped.x * 100}%`, top: `${tapped.y * 100}%` }}
            >
              {/* 小太陽滑軌 */}
              <div className="absolute -right-7 top-1/2 flex -translate-y-1/2 flex-col items-center">
                <span className="text-[10px] text-yellow-200">▲</span>
                <span className="text-lg" style={{ transform: `translateY(${-offset * 28}px)` }}>
                  ☀️
                </span>
                <span className="text-[10px] text-yellow-200">▼</span>
              </div>
            </div>
          )}
        </div>
      </CameraShell>

      {tapped && shot === null && (
        <AutoScroll>
          <p className="mt-2 text-center text-sm font-bold text-slate-600">
            在畫面上「上下拖曳」☀️：往上變亮、往下變暗
          </p>
          <ExposureMeter value={brightness} target={target} />
          {!onTarget && (
            <p className="mt-1 text-center text-sm font-bold text-amber-600">
              <RichInline text={brightness < target[0] ? step.feedback?.hint1 ?? '再往上滑亮一點～' : step.feedback?.hint2 ?? '太亮了，往下滑一點～'} />
            </p>
          )}
        </AutoScroll>
      )}

      {shot !== null && (
        <AutoScroll>
          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
            <p className="text-lg font-black text-green-700"><RichInline text={step.feedback?.great} /></p>
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
