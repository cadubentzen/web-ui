import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { zoneColor } from '../Activity/utils'

const powerSeries = vi.hoisted(() => [])

// react-vis' XYPlot cannot render under this React version in jsdom; replace the charting
// primitives with stubs and record the series data the component hands to them.
vi.mock('react-vis', () => {
    const Stub = () => null
    return {
        XYPlot: ({ children }) => <>{children}</>,
        LineSeries: (props) => { powerSeries.push(props); return null },
        HorizontalGridLines: Stub, VerticalGridLines: Stub, XAxis: Stub, YAxis: Stub, VerticalRectSeries: Stub,
    }
})

import { WorkoutRideGraph } from './WorkoutRideGraph'

describe('WorkoutRideGraph', () => {

    beforeEach(() => { powerSeries.length = 0 })

    test('colours live power bars by zone', () => {
        // 170 W at FTP 200 = 85% of FTP = zone 3
        const logs = [
            { time: 0, power: 170, heartrate: 120 },
            { time: 1, power: 170, heartrate: 120 },
            { time: 2, power: 170, heartrate: 120 },
        ]
        render(<WorkoutRideGraph width={100} height={100} ftp={200} activity={{ logs }} />)

        const withColor = powerSeries.flatMap(s => s.data ?? []).filter(d => d.color !== undefined)
        expect(withColor.length).toBeGreaterThan(0)
        withColor.forEach(d => expect(d.color).toBe(zoneColor[3]))
    })
})
