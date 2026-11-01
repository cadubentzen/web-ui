import React from 'react'
import { ZoneGauge } from './ZoneGauge'

export default { component: ZoneGauge, title: 'molecules/Ride/ZoneGauge' }

const Template = args => <div style={{ background: '#2a0f3a', padding: 20 }}><ZoneGauge {...args} /></div>

const colors = ['#7d7d86', '#3a7bd5', '#3fa34d', '#d9c21c', '#ec7a1c', '#d63a3a', '#a43ad6']
const names = ['Z1 Recovery', 'Z2 Endurance', 'Z3 Tempo', 'Z4 Threshold', 'Z5 VO2max', 'Z6 Anaerobic', 'Z7 Sprint']
const bounds = [0, 55, 75, 90, 105, 120, 150, 160]
const zones = names.map((name, i) => ({ name, color: colors[i], from: bounds[i] * 2, to: bounds[i + 1] * 2 }))

export const Power = Template.bind({})
Power.args = { metric: 'power', value: '152', unit: 'W', gauge: { min: 0, max: 320, zones, zone: 2 } }

export const WithTarget = Template.bind({})
WithTarget.args = { metric: 'power', value: '152', unit: 'W', gauge: { min: 0, max: 320, zones, zone: 2, target: { min: 180, max: 200 } } }

export const NoFtp = Template.bind({})
NoFtp.args = { metric: 'heartrate', value: '120', unit: 'bpm', gauge: { min: 0, max: 200 } }

export const OutOfRange = Template.bind({})
OutOfRange.args = { metric: 'power', value: '500', unit: 'W', gauge: { min: 0, max: 320, zones, zone: 6 } }

export const NoData = Template.bind({})
NoData.args = { metric: 'power', value: '–', unit: 'W', gauge: { min: 0, max: 320, zones } }
