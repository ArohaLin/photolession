// 建置前把 ../content（課程內容庫）同步到 public/content
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = path.resolve(here, '../../content')
const dst = path.resolve(here, '../public/content')

rmSync(dst, { recursive: true, force: true })
if (existsSync(src)) {
  cpSync(src, dst, { recursive: true })
  console.log('content synced ->', dst)
} else {
  mkdirSync(dst, { recursive: true })
  console.log('content/ 不存在，建立空目錄', dst)
}
