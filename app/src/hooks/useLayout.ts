import { useEffect, useState } from 'react'

export type Layout = 'phone' | 'tablet'

function current(): Layout {
  return window.innerWidth >= 768 ? 'tablet' : 'phone'
}

/** iPhone（<768px）→ phone 單欄；iPad／桌機 → tablet 雙欄 */
export function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>(current)
  useEffect(() => {
    const onResize = () => setLayout(current())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return layout
}
