import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup, act, screen } from '@testing-library/react'
import { EventEmitter } from 'events'
import { useState } from 'react'
import { ControllerNavigation, FOCUS_CLASS } from './ControllerNavigation'
import { Dialog } from '../../molecules/Dialog'
import { CheckBox } from '../../atoms/input/Checkbox'

const { location, adapters, selection } = vi.hoisted(() => ({ location: { pathname: '/routes' }, adapters: [], selection: { none: false } }))

vi.mock('react-router', () => ({
    useLocation: () => location,
}))
// the selected controller: the first app_control adapter in the list (none with selection.none)
vi.mock('incyclist-services', () => ({
    useDeviceConfiguration: () => ({
        getSelected: (capability) => selection.none ? undefined : adapters.find(ai => ai.capabilities.includes(capability))?.adapter,
    }),
    useDeviceRide: () => ({ getAllAdapters: () => adapters }),
}))
vi.mock('gd-eventlog', () => ({
    EventLogger: class { logEvent() {} set() {} },
}))
// the hooks index drags in the whole app bindings - the Dialog only needs these two
vi.mock('../../../hooks', async () => ({
    useKey: (await import('../../../hooks/ui/useKey')).useKey,
    useUnmountEffect: () => {},
}))

const rect = (left, top, width = 100, height = 40) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top })

// lays out the given elements on a grid: { id: [left, top] }
const layout = (positions) => {
    for (const el of document.body.querySelectorAll('*')) {
        const pos = positions[el.id]
        el.getBoundingClientRect = () => pos ? rect(...pos) : rect(0, 0, 1000, 1000)
        el.scrollIntoView = () => {}
    }
}

const key = (k, target = document.activeElement ?? document.body) => {
    act(() => {
        target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
        target.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true, cancelable: true }))
    })
}
const focused = () => document.querySelector(`.${FOCUS_CLASS}`)?.id
const anyFocused = () => document.querySelector(`.${FOCUS_CLASS}`)

describe('ControllerNavigation', () => {
    let clicks

    beforeEach(() => {
        location.pathname = '/routes'
        adapters.length = 0
        selection.none = false
        clicks = []
        document.body.innerHTML = `
            <div id="page">
                <button id="a">A</button><button id="b">B</button>
                <button id="c">C</button>
            </div>`
        for (const id of ['a', 'b', 'c'])
            document.getElementById(id).addEventListener('click', () => clicks.push(id))
        layout({ a: [0, 0], b: [200, 0], c: [0, 100] })
    })

    afterEach(() => {
        cleanup()
        vi.useRealTimers()
    })

    const mount = () => render(<ControllerNavigation />, { container: document.body.appendChild(document.createElement('div')) })

    test('the first arrow key focuses the top-left element, further ones move the focus', () => {
        mount()
        key('ArrowDown')
        expect(focused()).toBe('a')
        key('ArrowRight')
        expect(focused()).toBe('b')
        key('ArrowLeft')
        key('ArrowDown')
        expect(focused()).toBe('c')
    })

    test('the focus mark survives the focused element getting a different className', async () => {
        mount()
        key('ArrowDown')
        const a = document.getElementById('a')
        expect(a.classList.contains(FOCUS_CLASS)).toBe(true)
        // what React does when a styled-components class changes with state
        a.className = 'sc-other'
        await act(async () => { await Promise.resolve() })
        expect(a.classList.contains(FOCUS_CLASS)).toBe(true)
    })

    // a dialog with a switch and an OK button; the layout puts the switch above OK
    const renderSwitchDialog = (onESC) => {
        const Page = () => {
            const [on, setOn] = useState(false)
            return <Dialog id='Test' title='Test' onESC={onESC} noClose>
                <CheckBox checked={on} label='opt' onChange={e => setOn(e.target.checked)} />
                <button id='ok'>OK</button>
            </Dialog>
        }
        document.body.innerHTML = ''
        render(<><ControllerNavigation /><Page /></>)
        const sw = document.querySelector('[role=switch]')
        for (const el of document.body.querySelectorAll('*')) {
            el.getBoundingClientRect = () => el === sw ? rect(0, 0) : el.id === 'ok' ? rect(0, 100) : rect(0, 0, 1000, 1000)
            el.scrollIntoView = () => {}
        }
        return sw
    }

    test('Escape closes a dialog after Enter toggled a switch inside it', async () => {
        vi.useFakeTimers()
        const onESC = vi.fn()
        const sw = renderSwitchDialog(onESC)
        key('ArrowDown')
        expect(document.activeElement).toBe(sw)
        key('Enter')
        await act(async () => { await vi.advanceTimersByTimeAsync(500) })
        expect(sw.getAttribute('aria-checked')).toBe('true')
        expect(sw.classList.contains(FOCUS_CLASS)).toBe(true)
        // a real keyboard event carries the legacy keyCode the Dialog matches on
        act(() => { sw.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', keyCode: 27, bubbles: true })) })
        expect(onESC).toHaveBeenCalled()
    })

    test('an arrow press before the pending auto-focus fires is not overridden by it', async () => {
        vi.useFakeTimers()
        const sw = renderSwitchDialog(vi.fn())
        // the auto-focus (200 ms) is still pending: the user's first move comes first
        key('ArrowDown')
        expect(document.activeElement).toBe(sw)
        // (the auto-focus alone would pick OK, the dialog's default)
        await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
        expect(document.activeElement).toBe(sw)
        expect(sw.classList.contains(FOCUS_CLASS)).toBe(true)
    })

    test('the dialog close button is reachable and Enter closes the dialog', () => {
        const onESC = vi.fn()
        document.body.innerHTML = ''
        render(<><ControllerNavigation /><Dialog id='Test' title='Test' onESC={onESC}><button id='ok'>OK</button></Dialog></>)
        const close = screen.getByRole('button', { name: 'Close' })
        for (const el of document.body.querySelectorAll('*')) {
            el.getBoundingClientRect = () => el === close ? rect(500, 0) : el.id === 'ok' ? rect(0, 100) : rect(0, 0, 1000, 1000)
            el.scrollIntoView = () => {}
        }
        key('ArrowDown')
        expect(document.activeElement).toBe(close)
        key('Enter')
        expect(onESC).toHaveBeenCalled()
    })

    test('Enter activates the focused element', () => {
        mount()
        key('ArrowDown')
        key('ArrowRight')
        key('Enter')
        expect(clicks).toEqual(['b'])
    })

    test('the arrow keyup is not passed on to the page once it moved the focus', () => {
        const pageKeyUp = vi.fn()
        mount()
        window.addEventListener('keyup', pageKeyUp)
        key('ArrowDown')
        window.removeEventListener('keyup', pageKeyUp)
        expect(pageKeyUp).not.toHaveBeenCalled()
    })

    test('navigation is confined to the top-most open dialog', () => {
        document.body.insertAdjacentHTML('beforeend', `<div class="dialog" id="dlg"><button id="ok">OK</button><button id="cancel">Cancel</button></div>`)
        document.getElementById('ok').addEventListener('click', () => clicks.push('ok'))
        layout({ a: [0, 0], b: [200, 0], c: [0, 100], dlg: [100, 100, 400, 300], ok: [150, 300], cancel: [300, 300] })
        mount()
        key('ArrowRight')
        expect(focused()).toBe('ok')
        key('Enter')
        expect(clicks).toEqual(['ok'])
    })

    test('during a ride, arrow keys are left to the ride view unless a dialog is open', () => {
        location.pathname = '/rideOK'
        const rideKeyUp = vi.fn()
        mount()
        window.addEventListener('keyup', rideKeyUp)
        key('ArrowDown')
        window.removeEventListener('keyup', rideKeyUp)
        expect(focused()).toBeUndefined()
        expect(rideKeyUp).toHaveBeenCalled()
    })

    test('arrow left/right keep moving the caret inside a text field', () => {
        document.body.insertAdjacentHTML('beforeend', `<input id="search" type="text"/>`)
        layout({ a: [0, 0], b: [200, 0], c: [0, 100], search: [400, 0] })
        mount()
        const search = document.getElementById('search')
        search.focus()
        key('ArrowLeft', search)
        expect(focused()).toBeUndefined()
    })

    test('controller keys act as the corresponding keyboard keys', () => {
        vi.useFakeTimers()
        const controller = new EventEmitter()
        controller.getName = () => 'Zwift Play'
        adapters.push({ adapter: controller, capabilities: ['app_control'] })
        const escape = vi.fn()
        window.addEventListener('keyup', (e) => { if (e.key === 'Escape') escape() })
        mount()

        act(() => { controller.emit('key-pressed', {}, { key: 'dpad-down' }) })
        act(() => { controller.emit('key-pressed', {}, { key: 'dpad-right' }) })
        expect(focused()).toBe('b')

        act(() => { controller.emit('key-pressed', {}, { key: 'pad-a' }) })
        expect(clicks).toEqual(['b'])

        act(() => { controller.emit('key-pressed', {}, { key: 'pad-b' }) })
        expect(escape).toHaveBeenCalled()
    })

    test('controller keys carry the legacy keyCode too (e.g. the ride page matches Escape by keyCode 27)', () => {
        vi.useFakeTimers()
        const controller = new EventEmitter()
        adapters.push({ adapter: controller, capabilities: ['app_control'] })
        const codes = []
        const onKeyUp = (e) => codes.push([e.key, e.keyCode])
        window.addEventListener('keyup', onKeyUp)
        mount()

        act(() => { controller.emit('key-pressed', {}, { key: 'pad-b' }) })
        window.removeEventListener('keyup', onKeyUp)
        expect(codes).toContainEqual(['Escape', 27])
    })

    describe('automatic focus', () => {
        const connectController = () => {
            const controller = new EventEmitter()
            adapters.push({ adapter: controller, capabilities: ['app_control'] })
            return controller
        }

        test('with a controller connected, the most likely button is focused without any key press', async () => {
            vi.useFakeTimers()
            document.getElementById('b').innerText = 'OK'
            connectController()
            mount()
            await act(async () => { vi.advanceTimersByTime(500) })
            expect(focused()).toBe('b')
        })

        test('without a controller (and no keys used yet), nothing is focused automatically', async () => {
            vi.useFakeTimers()
            mount()
            await act(async () => { vi.advanceTimersByTime(500) })
            expect(focused()).toBeUndefined()
        })

        test('when a dialog opens, its most likely button is focused', async () => {
            vi.useFakeTimers()
            connectController()
            mount()
            await act(async () => { vi.advanceTimersByTime(500) })

            act(() => {
                document.body.insertAdjacentHTML('beforeend', `<div class="dialog" id="dlg"><button id="no">No</button><button id="yes">Yes</button></div>`)
                document.getElementById('yes').innerText = 'Yes'
                layout({ a: [0, 0], b: [200, 0], c: [0, 100], dlg: [100, 100, 400, 300], no: [150, 300], yes: [300, 300] })
            })
            // let the MutationObserver report the new dialog before the debounce timer runs
            await act(async () => { await Promise.resolve(); vi.advanceTimersByTime(500) })
            expect(focused()).toBe('yes')
        })

        test('until the user moves, the focus follows the most likely button when it appears later', async () => {
            vi.useFakeTimers()
            connectController()
            mount()
            await act(async () => { vi.advanceTimersByTime(500) })
            expect(focused()).toBe('a')

            // e.g. the Devices page enables its OK button once the trainer is connected
            act(() => {
                document.body.insertAdjacentHTML('beforeend', `<button id="ok">OK</button>`)
                document.getElementById('ok').innerText = 'OK'
                layout({ a: [0, 0], b: [200, 0], c: [0, 100], ok: [100, 400] })
            })
            await act(async () => { await Promise.resolve(); vi.advanceTimersByTime(500) })
            expect(focused()).toBe('ok')
        })

        test('a new page starts at its likely button, even after the user moved on the previous one', async () => {
            vi.useFakeTimers()
            connectController()
            location.pathname = '/pairing'
            const { rerender } = mount()
            await act(async () => { vi.advanceTimersByTime(500) })
            key('ArrowRight')       // the user moves on this page

            // to the next page (same root): its list - and the Select buttons - load a moment later
            location.pathname = '/workouts'
            act(() => {
                document.getElementById('page').innerHTML = `<button id="nav">User</button>`
                document.getElementById('nav').innerText = 'User'
                layout({ nav: [0, 0] })
            })
            rerender(<ControllerNavigation />)
            await act(async () => { await Promise.resolve(); vi.advanceTimersByTime(500) })
            expect(focused()).toBe('nav')     // the only thing there yet
            act(() => {
                document.getElementById('page').insertAdjacentHTML('beforeend', `<button id="select">Select</button>`)
                document.getElementById('select').innerText = 'Select'
                layout({ nav: [0, 0], select: [300, 300] })
            })
            await act(async () => { await Promise.resolve(); vi.advanceTimersByTime(500) })
            expect(focused()).toBe('select')
        })

        test('a likely button that becomes enabled later gets the focus', async () => {
            vi.useFakeTimers()
            document.body.insertAdjacentHTML('beforeend', `<button id="ok" disabled>OK</button>`)
            document.getElementById('ok').innerText = 'OK'
            layout({ a: [0, 0], b: [200, 0], c: [0, 100], ok: [100, 400] })
            connectController()
            mount()
            await act(async () => { vi.advanceTimersByTime(500) })
            expect(focused()).toBe('a')

            // e.g. the Devices page enables OK once the trainer is connected
            act(() => { document.getElementById('ok').disabled = false })
            await act(async () => { await Promise.resolve(); vi.advanceTimersByTime(500) })
            expect(focused()).toBe('ok')
        })

        test('once the user moved the focus, it stays where the user put it', async () => {
            vi.useFakeTimers()
            connectController()
            mount()
            await act(async () => { vi.advanceTimersByTime(500) })
            key('ArrowRight')
            expect(focused()).toBe('b')

            act(() => {
                document.body.insertAdjacentHTML('beforeend', `<button id="ok">OK</button>`)
                document.getElementById('ok').innerText = 'OK'
                layout({ a: [0, 0], b: [200, 0], c: [0, 100], ok: [100, 400] })
            })
            await act(async () => { await Promise.resolve(); vi.advanceTimersByTime(500) })
            expect(focused()).toBe('b')
        })

        test('not on the ride view itself (the ride owns the keys there)', async () => {
            vi.useFakeTimers()
            location.pathname = '/rideOK'
            connectController()
            mount()
            await act(async () => { vi.advanceTimersByTime(500) })
            expect(focused()).toBeUndefined()
        })
    })

    test('controllers connected later are picked up too, and other devices are ignored', () => {
        vi.useFakeTimers()
        mount()
        const controller = new EventEmitter()
        const trainer = new EventEmitter()
        adapters.push({ adapter: trainer, capabilities: ['power'] }, { adapter: controller, capabilities: ['app_control'] })
        act(() => { vi.advanceTimersByTime(2500) })

        expect(controller.listenerCount('key-pressed')).toBe(1)
        expect(trainer.listenerCount('key-pressed')).toBe(0)
    })

    test('only the selected controller is listened to, so a key is never handled twice', () => {
        // e.g. both halves of a Zwift Play known as controllers: the selected half already
        // forwards the keys of the other one
        vi.useFakeTimers()
        const selected = new EventEmitter()
        const other = new EventEmitter()
        adapters.push({ adapter: selected, capabilities: ['app_control'] }, { adapter: other, capabilities: ['app_control'] })
        mount()

        expect(selected.listenerCount('key-pressed')).toBe(1)
        expect(other.listenerCount('key-pressed')).toBe(0)

        // one press, one step: the first arrow focuses the top-left element (a second
        // delivery of the same press would have moved on to 'c')
        act(() => { selected.emit('key-pressed', {}, { key: 'dpad-down' }) })
        expect(focused()).toBe('a')

        // the user picks the other one: it replaces the first
        adapters.splice(0, 1)
        act(() => { vi.advanceTimersByTime(2500) })
        expect(selected.listenerCount('key-pressed')).toBe(0)
        expect(other.listenerCount('key-pressed')).toBe(1)
    })

    test('while no controller is selected, every controller navigates', () => {
        vi.useFakeTimers()
        selection.none = true
        const play = new EventEmitter()
        const click = new EventEmitter()
        const trainer = new EventEmitter()
        adapters.push({ adapter: play, capabilities: ['app_control'] }, { adapter: click, capabilities: ['app_control'] }, { adapter: trainer, capabilities: ['power'] })
        mount()

        expect(play.listenerCount('key-pressed')).toBe(1)
        expect(click.listenerCount('key-pressed')).toBe(1)
        expect(trainer.listenerCount('key-pressed')).toBe(0)

        // once one is selected, only that one
        selection.none = false
        act(() => { vi.advanceTimersByTime(2500) })
        expect(play.listenerCount('key-pressed')).toBe(1)
        expect(click.listenerCount('key-pressed')).toBe(0)
    })
})
