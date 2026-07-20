import { useState } from 'react'
import { CropView } from '../CropView'
import { SayBar } from '../SayBar'
import { NextButton } from '../NextButton'
import { PhoneMock } from '../PhoneMock'
import { ConceptArt } from '../ConceptArt'
import { RichInline, RichText } from '../../ui/RichText'
import { cropByName } from './types'
import type { StepProps } from './types'

/** 瞳孔類比：開燈／關燈看瞳孔大小變化，對應光圈。整個場景跟著變亮變暗。 */
function PupilAnalogy() {
  const [bright, setBright] = useState(false)
  const pupil = bright ? 12 : 30
  return (
    <div
      className={`rounded-2xl p-6 text-center transition-colors duration-500 ${
        bright ? 'bg-sky-100' : 'bg-slate-800'
      }`}
    >
      <p className={`mb-2 text-3xl transition-opacity duration-500 ${bright ? '' : 'opacity-40'}`}>
        {bright ? '☀️☀️☀️' : '🌙✨'}
      </p>
      <svg viewBox="0 0 120 120" className="mx-auto w-40">
        <circle cx="60" cy="60" r="46" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="60" cy="60" r="30" fill={bright ? '#7dd3fc' : '#0ea5e9'} />
        <circle
          cx="60"
          cy="60"
          r={pupil}
          fill="#0f172a"
          style={{ transition: 'r 0.5s ease' }}
        />
        <circle cx="50" cy="50" r="5" fill="#ffffff" opacity="0.85" />
      </svg>
      <p
        className={`mt-3 text-lg font-black transition-colors duration-500 ${
          bright ? 'text-slate-700' : 'text-white'
        }`}
      >
        {bright ? '很亮 → 瞳孔變小（光太多，縮小一點）' : '很暗 → 瞳孔變大（多收一點光）'}
      </p>
      <button
        type="button"
        onClick={() => setBright((b) => !b)}
        className="mt-3 min-h-12 rounded-full bg-amber-400 px-6 py-2 font-black text-white shadow active:scale-95"
      >
        {bright ? '🌙 關燈試試' : '☀️ 開燈試試'}
      </button>
    </div>
  )
}

/** 名詞登場卡：新名詞的正式亮相，可附對照圖 */
function TermCard({
  term,
  kidDef,
  children,
}: {
  term: string
  kidDef?: string
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-sky-100 to-indigo-50 p-6">
      <p className="text-center text-sm font-black tracking-wide text-sky-500">
        📖 新名詞登場
      </p>
      <p className="mt-2 text-center text-4xl font-black text-sky-800">{term}</p>
      {kidDef && (
        <div className="mt-4 rounded-2xl bg-white/85 p-4 leading-relaxed text-slate-700">
          <RichText text={kidDef} />
        </div>
      )}
      {children}
    </div>
  )
}

/** 怎麼做步驟卡：真手機上的操作，一步一格 */
function HowToCard({
  title,
  steps,
  mock,
  art,
}: {
  title?: string
  steps: string[]
  mock?: string
  art?: string
}) {
  return (
    <div className="rounded-3xl bg-slate-100 p-5">
      <p className="mb-3 text-center text-lg font-black text-slate-700">
        🛠️ {title ?? '跟著做做看'}
      </p>
      {mock && (
        <div className="mb-4">
          <PhoneMock name={mock} />
        </div>
      )}
      {art && !mock && (
        <div className="mb-4">
          <ConceptArt name={art} />
        </div>
      )}
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-base font-black text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 pt-0.5 font-medium text-slate-700">
              <RichText text={s} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** 教學示範步驟：single / compare / analogy / phone-reality / term / howto */
export function Example({ step, annotations, onDone }: StepProps) {
  const layout = step.layout ?? 'single'
  const photos = step.photos ?? (step.photo ? [step.photo] : [])

  return (
    <div>
      <SayBar text={step.say} />

      {layout === 'analogy' ? (
        <PupilAnalogy />
      ) : layout === 'term' && step.term ? (
        <TermCard term={step.term} kidDef={step.kid_def}>
          {step.art && (
            <div className="mt-4">
              <ConceptArt name={step.art} />
            </div>
          )}
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {photos.map((pid, i) => (
                <figure key={i} className="min-w-0">
                  <CropView pid={pid} rect={cropByName(step.crops?.[i], annotations[pid])} />
                  {step.labels?.[i] && (
                    <figcaption className="mt-1 text-center text-sm font-black text-sky-700">
                      <RichInline text={step.labels[i]} />
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </TermCard>
      ) : layout === 'howto' && step.howto ? (
        <HowToCard title={step.title} steps={step.howto} mock={step.mock} art={step.art} />
      ) : photos.length === 0 && step.art ? (
        <ConceptArt name={step.art} />
      ) : (
        <div
          className={
            photos.length === 3
              ? 'grid grid-cols-3 gap-2'
              : photos.length > 1
                ? 'grid grid-cols-2 gap-3'
                : 'mx-auto max-w-lg'
          }
        >
          {photos.map((pid, i) => (
            <figure key={i} className="min-w-0">
              <CropView pid={pid} rect={cropByName(step.crops?.[i], annotations[pid])} />
              {step.labels?.[i] && (
                <figcaption className="mt-2 text-center text-sm font-bold text-slate-600">
                  <RichInline text={step.labels[i]} />
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {layout === 'phone-reality' && (
        <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-center text-sm font-bold text-amber-700">
          📱 這就是你的手機做得到的魔法！
        </p>
      )}

      <div className="text-center">
        <NextButton onClick={() => onDone(0)} />
      </div>
    </div>
  )
}
