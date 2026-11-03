import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { newUITheme } from '../../../../theme'
import { ScreenshotGalleryView, screenshotCaption } from './ScreenshotGalleryView'

const renderView = ui => render(<ThemeProvider theme={newUITheme}>{ui}</ThemeProvider>)

const screenshots = [
    { fileName: '/pics/2026-11-03 Mensac Loop/screenshot-1.jpg', time: 61, moment: 'start' },
    { fileName: '/pics/2026-11-03 Mensac Loop/screenshot-2.jpg', time: 1835 },
    { fileName: '/pics/2026-11-03 Mensac Loop/screenshot-3.jpg', time: 1900, moment: 'summit' },
]

const viewerTitle = () => document.querySelector('.title-bar')?.textContent

describe('ScreenshotGalleryView', () => {
    test('nothing is shown for a ride without screenshots', () => {
        renderView(<ScreenshotGalleryView screenshots={[]} />)
        expect(screen.queryByTestId('screenshot-gallery')).toBeNull()
    })

    test('a thumbnail per screenshot, with the moment and ride time it was taken at', () => {
        renderView(<ScreenshotGalleryView screenshots={screenshots} />)
        const thumbnails = screen.getAllByRole('button', { name: /^Screenshot/ })
        expect(thumbnails.map(t => t.getAttribute('aria-label'))).toEqual([
            'Screenshot 1 (Start · 01:01)', 'Screenshot 2 (30:35)', 'Screenshot 3 (Summit · 31:40)'])
        expect(thumbnails[0].querySelector('img').getAttribute('src')).toBe('incyclist:////pics/2026-11-03 Mensac Loop/screenshot-1.jpg')
        expect(screen.getByTestId('screenshot-gallery').textContent).toContain('Screenshots3')
    })

    test('a thumbnail opens the screenshot large; Previous/Next page through them, ✕ closes it', () => {
        renderView(<ScreenshotGalleryView screenshots={screenshots} />)
        fireEvent.click(screen.getAllByRole('button', { name: /^Screenshot/ })[1])
        expect(viewerTitle()).toContain('Screenshot 2 of 3 · 30:35')

        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(viewerTitle()).toContain('Screenshot 3 of 3 · Summit · 31:40')
        expect(screen.getByRole('button', { name: 'Next' }).disabled).toBe(true)

        fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
        fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
        expect(viewerTitle()).toContain('Screenshot 1 of 3')
        expect(screen.getByRole('button', { name: 'Previous' }).disabled).toBe(true)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(viewerTitle()).toBeUndefined()
    })

    test('Escape closes the viewer', () => {
        renderView(<ScreenshotGalleryView screenshots={screenshots} />)
        fireEvent.click(screen.getAllByRole('button', { name: /^Screenshot/ })[0])
        fireEvent.keyUp(window, { key: 'Escape', keyCode: 27 })
        expect(viewerTitle()).toBeUndefined()
    })

    test('the viewer starts on Next, or on Previous for the last screenshot', () => {
        renderView(<ScreenshotGalleryView screenshots={screenshots} />)
        fireEvent.click(screen.getAllByRole('button', { name: /^Screenshot/ })[0])
        expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('data-nav-default')).toBe(true)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(screen.getByRole('button', { name: 'Previous' }).hasAttribute('data-nav-default')).toBe(true)
    })

    test('Open folder and Show in folder open the folder of the screenshots', () => {
        const onShowInFolder = vi.fn()
        renderView(<ScreenshotGalleryView screenshots={screenshots} onShowInFolder={onShowInFolder} />)
        fireEvent.click(screen.getByRole('button', { name: 'Open folder' }))
        expect(onShowInFolder).toHaveBeenLastCalledWith(screenshots[0].fileName)

        fireEvent.click(screen.getAllByRole('button', { name: /^Screenshot/ })[2])
        fireEvent.click(screen.getByRole('button', { name: 'Show in folder' }))
        expect(onShowInFolder).toHaveBeenLastCalledWith(screenshots[2].fileName)
    })

    test('the caption leaves out what is not known', () => {
        expect(screenshotCaption({ fileName: 'x.jpg' })).toBe('')
        expect(screenshotCaption({ fileName: 'x.jpg', moment: 'finish' })).toBe('Finish')
    })
})
