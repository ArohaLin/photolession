import { useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/** 病例加工：把好照片弄「壞」給小醫生診斷 */
function sickStyle(effect?: string): React.CSSProperties {
  switch (effect) {
    case 'blur':
      return { filter: 'blur(5px)' }
    case 'dark':
      return { filter: 'brightness(0.3)' }
    case 'tilt':
      return { transform: 'rotate(7deg) scale(1.18)' }
    default:
      return {}
  }
}

/** D6 照片醫生：看病例照片，選出病因，開藥方 */
export function Diagnose({ step, onDone }: StepProps) {
  const pid = step.photo!
  const photo = usePhoto(pid)
  const options = step.options ?? []
  const answer = step.answer ?? 0
  const [picked, setPicked] = useState<number | null>(null)
  const [misses, setMisses] = useState(0)
  const correct = picked === answer
  const tiny = step.effect === 'tiny'

  return (
    <div>
      <SayBar text={step.prompt ?? '這張照片生病了！哪裡出問題？'} />

      {/* 病例照片 */}
      <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border-4 border-dashed border-rose-200 bg-slate-100">
        {tiny ? (
          <div
            className="flex items-center justify-center bg-slate-200"
            style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
          >
            <img src={photoUrl(pid)} alt="" className="w-1/4 rounded object-cover" draggable={false} />
          </div>
        ) : (
          <div className="overflow-hidden" style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}>
            <img
              src={photoUrl(pid)}
              alt=""
              className="h-full w-full object-cover"
              style={sickStyle(step.effect)}
              draggable={false}
            />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white">
          🏥 病例
        </span>
      </div>

      {/* 診斷選項 */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          const revealed = picked !== null && correct
          const state =
            revealed && i === answer
              ? 'border-green-400 bg-green-50 text-green-700'
              : picked === i && !correct
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-white text-slate-700'
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null && correct}
              onClick={() => {
                setPicked(i)
                if (i !== answer) setMisses((m) => m + 1)
              }}
              className={`min-h-12 rounded-2xl border-2 px-3 py-3 font-bold transition active:scale-95 ${state}`}
            >
              <RichInline text={opt} />
            </button>
          )
        })}
      </div>

      {picked !== null && !correct && (
        <p className="mt-3 text-center font-bold text-amber-600">再看仔細一點，照片是怎麼了？</p>
      )}

      {correct && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="font-black text-green-700">✅ 診斷正確！</p>
          <p className="mt-2 rounded-xl bg-white p-3 text-sm font-medium text-slate-700">
            💊 藥方：<RichInline text={step.remedy} />
          </p>
          <button
            type="button"
            onClick={() => onDone(misses === 0 ? 3 : 2)}
            className="mt-3 min-h-12 rounded-full bg-sky-500 px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95"
          >
            下一位病人 →
          </button>
        </div>
        </AutoScroll>
      )}
    </div>
  )
}
