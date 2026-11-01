import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../../theme'

vi.mock('incyclist-services', async importOriginal => ({
    ...await importOriginal(),
    useActivityList: () => ({ getActivityDetails: () => null }),
    useUserSettings: () => ({ get: () => ({ ftp: 200 }) }),
}))
// the thumbnail needs real layout; irrelevant for the row
vi.mock('../ActivityPreview', () => ({ ActivityPreview: () => <div data-testid='preview' /> }))

import { ActivityListItem } from './ActivityListItem'

const activityInfo = {
    summary: {
        id: 'a1', title: 'Passo Pordoi', startTime: new Date(2026, 9, 31, 8, 5).getTime(),
        rideTime: 3900, distance: 25400, totalElevation: 640,
    },
    details: { logs: [] },
}

const renderRow = (props = {}) => render(
    <ThemeProvider theme={newUITheme}>
        <ActivityListItem activityInfo={activityInfo} outsideFold={false} {...props} />
    </ThemeProvider>
)

describe('ActivityListItem', () => {
    test('shows title, date, duration, distance and elevation as a glass row', () => {
        renderRow()
        expect(screen.getByText('Passo Pordoi')).toBeInTheDocument()
        expect(screen.getByText(/31\.10\.2026\s+·\s+08:05\s+·\s+1h 5min/)).toBeInTheDocument()
        expect(screen.getByText('25.4km')).toBeInTheDocument()
        expect(screen.getByText('640m')).toBeInTheDocument()
        const row = screen.getByLabelText('Passo Pordoi')
        expect(getComputedStyle(row).background).toContain('rgba(255, 255, 255, 0.06)')
    })

    test('the row is focusable and selects the activity on click', () => {
        const onClick = vi.fn()
        renderRow({ onClick })
        const row = screen.getByLabelText('Passo Pordoi')
        expect(row).toHaveAttribute('tabindex', '0')
        fireEvent.click(row)
        expect(onClick).toHaveBeenCalledWith('a1')
    })

    test('the delete button is a real button that does not open the activity', () => {
        const onClick = vi.fn()
        const onDelete = vi.fn()
        renderRow({ onClick, onDelete })
        const button = screen.getByRole('button', { name: 'Delete' })
        fireEvent.click(button)
        expect(onDelete).toHaveBeenCalledTimes(1)
        expect(onClick).not.toHaveBeenCalled()
    })

    test('keeps a sized placeholder outside the fold', () => {
        const { container } = renderRow({ outsideFold: true, activityInfo: undefined })
        expect(container.firstChild).toBeTruthy()
        expect(screen.queryByRole('button')).toBeNull()
    })
})
