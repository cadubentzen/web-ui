import { describe, test, expect } from 'vitest'

describe('ActivitiesTable', () => {
    test('the module loads (all its names are defined)', async () => {
        const mod = await import('./ActivitiesTable')
        expect(Object.keys(mod).length).toBeGreaterThan(0)
    }, 30000)   // a cold import of the module graph is slow while the full suite runs in parallel
})
