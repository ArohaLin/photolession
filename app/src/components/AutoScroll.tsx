import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/**
 * 摺線救援（A-R3）：互動回饋出現時自動捲入視野，
 * 孩子答對的慶祝、提示與下一步按鈕不再藏在畫面外。
 */
export function AutoScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const t = window.setTimeout(
      () => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
      80,
    )
    return () => window.clearTimeout(t)
  }, [])
  return <div ref={ref}>{children}</div>
}
