import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../../theme'
import { StartRideOverlay, GEAR_STATES } from './StartRideOverlay'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

const rgb = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`

const devices = [
    { name: 'KICKR CORE', isControl: true, state: GEAR_STATES.START_OK },
    { name: 'HRM-Pro', state: GEAR_STATES.STARTING },
]

describe('StartRideOverlay', () => {
    test('lists the devices and their state; Start is the primary action, Cancel cancels', () => {
        const onIgnore = vi.fn(), onCancel = vi.fn()
        renderView(<StartRideOverlay devices={devices} mapType='Street View' mapState='Loaded' readyToStart onIgnore={onIgnore} onCancel={onCancel} />)
        expect(screen.getByRole('dialog', { name: 'Start ride' })).toBeInTheDocument()
        expect(screen.getByText('Starting activity ...')).toBeInTheDocument()
        expect(screen.getByText('KICKR CORE')).toBeInTheDocument()
        expect(screen.getByText('Starting ...')).toBeInTheDocument()

        const start = screen.getByRole('button', { name: 'Start' })
        const cancel = screen.getByRole('button', { name: 'Cancel' })
        expect(getComputedStyle(start).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(getComputedStyle(cancel).backgroundColor).toBe('rgba(0, 0, 0, 0)')

        fireEvent.click(start)
        expect(onIgnore).toHaveBeenCalledTimes(1)
        fireEvent.click(cancel)
        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    test('state colours come from the theme: OK green, failure red', () => {
        renderView(<StartRideOverlay devices={[
            { name: 'Sensor A', state: GEAR_STATES.START_OK },
            { name: 'Sensor B', state: GEAR_STATES.START_FAILURE },
        ]} mapType='Map' mapState='Loaded' />)
        expect(getComputedStyle(screen.getAllByText('Started')[0]).color).toBe(rgb(newUITheme.colors.ok))
        expect(getComputedStyle(screen.getByText('Failed')).color).toBe(rgb(newUITheme.hud.error))
    })

    test('a failed bike start offers Retry and Cancel', () => {
        const onRetry = vi.fn()
        renderView(<StartRideOverlay devices={[{ name: 'KICKR CORE', isControl: true, state: GEAR_STATES.START_FAILURE }]} onRetry={onRetry} />)
        expect(screen.getByText('Start failed')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
        expect(onRetry).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    test('the box has rounded corners', () => {
        renderView(<StartRideOverlay devices={devices} />)
        expect(getComputedStyle(screen.getByRole('dialog')).borderRadius).toBe(newUITheme.hud.radius)
    })
})
