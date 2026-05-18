import { useState } from 'react'
import { useCategories, useExport } from '../hooks/usePlans'
import './SettingsPage.css'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280']

export default function SettingsPage() {
  const { categories, loaded, addCategory, deleteCategory } = useCategories()
  const { exportData, importData } = useExport()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [msg, setMsg] = useState<string | null>(null)

  const handleAddCat = async () => {
    const name = newName.trim()
    if (!name) return
    await addCategory(name, newColor)
    setNewName('')
    setMsg('分类已添加')
    setTimeout(() => setMsg(null), 2000)
  }

  const handleImport = async () => {
    const err = await importData()
    if (err) {
      setMsg(err)
    } else {
      setMsg('数据已导入，请刷新页面')
    }
    setTimeout(() => setMsg(null), 3000)
  }

  if (!loaded) return <div className="empty-state">加载中…</div>

  return (
    <div className="settings-page">
      {msg && <div className="toast">{msg}</div>}

      <section className="settings-section">
        <h3>分类管理</h3>
        <ul className="cat-list">
          {categories.map((cat) => (
            <li key={cat.id} className="cat-item">
              <span className="cat-color" style={{ background: cat.color }} />
              <span className="cat-name">{cat.name}</span>
              {!cat.isDefault && (
                <button className="cat-del" onClick={() => deleteCategory(cat.id)}>
                  删除
                </button>
              )}
              {cat.isDefault && <span className="cat-default">默认</span>}
            </li>
          ))}
        </ul>

        <div className="add-cat">
          <input
            type="text"
            className="cat-input"
            placeholder="新分类名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
          />
          <div className="color-picker">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-opt${c === newColor ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <button className="btn-add" onClick={handleAddCat}>
            添加分类
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3>数据备份</h3>
        <p className="settings-desc">
          数据存储在浏览器本地。导出备份文件以防丢失，或在新设备上导入恢复。
        </p>
        <div className="backup-actions">
          <button className="btn-backup" onClick={exportData}>
            📤 导出备份
          </button>
          <button className="btn-backup" onClick={handleImport}>
            📥 导入数据
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3>关于</h3>
        <p className="settings-desc">
          每日计划 v1.0 — 基于 PWA 技术构建，支持离线使用。数据完全存储在你的设备上。
        </p>
      </section>
    </div>
  )
}
