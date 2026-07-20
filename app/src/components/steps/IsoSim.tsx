import { useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { ExposureMeter } from '../ExposureMeter'
import { gradeCoverage, starsFor } from '../../engine/geometry'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

const ISO = [100, 200, 400, 800, 1600, 3200, 6400]

/** A4 ISO 模擬：拉高 ISO 讓暗場景變亮，但顆粒（雜訊）也會變多 */
export function IsoSim({ step, onDone }: StepProps) {
  const pid = step.photo!
  const photo = usePhoto(pid)
  const target = (step.goal?.exposure ?? [0.85, 1.15]) as [number, number]
  const [idx, setIdx] = useState(0)
  const [shot, setShot] = useState<number | null>(null)

  const brightness = 0.4 + (idx / 6) * 1.0
  const grain = Math.pow(idx / 6, 1.5) * 0.9
  const rawGrade = gradeCoverage(brightness, target)
  // clean 模式（B-O3）：顆粒也計分——ISO 太高就算夠亮也只給 good
  const tooGrainy = step.mode === 'clean' && idx >= 5
  const grade = tooGrainy && rawGrade !== 'retry' ? 'good' : rawGrade
  const onTarget = grade === 'great'

  return (
    <div>
      <SayBar text={[step.say, step.goal?.say].filter(Boolean).join(' ')} />
      <div
        className="relative mx-auto max-w-md overflow-hidden rounded-2xl bg-black"
        style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
      >
        <img
          src={photoUrl(pid)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `brightness(${brightness})` }}
          draggable={false}
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: grain, mixBlendMode: 'overlay' }}
        >
          <filter id="iso-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#iso-grain)" />
        </svg>
        <div className="absolute right-2 top-2 rounded-full bg-white/85 px-3 py-1 text-sm font-black text-slate-700">
          ISO {ISO[idx]}
        </div>
      </div>

      {shot === null ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span className="whitespace-nowrap text-xs font-bold text-slate-500">🌙暗</span>
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="h-11 flex-1 accent-amber-500"
              aria-label="調整 ISO"
            />
            <span className="whitespace-nowrap text-xs font-bold text-slate-500">亮＋顆粒</span>
          </div>
          <ExposureMeter value={brightness} target={target} />
          {tooGrainy && rawGrade === 'great' && (
            <p className="mt-1 text-center text-sm font-bold text-amber-600">
              亮是夠亮了，但顆粒爆表——往左退一格試試！
            </p>
          )}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShot(starsFor[grade])}
              disabled={grade === 'retry'}
              className={`min-h-12 rounded-full px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95 ${
                onTarget ? 'bg-green-500' : grade === 'good' ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            >
              📸 就拍這張！
            </button>
            {grade === 'retry' && (
              <p className="mt-2 text-sm font-bold text-amber-600">
                <RichInline text={brightness < target[0] ? step.feedback?.hint2 : step.feedback?.hint1} />
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
