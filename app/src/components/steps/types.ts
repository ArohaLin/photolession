import type { Annotation, Rect, Step } from '../../types'

export interface StepProps {
  step: Step
  annotations: Record<string, Annotation>
  onDone: (stars: number) => void
  /** 目前課程 id（QuestCard 存作品時用） */
  lessonId: string
}

const FULL: Rect = [0, 0, 1, 1]

/** 取某圖的建議裁切 rect（優先找 concept 相符者，否則第一個，沒有就回全圖） */
export function suggestedRect(ann?: Annotation, concept?: string): Rect {
  const crops = ann?.suggested_crops
  if (!crops || crops.length === 0) return FULL
  if (concept) {
    const hit = crops.find((c) => c.concept === concept)
    if (hit) return hit.rect
  }
  return crops[0].rect
}

/** 依裁切名稱回傳 rect："suggested" → 建議裁切；其餘（含 "full"）→ 全圖 */
export function cropByName(name: string | undefined, ann?: Annotation): Rect {
  return name === 'suggested' ? suggestedRect(ann) : FULL
}
