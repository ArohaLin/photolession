import { Fragment, type ReactNode } from 'react'
import { useGlossary, useNav } from './appui'

/**
 * 輕量標記渲染：
 *   **重點**            → 醒目關鍵字
 *   [[名詞]] / [[名詞｜顯示字]] → 專有名詞（點了彈出解釋）
 *   [顯示字](lesson:C5) → 跳到某課的連結（觸發浮動返回鈕）
 *   換行分段、行首「- 」→ 項目符號
 */

const TOKEN = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\]|\[[^\]]+\]\(lesson:[A-Za-z0-9]+\))/g

function GlossaryChip({ term, label }: { term: string; label: string }) {
  const { openTerm } = useGlossary()
  return (
    <button
      type="button"
      onClick={() => openTerm(term)}
      className="mx-0.5 whitespace-nowrap rounded-md border-b-2 border-dotted border-sky-400 bg-sky-50 px-1 font-bold text-sky-700 active:scale-95"
    >
      {label}
    </button>
  )
}

function LessonLink({ id, label }: { id: string; label: string }) {
  const { jumpToLesson } = useNav()
  return (
    <button
      type="button"
      onClick={() => jumpToLesson(id)}
      className="mx-0.5 font-bold text-sky-600 underline decoration-2 underline-offset-2 active:scale-95"
    >
      {label} →
    </button>
  )
}

function parseInline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  TOKEN.lastIndex = 0
  let k = 0
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) out.push(<Fragment key={k++}>{text.slice(last, m.index)}</Fragment>)
    const tok = m[0]
    if (tok.startsWith('**')) {
      out.push(
        <strong key={k++} className="hl-clone rounded bg-amber-100 px-1 font-bold text-amber-800">
          {tok.slice(2, -2)}
        </strong>,
      )
    } else if (tok.startsWith('[[')) {
      const inner = tok.slice(2, -2)
      const [term, label] = inner.split(/[|｜]/)
      out.push(<GlossaryChip key={k++} term={term} label={label ?? term} />)
    } else {
      const mm = /^\[([^\]]+)\]\(lesson:([A-Za-z0-9]+)\)$/.exec(tok)
      if (mm) out.push(<LessonLink key={k++} id={mm[2]} label={mm[1]} />)
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>)
  return out
}

/** 行內版：只處理 **粗體**／[[名詞]]／連結，不分段（給 feedback、提示等單行文字用） */
export function RichInline({ text }: { text?: string }) {
  if (!text) return null
  return <>{parseInline(text)}</>
}

/** 把含標記的字串渲染成段落／清單 */
export function RichText({ text, className = '' }: { text?: string; className?: string }) {
  if (!text) return null
  const lines = text.split('\n')
  const blocks: ReactNode[] = []
  let bullets: string[] = []
  let bk = 0

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`u${bk++}`} className="my-1 space-y-1 pl-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-sky-400">•</span>
              <span className="flex-1">{parseInline(b)}</span>
            </li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flush()
      continue
    }
    if (/^[-•]\s+/.test(line)) {
      bullets.push(line.replace(/^[-•]\s+/, ''))
    } else if (line.startsWith('💡')) {
      // 小提示泡泡
      flush()
      blocks.push(
        <div key={`t${bk++}`} className="my-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3">
          <span className="shrink-0">💡</span>
          <span className="min-w-0 flex-1 text-[0.95em] font-medium text-amber-800">
            {parseInline(line.replace(/^💡\s*/, ''))}
          </span>
        </div>,
      )
    } else {
      flush()
      blocks.push(
        <p key={`p${bk++}`} className="my-1">
          {parseInline(line)}
        </p>,
      )
    }
  }
  flush()

  return <div className={`space-y-1.5 ${className}`}>{blocks}</div>
}
