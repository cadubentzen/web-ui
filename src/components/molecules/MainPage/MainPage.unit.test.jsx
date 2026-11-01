import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../theme'
import { MainPage } from './index'

describe('MainPage', () => {
    const renderPage = () => render(
        <ThemeProvider theme={newUITheme}>
            <MainPage><span>content</span></MainPage>
        </ThemeProvider>
    )

    test('renders its children without the photo background', () => {
        const { container } = renderPage()
        expect(screen.getByText('content')).toBeTruthy()
        expect(container.querySelector('.main-page')).toBeNull()
    })

    test('the root uses the page background token', () => {
        const { container } = renderPage()
        const root = container.firstChild
        const background = getComputedStyle(root).background
        expect(background).toContain('radial-gradient')
        expect(background).toContain('linear-gradient')
    })

    test('the background layer covers the whole viewport', () => {
        const { container } = renderPage()
        const style = getComputedStyle(container.firstChild)
        expect(style.position).toBe('absolute')
        expect(style.top).toBe('0px')
        expect(style.right).toBe('0px')
        expect(style.bottom).toBe('0px')
        expect(style.left).toBe('0px')
        expect(style.height).toBe('100%')
        expect(style.width).toBe('100%')
    })
})
