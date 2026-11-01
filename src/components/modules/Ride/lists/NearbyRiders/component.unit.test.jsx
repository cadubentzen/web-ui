import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppTheme, { newUITheme } from '../../../../../theme'
import { NearbyRidersView } from './component'

// the component module is imported above, i.e. before the app selects its theme
vi.mock('../../../../molecules/Ride/RiderInfo/rider-info', () => ({ RiderInfo: () => null }))

describe('NearbyRidersView', () => {

    test('list header uses the active theme', () => {
        AppTheme.add('newUI', newUITheme)
        AppTheme.select('newUI')

        render(<NearbyRidersView title='Nearby' activeRides={[{ name: 'Rider' }]} />)

        const background = getComputedStyle(screen.getByText('Nearby')).backgroundColor
        expect(background).not.toBe('rgb(44, 62, 80)') // #2c3e50, the default theme's header
    })
})
