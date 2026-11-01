import React from 'react'
import { useRideDashboardItems } from '../../../../hooks/ride'
import { ErrorBoundary } from '../../../atoms'
import { toHudModel } from './model'
import { RideProgressPanelView } from './RideProgressPanelView'

// rendered by RidePageItems as an overlay; the overlay props are not needed here
export const RideProgressPanel = () => {
    const { time, distance, elevation } = toHudModel(useRideDashboardItems())
    return (
        <ErrorBoundary hideOnError>
            <RideProgressPanelView time={time} distance={distance} elevation={elevation} />
        </ErrorBoundary>
    )
}
