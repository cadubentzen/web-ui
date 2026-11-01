import React from 'react'
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../theme'
import { RideMetricsPanelView } from './RideMetricsPanelView'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

const gauge = { min: 0, max: 400, zones: [{ from: 0, to: 400, color: '#0f0', name: 'Z1' }], zone: 0 }
const power = { key: 'power', value: '152', unit: 'W', gauge }
const heartrate = { key: 'heartrate', value: '112', unit: 'bpm', gauge: { min: 60, max: 200 } }
const row = [
    { key: 'speed', value: '31.2', unit: 'km/h' },
    { key: 'slope', value: '1.5', unit: '%' },
    { key: 'cadence', value: '82', unit: 'rpm' },
    { key: 'gear', value: '12', gearCount: 24 },
]

describe('RideMetricsPanelView', () => {
    test('renders two gauges and the row values in order', () => {
        const { container } = renderView(<RideMetricsPanelView power={power} heartrate={heartrate} row={row} />)
        expect(container.querySelectorAll('[data-testid="needle"]').length).toBe(2)
        const cols = [...container.querySelectorAll('[data-testid="row-column"]')]
        expect(cols.map(c => c.textContent.match(/31\.2|1\.5|82|12/)?.[0])).toEqual(['31.2', '1.5', '82', '12'])
    })

    test('free ride model (no slope, no gear) renders two columns', () => {
        const { container } = renderView(<RideMetricsPanelView power={power} heartrate={heartrate} row={row.filter(r => ['speed', 'cadence'].includes(r.key))} />)
        expect(container.querySelectorAll('[data-testid="row-column"]').length).toBe(2)
    })
})
