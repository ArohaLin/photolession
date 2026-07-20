import { Link, useParams } from 'react-router-dom'
import { READY_LESSONS, lessonTitle } from '../config'
import { LessonRunner } from '../components/LessonRunner'

export default function Lesson() {
  const { id } = useParams()

  if (!id || !READY_LESSONS.has(id)) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow">
        <div className="text-5xl">🚧</div>
        <h2 className="mt-3 text-xl font-black">
          {id}｜{lessonTitle(id)}
        </h2>
        <p className="mt-2 text-slate-500">這一課還在建置中！</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-sky-500 px-6 py-3 font-bold text-white"
        >
          回首頁
        </Link>
      </div>
    )
  }

  return <LessonRunner lessonId={id} />
}
