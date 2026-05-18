import { useState, useCallback } from 'react'
import { usePlans, useCategories } from '../hooks/usePlans'
import './TodayPage.css'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function TodayPage() {
  const date = todayStr()
  const { plans, loaded, addPlan, updateStatus } = usePlans(date)
  const { categories } = useCategories()
  const [input, setInput] = useState('')
  const [selectedCat, setSelectedCat] = useState('work')
  const [postponeDate, setPostponeDate] = useState<string | null>(null)
  const [postponeId, setPostponeId] = useState<string | null>(null)

  const handleAdd = useCallback(async () => {
    const title = input.trim()
    if (!title) return
    await addPlan(title, selectedCat)
    setInput('')
  }, [input, selectedCat, addPlan])

  const catColor = (catId: string) =>
    categories.find((c) => c.id === catId)?.color ?? '#6b7280'

  const catName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name ?? '未分类'

  const handlePostpone = (id: string) => {
    setPostponeId(id)
    setPostponeDate(null)
  }

  const confirmPostpone = async () => {
    if (!postponeId) return
    const target = postponeDate ?? tomorrowStr()
    await updateStatus(postponeId, 'postponed', target)
    setPostponeId(null)
    setPostponeDate(null)
  }

  const pending = plans.filter((p) => p.status === 'pending')
  const done = plans.filter((p) => p.status === 'done')

  if (!loaded) return <div className="empty-state">加载中…</div>

  return (
    <div className="today-page">
      <div className="date-header">
        <span className="date-text">{formatDate(date)}</span>
      </div>

      {/* Input area */}
      <div className="add-plan">
        <input
          type="text"
          className="plan-input"
          placeholder="添加今日计划…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          enterKeyHint="done"
        />
        <div className="add-row">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="cat-select"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="btn-add" onClick={handleAdd}>
            添加
          </button>
        </div>
      </div>

      {/* Pending plans */}
      <section className="plan-section">
        <h3 className="section-title">
          待完成
          {pending.length > 0 && (
            <span className="section-count">{pending.length}</span>
          )}
        </h3>
        {pending.length === 0 ? (
          <div className="empty-hint">暂无计划，添加一条吧</div>
        ) : (
          <ul className="plan-list">
            {pending.map((plan) => (
              <li key={plan.id} className="plan-item">
                <span
                  className="cat-dot"
                  style={{ background: catColor(plan.categoryId) }}
                />
                <span className="plan-title">{plan.title}</span>
                <span className="plan-cat-label">{catName(plan.categoryId)}</span>
                <div className="plan-actions">
                  <button
                    className="act-btn act-done"
                    onClick={() => updateStatus(plan.id, 'done')}
                    title="完成"
                  >
                    ✓
                  </button>
                  <button
                    className="act-btn act-postpone"
                    onClick={() => handlePostpone(plan.id)}
                    title="顺延"
                  >
                    →
                  </button>
                  <button
                    className="act-btn act-cancel"
                    onClick={() => updateStatus(plan.id, 'cancelled')}
                    title="取消"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Done plans */}
      {done.length > 0 && (
        <section className="plan-section">
          <h3 className="section-title done-title">
            已完成
            <span className="section-count done-count">{done.length}</span>
          </h3>
          <ul className="plan-list">
            {done.map((plan) => (
              <li key={plan.id} className="plan-item done-item">
                <span
                  className="cat-dot"
                  style={{ background: catColor(plan.categoryId) }}
                />
                <span className="plan-title done-text">{plan.title}</span>
                <span className="plan-cat-label">{catName(plan.categoryId)}</span>
                <button
                  className="act-btn act-undo"
                  onClick={() => updateStatus(plan.id, 'pending')}
                  title="撤销"
                >
                  ↩
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Postpone dialog */}
      {postponeId !== null && (
        <div className="overlay" onClick={() => setPostponeId(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h4>顺延至</h4>
            <button
              className="dialog-btn"
              onClick={() => {
                setPostponeDate(tomorrowStr())
                confirmPostpone()
              }}
            >
              明天 ({formatShort(tomorrowStr())})
            </button>
            <div className="dialog-divider">
              <span>或选择日期</span>
            </div>
            <input
              type="date"
              className="date-picker"
              value={postponeDate ?? ''}
              min={tomorrowStr()}
              onChange={(e) => setPostponeDate(e.target.value)}
            />
            <div className="dialog-actions">
              <button className="dialog-btn secondary" onClick={() => setPostponeId(null)}>
                取消
              </button>
              <button
                className="dialog-btn primary"
                disabled={!postponeDate}
                onClick={confirmPostpone}
              >
                确认顺延
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
}

function formatShort(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
