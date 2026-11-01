import styled from 'styled-components'
import { kitTokens } from '../../../../theme'

const toneColors = (kit, tone) => {
    switch (tone) {
        case 'ok':     return { color: kit.ok, fill: `color-mix(in srgb, ${kit.ok} 18%, transparent)`, border: kit.ok }
        case 'failed': return { color: kit.danger, fill: `color-mix(in srgb, ${kit.danger} 14%, transparent)`, border: kit.danger }
        default:       return { color: kit.muted, fill: kit.pillSelected, border: 'transparent' }
    }
}

/**
 * Small pill-shaped chip used for export files and upload targets (kit tokens only).
 * `$tone`: 'ok' (exists / synchronized), 'failed' or 'idle' (not created / not synchronized yet).
 * A real `button`, so it takes part in keyboard / controller navigation.
 */
export const Chip = styled.button`
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    max-width: 100%;
    padding: 0.25em 1em;
    border-radius: 999px;
    font-size: 1.5vh;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    user-select: none;
    color: ${props => toneColors(kitTokens(props.theme), props.$tone).color};
    background: ${props => toneColors(kitTokens(props.theme), props.$tone).fill};
    border: 1px solid ${props => toneColors(kitTokens(props.theme), props.$tone).border};

    &:hover:not(:disabled) { background-image: linear-gradient(${props => kitTokens(props.theme).pillHover}, ${props => kitTokens(props.theme).pillHover}); }
    &:disabled { cursor: default; }
`

/** Glass popover for the chip actions (Create / Show / Synchronize / Open) */
export const ChipMenu = styled.div`
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: 0.3em;
    background: ${props => kitTokens(props.theme).dialogBackground};
    border: ${props => kitTokens(props.theme).panel.border};
    border-radius: ${props => kitTokens(props.theme).field.radius};
`

export const ChipMenuItem = styled.button.attrs({ type: 'button', role: 'menuitem' })`
    padding: 0.4em 1.2em;
    border: none;
    border-radius: 0.4em;
    background: transparent;
    color: inherit;
    font-size: 1.5vh;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    &:hover { background: ${props => kitTokens(props.theme).pillSelected}; }
`
