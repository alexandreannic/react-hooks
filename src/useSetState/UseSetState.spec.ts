import {renderHook, act} from '@testing-library/react'
import {useSetState} from './UseSetState'

describe('useSetState', () => {
  it('initializes with given values', () => {
    const {result} = renderHook(() => useSetState(['a', 'b']))
    expect(result.current.toArray.sort()).toEqual(['a', 'b'])
    expect(result.current.size).toBe(2)
  })

  it('adds items to the set', () => {
    const {result} = renderHook(() => useSetState<string>())
    act(() => {
      result.current.add('a')
      result.current.add(['b', 'c'])
    })
    expect(result.current.toArray.sort()).toEqual(['a', 'b', 'c'])
  })

  it('deletes items from the set', () => {
    const {result} = renderHook(() => useSetState(['a', 'b', 'c']))
    act(() => {
      result.current.delete('b')
    })
    expect(result.current.toArray.sort()).toEqual(['a', 'c'])
  })

  it('toggles a single item', () => {
    const {result} = renderHook(() => useSetState(['a']))
    act(() => {
      result.current.toggle('a') // remove
      result.current.toggle('b') // add
    })
    expect(result.current.toArray.sort()).toEqual(['b'])
  })

  it('toggles all — removes if all present', () => {
    const {result} = renderHook(() => useSetState(['a', 'b', 'c']))
    act(() => {
      result.current.toggleAll(['a', 'b'])
    })
    expect(result.current.toArray.sort()).toEqual(['c'])
  })

  it('toggles all — adds if not all present', () => {
    const {result} = renderHook(() => useSetState(['a']))
    act(() => {
      result.current.toggleAll(['a', 'b', 'c'])
    })
    expect(result.current.toArray.sort()).toEqual(['a', 'b', 'c'])
  })

  it('resets to new values', () => {
    const {result} = renderHook(() => useSetState(['a', 'b']))
    act(() => {
      result.current.reset(['x', 'y'])
    })
    expect(result.current.toArray.sort()).toEqual(['x', 'y'])
  })

  it('clears the set', () => {
    const {result} = renderHook(() => useSetState(['a', 'b']))
    act(() => {
      result.current.clear()
    })
    expect(result.current.toArray).toEqual([])
    expect(result.current.size).toBe(0)
  })

  it('has() returns correct result', () => {
    const {result} = renderHook(() => useSetState(['a']))
    expect(result.current.has('a')).toBe(true)
    expect(result.current.has('b')).toBe(false)
  })

  it('get() returns a new copy of the internal set', () => {
    const {result} = renderHook(() => useSetState(['a', 'b']))
    const copy = result.current.get
    expect(copy).toEqual(new Set(['a', 'b']))
  })
})
