import { describe, test, expect } from 'vitest'
import AppTheme, { newUITheme } from './theme'

describe('theme', () => {

    test('newUI theme defines the HUD tokens', () => {
        expect(newUITheme.colors.accent).toBe('#e4a13c')
        expect(newUITheme.colors.accentText).toBe('#1c1203')
        expect(newUITheme.hud).toEqual({
            panel: 'linear-gradient(rgba(56,1,31,0.72), rgba(26,4,86,0.72))',
            border: 'rgba(255,255,255,0.16)',
            hairline: 'rgba(255,255,255,0.18)',
            text: '#ffffff',
            muted: 'rgba(255,255,255,0.7)',
            track: 'rgba(255,255,255,0.15)',
            radius: '0.9vw',
            warning: '#FFBF00',
            error: '#ff4d4d',
        })
    })

    test('default theme has no accent override', () => {
        expect(AppTheme.get('default').colors.accent).toBeUndefined()
    })
})
