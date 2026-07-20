import { useState } from 'react'

/** 朗讀輔助：用瀏覽器內建語音唸出文字（給還不太會認字的小朋友） */
export function SpeakButton({ text, className = '' }: { text?: string; className?: string }) {
  const [on, setOn] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  if (!supported || !text) return null

  const speak = () => {
    const synth = window.speechSynthesis
    synth.cancel()
    if (on) {
      setOn(false)
      return
    }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-TW'
    u.rate = 1.0
    u.onend = () => setOn(false)
    u.onerror = () => setOn(false)
    setOn(true)
    synth.speak(u)
  }

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={on ? '停止朗讀' : '唸給我聽'}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-xl shadow active:scale-90 ${className}`}
    >
      {on ? '⏸️' : '🔊'}
    </button>
  )
}
