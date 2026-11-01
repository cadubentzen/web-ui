import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../../theme'

// the graph and the map need real layout/DOM APIs jsdom doesn't provide
vi.mock('../../../molecules/Activity', async () => {
    const actual = await vi.importActual('../../../molecules/Activity')
    return { ...actual, ActivityGraph: () => <div data-testid='activity-graph' />, ScreenshotPopup: () => null }
})
vi.mock('../../../molecules/Maps', () => ({ FreeMap: () => <div data-testid='map' /> }))

import { ActivitySummaryView } from './ActivitySummary'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

// as services provide it (getActivitySummaryDisplayProperties -> createUIActivityDetails)
const activity = {
    title: 'Incyclist Ride: Arnbach',
    time: 1450,
    distance: { value: 9.8, unit: 'km' },
    stats: { power: { avg: 148.4, min: 0, max: 400 }, hrm: { avg: 121.2, min: 90, max: 160 } },
    logs: [],
}

// (the stats panel below repeats Time and Distance)
const tile = (label) => screen.getAllByTestId('summary-tile').find(t => within(t).queryByTestId('tile-label')?.textContent === label)

describe('ActivitySummaryView (pause menu activity tab)', () => {
    test('summary tiles: time, distance, avg power and avg heart rate', () => {
        renderView(<ActivitySummaryView activity={activity} showSave />)
        const tiles = screen.getAllByTestId('summary-tile')
        expect(tiles.map(t => t.querySelector('[data-testid="tile-label"]').textContent))
            .toEqual(['Time', 'Distance', 'Avg power', 'Avg heart rate'])
        expect(tile('Time').textContent).toContain('0:24:10')
        expect(tile('Distance').textContent).toContain('9.8')
        expect(tile('Distance').textContent).toContain('km')
        expect(tile('Avg power').textContent).toContain('148')
        expect(tile('Avg power').textContent).toContain('W')
        expect(tile('Avg heart rate').textContent).toContain('121')
        expect(tile('Avg heart rate').textContent).toContain('bpm')
    })

    test('missing values show – and no unit', () => {
        renderView(<ActivitySummaryView activity={{ title: 'x', logs: [] }} showSave />)
        for (const label of ['Time', 'Distance', 'Avg power', 'Avg heart rate']) {
            const value = within(tile(label)).getByTestId('tile-value')
            expect(value.textContent, label).toBe('–')
        }
    })

    test('no heart rate sensor (avg 0) shows –', () => {
        renderView(<ActivitySummaryView activity={{ ...activity, stats: { power: activity.stats.power, hrm: { avg: 0 } } }} showSave />)
        expect(within(tile('Avg heart rate')).getByTestId('tile-value').textContent).toBe('–')
    })

    test('shows the power trace in its own panel', () => {
        renderView(<ActivitySummaryView activity={activity} showSave />)
        expect(screen.getByTestId('activity-graph')).toBeInTheDocument()
    })

    test('keeps the title (editable) and the map', () => {
        const onTitleChange = vi.fn()
        renderView(<ActivitySummaryView activity={activity} showSave showMap onTitleChange={onTitleChange} />)
        expect(screen.getByText('Incyclist Ride: Arnbach')).toBeInTheDocument()
        expect(screen.getByTestId('map')).toBeInTheDocument()
    })

    test('footer: Delete set apart on the left, Save and Continue on the right, Continue primary', () => {
        const onDelete = vi.fn(), onSave = vi.fn(), onContinue = vi.fn()
        renderView(<ActivitySummaryView activity={activity} showSave onDelete={onDelete} onSave={onSave} onContinue={onContinue} />)
        const start = screen.getByTestId('footer-start')
        const end = screen.getByTestId('footer-end')
        const del = within(start).getByRole('button', { name: 'Delete' })
        const save = within(end).getByRole('button', { name: 'Save' })
        const cont = within(end).getByRole('button', { name: 'Continue' })
        expect(within(end).getAllByRole('button')).toEqual([save, cont])
        // primary = accent fill, the others are outlines
        expect(getComputedStyle(cont).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(getComputedStyle(save).backgroundColor).toBe('rgba(0, 0, 0, 0)')
        expect(getComputedStyle(del).backgroundColor).toBe('rgba(0, 0, 0, 0)')

        fireEvent.click(del); fireEvent.click(save); fireEvent.click(cont)
        expect(onDelete).toHaveBeenCalled()
        expect(onSave).toHaveBeenCalled()
        expect(onContinue).toHaveBeenCalled()
    })

    test('a finished ride has no Continue', () => {
        renderView(<ActivitySummaryView activity={activity} showSave showContinue={false} />)
        expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    test('after saving: New Ride and Exit App, nothing to delete', () => {
        renderView(<ActivitySummaryView activity={activity} showSave={false} showDelete={false} />)
        expect(screen.getByRole('button', { name: 'New Ride' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Exit App' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    })

    test('delete asks for confirmation, No first', () => {
        renderView(<ActivitySummaryView activity={activity} showSave showDeleteConfirm />)
        expect(screen.getByText('Delete Ride')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument()
    })
})
