export interface Category {
  id: string
  name: string
  color: string
  isDefault: boolean
}

export type PlanStatus = 'pending' | 'done' | 'postponed' | 'cancelled'

export interface Plan {
  id: string
  title: string
  categoryId: string
  date: string
  status: PlanStatus
  postponedTo: string | null
  createdAt: string
  updatedAt: string
  sortOrder: number
}

export type ViewMode = 'today' | 'calendar' | 'settings'
