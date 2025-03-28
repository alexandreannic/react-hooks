import {Fetch, UseFetcher, useFetcher} from '..'
import {Dispatch, SetStateAction, useCallback, useState} from 'react'

export interface Paginate<T> {
  data: T[]
  totalSize: number
}

export type OrderBy = 'desc' | 'asc';

export interface ISearch<T = any> {
  limit: number
  offset: number
  orderBy?: OrderBy
  sortBy?: keyof T
}

export interface UsePaginate<T, S, E = any> {
  list?: Paginate<T>,
  error?: E
  fetching: boolean,
  fetch: Fetch<(...args: any[]) => Promise<Paginate<T>>>
  filters: S,
  updateFilters: (_: SetStateAction<S>, params?: UpdateFiltersParams) => void,
  setEntity: Dispatch<SetStateAction<Paginate<T> | undefined>>,
  clearFilters: () => void,
  pageNumber: number
  initialFilters: S
  clearCache: () => void
}

export interface UpdateFiltersParams {
  preserveOffset?: boolean
}

const defaultFilters: ISearch = {offset: 0, limit: 10,}

export const usePaginate = <T, S extends ISearch, E = any>(
  fetcher: (search: S) => Promise<Paginate<T>>,
  initialFilters: S,
  mapError: (_: any) => E = _ => _
): UsePaginate<T, S, E> => {
  const [filters, setFilters] = useState<S>({...defaultFilters, ...initialFilters})
  const {get: list, error, loading: fetching, fetch, set: setEntity, clearCache} = useFetcher<typeof fetcher, E>(fetcher, {mapError})

  const updateFilters = useCallback((update: SetStateAction<S>, {preserveOffset}: UpdateFiltersParams = {}) => {
    setFilters(mutableFilters => {
      const previous = {...mutableFilters}
      const updatedFilters = typeof update === 'function' ? update(mutableFilters) : update
      if (!preserveOffset && previous.offset === updatedFilters.offset && previous.limit === updatedFilters.limit) {
        updatedFilters.offset = 0
      }
      return updatedFilters
    })
  }, [])

  const clearFilters = useCallback(() => updateFilters(initialFilters), [])

  return {
    list,
    error,
    fetching,
    fetch: (args: {force?: boolean, clean?: boolean} = {}) => fetch(args, filters),
    filters,
    pageNumber: filters.offset / filters.limit,
    updateFilters,
    clearFilters,
    initialFilters,
    setEntity,
    clearCache,
  }
}
