import React from "react";
import styled from "styled-components";

import Loader from "react-spinners/BounceLoader";
import { CheckIcon, XCircleFillIcon } from "@primer/octicons-react";

import { kitTokens } from "../../../../theme";

// switch: accent when on, white 20 % track when off (same look as the kit CheckBox switch)
const Toggle = styled.button`
    position: relative;
    flex: none;
    width: 4.4vh;
    height: 2.4vh;
    padding: 0;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    background: ${props => props.$on ? kitTokens(props.theme).accent : kitTokens(props.theme).switchOff};
    transition: background 0.15s;
    &::after {
        content: '';
        position: absolute;
        top: 0.3vh;
        left: ${props => props.$on ? 'calc(100% - 2.1vh)' : '0.3vh'};
        width: 1.8vh;
        height: 1.8vh;
        border-radius: 50%;
        background: ${props => props.$on ? kitTokens(props.theme).accentText : kitTokens(props.theme).text};
        transition: left 0.15s;
    }
`

// footer row of a tile: status dot + text on the left, switch on the right, above a hairline
const Status = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1vw;
    margin-top: auto;
    padding-top: 0.8vh;
    border-top: 1px solid ${props => kitTokens(props.theme).hairline};
    font-size: 1.8vh;
    color: ${props => kitTokens(props.theme).text};
`

const State = styled.span`
    display: flex;
    align-items: center;
    gap: 0.6vw;
    min-width: 0;
`

const Dot = styled.span`
    flex: none;
    width: 1.1vh;
    height: 1.1vh;
    border-radius: 50%;
    background: ${props => {
        const kit = kitTokens(props.theme)
        return props.$state==='connected' ? kit.ok : props.$state==='failed' ? kit.danger : kit.accent
    }};
`

const Text = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: capitalize;
`

export const LaunchStatusIcon = ( {status}) => {


    switch (status) {
        case 'failed': return <XCircleFillIcon fill='red' size={24} />
        case 'connected': return <CheckIcon fill='green' size={24} />
        case 'connecting': return <div><Loader size={24} color='white'/></div>
        default: 
            return <Loader size={24}/>
            
    }
}


export const ConnectionStatus = ({state,disabled,footer,onUnselect,onUse})=>{

    // the toggle is on while the capability is used; switching it off unselects the capability.
    // On a switched-off (T16) tile the toggle is off; switching it on restores the remembered
    // device with no new scan (onUse). stopPropagation keeps the click from also opening the
    // device list on the tile.
    const onToggleClicked = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) {
            if (onUse)
                onUse()
        }
        else if (onUnselect)
            onUnselect()
    }

    return (
        <Status>
            <State>
                {!disabled && <Dot $state={state} data-testid='status-dot'/>}
                <Text>{disabled ? (footer ?? 'Not used') : state}</Text>
            </State>
            <Toggle
                type="button"
                role="switch"
                aria-checked={disabled ? "false" : "true"}
                aria-label="Use device"
                $on={!disabled}
                onClick={onToggleClicked}
            />

        </Status>
    )
}