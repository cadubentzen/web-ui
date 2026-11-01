import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { newUITheme } from '../../../../theme'
import { MetricValue } from './MetricValue'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('MetricValue', () => {
    test('renders value, unit and the metric icon', () => {
        renderView(<MetricValue metric="power" value="210" unit="W" />)
        expect(screen.getByText('210')).toBeDefined()
        expect(screen.getByText('W')).toBeDefined()
        expect(screen.getByLabelText('power')).toBeDefined()
    })

    test('state red tints the icon with the error token', () => {
        renderView(<MetricValue metric="power" value="210" state="red" />)
        expect(screen.getByLabelText('power').style.color).toBe('rgb(255, 77, 77)')
    })

    test('state amber tints the icon with the warning token', () => {
        renderView(<MetricValue metric="heartrate" value="150" state="amber" />)
        expect(screen.getByLabelText('heartrate').style.color).toBe('rgb(255, 191, 0)')
    })

    test('renders the badge', () => {
        renderView(<MetricValue metric="power" value="210" badge="RF 50%" />)
        expect(screen.getByText('RF 50%')).toBeDefined()
    })
})
