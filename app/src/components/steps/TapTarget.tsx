import { useRef, useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { pointInBox } from '../../engine/geometry'
import { SayBar } from '../SayBar'
import { NextButton } from '../NextButton'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

export function TapTarget({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]
  const photo = usePhoto(pid)
  const box = ann?.subject?.bbox
  const ref = useRef<HTMLDivElement>(null)
  const [hit, setHit] = useState(false)
  const [misses, setMisses] = useState(0)
  const showBoxHint = misses >= 2 && !hit

  const onTap = (e: React.PointerEvent) => {
    if (hit || !box) return
    const r = ref.current!.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    if (pointInBox(px, py, box, 0.05)) setHit(true)
    else setMisses((m) => m + 1)
  }

  return (
    <div>
      <SayBar text={step.prompt ?? step.say} />
      <div
        ref={ref}
        onPointerDown={onTap}
        className="relative mx-auto max-w-lg cursor-pointer select-none overflow-hidden rounded-2xl"
        style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
      >
        <img src={photoUrl(pid)} alt="" className="h-full w-full object-cover" draggable={false} />
        {showBoxHint && box && (
          <div
            className="pointer-events-none absolute animate-pulse rounded-xl ring-4 ring-yellow-300"
            style={{
              left: `${box[0] * 100}%`,
              top: `${box[1] * 100}%`,
              width: `${box[2] * 100}%`,
              height: `${box[3] * 100}%`,
            }}
          />
        )}
        {hit && box && (
          <div
            className="pointer-events-none absolute flex items-center justify-center rounded-xl bg-green-500/30 ring-4 ring-green-500"
            style={{
              left: `${box[0] * 100}%`,
              top: `${box[1] * 100}%`,
              width: `${box[2] * 100}%`,
              height: `${box[3] * 100}%`,
            }}
          >
            <span className="text-4xl">✓</span>
          </div>
        )}
      </div>
      {/* 教學輔助句（之前被 prompt 蓋掉的 say，改顯示在圖下方） */}
      {!hit && step.prompt && step.say && (
        <p className="mt-2 text-center text-sm font-medium text-slate-500"><RichInline text={step.say} /></p>
      )}

      {/* 提示階梯：錯 1 次出 hint1、錯 2 次起出 hint2＋黃框 */}
      {!hit && misses === 1 && (
        <AutoScroll>
          <p className="mt-3 text-center font-bold text-amber-600">
            🤔 <RichInline text={step.feedback?.hint1 ?? '不是那裡喔，再找找看～'} />
          </p>
        </AutoScroll>
      )}
      {!hit && showBoxHint && (
        <AutoScroll>
          <p className="mt-3 text-center font-bold text-amber-600">
            💡 <RichInline text={step.feedback?.hint2 ?? '看看發亮的地方～'} />
          </p>
        </AutoScroll>
      )}
      {hit && (
        <AutoScroll>
          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
            <p className="text-lg font-black text-green-700"><RichInline text={step.feedback?.great ?? '答對了！'} /></p>
            <NextButton onClick={() => onDone(misses === 0 ? 3 : 2)} />
          </div>
        </AutoScroll>
      )}
    </div>
  )
}
