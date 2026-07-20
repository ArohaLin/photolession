import { useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { CameraShell } from '../camera/Shell'
import { RichInline } from '../../ui/RichText'
import type { Rect } from '../../types'
import type { StepProps } from './types'

interface Lens {
  key: string
  label: string
  rect: Rect
  note: string
  warn?: boolean
}

const LENSES: Lens[] = [
  { key: 'uw', label: '0.5x', rect: [0, 0, 1, 1], warn: true,
    note: '超廣角：裝得下超多東西！但邊邊會暗暗的，而且人站邊邊會被拉寬變形喔。' },
  { key: 'main', label: '1x', rect: [0.25, 0.25, 0.5, 0.5],
    note: '主鏡頭：最常用、畫質最好。九成的照片用它就對了！' },
  { key: 'tele', label: '3x', rect: [0.415, 0.415, 0.17, 0.17],
    note: '長焦：把遠的東西拉近。拍不方便靠近的東西（怕生的鳥）很好用。' },
]

/** A5 變焦與鏡頭：切換 0.5x/1x/3x 看視野變化（同一張圖即時裁切） */
export function ZoomLens({ step, onDone }: StepProps) {
  const pid = step.photo!
  const photo = usePhoto(pid)
  const w = photo?.w ?? 1600
  const h = photo?.h ?? 1200
  const [cur, setCur] = useState(0)
  const [tried, setTried] = useState<Set<string>>(new Set(['uw']))
  const allTried = tried.size === LENSES.length
  const lens = LENSES[cur]
  const [rx, ry, rw, rh] = lens.rect

  const pick = (i: number) => {
    setCur(i)
    setTried((prev) => new Set(prev).add(LENSES[i].key))
  }

  return (
    <div>
      <SayBar text={step.say ?? '按按看三顆倍率鈕，同一個地方看起來差多少？'} />
      <CameraShell
        aboveShutter={
          <div className="flex gap-2">
            {LENSES.map((l, i) => (
              <button
                key={l.key}
                type="button"
                onClick={() => pick(i)}
                className={`min-h-10 rounded-full px-4 text-sm font-black transition active:scale-90 ${
                  i === cur ? 'bg-yellow-300 text-slate-900' : 'bg-slate-700 text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="relative">
          <svg
            viewBox={`${rx * w} ${ry * h} ${rw * w} ${rh * h}`}
            preserveAspectRatio="xMidYMid slice"
            className="block aspect-[4/3] w-full"
          >
            <image href={photoUrl(pid)} x={0} y={0} width={w} height={h} />
          </svg>
          {/* 超廣角邊緣變形示意 */}
          {lens.warn && (
            <div className="pointer-events-none absolute inset-0 rounded-none"
              style={{ boxShadow: 'inset 0 0 60px 14px rgba(0,0,0,0.35)' }} />
          )}
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-3 py-1 text-sm font-black text-white">
            {lens.label}
          </span>
        </div>
      </CameraShell>

      <div className={`mt-3 rounded-2xl p-3 text-center text-sm font-bold ${lens.warn ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-slate-700'}`}>
        {lens.note}
      </div>
      <p className="mt-2 text-center text-sm font-black text-slate-500">
        {allTried ? '' : `試過 ${tried.size} / 3 顆鏡頭`}
      </p>

      {allTried && (
        <AutoScroll>
        <div className="mt-3 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '記住口訣：先用腳走近，再用鏡頭拉近！數位變焦拉太多會變糊喔。'} />
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
