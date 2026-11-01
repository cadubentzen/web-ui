import { describe, test, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useScreenshotRequests } from './useScreenshotRequests'

// a take() that finishes when the test says so
const deferredTake = () => {
    const calls = []
    const take = vi.fn((moment) => new Promise(done => calls.push({ moment, done })))
    return { take, calls }
}

describe('useScreenshotRequests', () => {

    test('takes a requested screenshot, with the key moment it was requested for', async () => {
        const { take, calls } = deferredTake()
        const { result } = renderHook(() => useScreenshotRequests(take))
        expect(result.current.screenshotRequested).toBe(false)

        act(() => result.current.requestScreenshot('start'))
        expect(result.current.screenshotRequested).toBe('start')
        await waitFor(() => expect(take).toHaveBeenCalledWith('start'))

        await act(async () => calls[0].done())
        await waitFor(() => expect(result.current.screenshotRequested).toBe(false))
    })

    test('the rider\'s screenshot (moment none) requested during an automatic one is taken after it', async () => {
        const { take, calls } = deferredTake()
        const { result } = renderHook(() => useScreenshotRequests(take))

        act(() => result.current.requestScreenshot('start'))
        await waitFor(() => expect(take).toHaveBeenCalledTimes(1))
        act(() => result.current.requestScreenshot(true))

        await act(async () => calls[0].done())
        await waitFor(() => expect(take).toHaveBeenCalledTimes(2))
        expect(take).toHaveBeenLastCalledWith(undefined)

        await act(async () => calls[1].done())
        await waitFor(() => expect(result.current.screenshotRequested).toBe(false))
    })

    test('two of the rider\'s screenshots in a row are both taken', async () => {
        const { take, calls } = deferredTake()
        const { result } = renderHook(() => useScreenshotRequests(take))

        act(() => result.current.requestScreenshot(true))
        await waitFor(() => expect(take).toHaveBeenCalledTimes(1))
        act(() => result.current.requestScreenshot(true))

        await act(async () => calls[0].done())
        await waitFor(() => expect(take).toHaveBeenCalledTimes(2))
        await act(async () => calls[1].done())
        await waitFor(() => expect(result.current.screenshotRequested).toBe(false))
        expect(take).toHaveBeenCalledTimes(2)
    })

    test('a failed screenshot doesn\'t block the next ones', async () => {
        const take = vi.fn().mockRejectedValueOnce(new Error('no')).mockResolvedValue(undefined)
        const { result } = renderHook(() => useScreenshotRequests(take))

        act(() => result.current.requestScreenshot('start'))
        await waitFor(() => expect(result.current.screenshotRequested).toBe(false))
        act(() => result.current.requestScreenshot('finish'))
        await waitFor(() => expect(take).toHaveBeenLastCalledWith('finish'))
    })
})
