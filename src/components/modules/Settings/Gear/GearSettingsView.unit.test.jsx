import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CyclingModeProperyType } from 'incyclist-services'
import { GearSettingsView } from './GearSettingsView'

const logger = { logEvent: vi.fn() }
const option = (name, properties) => ({ getName: () => name, getDescription: () => `${name} description`, getProperties: () => properties })

describe('GearSettingsView', () => {
    const properties = [
        { key: 'slope', name: 'Slope', type: CyclingModeProperyType.Integer, max: 99, description: 'in %' },
        { key: 'vs', name: 'Virtual Shifting', type: CyclingModeProperyType.SingleSelect, options: ['Off', 'On'] },
        { key: 'flag', name: 'Flag', type: CyclingModeProperyType.Boolean },
    ]
    const props = {
        mode: 'ERG', logger, settings: { slope: 5, vs: 'Off', flag: true },
        options: [option('ERG', properties), option('Sim', [])],
    }

    test('renders mode selector, section header and property rows', () => {
        render(<GearSettingsView {...props} />)
        expect(screen.getByText('Bike Preference')).toBeInTheDocument()
        expect(screen.getByLabelText('Mode')).toHaveValue('ERG')
        expect(screen.getByText('Slope')).toBeInTheDocument()
        expect(screen.getByText('Virtual Shifting')).toBeInTheDocument()
        expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    test('mode change and select change are reported', () => {
        const onChangeMode = vi.fn(), onChangeSetting = vi.fn()
        render(<GearSettingsView {...props} onChangeMode={onChangeMode} onChangeSetting={onChangeSetting} />)
        fireEvent.change(screen.getByLabelText('Mode'), { target: { value: 'Sim' } })
        expect(onChangeMode).toHaveBeenCalledWith('Sim')
        fireEvent.change(screen.getByDisplayValue('Off'), { target: { value: 'On' } })
        expect(onChangeSetting).toHaveBeenCalledWith('vs', 'On')
    })
})
