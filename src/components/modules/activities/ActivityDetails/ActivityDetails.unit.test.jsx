import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ActivityGraph/ScreenshotPopup pull in charting/map libraries that need real layout/DOM APIs
// jsdom doesn't provide - they are irrelevant to the upload-pill behaviour under test here.
vi.mock('../../../molecules/Activity', async () => {
    const actual = await vi.importActual('../../../molecules/Activity')
    return {
        ...actual,
        ActivityGraph: () => null,
        ScreenshotPopup: () => null,
    }
})

vi.mock('../../../molecules', async () => {
    const actual = await vi.importActual('../../../molecules')
    return {
        ...actual,
        Dialog: ({ children }) => <div>{children}</div>,
        FreeMap: () => null,
    }
})

import { ActivityDetails } from './ActivityDetails'

// Regression coverage for FIXES_BACKLOG item #48 (defense-in-depth, web-ui side):
// while activity.details is still loading, incyclist-services now reports upload status
// 'loading' instead of 'unknown'. The Synchronize pill must treat that as non-actionable,
// so it can't be clicked before the real details (and therefore a real upload status) exist.
describe('ActivityDetails - upload pill loading status (issue #48)', () => {

    const baseProps = {
        title: 'Test Activity',
        activity: {},
        units: {},
        exports: [],
        showMap: false,
        canStart: false,
        canOpen: false,
    }

    test('an upload still loading its details cannot be synchronized', () => {
        const onUpload = vi.fn()
        const uploads = [
            { type: 'komoot', text: 'Komoot', status: 'loading', synchronizing: false },
        ]

        render(<ActivityDetails {...baseProps} uploads={uploads} onUpload={onUpload} />)

        const pillText = screen.getByText('Komoot')
        fireEvent.click(pillText)

        // the pill must not expose a Synchronize action while status is 'loading'
        expect(screen.queryByText('Synchronize')).not.toBeInTheDocument()
        expect(onUpload).not.toHaveBeenCalled()
    })

    test('control case: a not-yet-synced upload (status unknown) can still be synchronized', () => {
        const onUpload = vi.fn()
        const uploads = [
            { type: 'strava', text: 'Strava', status: 'unknown', synchronizing: false },
        ]

        render(<ActivityDetails {...baseProps} uploads={uploads} onUpload={onUpload} />)

        const pillText = screen.getByText('Strava')
        fireEvent.click(pillText)

        const syncItem = screen.getByText('Synchronize')
        fireEvent.click(syncItem)

        expect(onUpload).toHaveBeenCalledWith(uploads[0])
    })

    test('footer: Delete is a danger action set apart, Ride Again is primary when it can start', () => {
        const onDelete = vi.fn()
        const onStart = vi.fn()
        render(<ActivityDetails {...baseProps} canStart={true} canOpen={true} onDelete={onDelete} onStart={onStart} />)

        const del = screen.getByRole('button', { name: 'Delete' })
        const rideAgain = screen.getByRole('button', { name: 'Ride Again' })
        expect(screen.getByRole('button', { name: 'Open' })).toBeEnabled()
        expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled()
        // primary = accent fill, danger = red outline
        expect(getComputedStyle(rideAgain).backgroundColor).not.toBe(getComputedStyle(del).backgroundColor)
        expect(getComputedStyle(del).backgroundColor).toBe('rgba(0, 0, 0, 0)')
        expect(del.parentElement.parentElement).toBe(rideAgain.parentElement.parentElement)
    })

    test('info is a label/value grid and chips are focusable buttons', () => {
        render(<ActivityDetails {...baseProps} started={new Date(2026, 9, 31, 8, 5).getTime()} duration={3900}
            distance={25400} exports={[{ type: 'fit', file: '/tmp/a.fit' }]}
            uploads={[{ type: 'strava', text: 'Strava', status: 'unknown' }]} />)
        expect(screen.getByText('Started')).toBeInTheDocument()
        expect(screen.getByText('1h 5min')).toBeInTheDocument()
        expect(screen.getByText('25.4 km')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'fit' })).toBeEnabled()
        expect(screen.getByRole('button', { name: 'Strava' })).toBeEnabled()
    })
})
