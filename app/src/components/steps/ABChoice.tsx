import { useState } from 'react'
import { CropView } from '../CropView'
import { SayBar } from '../SayBar'
import { NextButton } from '../NextButton'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/**
 * 二選一。答錯不揭答（沿用 Diagnose 模式）：錯的選項標紅、
 * 其餘照樣可點、給提示文字，答對才亮綠並解釋為什麼。
 */
export function ABChoice({ step, onDone }: StepProps) {
  const photos = step.photos ?? []
  const answer = step.answer ?? 0
  const [picked, setPicked] = useState<number | null>(null)
  const [misses, setMisses] = useState(0)
  const correct = picked === answer

  const pick = (i: number) => {
    if (correct) return
    setPicked(i)
    if (i !== answer) setMisses((m) => m + 1)
  }

  return (
    <div>
      <SayBar text={step.prompt ?? step.say} />
      <div className="grid grid-cols-2 gap-3">
        {photos.map((pid, i) => {
          const ring = correct
            ? i === answer
              ? 'ring-4 ring-green-500'
              : 'opacity-50 ring-2 ring-slate-200'
            : picked === i
              ? 'ring-4 ring-rose-400'
              : 'ring-2 ring-slate-200'
          return (
            <button
              key={i}
              type="button"
              disabled={correct}
              onClick={() => pick(i)}
              className={`relative block overflow-hidden rounded-2xl transition active:scale-95 ${ring}`}
            >
              <CropView pid={pid} rect={step.rects?.[i]} />
              {correct && i === answer && (
                <span className="absolute right-2 top-2 text-3xl drop-shadow">✅</span>
              )}
              {!correct && picked === i && (
                <span className="absolute right-2 top-2 text-3xl drop-shadow">❌</span>
              )}
            </button>
          )
        })}
      </div>

      {picked !== null && !correct && (
        <AutoScroll>
          <p className="mt-3 text-center font-bold text-amber-600">
            再想想看～另一張說不定藏著答案！
          </p>
        </AutoScroll>
      )}

      {correct && (
        <AutoScroll>
          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
            <p className="text-lg font-black text-green-700">答對了！</p>
            {step.why && <p className="mt-1 text-sm font-medium text-slate-600"><RichInline text={step.why} /></p>}
            <NextButton onClick={() => onDone(misses === 0 ? 3 : 2)} />
          </div>
        </AutoScroll>
      )}
    </div>
  )
}
