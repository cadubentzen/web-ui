import React from 'react'
import styled from 'styled-components'
import { hudTokens } from '../../../../theme'


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
    color: ${p => hudTokens(p.theme).accent};
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
    background: ${p => (p.$current ? hudTokens(p.theme).accent : hudTokens(p.theme).track)};
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
