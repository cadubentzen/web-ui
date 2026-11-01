import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Row as BaseRow } from "../../../atoms"
import { WorkoutButton } from '../../../molecules/Buttons'
import { hudTokens } from '../../../../theme'
import { PinIcon, PinSlashIcon } from '@primer/octicons-react'
import { SHIFTING_REGION } from '../../Ride/layoutConstants'

export const ROW_GAP = '0.4vw'
// square buttons: 5 must fit the slot width (less 4 gaps) and its height
export const BUTTON_BOX = `min(${SHIFTING_REGION.height * 0.9}vh, calc((${SHIFTING_REGION.width}vw - 4 * ${ROW_GAP}) / 5))`

const Row = styled(BaseRow)`
    align-items: center;
    gap: ${ROW_GAP};
`

export const ShiftingControl = ( {
    onPowerUp, onPowerDown,
    showHotkeys,
    pinned, onPin, onUnpin,
    justify,
    }) => {

    const onInc = (val) => {
        if (onPowerUp)
            onPowerUp(val)
    }
    const onDec = (val) => {
        if (onPowerDown)
            onPowerDown(val)
    }

    const theme = useContext(ThemeContext)
    const { panel, border, accent } = hudTokens(theme)

    const common = {size:20, boxSize:BUTTON_BOX, color:accent, background:panel, borderColor:border, $radius:'50%', opacity:1, showHotkey:showHotkeys}

    return (
        <Row justify={justify}>
            <WorkoutButton {...common} id='dec5' hotkey='Shift+↓' text='-5' onClick={()=>onDec(5)}/>
            <WorkoutButton {...common} id='dec1' hotkey='↓' text='-1'onClick={()=>onDec(1)}/>
            <WorkoutButton {...common} id='inc1' hotkey='↑' text='+1' onClick={()=>onInc(1)}/>
            <WorkoutButton {...common} id='inc5' hotkey='Shift+↑' text='+5' onClick={()=>onInc(5)}/>
            {pinned ? 
                <WorkoutButton {...common} id='unpin' onClick={onUnpin}><PinSlashIcon/></WorkoutButton> :
                <WorkoutButton {...common} id='pin' onClick={onPin}><PinIcon/></WorkoutButton>
            }
            
        </Row>
            
    )
}

