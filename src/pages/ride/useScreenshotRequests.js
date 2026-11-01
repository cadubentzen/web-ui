import { useCallback, useEffect, useRef, useState } from 'react'

const nextTick = () => new Promise(done => setTimeout(done, 0))

/**
 * Screenshots of the ride, one at a time.
 *
 * A request is `true` when the rider asked for one, or the key moment (e.g. 'summit') when the
 * ride service did. Requests made while a screenshot is being taken wait their turn - none is
 * dropped. `screenshotRequested` is truthy while one is pending or being taken (the ride page
 * hides some controls for it).
 *
 * @param {(moment?:string)=>Promise<void>} take takes the screenshot (moment: none if the rider asked)
 */
export const useScreenshotRequests = (take) => {
    const [screenshotRequested, setRequested] = useState(false)
    const refQueue = useRef([])
    const refTaking = useRef(false)
    const refTake = useRef(take)
    refTake.current = take

    const requestScreenshot = useCallback((request) => {
        refQueue.current.push(request)
        setRequested(current => current || request)
    }, [])

    useEffect(() => {
        if (!screenshotRequested || refTaking.current)
            return
        refTaking.current = true

        const request = refQueue.current.shift() ?? screenshotRequested
        const moment = typeof request === 'string' ? request : undefined

        Promise.resolve()
            .then(() => refTake.current(moment))
            .catch(() => { /* the ride service logs its errors */ })
            .finally(() => {
                refTaking.current = false
                setRequested(false)
                // then the next one waiting, if any (a separate update: setting the same value
                // again wouldn't render, and so wouldn't take it)
                if (refQueue.current.length > 0)
                    nextTick().then(() => setRequested(refQueue.current[0] ?? false))
            })
    }, [screenshotRequested])

    return { screenshotRequested, requestScreenshot }
}
