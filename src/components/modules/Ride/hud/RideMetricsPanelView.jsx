import React from 'react'
import styled from 'styled-components'
import { GearValue, MetricValue, ZoneGauge } from '../../../molecules'

const FALLBACK = {
    panel: 'linear-gradient(rgba(56,1,31,0.72), rgba(26,4,86,0.72))',
    border: 'rgba(255,255,255,0.16)',
    hairline: 'rgba(255,255,255,0.18)',
    radius: '0.9vw',
}
const tokens = theme => ({ ...FALLBACK, ...(theme?.hud ?? {}) })

const Panel = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 0.6vw 1vw;
    background: ${p => tokens(p.theme).panel};
    border: 1px solid ${p => tokens(p.theme).border};
    border-radius: ${p => tokens(p.theme).radius};
`
const Gauges = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
`
const Row = styled.div`
    display: flex;
    padding-top: 0.6vw;
    border-top: 1px solid ${p => tokens(p.theme).hairline};
`
const Column = styled.div`
    flex: 1 1 0;
    display: flex;
    justify-content: center;
`

const Gauge = ({ metric }) => (
    <ZoneGauge metric={metric?.key} value={metric?.value} unit={metric?.unit} gauge={metric?.gauge} />
)

export const RideMetricsPanelView = ({ power, heartrate, row = [] }) => (
    <Panel>
        <Gauges>
            <Gauge metric={power} />
            <Gauge metric={heartrate} />
        </Gauges>
        <Row>
            {row.map(m => (
                <Column key={m.key} data-testid="row-column">
                    {m.key === 'gear' ? (
                        <GearValue value={m.value} gearCount={m.gearCount} />
                    ) : (
                        <MetricValue metric={m.key} value={m.value} unit={m.unit} state={m.state} badge={m.badge} />
                    )}
                </Column>
            ))}
        </Row>
    </Panel>
)
