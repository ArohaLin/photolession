import { useEffect, useRef, useState } from 'react'
import { photoUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { CameraShell } from '../camera/Shell'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

const CALM = 0.22 // 穩定門檻（振幅比例）

/** A4 拿穩不手震：畫面會晃，按住「穩住」讓晃動變小，夠穩時按快門 */
export function SteadyGame({ step, onDone }: StepProps) {
  const pid = step.photo!
  const photo = usePhoto(pid)
  const [amp, setAmp] = useState(1) // 晃動幅度 0~1
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const holding = useRef(false)
  const ampRef = useRef(1)
  const [result, setResult] = useState<'sharp' | 'blurry' | null>(null)

  useEffect(() => {
    let raf = 0
    let t = 0
    const tick = () => {
      t += 0.14
      // 按住→振幅慢慢縮小；放開→慢慢回彈
      ampRef.current = Math.max(0, Math.min(1, ampRef.current + (holding.current ? -0.012 : 0.008)))
      setAmp(ampRef.current)
      const a = ampRef.current
      setPos({
        x: Math.sin(t * 1.7) * 14 * a + Math.sin(t * 3.1) * 6 * a,
        y: Math.cos(t * 2.3) * 12 * a + Math.sin(t * 4.7) * 5 * a,
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const steady = amp <= CALM

  const shoot = () => {
    if (result) return
    setResult(steady ? 'sharp' : 'blurry')
  }

  return (
    <div>
      <SayBar text={[step.say, step.goal?.say].filter(Boolean).join(' ')} />
      <CameraShell
        onShutter={result ? undefined : shoot}
        shutterGlow={steady && !result}
        aboveShutter={
          !result ? (
            <button
              type="button"
              onPointerDown={() => (holding.current = true)}
              onPointerUp={() => (holding.current = false)}
              onPointerLeave={() => (holding.current = false)}
              className="min-h-12 select-none rounded-full bg-amber-400 px-8 py-3 text-base font-black text-white shadow-lg active:scale-95"
            >
              🫁 按住穩住！（夾緊手肘）
            </button>
          ) : undefined
        }
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}>
          <img
            src={photoUrl(pid)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: result ? 'none' : `translate(${pos.x}px, ${pos.y}px) scale(1.12)`,
              filter: result === 'blurry' ? 'blur(7px)' : result === 'sharp' ? 'none' : `blur(${amp * 1.5}px)`,
            }}
            draggable={false}
          />
          {/* 穩定計 */}
          {!result && (
            <div className="absolute left-2 right-2 top-2">
              <div className="h-3 overflow-hidden rounded-full bg-black/40">
                <div
                  className={`h-full transition-[width] ${steady ? 'bg-green-400' : 'bg-amber-400'}`}
                  style={{ width: `${(1 - amp) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-center text-xs font-black text-white drop-shadow">
                {steady ? '很穩！快按快門 📸' : '好晃啊…按住下面的「穩住！」'}
              </p>
            </div>
          )}
        </div>
      </CameraShell>

      {!result && (
        <p className="mt-2 text-center text-sm text-slate-400">
          訣竅：雙手握穩、手肘夾身體、輕輕呼氣再按快門
        </p>
      )}

      {result === 'blurry' && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-center">
          <p className="text-lg font-black text-amber-700">糊掉了！手還在晃就按了快門。</p>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-3 min-h-12 rounded-full bg-amber-400 px-8 py-3 text-lg font-black text-white shadow active:scale-95"
          >
            再試一次
          </button>
        </div>
        </AutoScroll>
      )}
      {result === 'sharp' && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '好清楚！穩住再拍，照片就不會糊。'} />
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
