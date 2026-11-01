import React from 'react';
import styled from 'styled-components';
import { kitTokens } from '../../../../theme';
import { Tile, Capability } from '../SelectedDevice';

const Footer = styled.div`
    margin-top: auto;
    padding-top: 0.8vh;
    border-top: 1px solid ${props => kitTokens(props.theme).hairline};
    font-size: 1.8vh;
    color: ${props => kitTokens(props.theme).muted};
`

const HelpText = styled.div`
    font-size: 1.9vh;
    color: ${props => kitTokens(props.theme).muted};
    overflow: hidden;
`

export const SearchingDevice = ( {title, capability, waiting, helpText, footer, onClick }) => {

    const onContainerClicked = () =>{
        if (onClick)
            onClick(capability)
    }

    // a required capability that is still missing gets an accent ring
    return (
        <Tile $focused={waiting} onClick={ onContainerClicked}>
            <Capability>{title ?? capability}</Capability>
            <HelpText>{helpText}</HelpText>
            <Footer>{footer}</Footer>
        </Tile>
    )
}
