import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../theme'
import { RideProgressPanelView } from './RideProgressPanelView'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

const time = { value: '0:10:01', remaining: '−0:35:12' }
const distance = { value: '1.80', unit: 'km', remaining: '−9.20' }

describe('RideProgressPanelView', () => {
    test('shows elapsed and remaining without captions', () => {
        const { container } = renderView(<RideProgressPanelView time={time} distance={distance} />)
        expect(screen.getByText('0:10:01')).toBeDefined()
        expect(screen.getByText('−0:35:12')).toBeDefined()
        expect(screen.getByText('1.80')).toBeDefined()
        expect(screen.getByText('−9.20')).toBeDefined()
        expect(container.textContent).not.toMatch(/ridden|to go/i)
    })

    test('shows the elevation gain (and what is left to climb) under time and distance, if given', () => {
        renderView(<RideProgressPanelView time={time} distance={distance} elevation={{ value: '120', unit: 'm', remaining: '−340' }} />)
        expect(screen.getByRole('img', { name: 'elevation' })).toBeDefined()
        expect(screen.getByText('120').textContent).toBe('120m')
        expect(screen.getByText('−340').textContent).toBe('−340m')
    })

    test('no elevation row without a route', () => {
        renderView(<RideProgressPanelView time={time} distance={distance} />)
        expect(screen.queryByRole('img', { name: 'elevation' })).toBeNull()
    })

    test('remaining distance is followed by its unit', () => {
        renderView(<RideProgressPanelView time={time} distance={distance} />)
        const rem = screen.getByText('−9.20')
        expect(rem.textContent).toBe('−9.20km')
        expect(screen.getAllByText('km').length).toBe(2)
    })

    test('remaining and elapsed values share the font size', () => {
        renderView(<RideProgressPanelView time={time} distance={distance} />)
        for (const [e, r] of [['0:10:01', '−0:35:12'], ['1.80', '−9.20']])
            expect(getComputedStyle(screen.getByText(r)).fontSize).toBe(getComputedStyle(screen.getByText(e)).fontSize)
    })

    test('progress bar width is elapsed/(elapsed+remaining)', () => {
        const { container } = renderView(<RideProgressPanelView time={time} distance={distance} />)
        const bars = [...container.querySelectorAll('[data-testid="progress"]')]
        expect(bars.length).toBe(2)
        expect(parseFloat(bars[0].style.width)).toBeCloseTo((601 / (601 + 2112)) * 100, 1)
        expect(parseFloat(bars[1].style.width)).toBeCloseTo((1.8 / 11) * 100, 1)
    })

    test('no remaining means no bar', () => {
        const { container } = renderView(<RideProgressPanelView time={{ value: '10:01' }} distance={{ value: '1.80', unit: 'km' }} />)
        expect(container.querySelectorAll('[data-testid="progress"]').length).toBe(0)
    })

    test('unparsable values mean no bar; m:ss is accepted', () => {
        const { container } = renderView(<RideProgressPanelView time={{ value: '–', remaining: '−10:00' }} distance={{ value: '5:00', remaining: '−5:00' }} />)
        expect(container.querySelectorAll('[data-testid="progress"]').length).toBe(0)
        const r = renderView(<RideProgressPanelView time={{ value: '5:00', remaining: '−5:00' }} distance={{ value: '–' }} />)
        const bar = r.container.querySelector('[data-testid="progress"]')
        expect(parseFloat(bar.style.width)).toBeCloseTo(50, 1)
    })

    test('the panel surface comes from the theme', () => {
        const theme = { ...newUITheme, hud: { ...newUITheme.hud, panel: 'rgb(1, 2, 3)' } }
        const { container } = render(<ThemeProvider theme={theme}><RideProgressPanelView time={time} distance={distance} /></ThemeProvider>)
        expect(getComputedStyle(container.firstChild).backgroundColor).toBe('rgb(1, 2, 3)')
    })
})
