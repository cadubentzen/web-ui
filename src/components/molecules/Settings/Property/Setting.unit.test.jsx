import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { CyclingModeProperyType } from 'incyclist-services'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../../theme'
import { Setting } from './Setting'

const wrap = (ui) => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('Setting text inputs', () => {
    test('integer: confirmed value is logged and reported', () => {
        const logger = { logEvent: vi.fn() }, onChange = vi.fn()
        const { container } = wrap(<Setting logger={logger} onChange={onChange} value='5'
            property={{ key: 'slope', type: CyclingModeProperyType.Integer, max: 99 }} />)
        const input = container.querySelector('input')
        fireEvent.change(input, { target: { value: '12' } })
        fireEvent.blur(input)
        expect(onChange).toHaveBeenCalledWith('slope', '12')
        expect(logger.logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'text entered', field: 'slope' }))
    })

    test('integer below min: danger border, no onChange', () => {
        const onChange = vi.fn()
        const { container } = wrap(<Setting logger={{ logEvent: vi.fn() }} onChange={onChange} value='5' noLog
            property={{ key: 'slope', type: CyclingModeProperyType.Integer, min: 10, max: 99 }} />)
        const input = container.querySelector('input')
        fireEvent.change(input, { target: { value: '7' } })
        fireEvent.blur(input)
        expect(onChange).not.toHaveBeenCalled()
        expect(getComputedStyle(input).borderColor).toContain('255, 107, 107')
    })
})
