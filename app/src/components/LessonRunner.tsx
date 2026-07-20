import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { lessonTitle } from '../config'
import { loadLesson, loadLessonAnnotations, loadPhotos } from '../content'
import { PhotosContext } from '../photosContext'
import {
  lessonReached,
  lessonResume,
  markLearned,
  markQuizPassed,
  recordLearn,
  recordLessonStep,
} from '../store/progress'
import { setTesterCtx } from '../store/testerContext'
import { useNav } from '../ui/appui'
import { FunFactCard } from './FunFactCard'
import { RichInline } from '../ui/RichText'
import { Example } from './steps/Example'
import { ABChoice } from './steps/ABChoice'
import { Compare } from './steps/Compare'
import { TapTarget } from './steps/TapTarget'
import { Viewfinder } from './steps/Viewfinder'
import { SunDrag } from './steps/SunDrag'
import { ApertureSim } from './steps/ApertureSim'
import { ShutterSim } from './steps/ShutterSim'
import { IsoSim } from './steps/IsoSim'
import { ExposureSim } from './steps/ExposureSim'
import { ThirdsGrid } from './steps/ThirdsGrid'
import { CameraTour } from './steps/CameraTour'
import { TapFocus } from './steps/TapFocus'
import { SunSlider } from './steps/SunSlider'
import { SteadyGame } from './steps/SteadyGame'
import { ZoomLens } from './steps/ZoomLens'
import { FramePicker } from './steps/FramePicker'
import { PanoDrag } from './steps/PanoDrag'
import { TempSlider } from './steps/TempSlider'
import { ZoomDegrade } from './steps/ZoomDegrade'
import { ColorWheel } from './steps/ColorWheel'
import { Diagnose } from './steps/Diagnose'
import { QuestCard } from './steps/QuestCard'
import { Quiz } from './steps/Quiz'
import { NextButton } from './NextButton'
import type { Annotation, Lesson, Photo, Step } from '../types'
import type { StepProps } from './steps/types'

interface Data {
  lesson: Lesson
  annotations: Record<string, Annotation>
  photos: Record<string, Photo>
}

type Phase = 'steps' | 'funfact' | 'quiz' | 'summary'

function StepView(props: StepProps) {
  const { step } = props
  switch (step.type) {
    case 'example':
      return <Example {...props} />
    case 'compare':
      return <Compare {...props} />
    case 'quest':
      return <QuestCard {...props} />
    case 'play':
    case 'sim':
      switch (step.tool) {
        case 'tap-target':
          return <TapTarget {...props} />
        case 'ab-choice':
          return <ABChoice {...props} />
        case 'viewfinder':
          return <Viewfinder {...props} />
        case 'sun-drag':
          return <SunDrag {...props} />
        case 'aperture-sim':
          return <ApertureSim {...props} />
        case 'shutter-sim':
          return <ShutterSim {...props} />
        case 'iso-sim':
          return <IsoSim {...props} />
        case 'exposure-sim':
          return <ExposureSim {...props} />
        case 'thirds':
          return <ThirdsGrid {...props} />
        case 'camera-tour':
          return <CameraTour {...props} />
        case 'tap-focus':
          return <TapFocus {...props} />
        case 'sun-slider':
          return <SunSlider {...props} />
        case 'steady':
          return <SteadyGame {...props} />
        case 'zoom-lens':
          return <ZoomLens {...props} />
        case 'frame-picker':
          return <FramePicker {...props} />
        case 'pano':
          return <PanoDrag {...props} />
        case 'temp-slider':
          return <TempSlider {...props} />
        case 'zoom-degrade':
          return <ZoomDegrade {...props} />
        case 'color-wheel':
          return <ColorWheel {...props} />
        case 'diagnose':
          return <Diagnose {...props} />
      }
  }
  return <p className="py-8 text-center text-slate-400">（這個步驟還在建置中）</p>
}

function StepDots({ n, i }: { n: number; i: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: n }, (_, k) => (
        <span
          key={k}
          className={`h-2.5 rounded-full transition-all ${
            k < i ? 'w-2.5 bg-green-400' : k === i ? 'w-6 bg-sky-500' : 'w-2.5 bg-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

function Summary({ lesson, onReplay }: { lesson: Lesson; onReplay: () => void }) {
  return (
    <div className="mt-5 rounded-3xl bg-white p-8 text-center shadow">
      <div className="text-6xl">🎉</div>
      <h2 className="mt-3 text-2xl font-black text-slate-800">
        完成「{lessonTitle(lesson.id) || lesson.title}」！
      </h2>
      <div className="mx-auto mt-4 max-w-sm rounded-2xl bg-sky-50 p-4">
        <p className="text-sm font-bold text-sky-700">今天學到 🧠</p>
        <p className="mt-1 font-medium text-slate-700"><RichInline text={lesson.big_idea} /></p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="min-h-12 rounded-full bg-amber-400 px-6 py-3 font-black text-white shadow active:scale-95"
        >
          🔁 再玩一次
        </button>
        <Link
          to="/"
          className="min-h-12 rounded-full bg-sky-500 px-6 py-3 font-black text-white shadow active:scale-95"
        >
          🏠 回首頁
        </Link>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow">
      <div className="animate-bounce text-5xl">📷</div>
      <p className="mt-3 font-bold text-slate-400">課程載入中…</p>
    </div>
  )
}

function ErrorCard({ msg }: { msg: string }) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow">
      <div className="text-5xl">😵</div>
      <p className="mt-3 font-bold text-rose-500">課程載入失敗</p>
      <p className="mt-1 break-all text-xs text-slate-400">{msg}</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-sky-500 px-6 py-3 font-bold text-white">
        回首頁
      </Link>
    </div>
  )
}

export function LessonRunner({ lessonId }: { lessonId: string }) {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [i, setI] = useState(0)
  const [reached, setReached] = useState(0)
  const [phase, setPhase] = useState<Phase>('steps')
  const { reportStep } = useNav()
  const location = useLocation()
  // 由跨章「返回」帶回來的步驟，用來還原到跳走前的那一頁
  const restoreRef = useRef(0)
  restoreRef.current = (location.state as { restoreStep?: number } | null)?.restoreStep ?? 0

  useEffect(() => {
    let alive = true
    setData(null)
    setError(null)
    // 起始步驟：跨章返回優先，其次是這課上次停的地方
    const start = restoreRef.current || lessonResume(lessonId)
    setI(start)
    setReached(Math.max(lessonReached(lessonId), start))
    setPhase('steps')
    ;(async () => {
      try {
        const lesson = await loadLesson(lessonId)
        const [annotations, photos] = await Promise.all([
          loadLessonAnnotations(lesson),
          loadPhotos(),
        ])
        if (alive) {
          setData({ lesson, annotations, photos })
          setPhase(lesson.steps.length ? 'steps' : lesson.funfact ? 'funfact' : lesson.quiz ? 'quiz' : 'summary')
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => {
      alive = false
    }
  }, [lessonId])

  const steps = data?.lesson.steps ?? []
  // 記錄教學步數進度：總步數＝非 quest（作品）步；已完成＝走過的非 quest 步
  useEffect(() => {
    if (!data) return
    const st = data.lesson.steps
    const learnTotal = st.filter((s) => s.type !== 'quest').length
    const learnDone = st.slice(0, reached + 1).filter((s) => s.type !== 'quest').length
    recordLearn(data.lesson.id, learnDone, learnTotal)
  }, [reached, data])
  useEffect(() => {
    if (!data) return
    if (phase === 'steps') {
      reportStep(i)
      recordLessonStep(lessonId, i)
      setReached((r) => Math.max(r, i))
    }
    const s: Step | undefined = data.lesson.steps[i]
    setTesterCtx({
      page: 'lesson',
      lessonId: data.lesson.id,
      lessonTitle: lessonTitle(data.lesson.id) || data.lesson.title,
      stepIndex: i + 1,
      stepCount: data.lesson.steps.length,
      stepTool: s?.tool ?? s?.type ?? phase,
    })
  }, [data, i, phase, reportStep, lessonId])

  if (error) return <ErrorCard msg={error} />
  if (!data) return <LoadingCard />

  const { lesson, annotations, photos } = data
  const step = steps[i]

  const afterSteps = () => {
    if (!lesson.assessment) markLearned(lessonId)
    setPhase(lesson.funfact ? 'funfact' : lesson.quiz ? 'quiz' : 'summary')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStepDone = () => {
    if (i < steps.length - 1) {
      setI(i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      afterSteps()
    }
  }

  const replay = () => {
    setI(0)
    setPhase(steps.length ? 'steps' : lesson.funfact ? 'funfact' : lesson.quiz ? 'quiz' : 'summary')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 左右導航：只能在走過的步數間移動，下一步不能超過曾到過的最遠步
  const goStep = (n: number) => {
    const clamped = Math.max(0, Math.min(n, reached))
    if (clamped === i) return
    setI(clamped)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const showNav = phase === 'steps' && steps.length > 0
  const canPrev = showNav && i > 0
  const canNext = showNav && i < reached

  return (
    <PhotosContext.Provider value={photos}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            to="/"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-white px-3 text-base font-bold shadow"
          >
            ←
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-lg font-black text-slate-800">
            {lesson.icon} {lessonTitle(lesson.id) || lesson.title}
          </h1>
          <span className="shrink-0 text-sm font-bold text-slate-400">
            {phase === 'steps' ? `${Math.min(i + 1, steps.length)}/${steps.length}` : '★'}
          </span>
        </div>

        {phase === 'steps' && steps.length > 0 && <StepDots n={steps.length} i={i} />}

        {phase === 'summary' ? (
          <Summary lesson={lesson} onReplay={replay} />
        ) : phase === 'funfact' && lesson.funfact ? (
          <div className="mt-5 rounded-3xl bg-white p-5 shadow">
            <FunFactCard fact={lesson.funfact} />
            <div className="mt-5 text-center">
              <NextButton
                label={lesson.quiz ? '去小考 📝' : '完成 🎉'}
                onClick={() => {
                  setPhase(lesson.quiz ? 'quiz' : 'summary')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </div>
          </div>
        ) : phase === 'quiz' && lesson.quiz ? (
          <div className="mt-5 rounded-3xl bg-white p-5 shadow">
            <Quiz
              quiz={lesson.quiz}
              title={lesson.assessment ? '大章驗收' : '課後小考'}
              onPass={() => {
                markQuizPassed(lessonId)
                setPhase('summary')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onSkip={() => {
                setPhase('summary')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        ) : (
          <div className="mt-5 rounded-3xl bg-white p-5 shadow">
            <StepView
              key={i}
              step={step}
              annotations={annotations}
              onDone={handleStepDone}
              lessonId={lessonId}
            />
          </div>
        )}
      </div>

      {/* 左右導航鈕：在已學過的步數間移動 */}
      {canPrev && (
        <button
          type="button"
          onClick={() => goStep(i - 1)}
          aria-label="上一步"
          className="fixed left-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700/75 text-2xl font-black text-white shadow-lg backdrop-blur active:scale-90"
        >
          ‹
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => goStep(i + 1)}
          aria-label="下一步"
          className="fixed right-1 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700/75 text-2xl font-black text-white shadow-lg backdrop-blur active:scale-90"
        >
          ›
        </button>
      )}
    </PhotosContext.Provider>
  )
}
