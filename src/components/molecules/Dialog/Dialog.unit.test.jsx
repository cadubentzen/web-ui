import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { logEvent } = vi.hoisted(() => ({ logEvent: vi.fn() }))
vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: class { logEvent(...a) { logEvent(...a) } set() {} },
}))

import { getCandidates, getNavigationRoot, pickDefault } from '../../../utils/spatialNavigation'
import { Dialog } from './index'
import { MessageBox } from '../dialogs/MessageBox'

const R = (left, top, width = 100, height = 40) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top })

describe('Dialog frame', () => {

    test('renders the title in the header', () => {
        render(<Dialog title='User' onESC={() => {}}><p>body</p></Dialog>)
        const title = screen.getByText('User')
        expect(title.closest('.title-bar')).not.toBeNull()
        expect(getComputedStyle(title.closest('.title-bar')).textAlign).toBe('left')
    })

    test('close button calls the close handler', () => {
        const onESC = vi.fn()
        render(<Dialog title='User' onESC={onESC}><p>body</p></Dialog>)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onESC).toHaveBeenCalledTimes(1)
    })

    test('close button logs the click with the dialog id', () => {
        logEvent.mockClear()
        render(<Dialog id='UserDlg' title='User' onESC={() => {}}><p>body</p></Dialog>)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(logEvent).toHaveBeenCalledWith({ message: 'button clicked', button: 'Close', dialog: 'UserDlg', eventSource: 'user' })
    })

    test('onClose wins over onESC', () => {
        const onESC = vi.fn(), onClose = vi.fn()
        render(<Dialog title='User' onESC={onESC} onClose={onClose}><p>body</p></Dialog>)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(onESC).not.toHaveBeenCalled()
    })

    test('a titleless dialog with a handler still shows the close button', () => {
        const onESC = vi.fn()
        render(<Dialog onESC={onESC}><p>body</p></Dialog>)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onESC).toHaveBeenCalledTimes(1)
    })

    test('no close button without a handler', () => {
        render(<Dialog title='User'><p>body</p></Dialog>)
        expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    })

    test('Escape still closes', () => {
        const onESC = vi.fn()
        render(<Dialog title='User' onESC={onESC}><p>body</p></Dialog>)
        fireEvent.keyUp(window, { keyCode: 27, key: 'Escape' })
        expect(onESC).toHaveBeenCalledTimes(1)
    })
})

describe('MessageBox', () => {

    test('uses the dialog frame without a separate coloured header', () => {
        const { container } = render(<MessageBox title='Delete Ride' text='Sure?' onYes={() => {}} onNo={() => {}} />)
        expect(container.querySelector('.message-header')).toBeNull()
        expect(screen.getByText('Delete Ride').closest('.title-bar')).not.toBeNull()
    })

    test('defaultButton carries data-nav-default', () => {
        render(<MessageBox destructive defaultButton='No' title='Delete Ride' text='Sure?' onYes={() => {}} onNo={() => {}} />)
        expect(screen.getByRole('button', { name: 'No' }).hasAttribute('data-nav-default')).toBe(true)
        expect(screen.getByRole('button', { name: 'Yes' }).hasAttribute('data-nav-default')).toBe(false)
    })

    test('close button cancels', () => {
        const onNo = vi.fn()
        render(<MessageBox title='Delete Ride' text='Sure?' onYes={() => {}} onNo={onNo} />)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onNo).toHaveBeenCalledTimes(1)
    })

    test('no close button when it has no buttons at all', () => {
        render(<MessageBox noYes noNo title='Incyclist' text='Disconnecting ...' />)
        expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    })

    test('destructive action sits apart on the left and the footer is right-aligned', () => {
        const { container } = render(<MessageBox destructive title='Delete Ride' text='Sure?' onYes={() => {}} onNo={() => {}} />)
        const bar = container.querySelector('.message-buttons')
        expect(getComputedStyle(bar).justifyContent).toBe('flex-end')
        const yes = screen.getByRole('button', { name: 'Yes' })
        expect(getComputedStyle(yes).marginRight).toBe('auto')
        expect(bar.firstElementChild).toBe(yes)
    })

    test('the controller picks the defaultButton for the initial focus',  () => {
        render(<><MessageBox destructive defaultButton='No' title='Delete Ride' text='Sure?' onYes={() => {}} onNo={() => {}} /></>)
        const no = screen.getByRole('button', { name: 'No' })
        for (const el of document.body.querySelectorAll('*')) {
            el.getBoundingClientRect = () => el === no ? R(500, 300) : el.textContent === 'Yes' ? R(0, 300) : el.getAttribute('aria-label') === 'Close' ? R(600, 0) : R(0, 0, 1000, 1000)
            el.scrollIntoView = () => {}
        }
        expect(pickDefault(getCandidates(getNavigationRoot(document))).el).toBe(no)
    })

})
