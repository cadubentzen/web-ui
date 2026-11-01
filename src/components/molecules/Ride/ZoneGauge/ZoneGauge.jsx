import React from 'react'
import styled, { useTheme } from 'styled-components'
import { MetricIcon } from '../../../atoms/Icons'
import { arcPath, polar, valueToAngle } from './geometry'

const FALLBACK = { text: '#ffffff', muted: 'rgba(255,255,255,0.7)', track: 'rgba(255,255,255,0.15)' }
const tokens = theme => ({ ...FALLBACK, ...(theme?.hud ?? {}) })

const CX = 50
const CY = 50
const R = 40
const WIDTH = 7
const GAP = 0.8

const Wrapper = styled.div`
    position: relative;
    width: ${p => p.$size};
    aspect-ratio: 100 / 88;
`
const Arc = styled.svg`
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
`
const Centre = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: ${p => p.$size};
`
const Value = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.3em;
    font-size: 0.2em;
    font-weight: 600;
    line-height: 1.1;
    color: ${p => tokens(p.theme).text};
`
const Unit = styled.span`
    font-size: 0.45em;
    font-weight: 400;
    color: ${p => tokens(p.theme).muted};
`
const ZoneName = styled.span`
    font-size: 0.1em;
    font-weight: 600;
    color: ${p => p.$color};
`

const toNumber = value => {
    const n = parseFloat(value)
    return Number.isFinite(n) ? n : undefined
}

const needlePath = angle => {
    const [x0, y0] = polar(CX, CY, R - 13, angle)
    const [x1, y1] = polar(CX, CY, R + 5, angle - 4)
    const [x2, y2] = polar(CX, CY, R + 5, angle + 4)
    return `M${x0.toFixed(2)},${y0.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} Z`
}

const tick = (angle, key) => {
    const [x1, y1] = polar(CX, CY, 44, angle)
    const [x2, y2] = polar(CX, CY, 51, angle)
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="1.6" />
}

export const ZoneGauge = ({ metric, value, unit, gauge, size = '13vw' }) => {
    const t = tokens(useTheme())
    const { min = 0, max = 1, zones, zone, target } = gauge ?? {}
    const hasZones = Array.isArray(zones) && zones.length > 0
    const num = toNumber(value)
    const zoneItem = hasZones && zone !== undefined ? zones[zone] : undefined

    const angle = v => valueToAngle(v, min, max)
    const startAngle = angle(min)
    const endAngle = angle(max)

    return (
        <Wrapper $size={size}>
            <Arc viewBox="0 0 100 88">
                {hasZones ? (
                    zones.map((z, i) => (
                        <path
                            key={i}
                            data-testid="segment"
                            d={arcPath(CX, CY, R, angle(z.from) + (i ? GAP : 0), angle(z.to) - GAP)}
                            stroke={z.color}
                            strokeOpacity="0.95"
                            strokeWidth={WIDTH}
                            fill="none"
                        />
                    ))
                ) : (
                    <path
                        data-testid="track"
                        d={arcPath(CX, CY, R, startAngle, endAngle)}
                        stroke={t.track}
                        strokeWidth={WIDTH}
                        strokeLinecap="round"
                        fill="none"
                    />
                )}
                {target ? (
                    <g data-testid="target">
                        <path d={arcPath(CX, CY, 47.5, angle(target.min), angle(target.max))} stroke="#fff" strokeWidth="2.4" fill="none" />
                        {tick(angle(target.min), 'min')}
                        {tick(angle(target.max), 'max')}
                    </g>
                ) : null}
                {num !== undefined && gauge ? (
                    <path data-testid="needle" d={needlePath(angle(num))} fill={t.text} stroke="#000" strokeOpacity="0.4" strokeWidth="0.6" />
                ) : null}
            </Arc>
            <Centre $size={size}>
                <MetricIcon metric={metric} color={t.muted} />
                <Value>
                    <span>{value}</span>
                    {unit ? <Unit>{unit}</Unit> : null}
                </Value>
                {zoneItem ? (
                    <ZoneName data-testid="zone-name" $color={zoneItem.color}>
                        {zoneItem.name}
                    </ZoneName>
                ) : null}
            </Centre>
        </Wrapper>
    )
}
