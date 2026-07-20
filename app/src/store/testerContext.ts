/** 測試回報用：目前位置（課程/步驟）與最近的 console 錯誤，回報時自動附上 */

export interface TesterCtx {
  page: string
  lessonId?: string
  lessonTitle?: string
  stepIndex?: number
  stepCount?: number
  stepTool?: string
}

let current: TesterCtx = { page: '/' }
const errors: string[] = []

export function setTesterCtx(ctx: TesterCtx): void {
  current = ctx
}

export function getTesterCtx() {
  return {
    ...current,
    hash: window.location.hash,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    device: /iPad/.test(navigator.userAgent)
      ? 'iPad'
      : /iPhone/.test(navigator.userAgent)
        ? 'iPhone'
        : 'other',
    errors: errors.slice(-3),
  }
}

export const TEST_MODE_KEY = 'slp.testmode.v1'
/** 切換測試模式時廣播，讓 🐞 鈕即時出現/消失 */
export const TEST_MODE_EVENT = 'slp:testmode'
export const PIN_KEY = 'slp.testpin.v1'
export const OUTBOX_KEY = 'slp.issues.outbox.v1'
/** 開發者模式解鎖旗標（家長區隱藏的測試開發區塊，解鎖後才顯示） */
export const DEV_UNLOCK_KEY = 'slp.devmode.v1'

export function isTestMode(): boolean {
  try {
    return localStorage.getItem(TEST_MODE_KEY) === '1'
  } catch {
    return false
  }
}

export function isDevUnlocked(): boolean {
  try {
    return localStorage.getItem(DEV_UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

/** 捕捉最近錯誤（回報「壞掉了」時我能直接看到訊息） */
export function installErrorBuffer(): void {
  window.addEventListener('error', (e) => {
    errors.push(`${e.message} @ ${e.filename?.split('/').pop()}:${e.lineno}`)
    if (errors.length > 10) errors.shift()
  })
  window.addEventListener('unhandledrejection', (e) => {
    errors.push(`unhandled: ${String(e.reason).slice(0, 200)}`)
    if (errors.length > 10) errors.shift()
  })
}
