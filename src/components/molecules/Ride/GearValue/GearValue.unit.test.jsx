import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../theme'
import { GearValue } from './GearValue'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('GearValue', () => {
    test('renders a strip of marks with the current gear highlighted', () => {
        renderView(<GearValue value="12" gearCount={24} />)
        const marks = screen.getAllByTestId('gear-mark')
        expect(marks).toHaveLength(24)
        const current = marks.filter(m => m.getAttribute('aria-current') === 'true')
        expect(current).toHaveLength(1)
        expect(marks.indexOf(current[0])).toBe(11)
        expect(screen.getByText('12')).toBeDefined()
    })

    test('no strip for an offset value without gearCount', () => {
        renderView(<GearValue value="+2" />)
        expect(screen.queryAllByTestId('gear-mark')).toHaveLength(0)
    })

    test('no strip for a non-integer value', () => {
        renderView(<GearValue value="3 ↑" gearCount={24} />)
        expect(screen.queryAllByTestId('gear-mark')).toHaveLength(0)
    })
})
