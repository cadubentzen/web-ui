import React from 'react'
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../theme'
import { Panel } from './Panel'

describe('Panel', () => {
    test('takes fill, border and radius from the panel tokens', () => {
        const { getByTestId } = render(<ThemeProvider theme={newUITheme}><Panel data-testid='p'>x</Panel></ThemeProvider>)
        const style = getComputedStyle(getByTestId('p'))
        expect(style.background).toContain('rgba(255, 255, 255, 0.06)')
        expect(style.borderRadius).toBe(newUITheme.panel.radius)
        expect(style.borderTopWidth).toBe('1px')
    })

    test('a focused panel gets an accent ring', () => {
        const { getByTestId } = render(<ThemeProvider theme={newUITheme}><Panel data-testid='p' $focused>x</Panel></ThemeProvider>)
        expect(getComputedStyle(getByTestId('p')).boxShadow).toContain('2px')
    })
})
