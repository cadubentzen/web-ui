import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../../theme'
import { PrevRides } from './component'

const rides = [
    { position: 1, title: '01.01.2023', timeGap: 1, distanceGap: '10m', power: 200, speed: 36, avatar: {} },
    { position: 2, title: 'current', power: 199, speed: 35.1, avatar: {} },
]

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('PrevRides', () => {
    test('lists the previous rides and the current one under the title', () => {
        renderView(<PrevRides title='Previous Rides' rides={rides} />)
        expect(screen.getByText('Previous Rides')).toBeTruthy()
        expect(screen.getByText('01.01.2023')).toBeTruthy()
        expect(screen.getByText('Current Ride')).toBeTruthy()
    })

    test('uses the page font (no forced font family)', () => {
        renderView(<PrevRides title='Previous Rides' rides={rides} />)
        for (const text of ['Previous Rides', '01.01.2023', '+1s'])
            expect(getComputedStyle(screen.getByText(text)).fontFamily, text).not.toMatch(/Roboto|Arial/)
    })

    test('renders nothing without rides', () => {
        const { container } = renderView(<PrevRides rides={[]} />)
        expect(container.textContent).toBe('')
    })
})
