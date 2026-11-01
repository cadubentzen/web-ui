import { describe, it, expect } from 'vitest'
import { CONTROL_GAP, getRideLayout, toCss } from './layout'
import { RIGHT_COLUMN_WIDTH, SHIFTING_REGION } from '../../../components/modules/Ride/layoutConstants'

const FLAGS = ['workout', 'upcoming', 'nearby', 'prev', 'sideViews', 'map', 'totalElevation']

const combos = () => {
    const res = []
    for (let i = 0; i < 1 << FLAGS.length; i++) {
        const opts = { workoutOnly: false }
        FLAGS.forEach((f, idx) => { opts[f] = !!(i & (1 << idx)) })
        res.push(opts)
    }
    // the route-less workout page
    // (no route: no upcoming elevation, riders lists, side views, map)
    res.push({ workout: true, workoutOnly: true, upcoming: false, nearby: false, prev: false, sideViews: false, map: false, totalElevation: false })
    return res
}

const defined = (layout) => Object.entries(layout).filter(([, r]) => r !== undefined)
const intersects = (a, b) =>
    a.left < b.left + b.width && b.left < a.left + a.width &&
    a.top < b.top + b.height && b.top < a.top + a.height

describe('getRideLayout', () => {
    it('no two visible regions overlap', () => {
        for (const opts of combos()) {
            const regions = defined(getRideLayout(opts))
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const [na, a] = regions[i]
                    const [nb, b] = regions[j]
                    const names = [na, nb]
                    // transparent buttons over the graph, like over the video
                    if (names.includes('routeOptions') && names.includes('workoutGraph')) continue
                    expect(intersects(a, b), `${na} x ${nb} with ${JSON.stringify(opts)}`).toBe(false)
                }
            }
        }
    })

    it('the road stays clear', () => {
        const road = { top: 40, height: 35, left: 25, width: 50 }
        const exempt = ['routeOptions', 'svLeft', 'svRight', 'workoutGraph']
        for (const opts of combos()) {
            for (const [name, r] of defined(getRideLayout(opts))) {
                if (exempt.includes(name)) continue
                expect(intersects(r, road), `${name} with ${JSON.stringify(opts)}`).toBe(false)
            }
        }
    })

    it('everything fits on screen', () => {
        for (const opts of combos()) {
            for (const [name, r] of defined(getRideLayout(opts))) {
                expect(r.top, name).toBeGreaterThanOrEqual(0)
                expect(r.left, name).toBeGreaterThanOrEqual(0)
                expect(r.top + r.height, name).toBeLessThanOrEqual(100)
                expect(r.left + r.width, name).toBeLessThanOrEqual(100)
            }
        }
    })

    it('workout moves upcoming elevation below the workout panel', () => {
        const l = getRideLayout({ workout: true, upcoming: true })
        expect(l.upcoming.top).toBeGreaterThan(l.workoutPanel.top + l.workoutPanel.height)
    })

    it('gives the workout control room for two rows of buttons, just below the panel', () => {
        const l = getRideLayout({ workout: true, upcoming: true, nearby: true, prev: true })
        expect(l.workoutControl.height).toBeGreaterThanOrEqual(11)
        expect(l.workoutControl.top).toBeCloseTo(l.workoutPanel.top + l.workoutPanel.height + CONTROL_GAP)
    })

    it('keeps the route options on the workout page, without side views', () => {
        const l = getRideLayout({ workout: true, workoutOnly: true, sideViews: true })
        expect(l.routeOptions).toEqual({ top: 62, left: 26, width: 48, height: 16 })
        expect(l.workoutGraph).toBeDefined()
        expect(l.svLeft).toBeUndefined()
        expect(l.svRight).toBeUndefined()
    })

    it('only returns regions that are asked for', () => {
        const l = getRideLayout({})
        expect(l.progress && l.metrics && l.shifting && l.routeOptions).toBeTruthy()
        for (const n of ['workoutPanel', 'workoutControl', 'upcoming', 'nearby', 'prev', 'svLeft', 'svRight', 'map', 'totalElevation', 'workoutGraph'])
            expect(l[n], n).toBeUndefined()
    })

    it('totalElevation widens when there is no map', () => {
        expect(getRideLayout({ totalElevation: true }).totalElevation).toMatchObject({ left: 1.9, width: 96.2 })
        expect(getRideLayout({ totalElevation: true, map: true }).totalElevation).toMatchObject({ left: 19.5, width: 78.6 })
    })

    it('drops svRight when the right column leaves no room', () => {
        expect(getRideLayout({ workout: true, upcoming: true, nearby: true, prev: true, sideViews: true }).svRight).toBeUndefined()
        expect(getRideLayout({ sideViews: true }).svRight).toMatchObject({ top: 40, left: 75 })
    })
})

describe('getRideLayout centre panel (short stack)', () => {
    it('the centre panel is compact: no empty band under the gauges', () => {
        const { metrics } = getRideLayout({})
        expect(metrics.height).toBeLessThanOrEqual(26)
        expect(metrics.top).toBe(2.4)
    })

    it('the shifting buttons sit right under the centre panel, above the road', () => {
        const { metrics, shifting } = getRideLayout({})
        const gap = shifting.top - (metrics.top + metrics.height)
        expect(gap).toBeGreaterThanOrEqual(0)
        expect(gap).toBeLessThanOrEqual(1.5)
        expect(shifting.top + shifting.height).toBeLessThanOrEqual(40)
    })
})

describe('getRideLayout shared sizes', () => {
    it('uses the shifting slot and the column width the controls size themselves from', () => {
        const l = getRideLayout({ workout: true })
        expect(l.shifting).toEqual(SHIFTING_REGION)
        expect(l.workoutPanel.width).toBe(RIGHT_COLUMN_WIDTH)
    })
})

describe('getRideLayout deltaX', () => {
    const COLUMN_NAMES = ['workoutPanel', 'workoutControl', 'upcoming', 'nearby', 'prev']
    const all = { workout: true, upcoming: true, nearby: true, prev: true, sideViews: true, map: true, totalElevation: true }

    it('moves the whole right column together', () => {
        const base = getRideLayout(all)
        const moved = getRideLayout({ ...all, deltaX: 1.5 })
        for (const n of COLUMN_NAMES) {
            expect(moved[n].left, n).toBe(base[n].left + 1.5)
            expect(moved[n].top, n).toBe(base[n].top)
            expect(moved[n].width, n).toBe(base[n].width)
        }
    })

    it('moves the column to the left', () => {
        const base = getRideLayout(all)
        for (const n of COLUMN_NAMES)
            expect(getRideLayout({ ...all, deltaX: -4 })[n].left, n).toBe(base[n].left - 4)
    })

    it('keeps the column on screen', () => {
        for (const n of COLUMN_NAMES) {
            const r = getRideLayout({ ...all, deltaX: 50 })[n]
            expect(r.left + r.width, n).toBeLessThanOrEqual(100)
        }
    })

    it('never moves the column onto the centre panel', () => {
        const l = getRideLayout({ ...all, deltaX: -100 })
        for (const n of COLUMN_NAMES)
            expect(l[n].left, n).toBeGreaterThanOrEqual(l.metrics.left + l.metrics.width)
    })

    it('ignores a missing or invalid delta', () => {
        const base = getRideLayout(all)
        expect(getRideLayout({ ...all, deltaX: undefined })).toEqual(base)
        expect(getRideLayout({ ...all, deltaX: 'x' })).toEqual(base)
    })

    it('the column never overlaps the centre panels, nor itself, for any delta', () => {
        const CENTRE = ['progress', 'metrics', 'shifting']
        for (const deltaX of [-100, -10, 0, 10, 100]) {
            const l = getRideLayout({ ...all, deltaX })
            const names = [...COLUMN_NAMES, ...CENTRE]
            for (let i = 0; i < names.length; i++)
                for (let j = i + 1; j < names.length; j++) {
                    if (CENTRE.includes(names[i]) && CENTRE.includes(names[j])) continue
                    expect(intersects(l[names[i]], l[names[j]]), `${names[i]} x ${names[j]} deltaX ${deltaX}`).toBe(false)
                }
        }
    })
})

describe('toCss', () => {
    it('formats a region', () => {
        expect(toCss({ top: 2.4, left: 1.9, width: 22, height: 20 })).toEqual({ top: '2.4vh', left: '1.9vw', width: '22vw', height: '20vh' })
    })
    it('returns undefined for undefined', () => expect(toCss(undefined)).toBeUndefined())
})
