#!/usr/bin/env node
// Claude 處理回報用的小工具（避開 Windows curl 中文編碼坑）
// 用法：
//   node scripts/issues.mjs list            列出全部（預設只列 open）
//   node scripts/issues.mjs list all        列出含已處理
//   node scripts/issues.mjs fix <id> <說明>  標為已修＋處理說明
//   node scripts/issues.mjs dismiss <id> [說明]
// PIN 讀取順序：環境變數 ISSUES_PIN → pipeline/.env 的 ISSUES_PIN=
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const U = 'https://photolession.vercel.app/api/issues'

function pin() {
  if (process.env.ISSUES_PIN) return process.env.ISSUES_PIN
  try {
    const env = readFileSync(path.join(here, '../pipeline/.env'), 'utf8')
    const m = env.match(/ISSUES_PIN=(\S+)/)
    if (m) return m[1]
  } catch {}
  throw new Error('找不到 ISSUES_PIN（設環境變數或加進 pipeline/.env）')
}

const H = { 'Content-Type': 'application/json', 'x-pin': pin() }
const [cmd, ...args] = process.argv.slice(2)

const main = async () => {
  if (cmd === 'list' || !cmd) {
    const { issues } = await (await fetch(U, { headers: H })).json()
    const show = args[0] === 'all' ? issues : issues.filter((i) => i.status === 'open')
    for (const i of show) {
      const c = i.ctx ?? {}
      const where = c.lessonId ? `${c.lessonId} ${c.lessonTitle ?? ''} 第${c.stepIndex}/${c.stepCount}步(${c.stepTool ?? ''})` : '非課程頁'
      console.log(`[${i.status}] ${i.id}`)
      console.log(`  ${i.text}`)
      console.log(`  📍 ${where}｜${c.device ?? ''} ${c.viewport ?? ''}｜${new Date(i.at).toLocaleString('zh-TW')}`)
      if (c.errors?.length) console.log(`  ⚠️ ${c.errors.join(' | ')}`)
      if (i.note) console.log(`  💬 ${i.note}`)
    }
    console.log(`\n共 ${show.length} 筆${args[0] === 'all' ? '' : '（未處理）'}`)
    return
  }
  if (cmd === 'del') {
    const res = await fetch(U, { method: 'DELETE', headers: H, body: JSON.stringify(args[0] === 'done' ? { scope: 'done' } : { id: args[0] }) })
    console.log(res.status, await res.text())
    return
  }
  if (cmd === 'fix' || cmd === 'dismiss') {
    const [id, ...noteParts] = args
    const res = await fetch(U, {
      method: 'PATCH', headers: H,
      body: JSON.stringify({ id, status: cmd === 'fix' ? 'fixed' : 'dismissed', note: noteParts.join(' ') || undefined }),
    })
    console.log(res.status, await res.text())
    return
  }
  console.log('用法：list [all] | fix <id> <說明> | dismiss <id> [說明] | del <id>|done')
}
main()
