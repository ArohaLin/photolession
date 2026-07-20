import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { READY_LESSONS, TRACKS, isAssessment, type LessonInfo } from '../config'
import { useLayout } from '../hooks/useLayout'
import { isLessonComplete, lessonPercent, lessonSections } from '../store/progress'
import { approvedLessonIds } from '../store/works'

/** 四軌各自的主題色 */
const THEME: Record<string, { bg: string; chip: string }> = {
  A: { bg: 'bg-emerald-50', chip: 'bg-emerald-400' },
  B: { bg: 'bg-amber-50', chip: 'bg-amber-400' },
  C: { bg: 'bg-sky-100', chip: 'bg-sky-500' },
  D: { bg: 'bg-rose-50', chip: 'bg-rose-400' },
}

/** 三區小燈＋加權完成百分比：學習📖(80%)／測驗✏️(10%)／作品📸(10%) */
function SectionDots({ id, workIds, assess }: { id: string; workIds: Set<string>; assess: boolean }) {
  const pct = lessonPercent(id, workIds, assess)
  const dot = (on: boolean, label: string, emoji: string) => (
    <span title={label} className={on ? '' : 'opacity-25 grayscale'}>
      {emoji}
    </span>
  )
  if (assess) {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs">
        {dot(pct === 100, '驗收', '✏️')}
        <span className={`w-9 text-right font-black ${pct > 0 ? 'text-sky-500' : 'text-slate-300'}`}>
          {pct}%
        </span>
      </span>
    )
  }
  const s = lessonSections(id, workIds)
  return (
    <span className="flex shrink-0 items-center gap-1 text-xs">
      {dot(s.learn, '學習', '📖')}
      {dot(s.quiz, '測驗', '✏️')}
      {dot(s.work, '作品', '📸')}
      <span className={`w-9 text-right font-black ${pct > 0 ? 'text-sky-500' : 'text-slate-300'}`}>
        {pct}%
      </span>
    </span>
  )
}

export default function Home() {
  const layout = useLayout()
  const [workIds, setWorkIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    approvedLessonIds()
      .then(setWorkIds)
      .catch(() => setWorkIds(new Set()))
  }, [])

  const allLessons = TRACKS.flatMap((t) => t.lessons)
  const doneCount = allLessons.filter((l) => isLessonComplete(l.id, workIds)).length
  const allDone = doneCount === allLessons.length

  const renderItem = (item: LessonInfo, order: number | null, theme: { chip: string }, assess: boolean) => {
    if (!READY_LESSONS.has(item.id)) {
      return (
        <div
          key={item.id}
          className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/50 px-4 py-2.5 text-slate-400"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">🔒</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-bold">{item.term}</span>
            <span className="block text-xs">{item.sub}</span>
          </span>
        </div>
      )
    }
    const complete = isLessonComplete(item.id, workIds, assess)
    return (
      <Link
        key={item.id}
        to={`/lesson/${item.id}`}
        className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-sm transition active:scale-95"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${theme.chip}`}
        >
          {assess ? '🏁' : order}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block font-black text-slate-800">{item.term}</span>
          <span className="block text-[0.8rem] font-medium text-slate-600">{item.sub}</span>
        </span>
        {complete ? (
          <span className="shrink-0 text-sm font-black text-green-600">🏅 100%</span>
        ) : (
          <SectionDots id={item.id} workIds={workIds} assess={assess} />
        )}
      </Link>
    )
  }

  return (
    <div>
      {allDone ? (
        <div className="mb-5 rounded-3xl bg-gradient-to-r from-amber-100 to-rose-100 p-5 text-center shadow">
          <p className="text-3xl">🎓🎉</p>
          <p className="mt-1 text-xl font-black text-amber-700">全部破關！你是真正的小小攝影師了！</p>
        </div>
      ) : doneCount > 0 ? (
        <p className="mb-4 text-center text-sm font-bold text-slate-500">
          🏅 已完成 {doneCount} / {allLessons.length} 課——繼續加油！
        </p>
      ) : null}

      <div className={layout === 'tablet' ? 'grid grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
        {TRACKS.map((track) => {
          const theme = THEME[track.id]
          const items = [...track.lessons, track.assessment].filter((l) => READY_LESSONS.has(l.id))
          const doneInTrack = items.filter((l) => isLessonComplete(l.id, workIds, isAssessment(l.id))).length
          return (
            <section key={track.id} className={`rounded-3xl p-6 shadow ${theme.bg}`}>
              <h2 className="flex items-baseline justify-between gap-1 text-xl font-black">
                <span className="flex items-baseline gap-1">
                  <span className="text-slate-400">{track.ordinal}</span>
                  <span>
                    {track.icon} {track.term}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-sm font-black ${doneInTrack === items.length ? 'text-green-600' : 'text-slate-500'}`}
                >
                  {doneInTrack}/{items.length} 回
                </span>
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-500">{track.sub}</p>
              <div className="flex flex-col gap-2">
                {track.lessons.map((lesson, i) => renderItem(lesson, i + 1, theme, false))}
                {renderItem(track.assessment, null, theme, true)}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
