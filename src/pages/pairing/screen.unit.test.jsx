import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../theme'
import { PairingScreen } from './screen'

const tile = (overrides = {}) => ({
    title: 'Resistance',
    capability: 'control',
    role: 'required',
    helpText: { full: 'help', short: 'help' },
    emptyFooter: 'Searching...',
    ...overrides,
})

describe('PairingScreen', () => {

    test('renders a tile with no device as a SearchingDevice, waiting when required and not ready', () => {
        render(<PairingScreen capabilities={{ top: [tile()], bottom: [] }} readyToStart={false} />)

        expect(screen.getByText('Resistance')).toBeTruthy()
        expect(screen.getByText('Searching...')).toBeTruthy()
    })

    test('renders a tile with a device as a SelectedDevice', () => {
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Neo', connectState: 'connected' })], bottom: [] }} />)

        expect(screen.getByText('Tacx Neo')).toBeTruthy()
    })

    test('clicking a tile calls its own bound onClick, not a page-level handler', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [tile({ onClick })], bottom: [] }} />)

        fireEvent.click(screen.getByText('Resistance'))

        expect(onClick).toHaveBeenCalled()
    })

    test('a selected tile\'s onUnselect/onUse come straight from its own props, not from the page', () => {
        const onUnselect = vi.fn()
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Neo', connectState:'connected', onUnselect })], bottom: [] }} />)

        fireEvent.click(screen.getByRole('switch'))

        expect(onUnselect).toHaveBeenCalled()
    })

    test('renders the row labels from capabilities.rowLabels', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [], rowLabels: { top: { text: 'TO RIDE', subtext: 'connect any one' }, bottom: { text: 'OPTIONAL' } } }} />)

        expect(screen.getByText('TO RIDE')).toBeTruthy()
        expect(screen.getByText('connect any one')).toBeTruthy()
        expect(screen.getByText('OPTIONAL')).toBeTruthy()
    })

    test('renders the status line from the status prop, not derived locally', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} status={{ id: 'S3', dot: 'amber', text: 'Connect a trainer' }} />)

        expect(screen.getByText('Connect a trainer')).toBeTruthy()
    })

    test('renders no status line when the service sends none', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} />)

        expect(screen.queryByText('Connect a trainer')).toBeNull()
    })

    test('renders each button from the buttons prop and wires its own onClick', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} buttons={[{ label: 'Simulate', primary: true, onClick }, { label: 'Skip', primary: false, onClick: vi.fn() }]} />)

        fireEvent.click(screen.getByText('Simulate'))

        expect(onClick).toHaveBeenCalled()
        expect(screen.getByText('Skip')).toBeTruthy()
    })

    test('clicking an interface calls its own bound onClick, not a page-level handler', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} interfaces={[{ name: 'ant', enabled: true, state: 'idle', onClick }]} />)

        fireEvent.click(screen.getByText('Ant+'))

        expect(onClick).toHaveBeenCalled()
    })

    test('the sensor row sends Down to the OK button; the top row does not', () => {
        const { container } = render(<PairingScreen capabilities={{ top: [tile()], bottom: [tile({ title: 'Heartrate' })] }} buttons={[{ label: 'OK', primary: true }]} />)

        const hint = container.querySelector('.bottom').getAttribute('data-nav-down')
        expect(container.querySelector(hint)?.textContent).toBe('OK')
        expect(container.querySelector('.top').hasAttribute('data-nav-down')).toBe(false)
    })

    test('a device tile shows capability, name, value with unit, status dot and a switch', () => {
        render(<PairingScreen capabilities={{ top: [tile({ title: 'Power', deviceName: 'Tacx Neo', connectState: 'connected', value: 212, unit: 'W' })], bottom: [] }} />)

        expect(screen.getByText('Power')).toBeTruthy()
        expect(screen.getByText('Tacx Neo')).toBeTruthy()
        expect(screen.getByText('212')).toBeTruthy()
        expect(screen.getByText('W')).toBeTruthy()
        expect(screen.getByTestId('status-dot')).toBeTruthy()
        expect(screen.getByRole('switch')).toBeTruthy()
    })

    test('the capability label is drawn in the accent colour', () => {
        render(<ThemeProvider theme={newUITheme}><PairingScreen capabilities={{ top: [tile({ title: 'Power', deviceName: 'Tacx Neo', connectState: 'connected' })], bottom: [] }} /></ThemeProvider>)

        expect(getComputedStyle(screen.getByText('Power')).color).toBe('rgb(228, 161, 60)')
    })

    test('interface buttons are pills: green outline when enabled, muted otherwise', () => {
        render(<ThemeProvider theme={newUITheme}><PairingScreen capabilities={{ top: [], bottom: [] }} interfaces={[
            { name: 'ble', enabled: true, state: 'connected' }, { name: 'ant', enabled: false, state: 'idle' }]} /></ThemeProvider>)

        const on = getComputedStyle(screen.getByText('BLE').closest('button'))
        const off = getComputedStyle(screen.getByText('Ant+').closest('button'))
        expect(on.boxShadow).toContain('#8dc100')
        expect(off.boxShadow).not.toContain('#8dc100')
        expect(on.borderRadius).toBe('999px')
    })

    test('bottom buttons size to their label instead of a fixed width', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} buttons={[{ label: 'Simulate', primary: true }]} />)

        const btn = screen.getByText('Simulate').closest('button')
        expect(getComputedStyle(btn).minWidth).not.toBe('8vw')
        expect(getComputedStyle(btn).width).not.toBe('8vw')
    })

    test('interface pill outline shows the interface state', () => {
        render(<ThemeProvider theme={newUITheme}><PairingScreen capabilities={{ top: [], bottom: [] }} interfaces={[
            { name: 'ble', enabled: true, state: 'disconnected' },
            { name: 'ant', enabled: true, state: 'connecting' },
            { name: 'serial', enabled: false, state: 'disconnected' },
            { name: 'tcpip', enabled: true, state: 'unavailable' }]} /></ThemeProvider>)

        const shadow = (t) => getComputedStyle(screen.getByText(t).closest('button')).boxShadow
        expect(shadow('BLE')).toContain('#ff6b6b')
        expect(shadow('Ant+')).toContain('#e4a13c')
        expect(shadow('Serial')).not.toMatch(/#ff6b6b|#e4a13c|#8dc100/)
        expect(shadow('TCP')).not.toMatch(/#ff6b6b|#e4a13c|#8dc100/)
    })
})
