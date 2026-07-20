import { useState } from 'react'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

const COLORS = [
  { name: '紅', fill: '#ef4444' },
  { name: '橙', fill: '#f97316' },
  { name: '黃', fill: '#eab308' },
  { name: '綠', fill: '#22c55e' },
  { name: '藍', fill: '#3b82f6' },
  { name: '紫', fill: '#a855f7' },
]

/** C12 色環：點一個顏色，對面的「互補色」會亮起來 */
export function ColorWheel({ step, onDone }: StepProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const [pairs, setPairs] = useState<Set<number>>(new Set())
  const comp = picked === null ? null : (picked + 3) % 6

  const pick = (i: number) => {
    setPicked(i)
    setPairs((prev) => new Set(prev).add(Math.min(i, (i + 3) % 6)))
  }

  const R = 78
  const C = 100

  return (
    <div>
      <SayBar text={step.say ?? '點色環上的任何顏色，看看它「對面」是誰——對面的顏色放一起，主角最跳！'} />
      <svg viewBox="0 0 200 200" className="mx-auto w-64 max-w-full">
        {COLORS.map((c, i) => {
          const a0 = ((i * 60 - 90) * Math.PI) / 180
          const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180
          const x0 = C + R * Math.cos(a0)
          const y0 = C + R * Math.sin(a0)
          const x1 = C + R * Math.cos(a1)
          const y1 = C + R * Math.sin(a1)
          const active = i === picked || i === comp
          return (
            <path
              key={i}
              d={`M ${C} ${C} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} Z`}
              fill={c.fill}
              opacity={picked === null || active ? 1 : 0.25}
              stroke="#fff"
              strokeWidth="3"
              onClick={() => pick(i)}
              className="cursor-pointer"
              style={{ transition: 'opacity 0.3s' }}
            />
          )
        })}
        {picked !== null && comp !== null && (
          <line
            x1={C + (R - 30) * Math.cos(((picked * 60 - 60) * Math.PI) / 180)}
            y1={C + (R - 30) * Math.sin(((picked * 60 - 60) * Math.PI) / 180)}
            x2={C + (R - 30) * Math.cos(((comp * 60 - 60) * Math.PI) / 180)}
            y2={C + (R - 30) * Math.sin(((comp * 60 - 60) * Math.PI) / 180)}
            stroke="#0f172a"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
        )}
        <circle cx={C} cy={C} r="26" fill="#fff" />
        <text x={C} y={C + 6} textAnchor="middle" fontSize="15" fontWeight="900" fill="#334155">
          {picked === null ? '點我' : `${COLORS[picked].name}↔${COLORS[comp!].name}`}
        </text>
      </svg>

      <p className="mt-2 text-center text-sm font-bold text-slate-600">
        {picked === null
          ? ''
          : `${COLORS[picked].name}色的好朋友是對面的${COLORS[comp!].name}色——${COLORS[picked].name}色主角站在${COLORS[comp!].name}色背景前，會超級醒目！`}
      </p>

      {pairs.size >= 2 ? (
        <AutoScroll>
        <div className="mt-3 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '記住幾對好朋友：紅配綠、橙配藍、黃配紫。拍照時幫主角找「對面的顏色」當背景！'} />
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
      ) : (
        picked !== null && (
          <p className="mt-2 text-center text-sm font-bold text-amber-600">
            換一對新的好朋友！點點{['紅', '橙', '黃', '綠', '藍', '紫'].filter((_, i) => i !== picked && i !== (picked! + 3) % 6).join('、')}試試～
          </p>
        )
      )}
    </div>
  )
}
