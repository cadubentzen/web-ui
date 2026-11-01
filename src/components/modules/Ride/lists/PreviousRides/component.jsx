import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components'

import { PrevRideInfo } from '../../../../molecules/Ride/PrevRideInfo/component';
import { ErrorBoundary } from '../../../../atoms';
import { hudTokens } from '../../../../../theme'


const PanelArea = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: ${props => props.width || '100%'};
    max-height: 100%;
    overflow: hidden;
    padding: 0.4vw 0.8vw;
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
    color: ${p => hudTokens(p.theme).text};
    background: ${p => hudTokens(p.theme).panel};
    border: 1px solid ${p => hudTokens(p.theme).border};
    border-radius: ${p => hudTokens(p.theme).radius};
`;

const Title = styled.div `
    flex: none;
    padding: 0.2vw 0 0.3vw;
    text-align: left;
    font-size: 1.3vh;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    color: ${p => hudTokens(p.theme).muted};
`
export const PrevRides = (props) => {

    const t = hudTokens(useContext(ThemeContext))
    const {rides=[], title='Previous Rides',width} = props??{}

    // rows sit on the panel itself, the current ride is highlighted in the accent colour
    const list = rides.map( item => ({
        ...item,
        backgroundColor: 'transparent',
        textColor: item.title==='current' ? t.accent : t.text,
    }))

    if (!list.length) 
        return null

    return (
        <ErrorBoundary hideOnError>
            <PanelArea width={width}> 
                <Title>{title??'Previous Rides'}</Title>
                {list.map((item,index) => <PrevRideInfo {...item} key={index}/>)}
            </PanelArea>
        </ErrorBoundary>
    );

}
