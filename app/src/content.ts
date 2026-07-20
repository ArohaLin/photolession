import type { Annotation, Lesson, Photo } from './types'

const BASE = import.meta.env.BASE_URL + 'content/'

export function photoUrl(pid: string): string {
  return `${BASE}photos/${pid}.jpg`
}

export function thumbUrl(pid: string): string {
  return `${BASE}photos/thumbs/${pid}.jpg`
}

export function maskUrl(pid: string): string {
  return `${BASE}masks/${pid}-mask.png`
}

const cache = new Map<string, unknown>()

async function getJSON<T>(url: string): Promise<T> {
  const hit = cache.get(url)
  if (hit) return hit as T
  const res = await fetch(url)
  if (!res.ok) throw new Error(`載入失敗 ${url}: ${res.status}`)
  const data = (await res.json()) as T
  cache.set(url, data)
  return data
}

export function loadLesson(id: string): Promise<Lesson> {
  return getJSON<Lesson>(`${BASE}lessons/${id}.json`)
}

/** 專有名詞表：term → { def, home（首次教到的課 id） } */
export interface GlossaryEntry {
  def: string
  home: string
}
export type Glossary = Record<string, GlossaryEntry>

export function loadGlossary(): Promise<Glossary> {
  return getJSON<Glossary>(`${BASE}glossary.json`)
}

export function loadAnnotation(pid: string): Promise<Annotation> {
  return getJSON<Annotation>(`${BASE}annotations/${pid}.json`)
}

export async function loadPhotos(): Promise<Record<string, Photo>> {
  const list = await getJSON<Photo[]>(`${BASE}photos.json`)
  const map: Record<string, Photo> = {}
  for (const p of list) map[p.id] = p
  return map
}

/** 收集一課用到的所有圖片 id，並載入它們的標註 */
export async function loadLessonAnnotations(lesson: Lesson): Promise<Record<string, Annotation>> {
  const ids = new Set<string>()
  for (const s of lesson.steps) {
    if (s.photo) ids.add(s.photo)
    if (s.photos) for (const p of s.photos) ids.add(p)
  }
  const entries = await Promise.all(
    [...ids].map(async (id) => {
      try {
        return [id, await loadAnnotation(id)] as const
      } catch {
        return [id, null] as const
      }
    }),
  )
  const map: Record<string, Annotation> = {}
  for (const [id, ann] of entries) if (ann) map[id] = ann
  return map
}
