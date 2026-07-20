import { useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { CameraShell } from '../camera/Shell'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/** B9 數位變焦劣化：晚上倍率拉越高、畫質崩越慘——親身體驗「晚上別亂 zoom」 */
export function ZoomDegrade({ step, onDone }: StepProps) {
  const pid = step.photo!
  const photo = usePhoto(pid)
  const w = photo?.w ?? 1600
  const h = photo?.h ?? 1200
  const [z, setZ] = useState(1) // 1x ~ 10x
  const [sawWorst, setSawWorst] = useState(false)
  const [shot, setShot] = useState(false)

  const t = (z - 1) / 9 // 0~1
  const blur = t * 7
  const noise = t * 0.75
  const cw = w / z
  const ch = h / z
  const vb = `${(w - cw) / 2} ${(h - ch) / 2} ${cw} ${ch}`
  const ok = z <= 2

  const onZoom = (v: number) => {
    setZ(v)
    if (v >= 9) setSawWorst(true)
  }

  return (
    <div>
      <SayBar text={[step.say, step.goal?.say].filter(Boolean).join(' ')} />
      <CameraShell
        onShutter={sawWorst && ok && !shot ? () => setShot(true) : undefined}
        shutterGlow={sawWorst && ok && !shot}
      >
        <div className="relative">
          <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" className="block aspect-[4/3] w-full" style={{ filter: `blur(${blur}px) saturate(${1 - t * 0.35})` }}>
            <image href={photoUrl(pid)} x={0} y={0} width={w} height={h} />
          </svg>
          {/* 雜訊 */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: noise, mixBlendMode: 'overlay' }}>
            <filter id="zd-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#zd-noise)" />
          </svg>
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-3 py-1 text-sm font-black text-white">
            {z.toFixed(0)}x
          </span>
          {z >= 7 && (
            <p className="absolute bottom-2 left-0 right-0 text-center text-sm font-black text-rose-300 drop-shadow">
              畫質崩壞啦！糊成馬賽克 😵
            </p>
          )}
        </div>
      </CameraShell>

      {!shot && (
        <>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500">1x</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={z}
              onChange={(e) => onZoom(Number(e.target.value))}
              className="h-11 flex-1 accent-rose-500"
              aria-label="數位變焦"
            />
            <span className="text-sm font-bold text-slate-500">10x</span>
          </div>
          <p className="mt-2 text-center text-sm font-bold text-amber-600">
            {!sawWorst
              ? '先把倍率拉到最大，看看會發生什麼事…'
              : ok
                ? '對！退回 1–2x 最清楚——用腳走近吧。快門亮了！'
                : '看到了吧！現在退回 1x～2x，畫質就回來了。'}
          </p>
        </>
      )}

      {shot && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '晚上光少，數位變焦會讓畫質崩壞。口訣：夜拍不 zoom，用腳靠近！'} />
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
