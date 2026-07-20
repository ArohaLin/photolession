import { useState } from 'react'
import { photoUrl, maskUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { gradeRange } from '../../engine/geometry'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/** 光圈刻度：由大光圈（小 f）到小光圈（大 f） */
const STOPS = [1.8, 2.8, 4, 5.6, 8, 11, 16]
const MAX_BLUR = 16

/** A2 光圈模擬：拉滑桿改變光圈，看景深（背景模糊）怎麼變 */
export function ApertureSim({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]
  const photo = usePhoto(pid)
  const hasMask = !!ann?.mask
  const target = (step.goal?.aperture ?? [1.8, 2.8]) as [number, number]

  // 初始值放在目標區「對面」那端，避免零互動過關（B-O12）
  const [idx, setIdx] = useState(() => (target[1] >= 8 ? 0 : STOPS.length - 1))
  const [shot, setShot] = useState<number | null>(null)
  const f = STOPS[idx]

  // 大光圈(小 f) → 模糊多；小光圈(大 f) → 清晰
  const t = (16 - f) / (16 - 1.8) // 開口示意用
  // 模糊量 ∝ 1/f（f/8 只剩 ~2px，不再與「都清楚」打架）
  const blur = (MAX_BLUR * (1 / f - 1 / 16)) / (1 / 1.8 - 1 / 16)
  const openR = 8 + t * 26 // 光圈開口
  const onTarget = gradeRange(f, target) === 'great'

  const tooOpen = f > target[1] // 需要更大光圈（更小 f）
  const hint =
    step.feedback && (tooOpen ? step.feedback.hint2 : step.feedback.hint1)

  return (
    <div>
      <SayBar text={[step.say, step.goal?.say].filter(Boolean).join(' ')} />

      <div
        className="relative mx-auto max-w-lg overflow-hidden rounded-2xl bg-slate-200"
        style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
      >
        {/* 底層：整張照片，依光圈模糊 */}
        <img
          src={photoUrl(pid)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `blur(${blur}px)`, transform: 'scale(1.06)' }}
          draggable={false}
        />
        {/* 有去背遮罩時：主角保持清楚疊在上面（淺景深效果） */}
        {hasMask && (
          <img
            src={maskUrl(pid)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        )}
        <div className="absolute right-2 top-2 rounded-full bg-white/85 px-3 py-1 text-sm font-black text-slate-700">
          f/{f}
        </div>
      </div>

      {shot === null ? (
        <>
          {/* 光圈開口示意（要讓小朋友知道「這個就是光圈」） */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <figure className="text-center">
              <svg viewBox="0 0 80 80" className="h-16 w-16">
                <circle cx="40" cy="40" r="34" fill="#1e293b" />
                <circle cx="40" cy="40" r={openR} fill="#fde68a" />
              </svg>
              <figcaption className="mt-0.5 text-xs font-black text-sky-600">☝️ 光圈本人</figcaption>
            </figure>
            <div className="text-sm font-bold text-slate-600">
              <p className="text-base font-black text-slate-700">
                f/{f}｜{f <= 4 ? '光圈開很大' : f >= 8 ? '光圈縮很小' : '光圈中等'}
              </p>
              <p className="text-slate-400">
                {f <= 4 ? '進光多、背景糊' : f >= 8 ? '進光少、都清楚' : '背景微微糊'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="whitespace-nowrap text-xs font-bold text-slate-500">大光圈</span>
            <input
              type="range"
              min={0}
              max={STOPS.length - 1}
              step={1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="h-11 flex-1 accent-sky-500"
              aria-label="調整光圈"
            />
            <span className="whitespace-nowrap text-xs font-bold text-slate-500">小光圈</span>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShot(3)}
              disabled={!onTarget}
              className={`min-h-12 rounded-full px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95 ${
                onTarget ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              📸 就是這樣！
            </button>
            {!onTarget && hint && (
              <p className="mt-2 text-sm font-bold text-amber-600">
                <RichInline text={hint} />
              </p>
            )}
          </div>
        </>
      ) : (
        <AutoScroll>
          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
            <p className="text-lg font-black text-green-700">
              <RichInline text={step.feedback?.great} />
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
