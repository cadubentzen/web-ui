import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupportAreaView } from './component'

describe('SupportAreaView', () => {
    test('shows the versions, the section headers and the links', () => {
        render(<SupportAreaView uuid='abc-123' appVersion='1.2.3' reactVersion='4.5.6' />)
        expect(screen.getByText('App Info')).toBeInTheDocument()
        expect(screen.getByText('1.2.3')).toBeInTheDocument()
        expect(screen.getByText('abc-123')).toBeInTheDocument()
        expect(screen.getByText('Where can I get support?')).toBeInTheDocument()
        expect(screen.getByText('How can I support?')).toBeInTheDocument()
        expect(screen.getByText('Privacy Statement')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })
})
