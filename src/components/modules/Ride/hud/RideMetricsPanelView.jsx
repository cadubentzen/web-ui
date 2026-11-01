import React from 'react'
import styled from 'styled-components'
import { GearValue, MetricValue, ZoneGauge } from '../../../molecules'
import { hudTokens } from '../../../../theme'


// "Short stack": the panel takes the height and the width of its content (gauges + number row,
// tight spacing), centred in its layout region, so there are no empty bands at the sides or below;
// the region is only the most it may take.
// Sizes follow the smaller of width and height, so the stack fits its region at any aspect ratio.
const Panel = styled.div`
    box-sizing: border-box;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
    max-height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: min(0.4vw, 0.7vh);
    padding: min(0.5vw, 0.9vh) min(1vw, 1.8vh);
    background: ${p => hudTokens(p.theme).panel};
    border: 1px solid ${p => hudTokens(p.theme).border};
    border-radius: ${p => hudTokens(p.theme).radius};
`
const Gauges = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: min(2vw, 3.5vh);
`
// a gauge is 100 wide and 88 high
const GAUGE_SIZE = 'min(12vw, 17vh)'
const VALUE_SIZE = 'min(1.9vw, 3.4vh)'
const Row = styled.div`
    display: flex;
    padding-top: min(0.4vw, 0.7vh);
    border-top: 1px solid ${p => hudTokens(p.theme).hairline};
`
const Column = styled.div`
    flex: 1 1 0;
    display: flex;
    justify-content: center;
    padding: 0 min(0.6vw, 1vh);
`

const Gauge = ({ metric }) => (
    <ZoneGauge size={GAUGE_SIZE} metric={metric?.key} value={metric?.value} unit={metric?.unit} gauge={metric?.gauge} state={metric?.state} />
)

export const RideMetricsPanelView = ({ power, heartrate, row = [] }) => (
    <Panel data-testid="metrics-panel">
        <Gauges>
            <Gauge metric={power} />
            <Gauge metric={heartrate} />
        </Gauges>
        <Row>
            {row.map(m => (
                <Column key={m.key} data-testid="row-column">
                    {m.key === 'gear' ? (
                        <GearValue value={m.value} gearCount={m.gearCount} size={VALUE_SIZE} />
                    ) : (
                        <MetricValue metric={m.key} value={m.value} unit={m.unit} state={m.state} badge={m.badge} size={VALUE_SIZE} />
                    )}
                </Column>
            ))}
        </Row>
    </Panel>
)
