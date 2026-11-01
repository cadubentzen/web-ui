import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../theme'
import { EditNumber } from './EditNumber'
import { EditText } from './EditText'
import { SingleSelect } from './SingleSelect'

const show = (ui) => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

describe('filled fields', () => {
    test('text field uses the field tokens', () => {
        show(<EditText label='Name' value='x' />)
        const s = getComputedStyle(screen.getByRole('textbox'))
        expect(s.backgroundColor).toBe('rgba(255, 255, 255, 0.1)')
        expect(s.borderStyle).toBe('solid')
        expect(s.borderWidth).toBe('1px')
        expect(s.borderColor).toContain('rgba(255, 255, 255, 0.14)')
        expect(s.borderRadius).toBe('0.55em')
    })

    test('number field shows the unit muted on the right of the input', () => {
        show(<EditNumber label='Weight' unit='kg' value={70} min={0} max={200} />)
        const input = screen.getByRole('textbox')
        const unit = screen.getByText('kg')
        expect(input.compareDocumentPosition(unit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(getComputedStyle(unit).color).toBe('rgba(255, 255, 255, 0.7)')
    })

    test('validation error text stays visible and the field is marked invalid', () => {
        show(<EditNumber label='Weight' value={70} min={0} max={200} />)
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: '500' } })
        fireEvent.blur(input)
        expect(screen.getByText(/Value must be between 0 and 200/)).toBeDefined()
        expect(input.getAttribute('aria-invalid')).toBe('true')
        expect(getComputedStyle(input).borderColor).toContain('rgb(255, 107, 107)')
    })

    test('dropdown is filled like a field', () => {
        show(<SingleSelect label='Unit' options={['a', 'b']} value='a' />)
        const s = getComputedStyle(screen.getByRole('combobox'))
        expect(s.backgroundColor).toBe('rgba(255, 255, 255, 0.1)')
        expect(s.borderRadius).toBe('0.55em')
    })
})
