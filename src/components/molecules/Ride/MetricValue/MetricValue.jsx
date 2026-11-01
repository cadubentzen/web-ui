import React from 'react'
import styled, { useTheme } from 'styled-components'
import { MetricIcon } from '../../../atoms/Icons'

const FALLBACK = { warning: '#FFBF00', error: '#ff4d4d', muted: 'rgba(255,255,255,0.7)', text: '#ffffff', accent: '#e4a13c', accentText: '#1c1203' }
const tokens = theme => ({
    ...FALLBACK,
    ...(theme?.hud ?? {}),
    accent: theme?.colors?.accent ?? FALLBACK.accent,
    accentText: theme?.colors?.accentText ?? FALLBACK.accentText,
})

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    color: ${p => tokens(p.theme).text};
`
const Row = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.3em;
    font-size: ${p => p.$size};
    font-weight: 600;
    line-height: 1.1;
`
const Unit = styled.span`
    font-size: 0.45em;
    font-weight: 400;
    color: ${p => tokens(p.theme).muted};
`
const Badge = styled.span`
    font-size: 0.4em;
    font-weight: 600;
    padding: 0.1em 0.5em;
    border-radius: 1em;
    background: ${p => tokens(p.theme).accent};
    color: ${p => tokens(p.theme).accentText};
    align-self: center;
`

export const MetricValue = ({ metric, value, unit, state, badge, size = '2.4vw' }) => {
    const t = tokens(useTheme())
    const iconColor = state === 'red' ? t.error : state === 'amber' ? t.warning : t.muted
    return (
        <Wrapper>
            <MetricIcon metric={metric} color={iconColor} />
            <Row $size={size}>
                <span>{value}</span>
                {unit ? <Unit>{unit}</Unit> : null}
                {badge ? <Badge>{badge}</Badge> : null}
            </Row>
        </Wrapper>
    )
}
