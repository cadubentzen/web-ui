import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { EventEmitter } from 'events'
import { ControllerNavigation, FOCUS_CLASS } from './ControllerNavigation'

const { location, adapters } = vi.hoisted(() => ({ location: { pathname: '/routes' }, adapters: [] }))

vi.mock('react-router', () => ({
    useLocation: () => location,
}))
vi.mock('incyclist-services', () => ({
    useDeviceRide: () => ({ getAllAdapters: () => adapters }),
}))
vi.mock('gd-eventlog', () => ({
    EventLogger: class { logEvent() {} },
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

describe('ControllerNavigation', () => {
    let clicks

    beforeEach(() => {
        location.pathname = '/routes'
        adapters.length = 0
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
        adapters.push({ adapter: controller, capabilities: ['app_control'] }, { adapter: trainer, capabilities: ['power'] })
        act(() => { vi.advanceTimersByTime(2500) })

        expect(controller.listenerCount('key-pressed')).toBe(1)
        expect(trainer.listenerCount('key-pressed')).toBe(0)
    })
})
