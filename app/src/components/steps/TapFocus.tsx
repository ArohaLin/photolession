import { useRef, useState } from 'react'
import { photoUrl, maskUrl } from '../../content'
import { usePhoto } from '../../photosContext'
import { pointInBox } from '../../engine/geometry'
import { SayBar } from '../SayBar'
import { AutoScroll } from '../AutoScroll'
import { CameraShell } from '../camera/Shell'
import { RichInline } from '../../ui/RichText'
import type { StepProps } from './types'

type Focus = 'none' | 'subject' | 'bg'

/** A2 點一下對焦：點主角→主角清楚背景糊；點背景→反過來。長按＝AE/AF 鎖定彩蛋 */
export function TapFocus({ step, annotations, onDone }: StepProps) {
  const pid = step.photo!
  const ann = annotations[pid]
  const photo = usePhoto(pid)
  const box = ann?.subject?.bbox
  const hasMask = !!ann?.mask

  const ref = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<number | null>(null)
  const [focus, setFocus] = useState<Focus>('none')
  const [ring, setRing] = useState<{ x: number; y: number } | null>(null)
  const [locked, setLocked] = useState(false)
  const [tried, setTried] = useState<Set<Focus>>(new Set())
  const [shot, setShot] = useState(false)

  const onDown = (e: React.PointerEvent) => {
    if (shot) return
    const r = ref.current!.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const hitSubject = box ? pointInBox(px, py, box, 0.03) : false
    const f: Focus = hitSubject ? 'subject' : 'bg'
    setFocus(f)
    setLocked(false)
    setRing({ x: px, y: py })
    setTried((prev) => new Set(prev).add(f))
    // 長按 600ms → AE/AF 鎖定
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setLocked(true), 600)
  }
  const onUp = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
  }

  const bothTried = tried.has('subject') && tried.has('bg')
  const canShoot = focus === 'subject'

  return (
    <div>
      <SayBar text={step.prompt ?? step.say} />
      <CameraShell
        onShutter={bothTried && canShoot && !shot ? () => setShot(true) : undefined}
        shutterGlow={bothTried && canShoot}
        shutterDisabled={shot}
        topRight={
          locked ? (
            <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-slate-800">
              AE/AF 鎖定
            </span>
          ) : undefined
        }
      >
        <div
          ref={ref}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="relative cursor-pointer touch-none select-none"
          style={{ aspectRatio: `${photo?.w ?? 4} / ${photo?.h ?? 3}` }}
        >
          {/* 底圖：對焦在背景時清楚，否則模糊 */}
          <img
            src={photoUrl(pid)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-300"
            style={{ filter: focus === 'subject' ? 'blur(9px)' : 'blur(0px)', transform: 'scale(1.04)' }}
            draggable={false}
          />
          {/* 主角去背層：對焦在主角時清楚 */}
          {hasMask && (
            <img
              src={maskUrl(pid)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-300"
              style={{ filter: focus === 'bg' ? 'blur(7px)' : 'blur(0px)' }}
              draggable={false}
            />
          )}
          {/* 黃色對焦框 */}
          {ring && (
            <div
              className="pointer-events-none absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 border-2 border-yellow-300"
              style={{ left: `${ring.x * 100}%`, top: `${ring.y * 100}%` }}
            >
              <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-base">☀️</span>
            </div>
          )}
          {focus === 'none' && (
            <p className="absolute bottom-2 left-0 right-0 text-center text-sm font-black text-white drop-shadow">
              👆 點點看小狗，再點點看後面的樹
            </p>
          )}
        </div>
      </CameraShell>

      <p className="mt-3 text-center text-sm font-bold text-slate-600">
        {shot
          ? ''
          : focus === 'subject'
            ? '對焦在小狗身上：小狗清楚、背景變糊！'
            : focus === 'bg'
              ? '對焦在背景：相機改看樹了——小狗就變糊啦！'
              : ''}
        {!shot && bothTried && canShoot && ' 快門亮了，拍下這張！'}
        {!shot && bothTried && !canShoot && ' 要拍「小狗清楚」的那張喔，再點一下小狗。'}
      </p>
      {!shot && !locked && focus !== 'none' && (
        <p className="mt-1 text-center text-sm text-slate-400">彩蛋：手指「長按」畫面不放試試看？</p>
      )}
      {locked && !shot && (
        <p className="mt-1 text-center text-xs font-bold text-amber-600">
          🔒 鎖定了！之後怎麼移動，對焦和亮度都不會亂跳（拍同一個主角時超好用）。
        </p>
      )}

      {shot && (
        <AutoScroll>
        <div className="mt-4 rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-lg font-black text-green-700">
            <RichInline text={step.feedback?.great ?? '學會了！點誰，誰就清楚。拍照前先點主角！'} />
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
