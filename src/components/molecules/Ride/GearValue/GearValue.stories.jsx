import React from 'react'
import { GearValue } from './GearValue'

export default { component: GearValue, title: 'molecules/Ride/GearValue' }

const Template = args => <div style={{ background: '#2a0f3a', padding: 20 }}><GearValue {...args} /></div>

export const WithStrip = Template.bind({})
WithStrip.args = { value: '12', gearCount: 24 }

export const Offset = Template.bind({})
Offset.args = { value: '+2' }

export const Shifting = Template.bind({})
Shifting.args = { value: '3 ↑', gearCount: 24 }
