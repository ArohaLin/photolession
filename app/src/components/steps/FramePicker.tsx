import { useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

/** 連拍 5 格的「壞格」樣板：模糊或偏移，只有一格又清楚又置中 */
const SPECS = [
  { blur: 6, shift: 0 },
  { blur: 2.5, shift: 0.1 },
  { blur: 0, shift: 0.22 },
  { blur: 0, shift: 0 }, // ★ 最棒的一格
  { blur: 4, shift: -0.12 },
]

/**
 * A6/D2 連拍挑格。step.answer 可指定正解落在第幾格（0–4，預設 3），
 * 樣板隨之輪轉——不同課不會同一個答案位置。
 * 大預覽用 transform 呈現偏移（修 A-R5：object-position 在比例吻合時無效）。
 */
export function FramePicker({ step, onDone }: StepProps) {
  const pid = step.photo!
  const photo = usePhoto(pid)
  const best = step.answer ?? 3
  const frames = SPECS.map((_, i) => SPECS[(i - best + 3 + SPECS.length) % SPECS.length])
  const [preview, setPreview] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [misses, setMisses] = useState(0)
  const correct = picked === best
  const f = frames[preview]

  const frameStyle = (i: number): React.CSSProperties => {
    const spec = frames[i]
    return {
      filter: `blur(${spec.blur * 0.6}px)`,
      transform: `scale(1.2) translateX(${spec.shift * -40}%)`,
    }
  }

  const pick = () => {
    if (correct) return
    setPicked(preview)
    if (preview !== best) setMisses((m) => m + 1)
  }

  return (
    <div>
      <SayBar text={step.prompt ?? step.say} />

      {/* 大預覽：偏移用 transform 呈現（放大溢出、平移可見） */}
      <div
        className="relative mx-auto max-w-md overflow-hidden rounded-2xl bg-black"
        style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
      >
        <img
          src={photoUrl(pid)}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: `blur(${f.blur}px)`, transform: `scale(1.2) translateX(${f.shift * -40}%)` }}
          draggable={false}
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-3 py-1 text-sm font-black text-white">
          第 {preview + 1} 格
        </span>
      </div>

      {/* 底片條 */}
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {frames.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPreview(i)}
            disabled={correct}
            className={`overflow-hidden rounded-lg transition active:scale-95 ${
              correct && i === best
                ? 'ring-4 ring-green-500'
                : !correct && picked === i
                  ? 'ring-4 ring-rose-400'
                  : preview === i
                    ? 'ring-4 ring-sky-400'
                    : 'ring-1 ring-slate-200'
            }`}
          >
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={photoUrl(pid)}
                alt=""
                className="h-full w-full object-cover"
                style={frameStyle(i)}
                draggable={false}
              />
            </div>
          </button>
        ))}
      </div>

      {!correct ? (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={pick}
            className="min-h-12 rounded-full bg-sky-500 px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95"
          >
            ✅ 就選第 {preview + 1} 格！
          </button>
          <p className="mt-2 text-center text-sm text-slate-400">
            點小格子可以逐格檢查（找最清楚、主角在中間的）
          </p>
          {picked !== null && (
            <AutoScroll>
              <p className="mt-2 font-bold text-amber-600">
                {frames[picked].blur > 0
                  ? '這格糊糊的耶～再逐格看看誰最清楚！'
                  : '這格主角偏到旁邊去了～再比比看誰最置中！'}
              </p>
            </AutoScroll>
          )}
        </div>
      ) : (
        <AutoScroll>
          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
            <p className="text-lg font-black text-green-700">
              <RichInline text={step.feedback?.great ?? '好眼力！又清楚、主角又剛好——連拍後挑照片就是這樣挑。'} />
            </p>
            <button
              type="button"
              onClick={() => onDone(misses === 0 ? 3 : 2)}
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
