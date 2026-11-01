import { describe, test, expect } from 'vitest'
import { valueToAngle, arcPath } from './geometry'

describe('valueToAngle', () => {
    test('maps min, max and the middle onto the 240 degree arc', () => {
        expect(valueToAngle(0, 0, 320)).toBe(150)
        expect(valueToAngle(320, 0, 320)).toBe(390)
        expect(valueToAngle(160, 0, 320)).toBe(270)
    })
    test('clamps values outside the range', () => {
        expect(valueToAngle(500, 0, 320)).toBe(390)
        expect(valueToAngle(-5, 0, 320)).toBe(150)
    })
    test('does not return NaN for an empty range', () => {
        expect(valueToAngle(5, 10, 10)).toBe(150)
    })
})

describe('arcPath', () => {
    test('starts at the angle point and uses the large-arc flag above 180 degrees', () => {
        const d = arcPath(50, 50, 40, 0, 240)
        expect(d.startsWith('M90.00,50.00 A40,40 0 1 1')).toBe(true)
        expect(arcPath(50, 50, 40, 0, 90)).toContain(' 0 0 1 ')
    })
})
