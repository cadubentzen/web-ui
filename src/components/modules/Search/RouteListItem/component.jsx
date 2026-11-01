import React from 'react'
import styled from 'styled-components'
import { Panel } from '../../../atoms/Panel'
import { RouteTileSummaryView } from '../RouteTileSummary/component'

const Skeleton = styled(Panel)`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 84px;
    flex: 0 0 84px;
    overflow: hidden;
    &::before {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: 148px;
        background: rgba(255,255,255,.08);
    }
    &::after {
        content: '';
        position: absolute;
        top: 18px;
        left: 164px;
        width: min(36%, 280px);
        height: 15px;
        border-radius: 4px;
        background: rgba(255,255,255,.12);
        box-shadow: 0 25px 0 -3px rgba(255,255,255,.12);
    }
    @media (max-width: 1100px) { height: 112px; flex-basis: 112px; }
    @media (max-width: 900px) { &::before { width: 124px; } &::after { left: 140px; } }
    @media (max-width: 650px) { height: 184px; flex-basis: 184px; }
`

export const RouteListItemSkeleton = () => <Skeleton data-testid='route-list-item-skeleton' aria-hidden='true' />

export const RouteListItemView = props => <RouteTileSummaryView {...props} layout='list' visible={true} />
