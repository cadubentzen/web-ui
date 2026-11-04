import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserSettingsView } from './UserSettings'

describe('UserSettingsView', () => {

    test('shows the max heart rate and reports changes', () => {
        const onChangeMaxHr = vi.fn()
        const { container } = render(<UserSettingsView maxHr={185} onChangeMaxHr={onChangeMaxHr} />)

        expect(screen.getByText('Max HR')).toBeInTheDocument()
        const input = container.querySelector('input[value="185"]')
        expect(input).not.toBeNull()

        fireEvent.change(input, { target: { value: '190' } })
        fireEvent.blur(input) // EditField commits on blur
        expect(onChangeMaxHr).toHaveBeenCalledWith(190)
    })

    test('shows the threshold heart rate and reports changes', () => {
        const onChangeThresholdHr = vi.fn()
        const { container } = render(<UserSettingsView thresholdHr={170} onChangeThresholdHr={onChangeThresholdHr} />)

        expect(screen.getByText('Threshold HR')).toBeInTheDocument()
        const input = container.querySelector('input[value="170"]')
        expect(input).not.toBeNull()

        fireEvent.change(input, { target: { value: '180' } })
        fireEvent.blur(input)
        expect(onChangeThresholdHr).toHaveBeenCalledWith(180)
    })

    test('clearing the threshold heart rate reports null', () => {
        const onChangeThresholdHr = vi.fn()
        const { container } = render(<UserSettingsView thresholdHr={170} onChangeThresholdHr={onChangeThresholdHr} />)

        const input = container.querySelector('input[value="170"]')
        fireEvent.change(input, { target: { value: '' } })
        fireEvent.blur(input)
        expect(onChangeThresholdHr).toHaveBeenCalledWith(null)
    })
})
