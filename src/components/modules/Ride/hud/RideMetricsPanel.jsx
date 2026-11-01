import React from 'react'
import { useRideDashboardItems } from '../../../../hooks/ride'
import { toHudModel } from './model'
import { RideMetricsPanelView } from './RideMetricsPanelView'

// rendered by RidePageItems as an overlay; the overlay props are not needed here
export const RideMetricsPanel = () => {
    const { power, heartrate, row } = toHudModel(useRideDashboardItems())
    return <RideMetricsPanelView power={power} heartrate={heartrate} row={row} />
}
