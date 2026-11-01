import styled from 'styled-components'
import { kitTokens } from '../../../theme'

/** Scrolling content area of a settings tab (transparent: the dialog frame provides the surface) */
export const SettingsContent = styled.div`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    margin: auto;
    padding: 1vh 0.5vw;
    display: flex;
    flex-direction: column;
    text-align: left;
    color: inherit;

    label { color: ${props => kitTokens(props.theme).muted}; }

    /* only the very first header of the content sits close to the top */
    & > h5:first-child, & > :first-child > h5:first-child { margin-top: 0.5vh; }
`

/** Small uppercase muted section header */
export const SectionHeader = styled.h5`
    margin: 2.2vh 0 1.2vh;
    font-size: 1.5vh;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${props => kitTokens(props.theme).muted};
`
