import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../../theme'

vi.mock('../../../molecules', async importOriginal => ({
    ...await importOriginal(), WorkoutGraph: () => <div data-testid='workout-graph' />
}))

import { WorkoutSummary } from './WorkoutCard/summary'
import { ScheduledWorkoutSummary } from './ScheduledWorkoutCard/summary'
import { CreateSummary } from './CreateCard/summary'
import { UploadSummary } from './UploadCard/summary'

const withTheme = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)
const workout = { title: 'Tempo' }

describe('Workouts page glass cards', () => {
    test('workout card is a glass panel with title, duration, FTP and a primary Select pill', () => {
        const onOK = vi.fn()
        const { container } = withTheme(<WorkoutSummary visible workout={workout} title="30' SubLT Tempo" duration='30 min' ftp={143} onOK={onOK} />)
        const style = getComputedStyle(container.querySelector('.workout-card'))
        expect(style.background).toContain('rgba(255, 255, 255, 0.06)')
        expect(style.borderRadius).toBe(newUITheme.panel.radius)
        expect(screen.getByText("30' SubLT Tempo")).toBeTruthy()
        expect(screen.getByText('30 min')).toBeTruthy()
        expect(screen.getByText('FTP 143 W')).toBeTruthy()
        expect(screen.queryByText('OK')).toBeNull()
        const select = screen.getByRole('button', { name: 'Select' })
        expect(getComputedStyle(select).borderRadius).toBe('999px')
        fireEvent.click(select)
        expect(onOK).toHaveBeenCalled()
        expect(screen.getByTestId('workout-graph')).toBeTruthy()
    })

    test('selected workout offers Unselect and keeps the delete button', () => {
        const onUnselect = vi.fn(), onDelete = vi.fn()
        const { container } = withTheme(<WorkoutSummary visible workout={workout} title='A' selected onUnselect={onUnselect} onDelete={onDelete} />)
        fireEvent.click(screen.getByRole('button', { name: 'Unselect' }))
        expect(onUnselect).toHaveBeenCalled()
        expect(container.querySelectorAll('button').length).toBe(2)
    })

    test('scheduled card shows duration and date next to Select', () => {
        withTheme(<ScheduledWorkoutSummary visible workout={workout} title='45min Z1' duration='45 min' date={new Date(2026, 10, 1)} ftp={143} />)
        expect(screen.getByText(`45 min · ${new Date(2026, 10, 1).toLocaleDateString()}`)).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Select' })).toBeTruthy()
    })

    test('create card has a Create pill wired to onOK', () => {
        const onOK = vi.fn()
        withTheme(<CreateSummary onOK={onOK} />)
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        expect(onOK).toHaveBeenCalled()
    })

    test('import card is a glass drop zone', () => {
        const { container } = withTheme(<UploadSummary title='Import Workout' />)
        const zone = container.querySelector('.dropzone') ?? screen.getByText(/Drag your file here/).closest('div[tabindex]')
        expect(getComputedStyle(zone).borderRadius).toBe(newUITheme.panel.radius)
        expect(screen.getByText(/Drag your file here/)).toBeTruthy()
    })
})
