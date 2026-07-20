import type { ReactNode } from 'react'

/**
 * 模擬相機外殼：黑色機身＋取景窗＋底部快門列。
 * A 軌駕訓班共用，讓孩子在「長得像真相機」的介面裡練習。
 */
export function CameraShell({
  children,
  topLeft,
  topRight,
  aboveShutter,
  onShutter,
  shutterDisabled = false,
  shutterGlow = false,
  rightOfShutter,
}: {
  children: ReactNode
  topLeft?: ReactNode
  topRight?: ReactNode
  aboveShutter?: ReactNode
  onShutter?: () => void
  shutterDisabled?: boolean
  shutterGlow?: boolean
  rightOfShutter?: ReactNode
}) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-black shadow-xl">
      {/* 取景窗 */}
      <div className="relative">
        {children}
        {topLeft && <div className="absolute left-2 top-2">{topLeft}</div>}
        {topRight && <div className="absolute right-2 top-2">{topRight}</div>}
      </div>
      {/* 底部控制列 */}
      <div className="px-4 pb-4 pt-2">
        {aboveShutter && <div className="mb-2 flex justify-center">{aboveShutter}</div>}
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            aria-label="快門"
            onClick={onShutter}
            disabled={shutterDisabled || !onShutter}
            className={`h-16 w-16 rounded-full border-4 transition active:scale-90 ${
              shutterDisabled || !onShutter
                ? 'border-slate-600 bg-slate-500'
                : shutterGlow
                  ? 'border-green-300 bg-white ring-4 ring-green-400/60'
                  : 'border-slate-300 bg-white'
            }`}
          />
          {rightOfShutter && <div className="absolute right-0">{rightOfShutter}</div>}
        </div>
      </div>
    </div>
  )
}
