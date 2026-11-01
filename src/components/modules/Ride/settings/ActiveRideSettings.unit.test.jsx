import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: class { logEvent() {} set() {} },
}))

const activityRide = { getActivity: vi.fn() }
vi.mock('incyclist-services', async (importOriginal) => ({
    ...(await importOriginal()),
    useActivityRide: () => activityRide,
}))

// the settings tabs and the summary have their own tests
vi.mock('../../Settings', () => {
    const Tab = ({ label }) => <div>{`${label} settings`}</div>
    return { AppsSettings: Tab, UserSettings: Tab, SupportArea: Tab, GearSettings: Tab, RideSettings: Tab, WorkoutSettings: Tab }
})
vi.mock('../summary/wrapper', () => ({ DynamicActivitySummary: () => <div>activity summary</div> }))

import { ActiveRideSettings } from './ActiveRideSettings'

const HIDDEN = ['User', 'Workout', 'Apps', 'Support']

describe('ActiveRideSettings (pause menu)', () => {
    beforeEach(() => { activityRide.getActivity.mockReturnValue({ id: 'a' }) })

    test('opens on the Activity tab with the activity summary, titled Paused', () => {
        render(<ActiveRideSettings area='Activity' hidden={HIDDEN} onContinue={vi.fn()} />)
        expect(screen.getByText('Paused')).toBeInTheDocument()
        expect(screen.getByText('activity summary')).toBeInTheDocument()
        for (const tab of ['Gear', 'Ride', 'Activity'])
            expect(screen.getByText(tab)).toBeInTheDocument()
    })

    test('✕ resumes the ride like Continue', () => {
        const onContinue = vi.fn()
        render(<ActiveRideSettings area='Activity' hidden={HIDDEN} onContinue={onContinue} />)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onContinue).toHaveBeenCalledTimes(1)
    })

    test('other tabs: Continue is the primary action, on the right', () => {
        const onContinue = vi.fn()
        render(<ActiveRideSettings area='Ride' hidden={HIDDEN} onContinue={onContinue} />)
        const cont = screen.getByRole('button', { name: 'Continue' })
        expect(getComputedStyle(cont).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(getComputedStyle(cont.closest('div')).justifyContent).toBe('flex-end')
        fireEvent.click(cont)
        expect(onContinue).toHaveBeenCalledTimes(1)
    })
})
