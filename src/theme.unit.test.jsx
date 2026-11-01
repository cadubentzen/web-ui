import { describe, test, expect } from 'vitest'
import AppTheme, { newUITheme, hudTokens, kitTokens } from './theme'

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

    test('newUI theme defines the kit tokens', () => {
        expect(newUITheme.page.background).toBe('radial-gradient(120% 90% at 85% -10%, #4a1240 0%, transparent 55%), linear-gradient(160deg, #24081f 0%, #160a3c 100%)')
        expect(newUITheme.panel).toEqual({ fill: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.14)', radius: '0.9em', band: 'rgba(0,0,0,0.18)' })
        expect(newUITheme.field).toEqual({ fill: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.14)', radius: '0.55em' })
        expect(newUITheme.pill.selected).toBe('rgba(255,255,255,0.14)')
        expect(newUITheme.colors.danger).toBe('#ff6b6b')
        expect(kitTokens(undefined).heartRate).toBe(newUITheme.colors.heartRate)
    })

    describe('kitTokens', () => {
        test('falls back to the newUI values without a theme', () => {
            const t = kitTokens(undefined)
            expect(t.pageBackground).toBe(newUITheme.page.background)
            expect(t.panel).toEqual({ ...newUITheme.panel, border: '1px solid rgba(255,255,255,0.14)' })
            expect(t.field).toEqual({ ...newUITheme.field, border: '1px solid rgba(255,255,255,0.14)' })
            expect(t.pillSelected).toBe(newUITheme.pill.selected)
            expect(t.danger).toBe('#ff6b6b')
            expect(t.accent).toBe(newUITheme.colors.accent)
        })

        test('the theme values win over the fallback', () => {
            const t = kitTokens({ page: { background: 'red' }, panel: { fill: 'blue' }, colors: { danger: 'pink' } })
            expect(t.pageBackground).toBe('red')
            expect(t.panel.fill).toBe('blue')
            expect(t.panel.border).toBe('1px solid rgba(255,255,255,0.14)')
            expect(t.panel.radius).toBe(newUITheme.panel.radius)
            expect(t.danger).toBe('pink')
        })
    })

    test('default theme has no accent override', () => {
        expect(AppTheme.get('default').colors.accent).toBeUndefined()
    })

    describe('hudTokens', () => {
        test('falls back to the newUI values without a theme', () => {
            const t = hudTokens(undefined)
            expect(t.panel).toBe(newUITheme.hud.panel)
            expect(t.accent).toBe(newUITheme.colors.accent)
            expect(t.accentText).toBe(newUITheme.colors.accentText)
        })

        test('the theme values win over the fallback', () => {
            const t = hudTokens({ hud: { panel: 'red', warning: 'orange' }, colors: { accent: 'blue' } })
            expect(t.panel).toBe('red')
            expect(t.warning).toBe('orange')
            expect(t.accent).toBe('blue')
            expect(t.border).toBe(newUITheme.hud.border)
            expect(t.accentText).toBe(newUITheme.colors.accentText)
        })
    })
})
