import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AppThemeProvider, kitTokens } from '../../../theme';
import { scrollbarVars } from '../../../utils/scrollbar';
import { useKey } from '../../../hooks';
import { EventLogger } from 'gd-eventlog';
import { useUnmountEffect } from '../../../hooks';

const Container = styled.div`
    position: fixed;
    z-index: ${props => props.$zIndex};
    top:0;
    bottom:0;
    left:0;
    right:0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background:none;
`

const ModalDialog = styled.div`
    text-align: left;
    padding: 0;
    margin: 0;
    height: ${props=> props.height};
    min-height:${props=> props.height};
    max-height:${props=> props.height};

    width: ${props=> props.width};
    min-width: ${props=> props.width};
    max-width: ${props=> props.width};
    border: ${props => props.theme.dialog.border || 'rgb(0,0,0) 1px solid'};
    border-radius: ${props => props.theme.dialog?.borderRadius} ;
    
    box-shadow: 5px 5px 15px 5px #000000;
    background: ${props => props.theme.dialog.background};
    color: ${props => props.theme.dialog.text};
    ${props => scrollbarVars(props.$scrollbar)}
`;

export const TitleBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1em;
    box-sizing: border-box;
    width: 100%;
    height: 6.66vh;     // 1/12 of 80%
    padding: 0 1.4vw;
    text-align: left;
    font-size:  3vh;
    font-weight: 600;
    color: ${props=>props.theme.dialog.text};
`;

const ContainerArea = styled.div`
    width: 100%;
    height: ${props => props.$fullsize ? '100%' : 'calc(100% - 6.66vh);'};
    padding:0;
`;

const Text = styled.span`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const CloseButton = styled.button`
    flex: none;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    width: 4vh;
    height: 4vh;
    padding: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    font-size: 2.2vh;
    line-height: 1;
    cursor: pointer;
    border: 1.5px solid ${props => kitTokens(props.theme).pillOutline};
    &:hover {
        background: ${props => kitTokens(props.theme).pillHover};
    }
`;

const Header = ({ title, onClose, className, dialog }) => {
    const onCloseClicked = () => {
        new EventLogger('Incyclist').logEvent({ message: 'button clicked', button: 'Close', dialog, eventSource: 'user' })
        onClose()
    }
    return (
        <TitleBar className={className}>
            <Text>{title}</Text>
            {onClose ? <CloseButton type='button' aria-label='Close' data-nav-close onClick={onCloseClicked}>{'\u2715'}</CloseButton> : null}
        </TitleBar>
    )
}

export function Title(props) {
    return <Header title={props.title} />
} 

const ESC=27

export const Dialog = (props) => {

    const logger = new EventLogger('Incyclist')

    const key = `${props.id??props.title}${Date.now()}`
    const mounted = useRef(false)

    const onOutsideClicked = () => {
        const {onOutsideClicked} = props
        if (onOutsideClicked)            
            onOutsideClicked()
    }

    // the close button calls the dialog's existing close/cancel handler
    const onClose = props.noClose ? undefined : (props.onClose ?? props.onCancel ?? props.onESC)

    const hasHeader = Boolean(props.title) || Boolean(onClose)

    const onEscapePressed = () => {
        const {onESC} = props
        
        if (!onESC)
            return;

        logger.logEvent({message:'key pressed', key:'Escape', eventSource: 'user' })

        return onESC()
    }


    useEffect( ()=>{

        if (!mounted.current) {
            let dialog = props.id??props.title
            const additionalLogs = props.log || {}
        
            if (dialog) {
                logger.logEvent({message:'Dialog shown',dialog, ...additionalLogs})
                logger.set({dialog})
            }
        }

        mounted.current = true
    })

    useEffect( ()=>{
        const prev = window.activeDialog
        window.activeDialog = key
        return ()=> {
            window.activeDialog = prev
        }
    })

    useUnmountEffect( ()=>{

        let dialog = props.id??props.title
        const additionalLogs = props.log || {}
        if (dialog) {
            logger.logEvent({message:'Dialog closed',dialog, ...additionalLogs})
            logger.set({dialog:null})
        }
    },[])

    useKey(ESC,onEscapePressed,{propagate:false,enableDialog:props.onESC!==undefined, dialog:key})

    const zIndex = props.level!==undefined ?  (props.level+1)*10: props.zIndex || 10;
    const level = (props.level || zIndex/10)-1;       
    const height = props.height || `${80-4*level}%`;
    const width = props.width ||  `${80-4*level}%`
    // dialogs are used at the PC, so they get the compact scrollbar - unless they are opened while
    // the user is on the bike
    const scrollbarVariant = props.scrollbar ?? 'compact'

    if ( !props.flex) {
        return (
            <AppThemeProvider>
                <Container $zIndex={zIndex} onClick={onOutsideClicked}>
                <ModalDialog className='dialog'  onClick={(e)=>e.stopPropagation()}
                    width={width} height={height} $scrollbar={scrollbarVariant}>
    
                    {hasHeader && <Header className='title-bar' title={props.title} onClose={onClose} dialog={props.id??props.title}/>}
                    
                    <ContainerArea $fullsize={props.fullsize || !hasHeader} className='dialog-content'>
                        {props.children}
                    </ContainerArea>
                </ModalDialog>
                </Container>
            </AppThemeProvider>
        )    
    }
    else {
        return ( 
            <AppThemeProvider>
                <Container $zIndex={zIndex} onClick={onOutsideClicked}>
                <ModalDialog  className='dialog flex' onClick={(e)=>e.stopPropagation()}
                    width={width} height={height} $scrollbar={scrollbarVariant}>
                
                    <ContainerArea  $fullsize={!hasHeader} className='dialog-content'>
                        {hasHeader && <Header className='title-bar' title={props.title} onClose={onClose} dialog={props.id??props.title}/>}
                        {props.children}
                    </ContainerArea>
                </ModalDialog>                
                </Container>
            </AppThemeProvider>
        )
    }

}

