import React from 'react'
import { useRideDashboardItems } from '../../../../hooks/ride'
import { toHudModel } from './model'
import { RideProgressPanelView } from './RideProgressPanelView'

// rendered by RidePageItems as an overlay; the overlay props are not needed here
export const RideProgressPanel = () => {
    const { time, distance } = toHudModel(useRideDashboardItems())
    return <RideProgressPanelView time={time} distance={distance} />
}
