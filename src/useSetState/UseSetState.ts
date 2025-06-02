import {useCallback, useMemo, useState} from 'react'

export interface UseSetState<T> {
  add: (t: T | T[]) => void
  toggle: (t: T) => void
  toggleAll: (t: T[]) => void
  delete: (t: T | T[]) => boolean
  clear: () => void
  values: Iterable<T>
  toArray: T[]
  size: number
  has: (t: T) => boolean
  reset: (values?: T[]) => void
}

export function useSetState<T>(initialValue: T[] = []): UseSetState<T> {
  const [set, setSet] = useState(() => new Set<T>(initialValue))

  const add = useCallback((t: T | T[]) => {
    const items = Array.isArray(t) ? t : [t]
    setSet(prev => new Set([...prev, ...items]))
  }, [])

  const remove = useCallback((t: T | T[]): boolean => {
    const items = Array.isArray(t) ? t : [t]
    let result = false
    setSet(prev => {
      const newSet = new Set(prev)
      items.forEach(item => {
        const deleted = newSet.delete(item)
        if (deleted) result = true
      })
      return newSet
    })
    return result
  }, [])

  const toggle = useCallback((t: T) => {
    setSet(prev => {
      const newSet = new Set(prev)
      if (newSet.has(t)) {
        newSet.delete(t)
      } else {
        newSet.add(t)
      }
      return newSet
    })
  }, [])

  const toggleAll = useCallback((items: T[]) => {
    setSet(prev => {
      const allPresent = items.every(item => prev.has(item))
      const newSet = new Set(prev)
      if (allPresent) {
        items.forEach(item => newSet.delete(item))
      } else {
        items.forEach(item => newSet.add(item))
      }
      return newSet
    })
  }, [])

  const clear = useCallback(() => setSet(new Set()), [])

  const reset = useCallback((values: T[] = []) => {
    setSet(new Set(values))
  }, [])

  const has = useCallback((t: T) => set.has(t), [set])

  const toArray = useMemo(() => Array.from(set), [set])

  const values = useMemo(() => set.values(), [set])

  return {
    add,
    toggle,
    toggleAll,
    delete: remove,
    clear,
    reset,
    has,
    toArray,
    values,
    size: set.size,
  }
}
