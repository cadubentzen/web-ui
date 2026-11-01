import React from 'react';
import styled from 'styled-components';
import { Panel } from '../../../atoms/Panel';
import { kitTokens } from '../../../../theme';
import { ConnectionStatus } from '../ConnectionStatus';

export const Tile = styled(Panel)`
    display: flex;
    flex-direction: column;
    gap: 0.6vh;
    min-width: 0;
    height: 25vh;
    padding: 1.6vh 1.1vw 1.4vh;
    color: ${props => kitTokens(props.theme).text};
    cursor: pointer;
    opacity: ${props => props.$muted ? 0.6 : 1};
    transition: background 0.2s, border-color 0.2s;
    &:hover {
        background: ${props => kitTokens(props.theme).pillHover};
        border-color: ${props => kitTokens(props.theme).pillOutline};
    }
`

export const Capability = styled.div`
    font-size: 1.5vh;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${props => kitTokens(props.theme).accent};
`

const DeviceName = styled.div`
    font-size: 2.4vh;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const Info = styled.div`
    display: flex;
    align-items: baseline;
    min-height: 5vh;
    font-size: 5vh;
    font-weight: 700;
    line-height: 1;
`

const Unit = styled.span`
    font-size: 2vh;
    font-weight: 500;
    margin-left: 0.4vw;
    color: ${props => kitTokens(props.theme).muted};
`

export const SelectedDevice = ( {title, capability, value, unit, deviceName, imageUrl, connectState, disabled, footer, onClick,onUnselect, onUse }) => {

    const onContainerClicked = (e) =>{
        if (onClick)
            onClick(capability)
    }
    const onUnselectClicked = (e) =>{
        if (onUnselect)
            onUnselect(capability)
    }
    const onUseClicked = (e) =>{
        if (onUse)
            onUse(capability)
    }

    // T16: switched off by the rider, but the device is still remembered - shown muted, with no
    // value, and the toggle in the off position (onUse turns it back on, with no new scan)
    const hasValue = !disabled && value!==undefined && value!==null && !isNaN(value)

    return (
        <Tile $muted={disabled} onClick={ onContainerClicked}>
            <Capability>{title??capability}</Capability>
            <DeviceName>{deviceName}</DeviceName>
            <Info>
                {hasValue ? <>{value}<Unit>{unit}</Unit></> : null}
            </Info>
            <ConnectionStatus state={connectState} disabled={disabled} footer={footer} onUnselect={onUnselectClicked} onUse={onUseClicked} />
        </Tile>
    )
}
