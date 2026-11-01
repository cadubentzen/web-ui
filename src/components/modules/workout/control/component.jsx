import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { WorkoutButton } from '../../../molecules/Buttons'
import { hudTokens } from '../../../../theme'
import { RIGHT_COLUMN_WIDTH } from '../../Ride/layoutConstants'
import { CircleSlashIcon, MoveToEndIcon, MoveToStartIcon, PinIcon, PinSlashIcon } from '@primer/octicons-react'


// Below the workout panel (see WorkoutPanelView), with the same surface. It hides itself after a
// few seconds (AutoHide), so the panel can't rely on it as its bottom: both are complete cards.
// Fills its layout region (right column width x 11vh): two rows of buttons sized from the region.
const Bar = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.8vh;
    width: 100%;
    height: 100%;
    padding: 0.6vh 0.6vw;
    background: ${p => p.$t.panel};
    border: 1px solid ${p => p.$t.border};
    border-radius: ${p => p.$t.radius};
`

export const ROW_GAP = '0.4vw'
// square buttons: 5 per row must fit the region width (19.1vw less padding 1.2vw and 4 gaps),
// two rows plus the gap and padding must fit its 11vh height
export const BUTTON_BOX = `min(3.2vw, 4.2vh, calc((${RIGHT_COLUMN_WIDTH}vw - 1.2vw - 4 * ${ROW_GAP}) / 5))`

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${ROW_GAP};
`

export const WorkoutControl = ( {
    onBackward, onForward, onStop, onPowerUp, onPowerDown,
    showHotkeys,
    pinned, onPin, onUnpin,
    mode,onToggleMode,
    loadButtons, loadButtonMode
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
    const t = hudTokens(theme)
    const accent = t.accent

    const common = {size:20, boxSize:BUTTON_BOX, color:t.text, background:'transparent', borderColor:t.hairline, opacity:1, showHotkey:showHotkeys}
    const adjust = {...common, color:accent, borderColor:accent}

    // FIXES_BACKLOG #37: in SIM/Resistance mode with virtual shifting disabled, the load buttons
    // are meaningless (no gear concept, no power target to nudge) - hide just the four load
    // buttons, keep back/forward/stop/mode-toggle/pin visible.
    const showLoadButtons = loadButtonMode!=='hidden'

    return (
        <Bar $t={t}>
            <Row data-testid='workout-control-row'>
            <WorkoutButton {...common} id='back' aria-label='Previous step' hotkey='←' onClick={onBackward}><MoveToStartIcon/></WorkoutButton>
            <WorkoutButton {...common} id='forward' aria-label='Next step' hotkey='→' onClick={onForward}><MoveToEndIcon/></WorkoutButton>
            <WorkoutButton {...common} id='stop' aria-label='Stop workout' hotkey='#' onClick={onStop}><CircleSlashIcon/></WorkoutButton>
            {mode?<WorkoutButton {...common} id='mode' hotkey='C' onClick={onToggleMode} text={mode}/>:null}
            {pinned ?
                <WorkoutButton {...common} id='unpin' aria-label='Unpin' onClick={onUnpin}><PinSlashIcon/></WorkoutButton> :
                <WorkoutButton {...common} id='pin' aria-label='Pin' onClick={onPin}><PinIcon/></WorkoutButton>
            }
            </Row>
            <Row data-testid='workout-control-row'>
            {showLoadButtons && <WorkoutButton {...adjust} id='inc5' hotkey='Shift+↑' text={loadButtons?.inc5 ?? '+5%'} onClick={()=>onInc(5)}/>}
            {showLoadButtons && <WorkoutButton {...adjust} id='inc1' hotkey='↑' text={loadButtons?.inc1 ?? '+1%'} onClick={()=>onInc(1)}/>}
            {showLoadButtons && <WorkoutButton {...adjust} id='dec1' hotkey='↓' text={loadButtons?.dec1 ?? '-1%'}onClick={()=>onDec(1)}/>}
            {showLoadButtons && <WorkoutButton {...adjust} id='dec5' hotkey='Shift+↓' text={loadButtons?.dec5 ?? '-5%'} onClick={()=>onDec(5)}/>}
            </Row>
        </Bar>

    )
}

