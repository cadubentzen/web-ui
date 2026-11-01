import React from 'react'
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../theme'
import PageBackground from './index'

describe('PageBackground', () => {
    test('covers the whole viewport with the page background', () => {
        const { container } = render(<ThemeProvider theme={newUITheme}><PageBackground /></ThemeProvider>)
        const style = getComputedStyle(container.firstChild)
        expect(style.position).toBe('absolute')
        expect(style.top).toBe('0px')
        expect(style.left).toBe('0px')
        expect(style.height).toBe('100%')
        expect(style.background).toContain('radial-gradient')
    })
})
