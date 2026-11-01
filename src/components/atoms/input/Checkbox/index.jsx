import { EventLogger } from "gd-eventlog"
import React, { useState } from "react"
import styled from "styled-components"
import { copyPropsExcluding } from "../../../../utils/props"
import { kitTokens } from "../../../../theme"

// the switch is 1.8em x 1em, so it scales with the font size of the container
const Track = styled.button`
    position: relative;
    flex: none;
    display: inline-block;
    vertical-align: middle;
    width: 1.8em;
    height: 1em;
    padding: 0;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-size: inherit;
    margin-right: ${ props=>props.$innerMargin||'0.4vw'};
    background: ${ props => props.$on ? kitTokens(props.theme).accent : kitTokens(props.theme).switchOff};
    transition: background 0.15s;
    &:disabled { opacity: 0.5; cursor: default; }

    &::after {
        content: '';
        position: absolute;
        top: 0.12em;
        left: ${ props => props.$on ? '0.92em' : '0.12em'};
        width: 0.76em;
        height: 0.76em;
        border-radius: 50%;
        background: ${ props => props.$on ? kitTokens(props.theme).accentText : kitTokens(props.theme).text};
        transition: left 0.15s;
    }
`

const Label = styled.label`
    display: inline-block;
    align-items: center;
    vertical-align: middle;
    width: ${props => props.$width};
    margin-right: ${props => props.$before ? (props.$innerMargin||'0.4vw') : undefined};
`

const Container = styled.div`
    text-align: ${props=> props.textAlign||'left'};
    vertical-align: middle;
    font-size: ${ props=>props.fontSize}    
`

export const CheckBox = (props) => {

    const {label,onClick,onValueChange,labelPosition='after',labelWidth, innerMargin='0.4vw',disabled,onChange,noLog} = props
    const childProps = copyPropsExcluding( props, ['id','aria-label','onChange','noLog','value','checked','disabled','label','onClick','onValueChange','labelPosition','labelWidth','innerMargin'])
    const controlled = props.checked ?? props.value
    const id = props.id || `check-${label}`

    // a controlled switch shows exactly its prop; local state is only for the uncontrolled case
    const isControlled = controlled!==undefined && controlled!==null
    const [local,setLocal] = useState(false)
    const state = isControlled ? !!controlled : local
    const logger = new EventLogger('Incyclist')

    const toggle = ()=> {
        if (disabled)
            return
        const checked = !state
        if (!isControlled)
            setLocal(checked)
        if (!noLog)
            logger.logEvent( {message: 'checkbox clicked',checkbox:label,checked, eventSource:'user'})
        if (onChange) {
            // event-like object, for callers written against the native checkbox change event
            const target = { checked, value: checked, name: props.name, id }
            onChange({ target, currentTarget: target, type: 'change' })
        }
        if (onClick)
            onClick(checked)
        if (onValueChange)
            onValueChange(checked)
    }

    const onKeyDown = (e) => {
        if (e.key==='Enter' || e.key===' ') {
            e.preventDefault()
            toggle()
        }
    }
    // Space activates a button on keyup: keep the browser from sending a second click
    const onKeyUp = (e) => { if (e.key===' ') e.preventDefault() }

    return  <Container {...childProps}> 
        { (labelPosition ==='before') ? <Label $before $width={labelWidth} $innerMargin={innerMargin} htmlFor={id} >{label}</Label>:null }
        <Track type="button" role="switch" id={id} aria-checked={state} aria-label={props['aria-label']} disabled={disabled} $on={state} $innerMargin={innerMargin}
            onClick={toggle} onKeyDown={onKeyDown} onKeyUp={onKeyUp} /> 
        { (labelPosition ==='after') ? <Label $width={labelWidth} htmlFor={id} >{label}</Label>:null }

    </Container>
}
