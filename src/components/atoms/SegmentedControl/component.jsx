import React from "react"
import styled from "styled-components"
import { EventLogger } from "gd-eventlog"
import { Row } from "../layout"
import { kitTokens } from "../../../theme"
import { Label } from "../input/base/EditField"

const Container = styled(Row)`
    text-align: ${props=> props.textAlign||'left'};
    align-items: center;
    padding-bottom: 1vh;
    font-size: ${props=>props.fontSize};
`

const Options = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4vw;
`

const Option = styled.button`
    border: none;
    cursor: ${props => props.disabled ? 'default' : 'pointer'};
    border-radius: 999px;
    padding: 0.3em 1.2ch;
    min-width: 3ch;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${props => props.$fontSize || '1.3vh'};
    font-family: inherit;
    line-height: 1.4;
    opacity: ${props => props.disabled ? 0.5 : 1};
    background: ${props => props.$selected ? kitTokens(props.theme).pillSelected : 'transparent'};
    color: ${props => props.$selected ? 'white' : kitTokens(props.theme).muted};

    &:hover:not(:disabled) {
        background: ${props => props.$selected ? kitTokens(props.theme).pillSelected : kitTokens(props.theme).pillHover};
    }
`

/**
 * A single row of mutually exclusive options, rendered as chips.
 *
 * Rendered as kit pills: muted text, unframed, with the pill-selected fill (white 14 %) on the chosen one.
 *
 * Options are given as `[{value, label}]` or as bare values; `value` identifies the selected one.
 */
export const SegmentedControl = (props) => {

    const {name, label, labelPosition='before', labelWidth, innerMargin='0.4vw', fontSize,
           options=[], value, disabled=false, onValueChange} = props

    const logger = new EventLogger('Incyclist')

    const id = name || `segmented-${String(label??'').trim().replace(/\s+/g,'-').toLowerCase()}`

    const normalized = options.map( o => (o!==null && typeof o === 'object') ? o : {value:o, label:String(o)} )

    const onClick = (option) => {
        if (disabled || option.value===value)
            return

        logger.logEvent({message:'option selected', field:label, value:option.value, eventSource:'user'})

        if (onValueChange)
            onValueChange(option.value)
    }

    return <Container fontSize={fontSize} textAlign={props.textAlign}>
        { labelPosition==='before' ?
            <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin} htmlFor={id}>{label}</Label>
        : null }

        <Options id={id} role='radiogroup' aria-label={label}>
            { normalized.map( option => (
                <Option key={option.value} type='button' role='radio'
                        aria-checked={option.value===value}
                        disabled={disabled}
                        $selected={option.value===value} $fontSize={fontSize}
                        onClick={ ()=>onClick(option) }>
                    {option.label}
                </Option>
            ))}
        </Options>

        { labelPosition==='after' ?
            <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin} htmlFor={id}>{label}</Label>
        : null }
    </Container>
}
