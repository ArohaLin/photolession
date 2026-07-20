import { CropView } from '../CropView'
import { SayBar } from '../SayBar'
import { NextButton } from '../NextButton'
import { suggestedRect } from './types'
import type { StepProps } from './types'

/** 前後對比示範：versus "suggested"＝原圖 vs 建議裁切；"self"＝單張真實範例 */
export function Compare({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]

  if (step.versus === 'suggested') {
    return (
      <div>
        <SayBar text={step.say} />
        <div className="grid grid-cols-2 gap-3">
          <figure className="min-w-0">
            <CropView pid={pid} />
            <figcaption className="mt-2 text-center text-sm font-bold text-slate-500">
              原本
            </figcaption>
          </figure>
          <figure className="min-w-0">
            <CropView pid={pid} rect={suggestedRect(ann)} />
            <figcaption className="mt-2 text-center text-sm font-bold text-green-600">
              ✂️ 靠近後
            </figcaption>
          </figure>
        </div>
        <div className="text-center">
          <NextButton onClick={() => onDone(0)} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <SayBar text={step.say} />
      <div className="mx-auto max-w-lg">
        <CropView pid={pid} />
      </div>
      <div className="text-center">
        <NextButton onClick={() => onDone(0)} />
      </div>
    </div>
  )
}
