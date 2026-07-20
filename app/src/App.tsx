import { useEffect } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { APP_NAME } from './config'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import Parent from './pages/Parent'
import Works from './pages/Works'
import Issues from './pages/Issues'
import { BugReporter, flushOutbox } from './components/BugReporter'
import { SosButton } from './components/SosButton'
import { installErrorBuffer } from './store/testerContext'
import { AppUIProvider } from './ui/appui'

export default function App() {
  useEffect(() => {
    installErrorBuffer()
    void flushOutbox()
  }, [])
  return (
    <HashRouter>
      <AppUIProvider>
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-4">
        <header className="flex items-center justify-between gap-2 py-4">
          <Link
            to="/"
            className="shrink-0 whitespace-nowrap text-xl font-black text-sky-700 sm:text-2xl"
          >
            📷 {APP_NAME}
          </Link>
          <nav className="flex shrink-0 gap-2 text-sm font-bold">
            <Link to="/works" className="whitespace-nowrap rounded-full bg-white px-3 py-2 shadow">
              🖼️ 作品
            </Link>
            <Link to="/parent" className="whitespace-nowrap rounded-full bg-white px-3 py-2 shadow">
              🔑 家長
            </Link>
          </nav>
        </header>
        <main className="flex-1 pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lesson/:id" element={<Lesson />} />
            <Route path="/works" element={<Works />} />
            <Route path="/parent" element={<Parent />} />
            <Route path="/issues" element={<Issues />} />
          </Routes>
        </main>
        <BugReporter />
        <SosButton />
      </div>
      </AppUIProvider>
    </HashRouter>
  )
}
