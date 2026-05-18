import { useState, Suspense, lazy } from 'react'
import type { ViewMode } from './types'
import './App.css'

const TodayPage = lazy(() => import('./pages/TodayPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const NAV_ITEMS: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'today', label: '今天', icon: '📋' },
  { mode: 'calendar', label: '日历', icon: '📅' },
  { mode: 'settings', label: '设置', icon: '⚙️' },
]

export default function App() {
  const [view, setView] = useState<ViewMode>('today')

  return (
    <div className="app">
      <header className="app-header">
        <h1>每日计划</h1>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => setView(view === 'today' ? 'calendar' : 'today')}
            title={view === 'today' ? '日历视图' : '今日计划'}
          >
            {view === 'today' ? '📅' : '📋'}
          </button>
        </div>
      </header>

      <main className="app-content">
        <Suspense fallback={<div className="empty-state">加载中…</div>}>
          {view === 'today' && <TodayPage />}
          {view === 'calendar' && <CalendarPage />}
          {view === 'settings' && <SettingsPage />}
        </Suspense>
      </main>

      <nav className="app-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.mode}
            className={`nav-item${view === item.mode ? ' active' : ''}`}
            onClick={() => setView(item.mode)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
