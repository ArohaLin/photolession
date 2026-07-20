import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { migrateLessonIds } from './store/migrate.ts'

// 課號重編（四軌化）一次性遷移，須在任何頁面讀進度前執行
migrateLessonIds()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
