import type { Rect } from '../types'

/** 兩個相對矩形的交集面積（0–1 座標） */
function intersectArea(a: Rect, b: Rect): number {
  const x = Math.max(a[0], b[0])
  const y = Math.max(a[1], b[1])
  const right = Math.min(a[0] + a[2], b[0] + b[2])
  const bottom = Math.min(a[1] + a[3], b[1] + b[3])
  return Math.max(0, right - x) * Math.max(0, bottom - y)
}

/** 主角在取景框內占「框面積」的比例（判斷主角夠不夠大） */
export function subjectCoverage(subject: Rect, crop: Rect): number {
  const cropArea = crop[2] * crop[3]
  if (cropArea <= 0) return 0
  return intersectArea(subject, crop) / cropArea
}

/** 主角是否有一部分被切到框外 */
export function isSubjectClipped(subject: Rect, crop: Rect): boolean {
  return (
    subject[0] < crop[0] - 1e-6 ||
    subject[1] < crop[1] - 1e-6 ||
    subject[0] + subject[2] > crop[0] + crop[2] + 1e-6 ||
    subject[1] + subject[3] > crop[1] + crop[3] + 1e-6
  )
}

/** 取景框是否納入了某個干擾物（超過 thresh 比例） */
export function cropIncludesDistraction(distraction: Rect, crop: Rect, thresh = 0.3): boolean {
  const dArea = distraction[2] * distraction[3]
  if (dArea <= 0) return false
  return intersectArea(distraction, crop) / dArea > thresh
}

/** 點 (px,py) 是否落在 box（加一點寬容邊距，給小朋友手指用） */
export function pointInBox(px: number, py: number, box: Rect, pad = 0.04): boolean {
  return (
    px >= box[0] - pad &&
    px <= box[0] + box[2] + pad &&
    py >= box[1] - pad &&
    py <= box[1] + box[3] + pad
  )
}

export type Grade = 'great' | 'good' | 'retry'

/** 依 coverage 與目標區間給評等；落在區間內＝great，鄰近＝good，其餘＝retry */
export function gradeCoverage(coverage: number, [lo, hi]: [number, number]): Grade {
  if (coverage >= lo && coverage <= hi) return 'great'
  const margin = (hi - lo) * 0.4
  if (coverage >= lo - margin && coverage <= hi + margin) return 'good'
  return 'retry'
}

/** 給角度／光圈等單一數值用：在區間內＝great，否則 retry */
export function gradeRange(value: number, [lo, hi]: [number, number]): Grade {
  return value >= lo && value <= hi ? 'great' : 'retry'
}

export const starsFor: Record<Grade, number> = { great: 3, good: 2, retry: 0 }
