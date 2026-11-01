import React from 'react'
import styled from 'styled-components'
import { Dialog } from '../../Dialog'
import { Button, ButtonBar } from '../../../atoms'

const Text = styled.div`
    textAlign:'left',
    

`
const Body = styled.div`
    display: flex;
    flex-direction: column;
    margin:auto;
    padding: 0.5vh 1.4vw;
    top:0;
    left:0;
    height: calc(100% - 7.7vh);
    justify-content:${props => props.$verticallyCentered ? 'center' : undefined};
    text-align: ${props => props.$horizontallyCentered ? 'center' : 'left'};

`;

export const MessageBox = (props) => {

    const { yes='Yes', no='No', defaultButton='Yes', text, children, width, height='25vh',level=12, onYes , onNo, title,id, noYes, noNo, center, destructive} = props

    const onOKHandler = () => {
        if (onYes)
            onYes()
    }

    const onCancelHandler = () => {
        if (onNo)
            onNo()
    }

    return( 
        <Dialog id={id??title??'MessageBox'} width={width} height={height} level={level} title={title} onESC={onCancelHandler} noClose={noNo && noYes}>

            <Body className='message-body' 
                $verticallyCentered={children===undefined || center }
                $horizontallyCentered={children===undefined && center }>
                {text? <Text>{text}</Text> : null}
                {children}
            </Body>

            <ButtonBar className='message-buttons' justify='flex-end'>

                    {noYes ? null : <Button text={yes} default={defaultButton===yes} data-nav-default={defaultButton===yes ? '' : undefined} variant={destructive ? 'danger' : undefined} margin={destructive ? '0 auto 0 1.4vw' : undefined} onClick={onOKHandler}/>}
                    {noNo  ? null : <Button text={no} default={defaultButton===no} data-nav-default={defaultButton===no ? '' : undefined} margin='0 1.4vw 0 1vw' onClick={onCancelHandler}/>}

            </ButtonBar>
        </Dialog>
    )
}

