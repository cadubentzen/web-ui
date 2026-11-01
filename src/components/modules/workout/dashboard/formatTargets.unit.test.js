import { describe, test, expect } from 'vitest'
import { formatTargets } from './formatTargets'

describe('formatTargets', () => {
    test('min and max -> range with unit', () => {
        const t = formatTargets({ minPower: 180, maxPower: 200, minCadence: 85, maxCadence: 95, minHrm: 130, maxHrm: 140 })
        expect(t.power).toEqual({ value: '180–200', unit: 'W' })
        expect(t.cadence).toEqual({ value: '85–95', unit: 'rpm' })
        expect(t.hrm).toEqual({ value: '130–140', unit: 'bpm' })
    })
    test('min equals max -> single value', () => {
        expect(formatTargets({ minPower: 150, maxPower: 150 }).power).toEqual({ value: '150', unit: 'W' })
    })
    test('only max -> ≤ max', () => {
        expect(formatTargets({ maxPower: 150 }).power).toEqual({ value: '≤ 150', unit: 'W' })
    })
    test('only min -> ≥ min', () => {
        expect(formatTargets({ minCadence: 80 }).cadence).toEqual({ value: '≥ 80', unit: 'rpm' })
    })
    test('rounds values and handles missing limits', () => {
        expect(formatTargets({ minPower: 99.6, maxPower: 120.2 }).power.value).toBe('100–120')
        expect(formatTargets(undefined)).toEqual({ power: {}, hrm: {}, cadence: {} })
        expect(formatTargets({}).hrm).toEqual({})
    })
})
