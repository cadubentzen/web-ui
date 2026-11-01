import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../theme'
import { SHIFTING_REGION } from '../../Ride/layoutConstants'
import { ShiftingControl, BUTTON_BOX, ROW_GAP } from './component'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('ShiftingControl', () => {
    const props = { onPowerUp: vi.fn(), onPowerDown: vi.fn(), onPin: vi.fn(), onUnpin: vi.fn() }

    test('buttons are sized from the shifting slot, so they stay inside it', () => {
        expect(BUTTON_BOX).toContain(`${SHIFTING_REGION.height * 0.9}vh`)
        expect(BUTTON_BOX).toContain(`(${SHIFTING_REGION.width}vw - 4 * ${ROW_GAP}) / 5`)

        const { container } = renderView(<ShiftingControl {...props} />)
        const buttons = [...container.querySelectorAll('button')]
        expect(buttons.length).toBe(5)
        const css = [...document.querySelectorAll('style')].map(el => el.textContent + [...(el.sheet?.cssRules ?? [])].map(r => r.cssText).join('')).join('')
        expect(css).toMatch(/width:\s*min\(3\.15vh/)
    })

    test('the buttons are separated by a small gap', () => {
        const { container } = renderView(<ShiftingControl {...props} />)
        expect(getComputedStyle(container.querySelector('button').parentElement).gap).toBe(ROW_GAP)
    })

    test('the buttons keep their handlers', () => {
        const { container } = renderView(<ShiftingControl {...props} />)
        fireEvent.click(container.querySelector('#dec5'))
        fireEvent.click(container.querySelector('#inc1'))
        fireEvent.click(container.querySelector('#pin'))
        expect(props.onPowerDown).toHaveBeenCalledWith(5)
        expect(props.onPowerUp).toHaveBeenCalledWith(1)
        expect(props.onPin).toHaveBeenCalled()
    })
})
