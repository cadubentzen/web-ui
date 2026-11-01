import { useCallback, useEffect, useRef, useState } from 'react'
import { EventLogger } from 'gd-eventlog'
import { useActivityRide } from 'incyclist-services'

/**
 * Subscribes to the ride's dashboard data and returns the current dashboard items.
 * Unsubscribes on unmount.
 */
export const useRideDashboardItems = () => {
    const refLogger = useRef(new EventLogger('Dashboard'))
    const service = useActivityRide()
    const [items, setItems] = useState([])

    const onActivityData = useCallback(() => {
        setItems(service.getDashboardDisplayProperties())
    }, [service])

    useEffect(() => {
        let observer
        try {
            observer = service.getObserver()
            if (!observer) return

            onActivityData()
            observer.on('data', onActivityData)
        } catch (err) {
            refLogger.current.logEvent({ message: 'error', error: err.message, fn: 'useRideDashboardItems', stack: err.stack })
            return
        }

        return () => observer.off('data', onActivityData)
    }, [service, onActivityData])

    return items
}
