import React from 'react'
import styled from 'styled-components'

const FALLBACK_ACCENT = '#e4a13c'
const FALLBACK_TRACK = 'rgba(255,255,255,0.15)'
const accent = theme => theme?.colors?.accent ?? FALLBACK_ACCENT
const track = theme => theme?.hud?.track ?? FALLBACK_TRACK

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2em;
`
const Value = styled.span`
    font-size: ${p => p.$size};
    font-weight: 600;
    line-height: 1.1;
    color: ${p => accent(p.theme)};
`
const Strip = styled.div`
    display: flex;
    gap: 0.12vw;
    align-items: flex-end;
    height: 0.8vw;
`
const Mark = styled.span`
    width: 0.2vw;
    height: ${p => (p.$current ? '100%' : '55%')};
    border-radius: 1px;
    background: ${p => (p.$current ? accent(p.theme) : track(p.theme))};
`

export const GearValue = ({ value, gearCount, size = '2.4vw' }) => {
    const n = /^\d+$/.test(String(value)) ? Number(value) : NaN
    const showStrip = gearCount > 0 && n >= 1 && n <= gearCount
    return (
        <Wrapper>
            <Value $size={size}>{value}</Value>
            {showStrip ? (
                <Strip>
                    {Array.from({ length: gearCount }, (_, i) => (
                        <Mark
                            key={i}
                            data-testid="gear-mark"
                            $current={i === n - 1}
                            aria-current={i === n - 1 ? 'true' : undefined}
                        />
                    ))}
                </Strip>
            ) : null}
        </Wrapper>
    )
}
