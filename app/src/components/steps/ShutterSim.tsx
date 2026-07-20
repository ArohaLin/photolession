import { useState } from 'react'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { gradeRange } from '../../engine/geometry'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

const LABELS = ['1/1000', '1/500', '1/125', '1/30', '1/8', '1/2', '1"']

/** 定格場景：狗往右朝球跑，慢快門會拖出殘影；背景靜物一直清楚 */
function FreezeScene({ slowness }: { slowness: number }) {
  const streak = slowness * 150
  return (
    <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 to-green-200">
      {/* 靜止的背景：不管快門多慢都清清楚楚——只有跑很快的狗狗才會糊 */}
      <span className="absolute" style={{ top: '9%', left: '14%', fontSize: 30 }}>☁️</span>
      <span className="absolute" style={{ top: '13%', left: '70%', fontSize: 26 }}>☁️</span>
      <div className="absolute bottom-0 h-10 w-full bg-green-300/60" />
      <span className="absolute" style={{ bottom: '2%', left: '5%', fontSize: 40 }}>🌳</span>
      <span className="absolute" style={{ bottom: '3%', left: '86%', fontSize: 32 }}>🌳</span>
      <span className="absolute" style={{ bottom: '3%', left: '38%', fontSize: 18 }}>🌼</span>
      {/* 移動殘影：快門越慢，狗狗身後（左側）拖得越長 */}
      <div
        className="absolute"
        style={{
          top: '46%',
          left: '58%',
          height: 38,
          width: streak,
          transform: 'translate(-100%, -50%)',
          background: 'linear-gradient(to left, rgba(70,70,85,0.45), transparent)',
          borderRadius: 9999,
          filter: 'blur(3px)',
        }}
      />
      {/* 快速移動的狗狗：翻面朝右（朝球跑），快門越慢越糊 */}
      <span
        className="absolute"
        style={{ top: '46%', left: '58%', transform: 'translate(-50%,-50%) scaleX(-1)', fontSize: 54, filter: `blur(${slowness * 3}px)` }}
      >
        🐕
      </span>
      <span className="absolute" style={{ top: '38%', left: '76%', fontSize: 24 }}>
        🎾
      </span>
    </div>
  )
}

/** 絲綢瀑布場景：慢快門把水流拉成滑順的線 */
function SilkScene({ slowness }: { slowness: number }) {
  const lines = [18, 32, 45, 58, 71, 84]
  const gap = ((1 - slowness) * 16).toFixed(1)
  return (
    <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-b from-slate-400 to-emerald-800">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {lines.map((x, i) => (
          <line
            key={i}
            x1={x}
            y1="0"
            x2={x + (i % 2 ? 2 : -2)}
            y2="100"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={1.6}
            strokeDasharray={`6 ${gap}`}
            style={{ filter: `blur(${slowness * 1.6}px)` }}
          />
        ))}
      </svg>
      <div className="absolute bottom-0 h-6 w-full bg-white/40 blur-sm" />
    </div>
  )
}

/** A3 快門模擬：快門快←→慢，定格動作或拉出流動線條 */
export function ShutterSim({ step, onDone }: StepProps) {
  const silk = step.mode === 'silk'
  const target = (step.goal?.shutter ?? (silk ? [0.65, 1] : [0, 0.3])) as [number, number]
  const [idx, setIdx] = useState(silk ? 0 : LABELS.length - 1)
  const [shot, setShot] = useState<number | null>(null)
  const slowness = idx / (LABELS.length - 1)
  const onTarget = gradeRange(slowness, target) === 'great'

  return (
    <div>
      <SayBar text={[step.say, step.goal?.say].filter(Boolean).join(' ')} />
      {silk ? <SilkScene slowness={slowness} /> : <FreezeScene slowness={slowness} />}
      <p className="mt-2 text-center text-sm font-black text-slate-600">
        快門：{LABELS[idx]}{idx === LABELS.length - 1 ? '（1 秒）' : ' 秒'}
        {slowness <= 0.2 ? '——超快！' : slowness >= 0.8 ? '——超慢～' : ''}
      </p>

      {shot === null ? (
        <>
          <div className="mt-2 flex items-center gap-3">
            <span className="whitespace-nowrap text-xs font-bold text-slate-500">⚡快</span>
            <input
              type="range"
              min={0}
              max={LABELS.length - 1}
              step={1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="h-11 flex-1 accent-sky-500"
              aria-label="調整快門"
            />
            <span className="whitespace-nowrap text-xs font-bold text-slate-500">🐢慢</span>
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShot(3)}
              disabled={!onTarget}
              className={`min-h-12 rounded-full px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95 ${
                onTarget ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              📸 就拍這張！
            </button>
            {!onTarget && (
              <p className="mt-2 text-sm font-bold text-amber-600"><RichInline text={step.feedback?.hint1} /></p>
            )}
          </div>
        </>
      ) : (
        <AutoScroll>
          <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
            <p className="text-lg font-black text-green-700"><RichInline text={step.feedback?.great} /></p>
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
