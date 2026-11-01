import { useEffect, useRef } from "react"
import { useLocation } from "react-router"
import { useDeviceRide } from "incyclist-services"
import { EventLogger } from "gd-eventlog"
import { getCandidates, getNavigationRoot, isTextInput, pickDefault, pickFirst, pickHinted, pickNext } from "../../../utils/spatialNavigation"

// Lets the whole UI be driven without a mouse: from the keyboard (arrow keys, Enter, Escape)
// or from a game controller such as the Zwift Play.
//
// - Arrow keys / D-pad move a visible focus between the interactive elements of the page, or
//   of the top-most open dialog.
// - Enter / A activates the focused element.
// - Escape / B goes back: closes the open dialog, or - during a ride - opens the pause menu.
//
// While riding (and no dialog is open) the arrow keys are left to the ride view.
//
// Once a controller is connected (or the keys were used), every new screen or dialog starts
// with the focus on its most likely button, so it can be activated without moving first.

export const FOCUS_CLASS = 'controller-focus'

const ARROW_DIRECTIONS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }

// controller key (as emitted by incyclist-devices) -> keyboard key it acts as
export const CONTROLLER_KEYS = {
    'dpad-up':    'ArrowUp',
    'dpad-down':  'ArrowDown',
    'dpad-left':  'ArrowLeft',
    'dpad-right': 'ArrowRight',
    'pad-a':      'Enter',
    'pad-b':      'Escape',
}

// legacy key codes: some handlers (e.g. the ride page's Escape hotkey) match on keyCode
const KEY_CODES = { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Enter: 13, Escape: 27 }

const createKeyEvent = (type, key) => {
    const event = new KeyboardEvent(type, { key, code: key, bubbles: true, cancelable: true })
    // KeyboardEventInit can't set keyCode/which - define them on the event instead
    Object.defineProperty(event, 'keyCode', { get: () => KEY_CODES[key] ?? 0 })
    Object.defineProperty(event, 'which', { get: () => KEY_CODES[key] ?? 0 })
    return event
}

const APP_CONTROL = 'app_control'
const CONTROLLER_SCAN_INTERVAL = 2000
const AUTO_FOCUS_DELAY = 200

const describe = (el) => {
    if (!el) return undefined
    const text = (el.innerText ?? el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
    return `${el.tagName.toLowerCase()}${text ? ` "${text}"` : ''}`
}

export const ControllerNavigation = () => {
    const location = useLocation()
    const refPath = useRef(location?.pathname ?? '/')
    refPath.current = location?.pathname ?? '/'
    // shared between the keyboard and the controller effects
    const refMode = useRef({ controllers: 0, keysUsed: false, scheduleAutoFocus: null })

    // keyboard (real, and synthesized from controller keys)
    useEffect(() => {
        const logger = new EventLogger('ControllerNavigation')
        let current = null
        const suppressedKeyUps = new Set()

        // React rewrites `className` when the element's styled-components class changes with its
        // state (switch toggled, pill selected) and thereby drops the mark: put it back
        const keepMark = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => {
            if (current && markShown && !current.classList.contains(FOCUS_CLASS))
                current.classList.add(FOCUS_CLASS)
        }) : null
        let markShown = false

        const removeMark = () => {
            markShown = false
            current?.classList?.remove(FOCUS_CLASS)
        }

        const setFocus = (el) => {
            if (current && current !== el)
                removeMark()
            current = el
            keepMark?.disconnect()
            if (!el) return
            el.classList.add(FOCUS_CLASS)
            markShown = true
            keepMark?.observe(el, { attributes: true, attributeFilter: ['class'] })
            if (typeof el.focus === 'function')
                el.focus({ preventScroll: true })
            el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
            logger.logEvent({ message: 'focus moved', target: describe(el) })
        }

        const validCurrent = (root) => (current?.isConnected && root.contains(current) && current.getBoundingClientRect().width > 0) ? current : null

        const move = (direction, root) => {
            const candidates = getCandidates(root)
            const from = validCurrent(root)
            if (!from) {
                setFocus(pickFirst(candidates)?.el ?? null)
                return
            }
            const others = candidates.filter(c => c.el !== from)
            const next = pickHinted(from, others, direction) ?? pickNext(from.getBoundingClientRect(), others, direction)
            if (next)
                setFocus(next.el)
        }

        // until the user moves the focus on a screen/dialog, it follows that screen's most likely
        // button (which may only appear or become enabled a bit later, e.g. once devices connect)
        let lastRoot = null
        let userMoved = false
        const autoFocus = () => {
            const mode = refMode.current
            if (!mode.controllers && !mode.keysUsed)
                return
            const root = getNavigationRoot(document)
            if (refPath.current.startsWith('/ride') && root === document.body)
                return
            if (root !== lastRoot)
                userMoved = false
            lastRoot = root
            if (userMoved && validCurrent(root))
                return
            if (isTextInput(document.activeElement))
                return
            const target = pickDefault(getCandidates(root))
            if (target && target.el !== current)
                setFocus(target.el)
        }

        // screens and dialogs come and go with DOM changes
        let autoFocusTimer
        const scheduleAutoFocus = () => {
            clearTimeout(autoFocusTimer)
            autoFocusTimer = setTimeout(autoFocus, AUTO_FOCUS_DELAY)
        }
        refMode.current.scheduleAutoFocus = scheduleAutoFocus
        const observer = typeof MutationObserver !== 'undefined' ? new MutationObserver(scheduleAutoFocus) : null
        // buttons also become available by attribute changes (e.g. OK is enabled once the trainer
        // is connected), not only by elements being added
        observer?.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'hidden'] })
        scheduleAutoFocus()

        const handled = (event) => {
            refMode.current.keysUsed = true
            userMoved = true
            event.preventDefault()
            event.stopPropagation()
            suppressedKeyUps.add(event.key)
        }

        const onKeyDown = (event) => {
            if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey)
                return

            const root = getNavigationRoot(document)
            const inDialog = root !== document.body
            if (refPath.current.startsWith('/ride') && !inDialog)
                return

            const active = document.activeElement
            const direction = ARROW_DIRECTIONS[event.key]
            if (direction) {
                if (isTextInput(active) && (direction === 'left' || direction === 'right'))
                    return
                handled(event)
                move(direction, root)
            }
            else if (event.key === 'Enter') {
                const target = validCurrent(root)
                if (!target || isTextInput(active))
                    return
                handled(event)
                logger.logEvent({ message: 'activate', target: describe(target) })
                target.click()
            }
        }

        // the page's own handlers (e.g. list scrolling) listen to keyup - skip those for keys
        // whose keydown already moved the focus
        const onKeyUp = (event) => {
            if (suppressedKeyUps.delete(event.key))
                event.stopImmediatePropagation()
        }

        // a mouse user doesn't need the keyboard focus highlight
        const onMouseDown = () => removeMark()

        window.addEventListener('keydown', onKeyDown, true)
        window.addEventListener('keyup', onKeyUp, true)
        window.addEventListener('mousedown', onMouseDown, true)
        return () => {
            window.removeEventListener('keydown', onKeyDown, true)
            window.removeEventListener('keyup', onKeyUp, true)
            window.removeEventListener('mousedown', onMouseDown, true)
            observer?.disconnect()
            clearTimeout(autoFocusTimer)
            refMode.current.scheduleAutoFocus = null
            keepMark?.disconnect()
            removeMark()
        }
    }, [])

    // controllers: their navigation keys act as the corresponding keyboard keys
    useEffect(() => {
        const logger = new EventLogger('ControllerNavigation')
        const attached = new Set()

        const onControllerKey = (_settings, event) => {
            const key = CONTROLLER_KEYS[event?.key]
            logger.logEvent({ message: 'controller key', key: event?.key, mapped: key })
            if (!key) return

            const target = document.activeElement ?? document.body
            target.dispatchEvent(createKeyEvent('keydown', key))
            target.dispatchEvent(createKeyEvent('keyup', key))
        }

        const scan = () => {
            try {
                const adapters = useDeviceRide().getAllAdapters() ?? []
                adapters
                    .filter(ai => ai?.capabilities?.includes(APP_CONTROL) && ai.adapter && !attached.has(ai.adapter))
                    .forEach(ai => {
                        ai.adapter.on('key-pressed', onControllerKey)
                        attached.add(ai.adapter)
                        refMode.current.controllers = attached.size
                        refMode.current.scheduleAutoFocus?.()
                        logger.logEvent({ message: 'listening to controller', device: ai.adapter.getName?.() })
                    })
            }
            catch (err) {
                logger.logEvent({ message: 'error', fn: 'scan', error: err?.message })
            }
        }

        scan()
        const iv = setInterval(scan, CONTROLLER_SCAN_INTERVAL)
        return () => {
            clearInterval(iv)
            attached.forEach(adapter => adapter.off('key-pressed', onControllerKey))
        }
    }, [])

    return null
}
