import React from 'react'
import styled from 'styled-components'
import { kitTokens } from '../../../../theme'

const Text = styled.div`
    color: ${props => kitTokens(props.theme).muted};
`

export const Label = (props) => <Text>{props.children}</Text>
