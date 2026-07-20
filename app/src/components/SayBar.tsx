import { RichText } from '../ui/RichText'
import { SpeakButton } from './SpeakButton'

/** 純文字版旁白內容（朗讀用，去掉標記符號） */
function plain(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[\[([^\]|｜]+)(?:[|｜][^\]]*)?\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\(lesson:[A-Za-z0-9]+\)/g, '$1')
    .replace(/\n+/g, '，')
}

/** 旁白泡泡：老師說的話 + 朗讀鈕。支援 RichText 標記。
 * 佈局：狐狸與喇叭放頂列，正文獨占整寬（手機窄螢幕才不會一行只剩十個字）。 */
export function SayBar({ text }: { text?: string }) {
  if (!text) return null
  return (
    <div className="mb-4 rounded-2xl bg-sky-50 p-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-2xl leading-none">🦊</span>
        <SpeakButton text={plain(text)} />
      </div>
      <div className="text-[1.05rem] font-medium leading-relaxed text-slate-700">
        <RichText text={text} />
      </div>
    </div>
  )
}
