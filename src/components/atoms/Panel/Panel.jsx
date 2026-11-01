import styled from 'styled-components'
import { kitTokens } from '../../../theme'

/**
 * Glass panel: translucent fill, hairline border and rounded corners, all from the kit `panel` tokens.
 * `focused` marks the panel with an accent ring (e.g. while its content has the controller focus).
 */
export const Panel = styled.div`
    box-sizing: border-box;
    background: ${props => kitTokens(props.theme).panel.fill};
    border: ${props => kitTokens(props.theme).panel.border};
    border-radius: ${props => kitTokens(props.theme).panel.radius};
    ${props => props.$focused ? `box-shadow: 0 0 0 2px ${kitTokens(props.theme).accent};` : ''}
`
