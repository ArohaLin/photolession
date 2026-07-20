import { useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/** B8 一天的顏色：色溫滑桿——清晨冷藍 ←→ 傍晚金黃（同一場景） */
export function TempSlider({ step, onDone }: StepProps) {
  const pid = step.photo!
  const photo = usePhoto(pid)
  const [t, setT] = useState(0.5) // 0=冷藍, 0.5=中午, 1=金黃
  const [visited, setVisited] = useState<Set<string>>(new Set(['mid']))

  const cold = Math.max(0, 0.5 - t) * 2 // 0~1
  const warm = Math.max(0, t - 0.5) * 2
  const label = t < 0.25 ? '🌌 天亮前（藍調）：冷冷的、安靜的感覺' : t > 0.75 ? '🌇 傍晚黃金時刻：暖暖的、溫柔的感覺' : '☀️ 白天：顏色最正常'

  const onChange = (v: number) => {
    setT(v)
    setVisited((prev) => {
      const next = new Set(prev)
      if (v <= 0.15) next.add('cold')
      if (v >= 0.85) next.add('warm')
      return next
    })
  }
  const explored = visited.has('cold') && visited.has('warm')

  return (
    <div>
      <SayBar text={step.say ?? '拉拉看時間滑桿，同一個地方在不同時間，顏色差多少？'} />
      <div
        className="relative mx-auto max-w-lg overflow-hidden rounded-2xl"
        style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
      >
        <img src={photoUrl(pid)} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {/* 冷暖色罩 */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: `rgba(60,120,255,${cold * 0.75})` }}
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: `rgba(255,140,30,${warm * 0.8})` }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `rgba(20,40,120,${cold * 0.22})` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-2xl">🌌</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 flex-1 accent-amber-500"
          aria-label="一天的時間"
        />
        <span className="text-2xl">🌇</span>
      </div>
      <p className="mt-2 text-center text-sm font-black text-slate-600">{label}</p>

      {explored ? (
        <AutoScroll>
        <div className="mt-3 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '發現了嗎？光有「顏色」！早晚偏暖藍調偏冷——挑對時間，照片自帶魔法。'} />
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
      ) : (
        <p className="mt-2 text-center text-sm font-bold text-amber-600">把滑桿拉到最左和最右各看一次！</p>
      )}
    </div>
  )
}
