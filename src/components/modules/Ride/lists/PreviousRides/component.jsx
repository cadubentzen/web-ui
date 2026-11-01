import React from 'react';
import styled from 'styled-components'

import AppTheme from '../../../../../theme';
import { PrevRideInfo } from '../../../../molecules/Ride/PrevRideInfo/component';
import { ErrorBoundary } from '../../../../atoms';

const PanelArea = styled.div`
    display: flex;
    flex-direction: column;
    width: ${props => props.width || '100%'};
    height: ${props => props.max ? `${props.max*4+2}vh`:'6vh' };
    z-index: ${props => props.zIndex!==undefined?  props.zIndex : 10};
    color: ${props => props.textColor || 'black'};
    background-color: ${props => props.backgroundColor || 'lightgrey'};
`;

const Title = styled.div `	
    height: 3vh;
    width: 100%;
    text-align: left;
    font-family: "Roboto", "Arial", sans-serif, bold;
    font-size: 2vh;
    text-align: center;
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    background-color: ${props => props.$headerBackground};
    color: ${props => props.$headerText};
`
export const PrevRides = (props) => {

    const listTheme = AppTheme.get().list
    const {rides=[], title='Previous Rides',max=10,width, backgroundColors=['black','#363636'], textColors=['white']} = props??{}

    const prepareList = () =>{ 
        try{

            const list = rides.map( (item,idx) => {
                if ( !item.backgroundColor) item.backgroundColor = textColors && textColors.length>0 ? backgroundColors[idx % backgroundColors.length] : 'lightgrey';
                if ( !item.textColor) item.textColor = textColors && textColors.length>0  ? textColors[idx % textColors.length] : 'black';

                if (item.title==='current') {
                    item.backgroundColor = listTheme.selected.background;
                    item.textColor = 'black'
                }
                return item;
            })
            return list;
        }
        catch(err) {
            console.log('# error',err)
            return []
        }
    }

    const list = prepareList();
    
    if (!list?.length) 
        return null


    const listSize = Math.min(max,list.length);

    return (
        <ErrorBoundary hideOnError>
            <PanelArea width={width} max={listSize}> 
                <Title $headerBackground={listTheme.header.background} $headerText={listTheme.header.text}>{title??'Previous Rides'}</Title>
                {list.map((item,index) => <PrevRideInfo {...item} key={index}/>)}
            </PanelArea>
        </ErrorBoundary>
    );

}
