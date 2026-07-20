import { useState } from 'react'
import { photoUrl, maskUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { ExposureMeter } from '../ExposureMeter'
import { gradeCoverage, starsFor } from '../../engine/geometry'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

const F = [1.8, 2.8, 4, 5.6, 8, 11, 16]
const SH = ['1/1000', '1/250', '1/60', '1/30', '1/15', '1/4', '1"']
const ISO = [100, 200, 400, 800, 1600, 3200, 6400]

function TriSlider({
  icon,
  name,
  value,
  setValue,
  readout,
  note,
  accent,
}: {
  icon: string
  name: string
  value: number
  setValue: (n: number) => void
  readout: string
  note: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-sm font-bold text-slate-600">
        {icon}
        {name}
      </span>
      <input
        type="range"
        min={0}
        max={6}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className={`h-11 flex-1 ${accent}`}
        aria-label={name}
      />
      <span className="w-20 shrink-0 text-right text-sm font-bold leading-tight text-slate-500">
        {readout}
        <br />
        <span className="text-slate-400">{note}</span>
      </span>
    </div>
  )
}

/** A5 曝光三角：光圈／快門／ISO 三滑桿一起決定亮度 */
export function ExposureSim({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]
  const photo = usePhoto(pid)
  const hasMask = !!ann?.mask
  const creative = step.mode === 'creative'
  const target = (step.goal?.exposure ?? [0.85, 1.15]) as [number, number]

  const [ap, setAp] = useState(6)
  const [sh, setSh] = useState(0)
  const [iso, setIso] = useState(0)
  const [shot, setShot] = useState<number | null>(null)

  const apUnits = 6 - ap // 大光圈進光多
  const total = apUnits + sh + iso // 0..18
  const brightness = 0.25 + (total / 18) * 1.3
  const bgBlur = hasMask ? (apUnits / 6) * 13 : 0
  const shake = sh >= 5 ? (sh - 4) * 1.2 : 0
  const grain = Math.pow(iso / 6, 1.5) * 0.85

  const expGrade = gradeCoverage(brightness, target)
  const wideOpen = ap <= 2
  // 副作用門檻（B-O4）：ISO 爆顆粒或快門慢到手震，就算亮度對也只給 good
  const clean = iso <= 4 && sh <= 4
  const grade = creative
    ? expGrade === 'great' && wideOpen && clean
      ? 'great'
      : expGrade === 'retry'
        ? 'retry'
        : 'good'
    : expGrade
  const onTarget = grade === 'great'

  const hint =
    grade === 'retry'
      ? step.feedback?.hint1
      : creative && expGrade === 'great' && wideOpen && !clean
        ? '亮度對了，但顆粒／手震把照片弄髒了——換一個兄弟來補光！'
        : creative && !wideOpen
          ? step.feedback?.hint2 ?? step.feedback?.hint1
          : step.feedback?.good

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
          style={{ filter: `brightness(${brightness}) blur(${Math.max(bgBlur, shake)}px)`, transform: 'scale(1.06)' }}
          draggable={false}
        />
        {hasMask && (
          <img
            src={maskUrl(pid)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: `brightness(${brightness}) blur(${shake}px)` }}
            draggable={false}
          />
        )}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: grain, mixBlendMode: 'overlay' }}
        >
          <filter id="exp-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#exp-grain)" />
        </svg>
      </div>

      <ExposureMeter value={brightness} target={target} />

      {shot === null ? (
        <>
          <div className="mt-3 space-y-2">
            <TriSlider icon="🔵" name="光圈" value={ap} setValue={setAp} readout={`f/${F[ap]}`} note={ap <= 2 ? '背景糊' : '全清楚'} accent="accent-sky-500" />
            <TriSlider icon="⏱️" name="快門" value={sh} setValue={setSh} readout={`${SH[sh]}s`} note={sh >= 5 ? '會手震' : '穩'} accent="accent-fuchsia-500" />
            <TriSlider icon="🔆" name="ISO" value={iso} setValue={setIso} readout={`${ISO[iso]}`} note={iso >= 5 ? '顆粒多' : '乾淨'} accent="accent-amber-500" />
          </div>
          <div className="mt-4 text-center">
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
            {grade !== 'great' && hint && <p className="mt-2 text-sm font-bold text-amber-600"><RichInline text={hint} /></p>}
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
