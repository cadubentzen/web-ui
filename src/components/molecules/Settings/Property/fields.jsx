import styled from 'styled-components'
import { kitTokens } from '../../../../theme'

// native controls carrying the kit field look
const fieldLook = (props) => {
    const kit = kitTokens(props.theme)
    return `
        color: inherit;
        color-scheme: dark;
        font-family: inherit;
        font-size: inherit;
        background: ${kit.field.fill};
        border: ${props.$invalid ? `1px solid ${kit.danger}` : kit.field.border};
        border-radius: ${kit.field.radius};
        padding: 0.3em 0.6em;
        &:disabled { opacity: 0.5; }
    `
}

export const Select = styled.select`${fieldLook}`
export const Input = styled.input`${fieldLook}`
