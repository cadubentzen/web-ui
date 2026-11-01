import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../../theme'
import { CheckBox } from './index'

const logEvent = vi.hoisted(() => vi.fn())
vi.mock('gd-eventlog', () => ({ EventLogger: vi.fn(function () { this.logEvent = logEvent }) }))

const show = (ui) => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('CheckBox (switch)', () => {
    beforeEach(() => logEvent.mockClear())

    test('renders a focusable switch reflecting checked', () => {
        show(<CheckBox label='Dark' checked={true} />)
        const sw = screen.getByRole('switch', { name: 'Dark' })
        expect(sw.getAttribute('aria-checked')).toBe('true')
        expect(sw.tabIndex).toBe(0)
    })

    test('accent track when on, translucent white when off', () => {
        const { unmount } = show(<CheckBox label='A' checked={true} />)
        expect(getComputedStyle(screen.getByRole('switch')).backgroundColor).toBe('rgb(228, 161, 60)')
        unmount()
        show(<CheckBox label='A' checked={false} />)
        expect(getComputedStyle(screen.getByRole('switch')).backgroundColor).toBe('rgba(255, 255, 255, 0.2)')
    })

    test('click toggles once: callbacks get the new value, one log', () => {
        const onClick = vi.fn(), onValueChange = vi.fn()
        show(<CheckBox label='A' checked={false} onClick={onClick} onValueChange={onValueChange} />)
        fireEvent.click(screen.getByRole('switch'))
        expect(onClick).toHaveBeenCalledWith(true)
        expect(onValueChange).toHaveBeenCalledWith(true)
        expect(logEvent).toHaveBeenCalledTimes(1)
        expect(logEvent.mock.calls[0][0]).toMatchObject({ checkbox: 'A', checked: true, eventSource: 'user' })
    })

    test('clicking the label toggles once', () => {
        const onValueChange = vi.fn()
        show(<CheckBox label='Label' value={true} onValueChange={onValueChange} />)
        fireEvent.click(screen.getByText('Label'))
        expect(onValueChange).toHaveBeenCalledTimes(1)
        expect(onValueChange).toHaveBeenCalledWith(false)
    })

    test.each(['Enter', ' '])('key %j toggles once', (key) => {
        const onValueChange = vi.fn()
        show(<CheckBox label='A' checked={true} onValueChange={onValueChange} />)
        fireEvent.keyDown(screen.getByRole('switch'), { key })
        expect(onValueChange).toHaveBeenCalledTimes(1)
        expect(onValueChange).toHaveBeenCalledWith(false)
        expect(logEvent).toHaveBeenCalledTimes(1)
    })

    test('label with an id toggles the switch (id is not duplicated on the container)', () => {
        const onValueChange = vi.fn()
        show(<CheckBox id='sw' label='Named' checked={false} onValueChange={onValueChange} />)
        expect(document.querySelectorAll('#sw').length).toBe(1)
        fireEvent.click(screen.getByText('Named'))
        expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    test('uncontrolled switch flips its own state', () => {
        show(<CheckBox label='A' />)
        const sw = screen.getByRole('switch')
        fireEvent.click(sw)
        expect(sw.getAttribute('aria-checked')).toBe('true')
    })

    test('disabled: toBeDisabled and neither click nor Enter/Space toggle', () => {
        const onValueChange = vi.fn(), onChange = vi.fn()
        show(<CheckBox label='A' checked={false} disabled onValueChange={onValueChange} onChange={onChange} />)
        const sw = screen.getByRole('switch')
        expect(sw).toBeDisabled()
        fireEvent.click(sw)
        fireEvent.keyDown(sw, { key: 'Enter' })
        fireEvent.keyDown(sw, { key: ' ' })
        expect(onValueChange).not.toHaveBeenCalled()
        expect(onChange).not.toHaveBeenCalled()
        expect(logEvent).not.toHaveBeenCalled()
    })

    test('onChange(event) callers get event.target.checked after click and after Enter', () => {
        const seen = []
        show(<CheckBox name='enabled' label='A' checked={false} onChange={(e) => seen.push(e.target.checked)} />)
        const sw = screen.getByRole('switch')
        fireEvent.click(sw)
        fireEvent.keyDown(sw, { key: 'Enter' })
        expect(seen).toEqual([true, true])  // controlled and the parent did not update: still toggles from false
    })

    test('a controlled switch whose parent ignores the change keeps its prop value', () => {
        show(<CheckBox label='A' checked={false} onValueChange={() => {}} />)
        const sw = screen.getByRole('switch')
        fireEvent.click(sw)
        expect(sw.getAttribute('aria-checked')).toBe('false')
    })

    test('noLog suppresses the log but not the callbacks', () => {
        const onValueChange = vi.fn()
        show(<CheckBox label='A' checked={false} noLog onValueChange={onValueChange} />)
        fireEvent.click(screen.getByRole('switch'))
        expect(onValueChange).toHaveBeenCalledWith(true)
        expect(logEvent).not.toHaveBeenCalled()
    })
})
