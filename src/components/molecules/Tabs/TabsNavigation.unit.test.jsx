import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, cleanup, act, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../theme'
import { ControllerNavigation, FOCUS_CLASS } from '../../modules/ControllerNavigation/ControllerNavigation'
import { Tabs } from './Tabs'

vi.mock('react-router', () => ({ useLocation: () => ({ pathname: '/settings' }) }))
vi.mock('incyclist-services', () => ({ useDeviceRide: () => ({ getAllAdapters: () => [] }) }))
vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: class { logEvent() {} set() {} },
}))

const Pane = () => <div>content</div>

const rect = (left, top, width = 100, height = 40) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top })

const key = (k) => {
    const target = document.activeElement ?? document.body
    act(() => {
        target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
        target.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true, cancelable: true }))
    })
}
const focusedText = () => document.querySelector(`.${FOCUS_CLASS}`)?.textContent

describe('Tabs controller navigation', () => {
    afterEach(() => cleanup())

    test('ArrowRight / ArrowLeft move the controller focus between tabs', () => {
        render(
            <ThemeProvider theme={newUITheme}>
                <Tabs activeTab='Gear'>
                    <Pane label='Gear' />
                    <Pane label='Ride' />
                    <Pane label='Apps' />
                </Tabs>
                <ControllerNavigation />
            </ThemeProvider>
        )
        const tabs = screen.getAllByRole('tab')
        for (const el of document.body.querySelectorAll('*')) {
            const i = tabs.indexOf(el)
            el.getBoundingClientRect = () => i >= 0 ? rect(i * 120, 0) : rect(0, 0, 1000, 1000)
            el.scrollIntoView = () => {}
        }

        key('ArrowDown')
        expect(focusedText()).toBe('Gear')
        key('ArrowRight')
        expect(focusedText()).toBe('Ride')
        key('ArrowRight')
        expect(focusedText()).toBe('Apps')
        key('ArrowLeft')
        expect(focusedText()).toBe('Ride')
    })
})
