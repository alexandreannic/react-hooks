import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

export type UseObjectStateReturn<T extends object> = {
  /** current state (stable reference only changes when state changes) */
  get: T
  /** React-style setter (setState or functional updater) */
  set: React.Dispatch<React.SetStateAction<T>>
  /** shallow-merge partial updates */
  update: (updates: Partial<T>) => void
  /** reset to the initial state captured on first render */
  reset: () => void
  /** set a single property; no-op if value is identical (===) */
  setProperty: <K extends keyof T>(key: K, value: T[K]) => void
  /** remove a property (if present) */
  remove: (key: keyof T) => void
  /** rename a key: no-op if oldKey not present or newKey === oldKey */
  renameKey: (oldKey: keyof T, newKey: keyof T) => void
  /** mutable ref always pointing to the latest state (no re-render when read) */
  getRef: React.MutableRefObject<T>
}

/**
 * useObjectState
 * - stores initialState in a ref (reset uses that snapshot)
 * - memoizes operations so their identity is stable
 * - avoids setState when update is a no-op
 */
export function useObjectState<T extends object>(initialState: T): UseObjectStateReturn<T> {
  // keep initial snapshot (mount-time). If you want reset to pick up new initialState
  // when the prop changes, replace this with useEffect updating the ref.
  const initialRef = useRef<T>(initialState)

  const [state, setState] = useState<T>(initialState)

  // mutable ref always pointing to latest state (useful for callbacks that shouldn't
  // close over stale state)
  const stateRef = useRef<T>(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // stable setter (React guarantees setState identity stable, but we wrap some helpers similarly)
  const set = setState

  const update = useCallback((updates: Partial<T>) => {
    // use functional update to avoid stale closures
    setState(prev => {
      // quick check: if updates would not change anything, return prev
      let changed = false
      // do a shallow check; small and fast
      for (const k in updates) {
        if (prev[k] !== (updates as any)[k]) {
          changed = true
          break
        }
      }
      if (!changed) return prev
      return {...prev, ...updates}
    })
  }, [])

  const reset = useCallback(() => {
    setState(initialRef.current)
  }, [])

  const setProperty = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState(prev => {
      if (prev[key] === value) return prev // no-op if identical (===)
      return {...prev, [key]: value}
    })
  }, [])

  const remove = useCallback((key: keyof T) => {
    setState(prev => {
      if (!(key in prev)) return prev
      // create shallow copy without the key
      const {[key as any]: _removed, ...rest} = prev as any
      // rest is already a new object
      return rest as T
    })
  }, [])

  const renameKey = useCallback((oldKey: keyof T, newKey: keyof T) => {
    if (oldKey === newKey) return
    setState(prev => {
      if (!(oldKey in prev)) return prev
      const {[oldKey as any]: value, ...rest} = prev as any
      // if newKey already exists and points to identical value and removing oldKey would not change
      // structure, we still perform rename for clarity; but we can optimize further if needed.
      return {...(rest as T), [newKey as any]: value} as T
    })
  }, [])

  return useMemo(
    () => ({
      get: state,
      set,
      update,
      reset,
      setProperty,
      remove,
      renameKey,
      getRef: stateRef,
    }),
    [state, set, update, reset, setProperty, remove, renameKey], // set/update... are stable
  )
}
