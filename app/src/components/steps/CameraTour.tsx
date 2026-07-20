import { useState } from 'react'
import { photoUrl } from '../../content'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { CameraShell } from '../camera/Shell'
import type { StepProps } from './types'

interface Spot {
  key: string
  icon: string
  name: string
  desc: string
  /** 位置：取景窗相對座標或特殊位置 */
  pos: 'tl' | 'tr' | 'zoom' | 'shutter' | 'flip' | 'grid'
}

const SPOTS: Spot[] = [
  { key: 'flash', icon: '⚡', name: '閃光燈', pos: 'tl',
    desc: '很暗時可以補光。但拍食物、拍玻璃、拍很遠的東西時不要開，會變醜喔！' },
  { key: 'night', icon: '🌙', name: '夜間模式', pos: 'tr',
    desc: '晚上會自動出現的月亮圖示。它會多收集一點光，讓夜晚照片變亮又清楚。' },
  { key: 'zoom', icon: '1x', name: '變焦倍率', pos: 'zoom',
    desc: '0.5 是超廣角（裝更多）、1x 最常用、3x 拉近遠的東西。之後 A5 課會專門教！' },
  { key: 'shutter', icon: '⬜', name: '快門鍵', pos: 'shutter',
    desc: '輕輕按一下＝拍照！壓住不放會變成錄影喔。想連拍，把白色圓鈕「往左邊滑住」不放。' },
  { key: 'flip', icon: '🔄', name: '前後切換', pos: 'flip',
    desc: '換成前鏡頭就能自拍。跟家人合照時超好用！' },
  { key: 'grid', icon: '#', name: '格線', pos: 'grid',
    desc: '在設定裡打開「格線」，畫面會出現井字，幫你把照片排整齊（C5 井字魔法用它）。' },
]

/** A1 認識你的相機：點亮 6 個部位學功能，最後小測驗 */
export function CameraTour({ step, onDone }: StepProps) {
  const pid = step.photo ?? 'px-16256623'
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<Spot | null>(null)
  const [quiz, setQuiz] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [wrong, setWrong] = useState(false)
  const allSeen = seen.size === SPOTS.length

  const look = (s: Spot) => {
    setOpen(s)
    setSeen((prev) => new Set(prev).add(s.key))
  }

  const dot = (s: Spot) => (
    <button
      key={s.key}
      type="button"
      onClick={() => (quiz ? answer(s) : look(s))}
      className={`flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-base font-black shadow transition active:scale-90 ${
        seen.has(s.key) && !quiz
          ? 'bg-green-400 text-white'
          : 'animate-pulse bg-yellow-300 text-slate-800'
      }`}
      aria-label={s.name}
    >
      {s.icon}
    </button>
  )

  const answer = (s: Spot) => {
    if (s.key === 'flip') {
      setQuizDone(true)
      setWrong(false)
    } else {
      setWrong(true)
    }
  }

  const byPos = (p: Spot['pos']) => SPOTS.filter((s) => s.pos === p)

  return (
    <div>
      <SayBar
        text={
          quiz
            ? '小測驗：想跟家人「自拍」，要按哪一個按鈕？'
            : step.say ?? '點亮相機上每一個發光的按鈕，認識它們是做什麼的！'
        }
      />
      {/* 說明卡放在相機上方，點熱點立刻看得到（A-R3） */}
      {open && !quiz && (
        <div className="mb-3 rounded-2xl bg-sky-50 p-4">
          <p className="font-black text-sky-700">
            {open.icon} {open.name}
          </p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">{open.desc}</p>
        </div>
      )}
      <CameraShell
        topLeft={byPos('tl').map((s) => dot(s))}
        topRight={byPos('tr').map((s) => dot(s))}
        aboveShutter={<div className="flex gap-2">{[...byPos('zoom'), ...byPos('grid')].map((s) => dot(s))}</div>}
        rightOfShutter={byPos('flip').map((s) => dot(s))}
        onShutter={() => (quiz ? answer(SPOTS[3]) : look(SPOTS[3]))}
      >
        <img src={photoUrl(pid)} alt="" className="block aspect-[3/4] w-full object-cover opacity-90" draggable={false} />
        {/* 快門光點提示蓋在畫面下緣說明 */}
        {!quiz && !seen.has('shutter') && (
          <p className="absolute bottom-1 left-0 right-0 text-center text-xs font-bold text-white/90">
            （下面那顆大白圈也可以點喔）
          </p>
        )}
      </CameraShell>

      <p className="mt-3 text-center text-sm font-bold text-slate-500">
        {quiz ? (wrong ? '不是這個喔，再想想～（提示：要換成前面的鏡頭）' : '點相機上的按鈕作答！') : `已認識 ${seen.size} / ${SPOTS.length} 個`}
      </p>

      {allSeen && !quiz && !quizDone && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setQuiz(true)
              setOpen(null)
            }}
            className="min-h-12 rounded-full bg-amber-400 px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95"
          >
            全部認識了，來小測驗！
          </button>
        </div>
      )}

      {quizDone && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">答對了！🔄 就是前後切換，自拍就靠它。</p>
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
