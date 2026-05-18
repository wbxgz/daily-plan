import { useState } from 'react'
import { usePlans, useMonthPlans, useCategories } from '../hooks/usePlans'
import './CalendarPage.css'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const STATUS_LABEL: Record<string, string> = {
  pending: '待完成',
  done: '已完成',
  postponed: '已顺延',
  cancelled: '已取消',
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const doneDates = useMonthPlans(year, month)
  const { plans, loaded } = usePlans(selectedDate ?? '')
  const { categories } = useCategories()

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const todayStr = new Date().toISOString().slice(0, 10)

  const goMonth = (delta: number) => {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setMonth(m)
    setYear(y)
  }

  const catColor = (catId: string) =>
    categories.find((c) => c.id === catId)?.color ?? '#6b7280'

  const catName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name ?? '未分类'

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="calendar-page">
      <div className="cal-header">
        <button className="cal-nav" onClick={() => goMonth(-1)}>‹</button>
        <span className="cal-title">{year}年{month}月</span>
        <button className="cal-nav" onClick={() => goMonth(1)}>›</button>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-weekday">{w}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="cal-cell empty" />
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasDone = doneDates.has(dateStr)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          return (
            <button
              key={dateStr}
              className={`cal-cell${hasDone ? ' has-done' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => setSelectedDate(dateStr)}
            >
              <span className="cal-day-num">{day}</span>
              {hasDone && <span className="cal-dot" />}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="cal-detail">
          <h3 className="cal-detail-title">
            {selectedDate === todayStr ? '今天' : selectedDate}
          </h3>
          {!loaded ? (
            <div className="empty-state">加载中…</div>
          ) : plans.length === 0 ? (
            <div className="empty-hint">当天没有计划</div>
          ) : (
            <ul className="plan-list">
              {plans.map((plan) => (
                <li key={plan.id} className={`plan-item ${plan.status === 'done' ? 'done-item' : ''}`}>
                  <span className="cat-dot" style={{ background: catColor(plan.categoryId) }} />
                  <span className={`plan-title ${plan.status === 'done' ? 'done-text' : ''}`}>
                    {plan.title}
                  </span>
                  <span className="plan-cat-label">{catName(plan.categoryId)}</span>
                  <span className="plan-status-label">{STATUS_LABEL[plan.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
