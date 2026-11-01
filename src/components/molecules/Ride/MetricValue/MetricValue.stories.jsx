import React from 'react'
import { MetricValue } from './MetricValue'

export default { component: MetricValue, title: 'molecules/Ride/MetricValue' }

const Template = args => <div style={{ background: '#2a0f3a', padding: 20 }}><MetricValue {...args} /></div>

export const Power = Template.bind({})
Power.args = { metric: 'power', value: '210', unit: 'W' }

export const Warning = Template.bind({})
Warning.args = { metric: 'heartrate', value: '171', unit: 'bpm', state: 'amber' }

export const Critical = Template.bind({})
Critical.args = { metric: 'power', value: '420', unit: 'W', state: 'red' }

export const WithBadge = Template.bind({})
WithBadge.args = { metric: 'power', value: '210', unit: 'W', badge: 'RF 50%' }
