// 測試回報 API（僅供家長驗收用；孩子照片與學習進度絕不經過這裡）
// 儲存設計：一筆回報＝一個 blob（issues/<id>.json）——避免單檔讀改寫在
// CDN 快取下互相覆蓋（lost update）。
// GET  /api/issues → { issues: [...] }
// POST /api/issues → 新增 { text, ctx }
// PATCH /api/issues → 更新 { id, status, note }
// 驗證：header x-pin 必須等於環境變數 ISSUES_PIN
import { del, list, put } from '@vercel/blob'

const PREFIX = 'issues/'

interface Issue {
  id: string
  at: number
  text: string
  ctx?: Record<string, unknown>
  status: 'open' | 'fixed' | 'dismissed'
  note?: string
  fixedAt?: number
}

async function fetchJSON(url: string): Promise<Issue | null> {
  try {
    const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as Issue
  } catch {
    return null
  }
}

async function loadAll(): Promise<{ issue: Issue; url: string }[]> {
  const { blobs } = await list({ prefix: PREFIX })
  const out = await Promise.all(
    blobs.map(async (b) => {
      const issue = await fetchJSON(b.downloadUrl ?? b.url)
      return issue ? { issue, url: b.url } : null
    }),
  )
  return out.filter((x): x is { issue: Issue; url: string } => x !== null)
}

async function saveIssue(issue: Issue, overwrite: boolean): Promise<void> {
  await put(`${PREFIX}${issue.id}.json`, JSON.stringify(issue), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: overwrite,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  })
}

export default async function handler(req: any, res: any) {
  if ((req.headers['x-pin'] ?? '') !== (process.env.ISSUES_PIN ?? '__unset__')) {
    return res.status(401).json({ error: 'bad pin' })
  }
  try {
    if (req.method === 'GET') {
      const all = await loadAll()
      return res
        .status(200)
        .json({ issues: all.map((x) => x.issue).sort((a, b) => b.at - a.at) })
    }
    if (req.method === 'POST') {
      const { text, ctx } = req.body ?? {}
      if (!text || String(text).length > 2000) return res.status(400).json({ error: 'bad text' })
      const issue: Issue = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        at: Date.now(),
        text: String(text),
        ctx: ctx ?? {},
        status: 'open',
      }
      await saveIssue(issue, false)
      return res.status(201).json({ ok: true, id: issue.id })
    }
    if (req.method === 'DELETE') {
      const { id, scope } = req.body ?? {}
      const { blobs } = await list({ prefix: PREFIX })
      if (scope === 'done') {
        // 清空所有已處理（fixed/dismissed）
        const all = await loadAll()
        const doneIds = new Set(all.filter((x) => x.issue.status !== 'open').map((x) => x.issue.id))
        const urls = blobs.filter((b) => doneIds.has(b.pathname.slice(PREFIX.length).replace(/\.json$/, ''))).map((b) => b.url)
        if (urls.length) await del(urls)
        return res.status(200).json({ ok: true, deleted: urls.length })
      }
      const hit = blobs.find((b) => b.pathname === `${PREFIX}${id}.json`)
      if (!hit) return res.status(404).json({ error: 'not found' })
      await del(hit.url)
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'PATCH') {
      const { id, status, note } = req.body ?? {}
      const all = await loadAll()
      const hit = all.find((x) => x.issue.id === id)
      if (!hit) return res.status(404).json({ error: 'not found' })
      const issue = hit.issue
      if (status) issue.status = status
      if (note !== undefined) issue.note = note
      if (status === 'fixed') issue.fixedAt = Date.now()
      await saveIssue(issue, true)
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'method' })
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message ?? e) })
  }
}
