import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import type { Plan, Category, PlanStatus } from '../types'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    db.categories.toArray().then((cats) => {
      setCategories(cats)
      setLoaded(true)
    })
  }, [])

  const addCategory = useCallback(async (name: string, color: string) => {
    const id = crypto.randomUUID()
    const cat: Category = { id, name, color, isDefault: false }
    await db.categories.add(cat)
    setCategories((prev) => [...prev, cat])
    return cat
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    const cat = await db.categories.get(id)
    if (cat?.isDefault) return
    await db.categories.delete(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { categories, loaded, addCategory, deleteCategory }
}

export function usePlans(date: string) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const list = await db.plans
      .where('date')
      .equals(date)
      .sortBy('sortOrder')
    setPlans(list)
    setLoaded(true)
  }, [date])

  useEffect(() => {
    setLoaded(false)
    refresh()
  }, [refresh])

  const addPlan = useCallback(
    async (title: string, categoryId: string) => {
      const max = await db.plans.where('date').equals(date).count()
      const plan: Plan = {
        id: crypto.randomUUID(),
        title,
        categoryId,
        date,
        status: 'pending',
        postponedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sortOrder: max,
      }
      await db.plans.add(plan)
      await refresh()
    },
    [date, refresh],
  )

  const updateStatus = useCallback(
    async (id: string, status: PlanStatus, postponedTo?: string) => {
      await db.plans.update(id, {
        status,
        postponedTo: postponedTo ?? null,
        updatedAt: new Date().toISOString(),
      })
      if (status === 'postponed' && postponedTo && postponedTo !== date) {
        await db.plans.update(id, { date: postponedTo })
      }
      await refresh()
    },
    [date, refresh],
  )

  const updateTitle = useCallback(
    async (id: string, title: string) => {
      await db.plans.update(id, {
        title,
        updatedAt: new Date().toISOString(),
      })
      await refresh()
    },
    [refresh],
  )

  const deletePlan = useCallback(
    async (id: string) => {
      await db.plans.delete(id)
      await refresh()
    },
    [refresh],
  )

  return { plans, loaded, refresh, addPlan, updateStatus, updateTitle, deletePlan }
}

export function useMonthPlans(year: number, month: number) {
  const [doneDates, setDoneDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    db.plans
      .where('date')
      .between(`${prefix}-01`, `${prefix}-31`, true, true)
      .and((p) => p.status === 'done')
      .toArray()
      .then((list) => {
        setDoneDates(new Set(list.map((p) => p.date)))
      })
  }, [year, month])

  return doneDates
}

export function useExport() {
  const exportData = useCallback(async () => {
    const [plans, categories] = await Promise.all([
      db.plans.toArray(),
      db.categories.toArray(),
    ])
    const blob = new Blob([JSON.stringify({ plans, categories }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-plan-backup-${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback(async () => {
    return new Promise<string | null>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return resolve(null)
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          if (!data.plans || !data.categories) {
            return resolve('文件格式不正确：缺少 plans 或 categories 数据')
          }
          await db.transaction('rw', db.plans, db.categories, async () => {
            await db.plans.clear()
            await db.categories.clear()
            await db.plans.bulkAdd(data.plans)
            await db.categories.bulkAdd(data.categories)
          })
          resolve(null)
        } catch {
          resolve('导入失败：文件无法解析')
        }
      }
      input.click()
    })
  }, [])

  return { exportData, importData }
}
