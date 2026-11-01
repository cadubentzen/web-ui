// Spatial ("TV remote") navigation helpers: find the interactive elements on screen and pick
// the one that lies in a given direction. Used to drive the UI from the keyboard arrow keys
// or a game controller (e.g. the Zwift Play D-pad). Side-effect free apart from reading the DOM.

const INTERACTIVE = [
    'button', 'a[href]', 'input:not([type=hidden])', 'select', 'textarea',
    '[role=button]', '[role=tab]', '[role=menuitem]', '[role=option]', '[role=checkbox]', '[role=switch]', '[role=radio]',
    '[tabindex]:not([tabindex="-1"])',
].join(',')

const DIRECTIONS = {
    left:  { x: -1, y: 0 },
    right: { x: 1,  y: 0 },
    up:    { x: 0,  y: -1 },
    down:  { x: 0,  y: 1 },
}

// weight of the distance perpendicular to the direction of travel: an element that is in
// line with the current one wins over a slightly closer one that is off to the side
const ORTHOGONAL_WEIGHT = 2
const SIDE_PENALTY = 100000

const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })

// distance between the intervals [a1,a2] and [b1,b2] - 0 if they overlap
const gap = (a1, a2, b1, b2) => Math.max(0, b1 - a2, a1 - b2)

/**
 * Picks the candidate that is nearest in the given direction from `currentRect`.
 * @param {{left:number,top:number,width:number,height:number}} currentRect
 * @param {Array<{rect:object}>} candidates
 * @param {'left'|'right'|'up'|'down'} direction
 */
export const pickNext = (currentRect, candidates, direction) => {
    const d = DIRECTIONS[direction]
    if (!d || !currentRect) return undefined

    const from = center(currentRect)
    const horizontal = d.x !== 0
    let best, bestScore = Infinity
    for (const candidate of candidates ?? []) {
        const r = candidate.rect
        const to = center(r)
        // only elements whose center lies in the direction of travel
        if ((to.x - from.x) * d.x + (to.y - from.y) * d.y <= 1) continue

        // distances between the edges, not the centers: a wide card right below the current
        // element is closer than a small button off to the side, wherever the card's center is
        const along = Math.max(0, horizontal
            ? (d.x > 0 ? r.left - currentRect.right : currentRect.left - r.right)
            : (d.y > 0 ? r.top - currentRect.bottom : currentRect.top - r.bottom))
        const orthogonal = horizontal
            ? gap(currentRect.top, currentRect.top + currentRect.height, r.top, r.top + r.height)
            : gap(currentRect.left, currentRect.left + currentRect.width, r.left, r.left + r.width)
        // elements in line with the current one (overlapping across the direction of
        // travel) always win over elements off to the side - like a TV remote
        const score = (orthogonal > 0 ? SIDE_PENALTY : 0) + along + ORTHOGONAL_WEIGHT * orthogonal
        if (score < bestScore) {
            best = candidate
            bestScore = score
        }
    }
    return best
}

/**
 * A screen can override the spatial choice for a group of elements: an element inside one
 * marked `data-nav-<direction>="<css selector>"` moves in that direction to the nearest
 * candidate matching the selector (e.g. `data-nav-down` on a row of tiles above the OK button).
 * Returns undefined if there is no hint, or no candidate matches it.
 */
export const pickHinted = (from, candidates, direction) => {
    const selector = from?.closest?.(`[data-nav-${direction}]`)?.getAttribute(`data-nav-${direction}`)
    if (!selector) return undefined
    const targets = (candidates ?? []).filter(c => c.el.matches?.(selector))
    return pickNext(from.getBoundingClientRect(), targets, direction)
}

/** The candidate a navigation starts from: top-most, then left-most. */
export const pickFirst = (candidates) => {
    const row = (c) => Math.round(c.rect.top / 10)
    return [...(candidates ?? [])].sort((a, b) => row(a) - row(b) || a.rect.left - b.rect.left)[0]
}

const hasReactClickHandler = (el) => {
    for (const key in el) {
        if (key.startsWith('__reactProps$'))
            return typeof el[key]?.onClick === 'function'
    }
    return false
}

const isVisible = (el) => {
    const r = el.getBoundingClientRect()
    if (!r || r.width <= 0 || r.height <= 0) return false
    const style = el.ownerDocument?.defaultView?.getComputedStyle(el)
    return !style || (style.visibility !== 'hidden' && style.display !== 'none')
}

const isEnabled = (el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true' && !el.closest('[inert]')

/**
 * The element navigation is confined to: the top-most open dialog, or the whole page.
 */
export const getNavigationRoot = (doc = document) => {
    const dialogs = [...doc.querySelectorAll('.dialog, [role=dialog]')].filter(isVisible)
    return dialogs[dialogs.length - 1] ?? doc.body
}

/**
 * All visible, enabled elements in `root` that can be activated: native interactive elements
 * and elements with a React click handler. An element with a click handler that merely wraps
 * other candidates (e.g. a dialog backdrop or a tile with its own buttons) is left out.
 * @returns {Array<{el:Element, rect:object}>}
 */
export const getCandidates = (root) => {
    if (!root) return []
    const area = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height }
    const rootArea = area(root) || Infinity

    // graphics (e.g. the bars of a workout graph) are never navigation targets of their own
    // maps are mouse/touch only: their links would open external web pages
    const all = [...root.querySelectorAll('*')].filter(el => !isSvgGraphic(el) && !el.closest(EXCLUDED))
    const native = new Set(all.filter(el => el.matches(INTERACTIVE)))
    const clickable = all.filter(el => native.has(el) || hasReactClickHandler(el))
        .filter(el => isEnabled(el) && isVisible(el))
    const clickableSet = new Set(clickable)

    // a card-sized clickable element is one target, even if parts of it are clickable too
    // (a wrapper that covers a large part of the screen, e.g. a backdrop, doesn't count)
    const insideCard = (el) => {
        for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
            if (clickableSet.has(p) && !native.has(p) && area(p) < CARD_MAX_SHARE * rootArea)
                return true
        }
        return false
    }
    const targets = clickable.filter(el => native.has(el) || !insideCard(el))

    // a clickable element that merely wraps buttons of its own is left to those buttons
    return targets
        .filter(el => native.has(el) || !targets.some(other => other !== el && el.contains(other)))
        .map(el => ({ el, rect: el.getBoundingClientRect() }))
}

const CARD_MAX_SHARE = 0.3
const EXCLUDED = '.leaflet-container'

const isSvgGraphic = (el) => {
    const SVG = el.ownerDocument?.defaultView?.SVGElement
    return !!SVG && el instanceof SVG
}

/** Whether keys typed while `el` has focus edit text (arrow keys move the caret there). */
export const isTextInput = (el) => {
    if (!el) return false
    if (el.tagName === 'TEXTAREA' || el.isContentEditable) return true
    if (el.tagName !== 'INPUT') return false
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image'].includes((el.type ?? 'text').toLowerCase())
}

// actions a user most likely wants next, most likely first
const LIKELY_ACTIONS = ['Start', 'Select', 'Continue', 'Yes', 'OK']

const label = (el) => (el.innerText ?? el.textContent ?? '').trim()

/**
 * The element the focus should start on when a screen or dialog opens: one marked with
 * `data-nav-default`, else the most likely action (Start, Select, Continue, Yes, OK - the
 * top-most one if there are several), else the first card of a list, else the top-left element
 * other than a dialog's close button.
 */
export const pickDefault = (candidates) => {
    const list = candidates ?? []
    const marked = list.find(c => c.el.hasAttribute?.('data-nav-default'))
    if (marked) return marked

    for (const action of LIKELY_ACTIONS) {
        const matches = list.filter(c => label(c.el) === action)
        if (matches.length)
            return [...matches].sort((a, b) => a.rect.top - b.rect.top)[0]
    }

    // a dialog's close button (✕) sits top-right of the title: never start there unless it is all there is
    const rest = list.filter(c => !c.el.hasAttribute?.('data-nav-close'))
    return pickFirst(rest.filter(c => c.el.tagName === 'ARTICLE')) ?? pickFirst(rest) ?? pickFirst(list)
}
