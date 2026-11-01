/**
 * What closing the pause menu (✕ or Escape) does: the same as the menu's own way out -
 * Back when it shows Back, else Continue (resume the ride). A finished ride shows neither,
 * so it has no close handler (undefined) unless the caller passes onOK - it cannot be closed
 * without saving or deleting.
 */
export const getCloseHandler = ({ back, finished, onBack, onContinue, onOK }) => {
    if (back !== undefined) return onBack
    if (finished !== true) return onContinue
    return onOK
}
