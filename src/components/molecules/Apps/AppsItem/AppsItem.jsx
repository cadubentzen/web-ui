import React from 'react'
import { Row, Text } from '../../../atoms'
import styled from 'styled-components'
import { AppThemeProvider, kitTokens } from '../../../../theme'

const Container = styled.button`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    cursor: pointer;
    width: 10vw;
    height: 3vw;
    margin: 0 1vw 1vh 0;
    padding: 0.5vh 0.8vw;
    background: ${props => kitTokens(props.theme).panel.fill};
    border: ${props => kitTokens(props.theme).panel.border};
    border-radius: 999px;

    &:hover {
        background: ${props => kitTokens(props.theme).pillHover};
    }
`

export const Image = styled.img`
    width: ${props => props.width};
    height: ${props => props.height};
    
    user-select: none;
    pointer-events: none;
`



export const AppsItem = ( {name, iconUrl, isConnected,onClick}) => {

    return <AppThemeProvider>
        <Container type='button' aria-label={name} onClick={onClick}>
            
            {iconUrl? <Image src={iconUrl} alt={name} width='100%' height='100%' style={{objectFit:'contain'}}/> :
             <Text text={name}/>}
        </Container>
    </AppThemeProvider>

}