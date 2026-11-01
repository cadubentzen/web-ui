import React, { useState } from 'react'
import styled from "styled-components";
import {Autosize, Icon, Loader} from '../../../atoms'
import { Panel } from '../../../atoms/Panel'
import { kitTokens } from '../../../../theme'
import { TrashIcon } from '@primer/octicons-react';
import { sleep } from '../../../../utils/coding';

export const Container = styled(Panel)`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.2vw;
    box-sizing: border-box;
    width: 100%;
    height: ${props => props.height || '8vh'};
    min-height: 56px;
    margin-bottom: 0.8vh;
    padding: 0.6vh 1vw 0.6vh 0.6vh;
    color: ${props => kitTokens(props.theme).pillSelectedText};
    cursor: pointer;
    user-select: none;
    transition: border-color 0.15s, background 0.15s;

    &:hover, &:focus-within {
        border-color: ${props => kitTokens(props.theme).accent};
        background-image: linear-gradient(${props => kitTokens(props.theme).pillHover}, ${props => kitTokens(props.theme).pillHover});
    }
`

export const ImageContainer = styled.div`
    position: relative;
    height: 100%;
    flex: 0 0 auto;
    aspect-ratio: 235 / 132;
    overflow: hidden;
    border-radius: ${props => kitTokens(props.theme).field.radius};
    background: ${props => kitTokens(props.theme).panel.band};
    user-select: none;
    pointer-events: none;
`

export const Image = styled.img`
    width: ${props => props.width};
    height: ${props => props.height};
    
    color: ${props => props.color};
    user-select: none;
    pointer-events: none;
`

export const Identity = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.4vh;
    flex: 1 1 auto;
    min-width: 0;
`

export const Title = styled.div`
    font-size: 2.4vh;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

export const Meta = styled.div`
    font-size: 1.7vh;
    color: ${props => kitTokens(props.theme).muted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

export const Stats = styled.div`
    display: flex;
    flex: 0 0 auto;
    gap: 2vw;
`

export const Stat = styled.div`
    min-width: 7ch;
    text-align: right;
`

export const StatValue = styled.div`
    font-size: 2.2vh;
    font-weight: 600;
    white-space: nowrap;
`

export const StatLabel = styled.div`
    font-size: 1.4vh;
    color: ${props => kitTokens(props.theme).muted};
`

export const DeleteSlot = styled.div`
    flex: 0 0 auto;
    width: 4.4vh;
    display: flex;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s;
    ${Container}:hover &, ${Container}:focus-within & { opacity: 1; }
`

export const SizedIcon = ({width,height,logContext,onClick})=> {
    if (width===undefined || height===undefined)
        return null;

    const size = height

    //return <TrashIcon verticalAlign="middle"  size={size} i={4}/>

    return  (
    <Icon id='delete' margin={'-2vh 0 0 0 '} padding={'5px' } size={size} width={`${size+10}px`} height={`${size+10}px`} onClick={onClick} logContext={logContext}>
        <TrashIcon verticalAlign="middle"/>
    </Icon>
)}

export const DeleteIcon = ({visible, onClick,logContext}) => {

    const [loading,setLoading] = useState(false)

    if (!visible)
        return null

    const onClickHandler = async (...args) =>{

        
        setLoading(true)
        if (typeof onClick==='function')
            await onClick(...args)
        else 
            await sleep(500)
        setLoading(false)
    }


    return (
    <Autosize width='3vw' height='3vh' >
        {loading ? <Loader/> : <SizedIcon onClick={onClickHandler} logContext={logContext}/>}
    </Autosize>    
)}