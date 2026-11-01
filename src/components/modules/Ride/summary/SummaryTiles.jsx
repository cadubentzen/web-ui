import React from 'react'
import styled from 'styled-components'
import { Panel } from '../../../atoms/Panel'
import { kitTokens } from '../../../../theme'
import { timeFormat } from '../../../../utils/formatting'

const MISSING = '–'

const Tiles = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1vw;
    flex: none;
`

const Tile = styled(Panel)`
    padding: 1.2vh 1vw;
    min-width: 0;
    text-align: left;
`

const Value = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.3em;
    font-size: 2.8vh;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const Unit = styled.span`
    font-size: 0.6em;
    font-weight: 400;
    color: ${props => kitTokens(props.theme).muted};
`

const Label = styled.div`
    margin-top: 0.4vh;
    font-size: 1.5vh;
    color: ${props => kitTokens(props.theme).muted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v)

// services deliver distance (and may deliver other values) as { value, unit }, the stats as plain numbers
const formatted = (v, unit, digits = 0) => {
    if (v?.value !== undefined && v?.unit)
        return isNumber(Number(v.value)) ? { value: `${v.value}`, unit: v.unit } : undefined
    return isNumber(v) ? { value: v.toFixed(digits), unit } : undefined
}

const getTiles = (activity) => {
    const { time, distance, stats } = activity ?? {}
    const heartrate = stats?.hrm?.avg
    return [
        { label: 'Time', item: isNumber(time) ? { value: timeFormat(time) } : undefined },
        { label: 'Distance', item: isNumber(distance) ? formatted(distance / 1000, 'km', 1) : formatted(distance) },
        { label: 'Avg power', item: formatted(stats?.power?.avg, 'W') },
        // no heart rate sensor: services report an average of 0
        { label: 'Avg heart rate', item: heartrate?.value !== undefined || heartrate > 0 ? formatted(heartrate, 'bpm') : undefined },
    ]
}

/** The activity at a glance: time, distance, average power and heart rate; `–` when a value is missing. */
export const SummaryTiles = ({ activity }) => (
    <Tiles className='activity-summary-tiles'>
        {getTiles(activity).map(({ label, item }) => (
            <Tile key={label} data-testid='summary-tile'>
                <Value data-testid='tile-value'>
                    <span>{item?.value ?? MISSING}</span>
                    {item?.unit ? <Unit>{item.unit}</Unit> : null}
                </Value>
                <Label data-testid='tile-label'>{label}</Label>
            </Tile>
        ))}
    </Tiles>
)
