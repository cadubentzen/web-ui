import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components'
import { RiderInfo } from '../../../../molecules/Ride/RiderInfo/rider-info';
import { Dynamic, ErrorBoundary } from '../../../../atoms';
import { copyPropsExcluding } from '../../../../../utils/props';
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

export const NearbyRidersView = ( {activeRides=[],title,width}) => {

    const t = hudTokens(useContext(ThemeContext))

    // rows sit on the panel itself, the user's own row is highlighted in the accent colour
    const list = activeRides.map( item => ({
        ...item,
        backgroundColor: 'transparent',
        textColor: item.isUser ? t.accent : t.text,
    }))

    if (list.length===0) 
        return null;

    return (
        <ErrorBoundary hideOnError>
            <PanelArea width={width}> 
                <Title>{title??'Incyclists Nearby'}</Title>
                {list.map((item,index) => <RiderInfo {...item} key={index}/>)}
            </PanelArea>
        </ErrorBoundary>
    );

}

export class NearbyRiders extends React.Component { 



    shouldComponentUpdate( nextProps) {
        return (nextProps.observer!==this.props.observer )
    }

    render() {

        const props = copyPropsExcluding(this.props, ['observer'])
        const {observer} = this.props??{}
        if (!observer)
            return null;

        return <Dynamic observer={observer} event='update' prop='activeRides'>
            <NearbyRidersView {...props} activeRides={[]} />
        </Dynamic>

    }
}

