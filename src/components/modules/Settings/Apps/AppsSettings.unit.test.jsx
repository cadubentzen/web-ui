import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppsSettingsView } from './AppsSettings'
import { StravaSettingsView } from './Strava/StravaSettings'
import { KomootSettingsView } from './Komoot/KomootSettings'
import { IntervalsSettingsView } from './Intervals/IntervalsSettings'

describe('AppsSettingsView', () => {
    test('app tiles are buttons that report the clicked app', () => {
        const onClick = vi.fn()
        render(<AppsSettingsView apps={[{ key: 'strava', name: 'Strava' }, { key: 'komoot', name: 'Komoot' }]} onClick={onClick} />)
        fireEvent.click(screen.getByRole('button', { name: 'Komoot' }))
        expect(onClick).toHaveBeenCalledWith('komoot')
    })
})

describe.each([
    ['Komoot', KomootSettingsView, 'Connect With Komoot'],
    ['Intervals.icu', IntervalsSettingsView, 'Connect With Intervals.icu'],
])('%s settings view', (name, View, connectText) => {
    test('connect, disconnect and back are real buttons', () => {
        const onConnect = vi.fn(), onBack = vi.fn(), onDisconnect = vi.fn()
        const { rerender } = render(<View isConnected={false} onConnect={onConnect} onBack={onBack} />)
        expect(screen.getByText(`${name} Settings`)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: connectText }))
        expect(onConnect).toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: /Apps/ }))
        expect(onBack).toHaveBeenCalled()

        rerender(<View isConnected={true} onDisconnect={onDisconnect} onBack={onBack} />)
        fireEvent.click(screen.getByRole('button', { name: `Disconnect from ${name}` }))
        expect(onDisconnect).toHaveBeenCalled()
    })
})

describe('StravaSettingsView', () => {
    test('renders the connect button and the back button', () => {
        render(<StravaSettingsView isConnected={false} />)
        expect(screen.getByText('Strava Settings')).toBeInTheDocument()
        expect(screen.getByAltText('Connect With Strava')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Apps/ })).toBeInTheDocument()
    })
})
