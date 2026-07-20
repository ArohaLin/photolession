import { photoUrl } from '../content'
import { usePhoto } from '../photosContext'
import type { Rect } from '../types'

const FULL: Rect = [0, 0, 1, 1]

/**
 * 不變形地顯示某張教材圖的指定區域（rect，0–1 相對座標）。
 * 「一張原圖衍生多構圖」的核心：同一張圖用不同 rect 即時呈現不同取景。
 */
export function CropView({
  pid,
  rect = FULL,
  rounded = true,
  className = '',
}: {
  pid: string
  rect?: Rect
  rounded?: boolean
  className?: string
}) {
  const photo = usePhoto(pid)
  const w = photo?.w ?? 1000
  const h = photo?.h ?? 750
  const [rx, ry, rw, rh] = rect
  const vb = `${rx * w} ${ry * h} ${rw * w} ${rh * h}`
  return (
    <svg
      viewBox={vb}
      preserveAspectRatio="xMidYMid slice"
      className={`${rounded ? 'rounded-2xl' : ''} block w-full ${className}`}
      style={{ aspectRatio: `${rw * w} / ${rh * h}`, background: '#e2e8f0' }}
    >
      <image href={photoUrl(pid)} x={0} y={0} width={w} height={h} />
    </svg>
  )
}
