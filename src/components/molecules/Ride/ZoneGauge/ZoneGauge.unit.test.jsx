import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../theme'
import { ZoneGauge } from './ZoneGauge'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

const colors = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777']
const zones = colors.map((color, i) => ({ from: i * 40, to: (i + 1) * 40, color, name: `Z${i + 1} ${i === 2 ? 'Tempo' : 'x'}` }))
const gauge = { min: 0, max: 280, zones, zone: 2 }

describe('ZoneGauge', () => {
    test('the arc sizing does not leak onto the centred metric icon', () => {
        const { container } = renderView(<ZoneGauge metric="power" value="100" unit="W" gauge={gauge} />)
        const icon = container.querySelector('svg[aria-label="power"]')
        const arc = container.querySelector('svg:not([aria-label])')
        expect(getComputedStyle(arc).width).toBe('100%')
        expect(getComputedStyle(icon).width).not.toBe('100%')
        expect(getComputedStyle(icon).height).not.toBe('100%')
    })

    test('draws one segment per zone in the zone colours and shows the zone name', () => {
        const { container } = renderView(<ZoneGauge metric="power" value="100" unit="W" gauge={gauge} />)
        const segs = [...container.querySelectorAll('[data-testid="segment"]')]
        expect(segs.map(s => s.getAttribute('stroke'))).toEqual(colors)
        expect(screen.getByText('Z3 Tempo')).toBeDefined()
        expect(screen.getByText('100')).toBeDefined()
        expect(screen.getByText('W')).toBeDefined()
    })

    test('without zones: one neutral track arc and no zone name', () => {
        const { container } = renderView(<ZoneGauge metric="heartrate" value="120" unit="bpm" gauge={{ min: 0, max: 200 }} />)
        expect(container.querySelectorAll('[data-testid="segment"]').length).toBe(0)
        const track = container.querySelectorAll('[data-testid="track"]')
        expect(track.length).toBe(1)
        expect(track[0].getAttribute('stroke')).toBe('rgba(255,255,255,0.15)')
        expect(container.querySelector('[data-testid="zone-name"]')).toBeNull()
        expect(container.querySelector('[data-testid="needle"]')).not.toBeNull()
    })

    test('no data: no needle and nothing throws', () => {
        const { container } = renderView(<ZoneGauge metric="power" value="–" unit="W" gauge={gauge} />)
        expect(container.querySelector('[data-testid="needle"]')).toBeNull()
        expect(screen.getByText('–')).toBeDefined()
    })

    test('a missing gauge does not throw and draws no needle', () => {
        const { container } = renderView(<ZoneGauge metric="power" value="100" unit="W" />)
        expect(container.querySelector('[data-testid="needle"]')).toBeNull()
    })

    test('out of range values clamp the needle to the arc end, the number stays real', () => {
        const at = v => renderView(<ZoneGauge metric="power" value={v} unit="W" gauge={gauge} />).container.querySelector('[data-testid="needle"]').getAttribute('d')
        const over = at('500')
        const atMax = at('280')
        expect(over).toBe(atMax)
        expect(at('-20')).toBe(at('0'))
        expect(screen.getAllByText('500').length).toBe(1)
    })

    test('target draws the bracket', () => {
        const { container } = renderView(<ZoneGauge metric="power" value="100" unit="W" gauge={{ ...gauge, target: { min: 100, max: 140 } }} />)
        expect(container.querySelector('[data-testid="target"]')).not.toBeNull()
    })

    test('no target: no bracket', () => {
        const { container } = renderView(<ZoneGauge metric="power" value="100" unit="W" gauge={gauge} />)
        expect(container.querySelector('[data-testid="target"]')).toBeNull()
    })

    test('state red tints the centre icon with the error token', () => {
        renderView(<ZoneGauge metric="power" value="100" unit="W" gauge={gauge} state="red" />)
        expect(screen.getByLabelText('power').style.color).toBe('rgb(255, 77, 77)')
    })

    test('state amber tints the centre icon with the warning token', () => {
        renderView(<ZoneGauge metric="heartrate" value="100" unit="bpm" gauge={gauge} state="amber" />)
        expect(screen.getByLabelText('heartrate').style.color).toBe('rgb(255, 191, 0)')
    })

    test('a long zone name shrinks to stay inside the arc, on one line', () => {
        const fontSize = name => {
            const g = { ...gauge, zones: zones.map((z, i) => i === 2 ? { ...z, name } : z) }
            const el = renderView(<ZoneGauge metric="power" value="100" unit="W" gauge={g} />).getByText(name)
            expect(getComputedStyle(el).whiteSpace).toBe('nowrap')
            return parseFloat(getComputedStyle(el).fontSize)
        }
        const short = fontSize('Z3 Tempo')
        const long = fontSize('Z6 Aerobic Capacity')
        expect(short).toBe(0.1)
        expect(long).toBeLessThan(short)
        expect(long).toBeGreaterThan(0.05)
    })
})
