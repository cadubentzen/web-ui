import React from 'react'
import styled from 'styled-components'
import { MetricIcon } from '../../../atoms/Icons'
import { hudTokens } from '../../../../theme'


// takes the height of its rows (time, distance and - on routes - elevation); the layout region
// is only the most it may take
const Panel = styled.div`
    box-sizing: border-box;
    width: 100%;
    max-height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 1.6vh;
    padding: 1.4vh 1vw;
    background: ${p => hudTokens(p.theme).panel};
    border: 1px solid ${p => hudTokens(p.theme).border};
    border-radius: ${p => hudTokens(p.theme).radius};
    color: ${p => hudTokens(p.theme).text};
`
const Row = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4vw;
`
const Line = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6vw;
`
const Elapsed = styled.span`
    font-size: 1.8vw;
    font-weight: 600;
    color: ${p => hudTokens(p.theme).text};
`
const Unit = styled.span`
    font-size: 0.45em;
    margin-left: 0.3vw;
    color: ${p => hudTokens(p.theme).muted};
`
const Remaining = styled(Elapsed)`
    margin-left: auto;
    font-weight: 400;
    color: ${p => hudTokens(p.theme).muted};
`
const Track = styled.div`
    height: 0.35vw;
    border-radius: 0.2vw;
    background: ${p => hudTokens(p.theme).track};
    overflow: hidden;
`
const Fill = styled.div`
    height: 100%;
    background: ${p => hudTokens(p.theme).accent};
`

// time is 'h:mm:ss' or 'm:ss', distance a plain number
const parseAmount = (metric, text) => {
    if (text === undefined || text === null) return undefined
    const s = String(text).trim().replace(/^[-−]/, '')
    if (metric === 'time')
        return /^\d+(:\d{2}){1,2}$/.test(s) ? s.split(':').reduce((acc, part) => acc * 60 + Number(part), 0) : undefined
    return /^\d+(\.\d+)?$/.test(s) ? Number(s) : undefined
}

const progress = (metric, { value, remaining }) => {
    const done = parseAmount(metric, value)
    const left = parseAmount(metric, remaining)
    if (done === undefined || left === undefined || done + left <= 0) return undefined
    return Math.min(100, Math.max(0, (done / (done + left)) * 100))
}

const ProgressRow = ({ metric, item }) => {
    const pct = progress(metric, item ?? {})
    return (
        <Row>
            <Line>
                <MetricIcon metric={metric} />
                <Elapsed>
                    {item?.value ?? '–'}
                    {item?.unit ? <Unit>{item.unit}</Unit> : null}
                </Elapsed>
                {item?.remaining ? (
                    <Remaining>
                        {item.remaining}
                        {item?.unit ? <Unit>{item.unit}</Unit> : null}
                    </Remaining>
                ) : null}
            </Line>
            {pct !== undefined ? (
                <Track>
                    <Fill data-testid="progress" style={{ width: `${pct}%` }} />
                </Track>
            ) : null}
        </Row>
    )
}

export const RideProgressPanelView = ({ time, distance, elevation }) => (
    <Panel>
        <ProgressRow metric="time" item={time} />
        <ProgressRow metric="distance" item={distance} />
        {elevation ? <ProgressRow metric="elevation" item={elevation} /> : null}
    </Panel>
)
