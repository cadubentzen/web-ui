import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NearbyRidersView } from './component'

// the component module is imported above, i.e. before the app selects its theme
vi.mock('../../../../molecules/Ride/RiderInfo/rider-info', () => ({ RiderInfo: () => null }))

describe('NearbyRidersView', () => {

    test('list header is a small uppercase muted label, not a coloured bar', () => {
        render(<NearbyRidersView title='Nearby' activeRides={[{ name: 'Rider' }]} />)

        const header = getComputedStyle(screen.getByText('Nearby'))
        expect(header.textTransform).toBe('uppercase')
        expect(header.backgroundColor).not.toBe('rgb(44, 62, 80)') // #2c3e50, the old header bar
        expect(header.color).toBe('rgba(255, 255, 255, 0.7)')
    })
})
