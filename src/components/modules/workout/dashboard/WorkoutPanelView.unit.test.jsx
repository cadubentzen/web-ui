import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../theme'
import { WorkoutPanelView } from './WorkoutPanelView'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

const current = { minPower: 180, maxPower: 200, minCadence: 85, maxCadence: 95, duration: 300, remaining: 125, time: 175 }
const workout = { name: 'Test' }

describe('WorkoutPanelView', () => {
    test('shows step title, time left, power and cadence targets with units', () => {
        renderView(<WorkoutPanelView title="Threshold 3 / 6" current={current} workout={workout} />)
        expect(screen.getByText('Threshold 3 / 6')).toBeDefined()
        expect(screen.getByText('02:05')).toBeDefined()
        expect(screen.getByText('180–200')).toBeDefined()
        expect(screen.getByText('W')).toBeDefined()
        expect(screen.getByText('85–95')).toBeDefined()
        expect(screen.getByText('rpm')).toBeDefined()
    })

    test('no heart rate row when the step has no HR limits', () => {
        renderView(<WorkoutPanelView title="x" current={current} workout={workout} />)
        expect(screen.queryByText('bpm')).toBeNull()
        expect(screen.queryByLabelText('heartrate')).toBeNull()
    })

    test('heart rate row when the step has HR limits', () => {
        renderView(<WorkoutPanelView title="x" current={{ ...current, minHrm: 130, maxHrm: 140 }} workout={workout} />)
        expect(screen.getByText('130–140')).toBeDefined()
        expect(screen.getByText('bpm')).toBeDefined()
    })

    test('progress bar reflects elapsed share of the step', () => {
        renderView(<WorkoutPanelView title="x" current={current} workout={workout} />)
        const bar = screen.getByRole('progressbar')
        expect(bar.getAttribute('aria-valuenow')).toBe('58')
    })

    test('renders nothing without a workout', () => {
        const { container } = renderView(<WorkoutPanelView title="x" current={current} />)
        expect(container.firstChild).toBeNull()
    })
})
