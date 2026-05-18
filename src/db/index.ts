import Dexie, { type Table } from 'dexie'
import type { Plan, Category } from '../types'

export class DailyPlanDB extends Dexie {
  plans!: Table<Plan, string>
  categories!: Table<Category, string>

  constructor() {
    super('DailyPlanDB')
    this.version(1).stores({
      plans: 'id, date, status, categoryId, sortOrder',
      categories: 'id',
    })
    this.on('populate', () => this.seedDefaults())
  }

  private async seedDefaults() {
    const defaults: Category[] = [
      { id: 'work', name: '工作', color: '#3b82f6', isDefault: true },
      { id: 'study', name: '学习', color: '#10b981', isDefault: true },
      { id: 'life', name: '生活', color: '#f59e0b', isDefault: true },
      { id: 'health', name: '健康', color: '#ef4444', isDefault: true },
      { id: 'other', name: '其他', color: '#6b7280', isDefault: true },
    ]
    await this.categories.bulkAdd(defaults)
  }
}

export const db = new DailyPlanDB()
