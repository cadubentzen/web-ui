import { describe, test, expect, beforeEach } from 'vitest'
import { pickFirst, pickNext, pickHinted, pickDefault, getNavigationRoot, getCandidates, isTextInput } from './spatialNavigation'

const rect = (left, top, width = 100, height = 40) => ({ left, top, width, height, right: left + width, bottom: top + height })
const item = (id, r) => ({ id, rect: r })

describe('spatialNavigation', () => {

    describe('pickNext', () => {
        //   A  B  C
        //   D  E  F
        const A = item('A', rect(0, 0)),   B = item('B', rect(200, 0)),   C = item('C', rect(400, 0))
        const D = item('D', rect(0, 100)), E = item('E', rect(200, 100)), F = item('F', rect(400, 100))
        const all = [A, B, C, D, E, F]

        test.each([
            ['right', B, C],
            ['left', B, A],
            ['down', B, E],
            ['up', E, B],
            ['right', D, E],
            ['left', F, E],
        ])('moving %s from %s picks the nearest element in that direction', (direction, from, expected) => {
            expect(pickNext(from.rect, all.filter(i => i !== from), direction)).toBe(expected)
        })

        test('prefers an element in line over a closer one that is off to the side', () => {
            const current = rect(0, 0)
            const inLine = item('inLine', rect(0, 200))
            const diagonal = item('diagonal', rect(150, 120))
            expect(pickNext(current, [inLine, diagonal], 'down')).toBe(inLine)
        })

        test('a wide element directly below wins over a smaller one off to the side, even if its center is far away', () => {
            // search box above a full-width route card, with the navigation bar on the left
            const search = rect(183, 65, 339, 22)
            const card = item('card', rect(170, 113, 1118, 84))
            const navButton = item('nav', rect(10, 286, 100, 70))
            expect(pickNext(search, [card, navButton], 'down')).toBe(card)
        })

        test('down from a menu entry goes to the next entry, not to an element beside and slightly lower', () => {
            // left navigation bar next to the page's search box (reported by the user)
            const user = rect(10, 15, 100, 70)
            const settings = item('settings', rect(10, 286, 100, 70))
            const search = item('search', rect(183, 65, 339, 22))
            expect(pickNext(user, [settings, search], 'down')).toBe(settings)
        })

        test('returns undefined when nothing lies in that direction', () => {
            expect(pickNext(C.rect, [A, B, D, E, F], 'right')).toBeUndefined()
            expect(pickNext(A.rect, [B, C, D, E, F], 'up')).toBeUndefined()
        })
    })

    describe('pickHinted (devices screen geometry)', () => {
        // optional-row switch above the interface buttons, with OK to the right of them
        const setup = () => {
            document.body.innerHTML = `
                <div id="row" data-nav-down="#ok"><button id="sw">use</button></div>
                <button id="ok">OK</button>
                <button id="tcp">TCP</button>
                <button id="other">x</button>`
            const rects = { sw: rect(120, 720, 56, 30), ok: rect(540, 918, 94, 61), tcp: rect(163, 950, 76, 51), other: rect(10, 400, 50, 30) }
            for (const [id, r] of Object.entries(rects)) document.getElementById(id).getBoundingClientRect = () => r
            const cand = (id) => ({ el: document.getElementById(id), rect: rects[id] })
            return { cand, all: [cand('ok'), cand('tcp'), cand('other')] }
        }

        test('plain spatial navigation would go to the interface button in line below', () => {
            const { cand, all } = setup()
            expect(pickNext(cand('sw').rect, all, 'down')).toBe(all[1])
        })

        test('down from inside an element with data-nav-down goes to the element matching it', () => {
            const { cand, all } = setup()
            expect(pickHinted(cand('sw').el, all, 'down')).toBe(all[0])
        })

        test('other directions and elements without a hint are not affected', () => {
            const { cand, all } = setup()
            expect(pickHinted(cand('sw').el, all, 'up')).toBeUndefined()
            expect(pickHinted(cand('tcp').el, all, 'down')).toBeUndefined()
            expect(pickNext(cand('ok').rect, [all[1]], 'left')).toBe(all[1])
        })
    })

    describe('pickFirst', () => {
        test('picks the top-most, then left-most element', () => {
            const a = item('a', rect(300, 10)), b = item('b', rect(50, 12)), c = item('c', rect(0, 200))
            expect(pickFirst([c, a, b])).toBe(b)
        })

        test('returns undefined for no candidates', () => {
            expect(pickFirst([])).toBeUndefined()
        })
    })

    describe('pickDefault', () => {
        const el = (tag, text, attrs = {}) => { const e = document.createElement(tag); e.innerText = text; Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e }
        const c = (e, top = 0, left = 0) => ({ el: e, rect: rect(left, top) })

        test('an element marked as the default wins', () => {
            const marked = c(el('button', 'Download', { 'data-nav-default': '' }))
            expect(pickDefault([c(el('button', 'Start')), marked])).toBe(marked)
        })

        test('picks the most likely action: Start before Select, Continue, Yes and OK', () => {
            const cancel = c(el('button', 'Cancel')), start = c(el('button', 'Start ')), ok = c(el('button', 'OK'))
            expect(pickDefault([cancel, ok, start])).toBe(start)
            const save = c(el('button', 'Save')), cont = c(el('button', 'Continue')), del = c(el('button', 'Delete'))
            expect(pickDefault([save, cont, del])).toBe(cont)
            const yes = c(el('button', 'Yes')), no = c(el('button', 'No'))
            expect(pickDefault([no, yes])).toBe(yes)
        })

        test('of several equally likely buttons, the top-most one wins', () => {
            const lower = c(el('button', 'OK'), 700), upper = c(el('button', 'OK'), 300)
            expect(pickDefault([lower, upper])).toBe(upper)
        })

        test('without a likely action, the first card of a list, else the top-left element', () => {
            const nav = c(el('button', 'User'), 15, 10), card = c(el('article', 'Arnbach'), 113, 170), details = c(el('button', 'Details'), 136, 1135)
            expect(pickDefault([nav, card, details])).toBe(card)
            expect(pickDefault([details, nav])).toBe(nav)
        })

        test("a dialog's close button is only picked when nothing else can take the focus", () => {
            const close = c(el('button', '✕', { 'aria-label': 'Close', 'data-nav-close': '' }), 66, 1236), map = c(el('div', 'map'), 145, 93), cancel = c(el('button', 'Cancel'), 928, 469)
            expect(pickDefault([close, map, cancel])).toBe(map)
            expect(pickDefault([close])).toBe(close)
        })
    })

    describe('DOM helpers', () => {
        beforeEach(() => {
            document.body.innerHTML = ''
        })

        const layout = (el, r) => { el.getBoundingClientRect = () => r; return el }

        test('getNavigationRoot returns the top-most open dialog, or the document body', () => {
            expect(getNavigationRoot(document)).toBe(document.body)

            document.body.innerHTML = `<div class="dialog" id="d1"></div><div class="dialog" id="d2"></div>`
            layout(document.getElementById('d1'), rect(0, 0, 500, 500))
            layout(document.getElementById('d2'), rect(10, 10, 300, 300))
            expect(getNavigationRoot(document).id).toBe('d2')
        })

        test('getCandidates returns visible, enabled interactive elements only', () => {
            document.body.innerHTML = `
                <button id="ok">OK</button>
                <button id="disabled" disabled>no</button>
                <button id="hidden" style="display:none">hidden</button>
                <a id="link" href="#x">link</a>
                <div id="plain">text</div>
                <div id="tab" role="button">tab</div>`
            for (const el of document.body.querySelectorAll('*'))
                layout(el, el.id === 'hidden' ? rect(0, 0, 0, 0) : rect(0, 0))

            const ids = getCandidates(document.body).map(c => c.el.id)
            expect(ids).toEqual(['ok', 'link', 'tab'])
        })

        test('getCandidates includes elements with a React click handler, but not containers of other candidates', () => {
            document.body.innerHTML = `
                <div id="tile"><span>Workout</span></div>
                <div id="container"><button id="inner">Details</button></div>`
            const tile = document.getElementById('tile')
            const container = document.getElementById('container')
            tile.__reactProps$abc = { onClick: () => {} }
            container.__reactProps$abc = { onClick: () => {} }
            for (const el of document.body.querySelectorAll('*'))
                layout(el, rect(0, 0))

            const ids = getCandidates(document.body).map(c => c.el.id)
            expect(ids).toEqual(['tile', 'inner'])
        })

        test('a clickable card is one candidate, even if parts of it (e.g. graph bars) are clickable too', () => {
            document.body.innerHTML = `
                <div id="card"><svg><rect id="bar1"></rect><rect id="bar2"></rect></svg><span id="label">30' Tempo</span></div>
                <div id="other"></div>`
            for (const id of ['card', 'bar1', 'bar2', 'label', 'other'])
                document.getElementById(id).__reactProps$abc = { onClick: () => {} }
            for (const el of document.body.querySelectorAll('*'))
                layout(el, el.id === 'card' ? rect(0, 0, 300, 100) : rect(0, 0))
            document.body.getBoundingClientRect = () => rect(0, 0, 2000, 1000)

            const ids = getCandidates(document.body).map(c => c.el.id)
            expect(ids).toEqual(['card', 'other'])
        })

        test('a large clickable wrapper (e.g. a page or backdrop) does not swallow the clickable cards inside it', () => {
            document.body.innerHTML = `<div id="page"><div id="card1"></div><div id="card2"></div></div>`
            for (const id of ['page', 'card1', 'card2'])
                document.getElementById(id).__reactProps$abc = { onClick: () => {} }
            for (const el of document.body.querySelectorAll('*'))
                layout(el, el.id === 'page' ? rect(0, 0, 2000, 1000) : rect(0, 0))
            document.body.getBoundingClientRect = () => rect(0, 0, 2000, 1000)

            const ids = getCandidates(document.body).map(c => c.el.id)
            expect(ids).toEqual(['card1', 'card2'])
        })

        test('map internals (zoom buttons, attribution links) are not navigation targets', () => {
            document.body.innerHTML = `<div class="leaflet-container" id="map"><a id="zoom" href="#">+</a><a id="osm" href="https://openstreetmap.org">OSM</a></div><button id="start">Start</button>`
            document.getElementById('map').__reactProps$abc = { onClick: () => {} }
            for (const el of document.body.querySelectorAll('*'))
                layout(el, rect(0, 0))

            expect(getCandidates(document.body).map(c => c.el.id)).toEqual(['start'])
        })

        test('isTextInput detects editable fields', () => {
            document.body.innerHTML = `<input id="t" type="text"/><input id="c" type="checkbox"/><textarea id="ta"></textarea><button id="b"></button>`
            expect(isTextInput(document.getElementById('t'))).toBe(true)
            expect(isTextInput(document.getElementById('ta'))).toBe(true)
            expect(isTextInput(document.getElementById('c'))).toBe(false)
            expect(isTextInput(document.getElementById('b'))).toBe(false)
        })
    })
})
