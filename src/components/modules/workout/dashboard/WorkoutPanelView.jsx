import React, { useContext } from 'react'
import styled, { keyframes, ThemeContext } from 'styled-components'

import { ErrorBoundary } from '../../../atoms'
import { MetricIcon } from '../../../atoms/Icons'
import { WorkoutGraph } from '../../../molecules'
import { formatTargets } from './formatTargets'
import { hudTokens } from '../../../../theme'


const tickPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.18); }
  100% { transform: scale(1); }
`
const stepFlash = keyframes`
  0% { background-color: rgba(255, 221, 0, 0.65); }
  100% { background-color: transparent; }
`

const Panel = styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.6vh;
    width: 100%;
    height: 100%;
    padding: 1vh 1vw;
    z-index: ${p => p.$zIndex ?? 10};
    background: ${p => p.$t.panel};
    color: ${p => p.$t.text};
    border: 1px solid ${p => p.$t.border};
    border-radius: ${p => p.$t.radius};
    text-align: left;
`
const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5vw;
`
const Title = styled.div`
    color: ${p => p.$t.accent};
    font-weight: 600;
    font-size: 2vh;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
const Ftp = styled.div`
    color: ${p => p.$t.muted};
    font-size: 1.3vh;
    white-space: nowrap;
`
const StepTime = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4vw;
    font-size: 3.2vh;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    animation-name: ${p => p.$pulse === 'tick' ? tickPulse : p.$pulse === 'flash' ? stepFlash : 'none'};
    animation-duration: ${p => p.$pulse === 'flash' ? '0.5s' : '0.3s'};
    animation-timing-function: ease-in-out;
`
const Track = styled.div`
    height: 0.7vh;
    border-radius: 0.4vh;
    background: ${p => p.$t.track};
    overflow: hidden;
`
const Fill = styled.div`
    height: 100%;
    width: ${p => p.$pct}%;
    background: ${p => p.$t.accent};
`
const GraphBox = styled.div`
    flex: 1;
    min-height: 6vh;
    border-top: 1px solid ${p => p.$t.hairline};
    border-bottom: 1px solid ${p => p.$t.hairline};
    padding: 0.4vh 0;
`
const TargetRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6vw;
    font-size: 2.4vh;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
`
const Unit = styled.span`
    color: ${p => p.$t.muted};
    font-size: 0.6em;
    font-weight: 400;
`

const pad = n => String(n).padStart(2, '0')
export const formatStepTime = seconds => {
    if (seconds === undefined || seconds === null)
        return undefined
    const total = Math.max(0, Math.round(seconds))
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const progressPct = ({ duration, remaining } = {}) => {
    if (!duration || remaining === undefined || remaining === null)
        return 0
    return Math.round(Math.min(100, Math.max(0, ((duration - remaining) / duration) * 100)))
}

const Target = ({ metric, target, t }) => (
    <TargetRow>
        <MetricIcon metric={metric} size="2.4vh" color={t.accent} />
        <span>{target.value ?? '–'}</span>
        {target.unit && <Unit $t={t}>{target.unit}</Unit>}
    </TargetRow>
)

export const WorkoutPanelView = ({ title, current, workout, start, stop, ftp, stepPulse, zIndex, id }) => {
    const t = hudTokens(useContext(ThemeContext))

    if (!workout)
        return null

    const targets = formatTargets(current)
    const hasFtp = ftp !== undefined && ftp !== null && ftp !== -1
    const hasHr = targets.hrm.value !== undefined

    return (
        <ErrorBoundary hideOnError>
            <Panel id={id} className='workout-panel' $t={t} $zIndex={zIndex}>
                <Header>
                    <Title $t={t}>{title ?? workout?.name ?? 'Workout'}</Title>
                    {hasFtp && <Ftp $t={t}>{`FTP ${Number(ftp).toFixed(0)}`}</Ftp>}
                </Header>
                <StepTime key={stepPulse?.ts} $pulse={stepPulse?.type}>
                    <MetricIcon metric="time" size="2.6vh" color={t.muted} />
                    <span>{formatStepTime(current?.remaining) ?? '–'}</span>
                </StepTime>
                <Track $t={t} role="progressbar" aria-label="step progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct(current)}>
                    <Fill $t={t} $pct={progressPct(current)} />
                </Track>
                <GraphBox $t={t}>
                    <WorkoutGraph dashboard={true} scheme='dark' ftp={ftp} start={start} stop={stop} position={[{ x: current?.time }]} workout={workout} />
                </GraphBox>
                <Target metric="power" target={targets.power} t={t} />
                {hasHr && <Target metric="heartrate" target={targets.hrm} t={t} />}
                <Target metric="cadence" target={targets.cadence} t={t} />
            </Panel>
        </ErrorBoundary>
    )
}

export default WorkoutPanelView
