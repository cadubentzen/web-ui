import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../../theme'
import { Button } from './index'

const show = (ui) => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)
const styleOf = (name) => getComputedStyle(screen.getByRole('button', { name }))

describe('Button (pill)', () => {
    test('primary: accent fill, dark text, full pill radius', () => {
        show(<Button primary text='Go' />)
        const s = styleOf('Go')
        expect(s.borderRadius).toBe('999px')
        expect(s.backgroundColor).toBe('rgb(228, 161, 60)')
        expect(s.color).toBe('rgb(28, 18, 3)')
    })

    test('secondary: transparent outline', () => {
        show(<Button secondary text='More' />)
        const s = styleOf('More')
        expect(s.borderRadius).toBe('999px')
        expect(s.borderStyle).toBe('solid')
        expect(s.borderWidth).toBe('1.5px')
        expect(s.borderColor).toContain('rgba(255, 255, 255, 0.3)')
        expect(s.backgroundColor).not.toBe('rgb(228, 161, 60)')
    })

    test('plain button without variant uses the outline look, not a filled pill', () => {
        show(<Button text='Cancel' />)
        const s = styleOf('Cancel')
        expect(s.borderWidth).toBe('1.5px')
        expect(s.borderColor).toContain('rgba(255, 255, 255, 0.3)')
        expect(s.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    })

    test('icon-only button keeps a compact rounded shape and is not clipped', () => {
        show(<Button id='dir' width='40px'><svg data-testid='i' /></Button>)
        const s = styleOf('')
        expect(s.borderRadius).toBe('8px')
        expect(s.overflow).not.toBe('hidden')
        expect(s.paddingLeft).toBe('0.3em')
    })

    test('button whose element child contains text is a labelled pill', () => {
        show(<Button outline><span><b>Free Ride</b></span></Button>)
        const s = getComputedStyle(screen.getByRole('button'))
        expect(s.borderRadius).toBe('999px')
        expect(s.overflow).toBe('hidden')
    })

    test('empty text prop (e.g. while loading) keeps the pill shape', () => {
        show(<Button text=''><svg /></Button>)
        expect(getComputedStyle(screen.getByRole('button')).borderRadius).toBe('999px')
    })

    test('hover tint does not replace the wrapper background colour', () => {
        show(<Button text='Tint' />)
        const css = Array.from(document.querySelectorAll('style')).map(n => n.textContent).join('\n')
        const hover = css.match(/:hover\{[^}]*\}/g) || []
        const mine = hover.filter(h => h.includes('linear-gradient'))
        expect(mine.length).toBeGreaterThan(0)
        mine.forEach(h => expect(h).not.toMatch(/background(-color)?:/))
    })

    test('responsive label sits in an ellipsis span', () => {
        show(<Button responsive text='A very long label' />)
        const span = screen.getByText('A very long label')
        expect(span.tagName).toBe('SPAN')
        expect(getComputedStyle(span).textOverflow).toBe('ellipsis')
    })

    test('danger: red outline', () => {
        show(<Button variant='danger' text='Delete' />)
        const s = styleOf('Delete')
        expect(s.borderColor).toBe('rgb(255, 107, 107)')
        expect(s.borderRadius).toBe('999px')
    })

    test('text variant has no frame', () => {
        show(<Button variant='text' text='Skip' />)
        const s = styleOf('Skip')
        expect(s.borderStyle).toBe('none')
    })

    test('disabled is dimmed and aria-disabled', () => {
        show(<Button primary disabled text='Off' />)
        const b = screen.getByRole('button', { name: 'Off' })
        expect(b.getAttribute('aria-disabled')).toBe('true')
        expect(getComputedStyle(b).opacity).toBe('0.5')
    })

    test('enabled has no aria-disabled', () => {
        show(<Button text='On' />)
        expect(screen.getByRole('button', { name: 'On' }).hasAttribute('aria-disabled')).toBe(false)
    })

    test('long labels are clipped with an ellipsis instead of overflowing', () => {
        show(<Button primary text='Start with workout and download' />)
        const s = styleOf('Start with workout and download')
        expect(s.whiteSpace).toBe('nowrap')
        expect(s.overflow).toBe('hidden')
        expect(s.textOverflow).toBe('ellipsis')
        expect(s.maxWidth).toBe('100%')
    })
})
