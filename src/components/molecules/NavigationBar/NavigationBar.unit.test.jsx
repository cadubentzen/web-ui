import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

const { mockUI } = vi.hoisted(() => ({
    mockUI: { toggleFullscreen: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useAppState: () => ({ hasFeature: () => false, getPersistedState: () => 'routes' }),
    }
})

vi.mock('../../../bindings/native-ui', () => ({ useAppUI: () => mockUI }))
vi.mock('../../modules/Settings', () => ({ UserSettingsDialog: () => null, SettingsDialog: () => null }))

import { NavigationBarComponent } from './index'
import { kitTokens } from '../../../theme'
import AppTheme from '../../../theme'

const renderBar = (props={}) => render(
    <MemoryRouter>
        <NavigationBarComponent height={800} width='120px' selected='routes' {...props} />
    </MemoryRouter>
)

describe('NavigationBar', () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('shows only Routes, no separate Search icon', () => {
        renderBar()
        expect(screen.queryByText('Search')).toBeNull()
        expect(screen.getByText('Routes')).toBeInTheDocument()
    })

    test('f toggles fullscreen, Ctrl+F does not', () => {
        renderBar()

        act(() => { window.dispatchEvent(new KeyboardEvent('keyup', {key:'f', ctrlKey:true})) })
        expect(mockUI.toggleFullscreen).not.toHaveBeenCalled()

        act(() => { window.dispatchEvent(new KeyboardEvent('keyup', {key:'f'})) })
        expect(mockUI.toggleFullscreen).toHaveBeenCalledTimes(1)
    })

    describe('rail and tiles', () => {
        const itemOf = (label) => screen.getByText(label).closest('button')

        test('items are real buttons', () => {
            renderBar()
            const labels = ['Settings','Devices','Routes','Workouts','Activities']
            labels.forEach( l => expect(itemOf(l)).not.toBeNull() )
        })

        test('selected item is a white rounded tile with dark text, others transparent and muted', () => {
            renderBar()
            const kit = kitTokens(AppTheme.get())
            const on = getComputedStyle(itemOf('Routes'))
            expect(on.backgroundColor).toBe('rgb(255, 255, 255)')
            expect(on.borderRadius).toBe(kit.navTileRadius)
            expect(on.borderRadius).not.toBe('999px')

            const off = getComputedStyle(itemOf('Devices'))
            expect(off.backgroundColor).not.toBe('rgb(255, 255, 255)')
            expect(off.borderRadius).toBe(kit.navTileRadius)
        })

        test('rail uses the translucent rail token with rounded corners', () => {
            const { container } = renderBar()
            const kit = kitTokens(AppTheme.get())
            let el = itemOf('Routes')
            let found
            while (el && el!==container) {
                const cs = getComputedStyle(el)
                if (cs.borderRadius===kit.navRailRadius) { found = cs; break }
                el = el.parentElement
            }
            expect(found).toBeDefined()
            expect(found.backgroundColor).toBe('rgba(0, 0, 0, 0.22)')
        })
    })
})
