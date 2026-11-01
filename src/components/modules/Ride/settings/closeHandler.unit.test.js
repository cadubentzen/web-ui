import { describe, test, expect, vi } from 'vitest'
import { getCloseHandler } from './closeHandler'

describe('ActiveRideSettings close (✕ / Escape)', () => {
    const onBack = vi.fn(), onContinue = vi.fn(), onOK = vi.fn()

    test('resumes the ride while it is paused', () => {
        expect(getCloseHandler({ onContinue, onOK })).toBe(onContinue)
    })

    test('goes back when the menu shows Back', () => {
        expect(getCloseHandler({ back: true, onBack, onContinue })).toBe(onBack)
    })

    test('a finished ride cannot be closed without saving or deleting', () => {
        expect(getCloseHandler({ finished: true, onContinue })).toBeUndefined()
    })
})
