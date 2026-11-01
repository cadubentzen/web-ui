import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AvailableUpdateMessage } from './AvailableUpdateMessage'

describe('AvailableUpdateMessage', () => {
    test('the Skip button is the controller default', () => {
        render(<AvailableUpdateMessage version='1.0.0' url='https://example.com' onSkip={() => {}} />)
        expect(screen.getByRole('button', { name: 'Skip' })).toHaveAttribute('data-nav-default')
    })
})
