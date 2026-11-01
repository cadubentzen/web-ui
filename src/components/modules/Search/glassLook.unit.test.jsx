import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../theme'

vi.mock('incyclist-services', async importOriginal => ({
    ...await importOriginal(), useRouteList: () => ({ requestRouteDetails: vi.fn() })
}))
vi.mock('../../molecules/Maps', () => ({ FreeMap: () => null }))
vi.mock('react-world-flags', () => ({ default: () => null }))

import { RouteTileSummaryView } from './RouteTileSummary/component'
import { RouteTilesView } from './RouteTiles/component'
import { RouteListToolbar } from './Toolbar'

const withTheme = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('Routes page modern look', () => {
    test.each(['list', 'tiles'])('the %s item is a glass panel', layout => {
        withTheme(<RouteTileSummaryView id='a' title='Arnbach' visible layout={layout === 'list' ? 'list' : undefined} />)
        const style = getComputedStyle(screen.getByRole('article', { name: 'Route Arnbach' }))
        expect(style.background).toContain('rgba(255, 255, 255, 0.06)')
        expect(style.borderRadius).toBe(newUITheme.panel.radius)
    })

    test('the search box and sort menu use the filled field look', () => {
        withTheme(<RouteListToolbar sortOptions={[{ value: 'name', label: 'Name' }]} sortOrder='name' />)
        expect(getComputedStyle(screen.getByPlaceholderText('Search routes by name').parentElement).background).toContain('rgba(255, 255, 255')
        expect(getComputedStyle(screen.getByRole('combobox')).background).toContain('rgba(255, 255, 255')
    })

    test('the tile grid fills the available width', () => {
        const { container } = withTheme(<RouteTilesView tiles={[]} TileComponent={() => null} getFoldEvent={() => ''} isOutsideFold={() => false} />)
        const cols = getComputedStyle(container.firstChild).gridTemplateColumns
        expect(cols).toContain('auto-fill')
        expect(cols).toContain('1fr')
    })
})
