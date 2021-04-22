import {useState} from 'react'

interface ReturnType<T> {
  add: (t: T | T[]) => void
  delete: (t: T) => boolean
  clear: () => void
  values: () => Iterable<T>
  size: number
  has: (t: T) => boolean
}

export const useSetState = <T>(initialValue: T[] = []): ReturnType<T> => {
  const [set, setSet] = useState(new Set<T>(initialValue))

  const add = (t: T | T[]): void => {
    if (Array.isArray(t)) {
      const newSet = new Set(t)
      setSet(newSet)
    } else {
      set.add(t)
      const newSet = new Set(set)
      setSet(newSet)
    }
  }

  const remove = (t: T): boolean => {
    const returnValue = set.delete(t)
    setSet(new Set(set))
    return returnValue
  }

  const clear = () => setSet(new Set())

  return {
    has: (t: T) => set.has(t),
    size: set.size,
    values: () => set.values(),
    add,
    delete: remove,
    clear,
  }
}
