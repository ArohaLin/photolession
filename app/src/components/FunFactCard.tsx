import type { FunFact } from '../types'
import { RichInline, RichText } from '../ui/RichText'
import { Media } from './ConceptArt'
import { SpeakButton } from './SpeakButton'

/** 類別徽章的顏色與圖示 */
const KIND_STYLE: Record<string, { badge: string; emoji: string }> = {
  小知識: { badge: 'bg-violet-500', emoji: '🧠' },
  小故事: { badge: 'bg-sky-500', emoji: '📖' },
  冷笑話: { badge: 'bg-amber-500', emoji: '😂' },
  攝影歷史: { badge: 'bg-emerald-500', emoji: '🏛️' },
}

/** 輕鬆小品卡：小故事／歷史／笑話／冷知識，附顯目類別徽章 */
export function FunFactCard({ fact }: { fact: FunFact }) {
  const kind = fact.kind ?? '小知識'
  const ks = KIND_STYLE[kind] ?? KIND_STYLE['小知識']
  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black text-white shadow-sm ${ks.badge}`}
        >
          {ks.emoji} {kind}
        </span>
        <SpeakButton text={fact.body.replace(/\n+/g, '，')} />
      </div>
      <p className="mt-3 flex items-center gap-2 text-lg font-black text-slate-800">
        <span className="text-2xl">{fact.emoji ?? '✨'}</span>
        <RichInline text={fact.title ?? '你知道嗎？'} />
      </p>
      {(fact.art || fact.photo) && <Media art={fact.art} photo={fact.photo} className="mt-3" />}
      <div className="mt-2 leading-relaxed text-slate-700">
        <RichText text={fact.body} />
      </div>
    </div>
  )
}
