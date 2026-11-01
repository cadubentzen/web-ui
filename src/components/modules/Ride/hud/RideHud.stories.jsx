import React from 'react'
import { RideProgressPanelView } from './RideProgressPanelView'
import { RideMetricsPanelView } from './RideMetricsPanelView'
import { toHudModel } from './model'
import { Overlay } from '../../../atoms'

export default {
    title: 'modules/ride/RideHud',
}

const powerGauge = {
    min: 0,
    max: 400,
    zones: [
        { from: 0, to: 100, color: '#8a8a8a', name: 'Z1' },
        { from: 100, to: 200, color: '#3b9cff', name: 'Z2' },
        { from: 200, to: 300, color: '#3ecf6a', name: 'Z3' },
        { from: 300, to: 400, color: '#e4a13c', name: 'Z4' },
    ],
    zone: 1,
    target: { min: 140, max: 170 },
}
const hrGauge = { min: 60, max: 200 }

const items2 = [
    { title: 'Time', data: [{ value: '0:10:01' }, { value: '-0:49:59' }] },
    { title: 'Distance', data: [{ value: '1.8', unit: 'km' }, { value: '-9.2' }] },
    { title: 'Speed', data: [{ value: '31.2', unit: 'km/h' }, { value: '55.0', label: 'max' }] },
    { title: 'Power', data: [{ value: '152', unit: 'W' }, { value: '170', label: 'avg' }], gauge: powerGauge },
    { title: 'Slope', data: [{ value: '1.5', unit: '%' }, { value: '7', label: 'gain', unit: 'm' }] },
    { title: 'Heartrate', data: [{ value: '112', unit: 'bpm' }, { value: '99', label: 'avg' }], gauge: hrGauge },
    { title: 'Cadence', data: [{ value: '82', unit: 'rpm' }, { value: '89', label: 'avg' }] },
    { title: 'Gear', data: [{ value: '12' }], gearCount: 24 },
]

const Scene = ({ children }) => (
    <div style={{ background: '#222', width: '100%', height: '100%' }}>{children}</div>
)

export const ProgressPanel = () => {
    const { time, distance } = toHudModel(items2)
    return (
        <Scene>
            <Overlay padding="0" margin="0" top="2vh" left="1vw" width="16vw" height="14vh">
                <RideProgressPanelView time={time} distance={distance} />
            </Overlay>
        </Scene>
    )
}

export const MetricsPanel = () => {
    const { power, heartrate, row } = toHudModel(items2)
    return (
        <Scene>
            <Overlay padding="0" margin="0" top="2vh" left="30vw" width="40vw" height="40vh">
                <RideMetricsPanelView power={power} heartrate={heartrate} row={row} />
            </Overlay>
        </Scene>
    )
}

export const FreeRide = () => {
    const { power, heartrate, row } = toHudModel(items2.filter(i => !['Slope', 'Gear'].includes(i.title)))
    return (
        <Scene>
            <Overlay padding="0" margin="0" top="2vh" left="30vw" width="40vw" height="40vh">
                <RideMetricsPanelView power={power} heartrate={heartrate} row={row} />
            </Overlay>
        </Scene>
    )
}
