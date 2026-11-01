import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme, kitTokens } from '../../../theme'
import { Tabs } from './Tabs'

const Pane = ({ label }) => <div>{label} content</div>

const renderTabs = (props = {}) => render(
    <ThemeProvider theme={newUITheme}>
        <Tabs {...props}>
            <Pane label='Gear' />
            <Pane label='Ride' />
            <Pane label='Apps' />
        </Tabs>
    </ThemeProvider>
)

describe('Tabs', () => {

    test('renders focusable role=tab buttons inside a tablist', () => {
        renderTabs({ activeTab: 'Ride' })

        const list = screen.getByRole('tablist')
        const tabs = screen.getAllByRole('tab')
        expect(tabs.map(t => t.textContent)).toEqual(['Gear', 'Ride', 'Apps'])
        tabs.forEach(t => { expect(list).toContainElement(t); expect(t.tagName).toBe('BUTTON') })
    })

    test('marks only the active tab as selected and shows its content', () => {
        renderTabs({ activeTab: 'Ride' })

        expect(screen.getByRole('tab', { name: 'Ride' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('tab', { name: 'Gear' })).toHaveAttribute('aria-selected', 'false')
        expect(screen.getByText('Ride content')).toBeInTheDocument()
    })

    test('selected tab has the pill-selected fill, others are unframed', () => {
        renderTabs({ activeTab: 'Ride' })

        const sel = getComputedStyle(screen.getByRole('tab', { name: 'Ride' }))
        const other = getComputedStyle(screen.getByRole('tab', { name: 'Gear' }))
        expect(sel.borderRadius).toBe('999px')
        expect(sel.background).toContain(kitTokens(newUITheme).pillSelected.replace(/,/g, ', '))
        expect(sel.color).toBe('rgb(255, 255, 255)')
        expect(other.background).not.toContain(kitTokens(newUITheme).pillSelected.replace(/,/g, ', '))
        expect(other.backgroundColor).toBe('rgba(0, 0, 0, 0)')
        expect(other.color).toBe(kitTokens(newUITheme).muted.replace(/,/g, ', '))
    })

    test('clicking a tab reports its label', () => {
        const onChangeTab = vi.fn()
        renderTabs({ activeTab: 'Ride', onChangeTab })

        fireEvent.click(screen.getByRole('tab', { name: 'Apps' }))
        expect(onChangeTab).toHaveBeenCalledWith('Apps')
    })

    test('long labels ellipsize instead of overflowing, and the row cannot outgrow its container', () => {
        render(
            <ThemeProvider theme={newUITheme}>
                <Tabs activeTab='Gear'>
                    <Pane label='Gear' />
                    <Pane label='Eine sehr lange deutsche Beschriftung' />
                </Tabs>
            </ThemeProvider>
        )
        const tab = getComputedStyle(screen.getByRole('tab', { name: /sehr lange/ }))
        expect(tab.overflow).toBe('hidden')
        expect(tab.textOverflow).toBe('ellipsis')
        expect(tab.minWidth).toBe('0px')
        const list = getComputedStyle(screen.getByRole('tablist'))
        expect(list.maxWidth).toBe('100%')
    })
})
