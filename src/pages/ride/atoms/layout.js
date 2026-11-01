// One place that decides where every ride overlay goes.
// left/width are in vw, top/height in vh. A region that is not shown is undefined.

import { METRICS_REGION, RIGHT_COLUMN_WIDTH, SHIFTING_REGION } from '../../../components/modules/Ride/layoutConstants'

const GAP = 1
export const CONTROL_GAP = 0.6

const COLUMN_LEFT = 79
const METRICS = METRICS_REGION
// the column may be moved sideways (preferences.rideListDeltaX), but never onto the centre panel
const COLUMN_MIN_LEFT = METRICS.left + METRICS.width + GAP
const COLUMN_MAX_LEFT = 100 - RIGHT_COLUMN_WIDTH
const COLUMN_TOP = 2.4
const COLUMN_BOTTOM = 79 // the right column must end above the bottom band
const SIDE_VIEW_BOTTOM = 78
const SIDE_VIEW_MIN_HEIGHT = 15

const NEARBY = { min: 12, max: 30 }
const PREV = { min: 10, max: 20 }

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

const getRightColumn = ({ workout, upcoming, nearby, prev, deltaX }) => {
    const left = clamp(COLUMN_LEFT + (Number.isFinite(deltaX) ? deltaX : 0), COLUMN_MIN_LEFT, COLUMN_MAX_LEFT)
    const column = { left, width: RIGHT_COLUMN_WIDTH }
    const res = {}
    let y = COLUMN_TOP
    let bottom

    const place = (name, height, gap = GAP) => {
        const top = bottom === undefined ? y : bottom + gap
        res[name] = { top, ...column, height }
        bottom = top + height
    }

    if (workout) {
        // two cards: the control hides itself, the panel must not depend on it (same total height)
        place('workoutPanel', 25.4)
        place('workoutControl', 11, CONTROL_GAP) // two rows of buttons
    }
    if (upcoming) place('upcoming', 12)

    const room = (names) => COLUMN_BOTTOM - (bottom === undefined ? y : bottom + GAP) - (names === 2 ? GAP : 0)
    if (nearby && prev) {
        const total = room(2)
        const prevHeight = clamp(total - NEARBY.max, PREV.min, PREV.max)
        place('nearby', clamp(total - prevHeight, NEARBY.min, NEARBY.max))
        place('prev', prevHeight)
    } else if (nearby) {
        place('nearby', clamp(room(1), NEARBY.min, NEARBY.max))
    } else if (prev) {
        place('prev', clamp(room(1), PREV.min, PREV.max))
    }

    return { regions: res, bottom }
}

export const getRideLayout = (opts = {}) => {
    const { workout, workoutOnly, upcoming, nearby, prev, sideViews, map, totalElevation, deltaX } = opts
    const column = getRightColumn({ workout, upcoming, nearby, prev, deltaX })

    const svTop = column.bottom === undefined ? 40 : Math.max(40, column.bottom + GAP)
    const svRightHeight = SIDE_VIEW_BOTTOM - svTop

    return {
        progress: { top: 2.4, left: 1.9, width: 22, height: 22 }, // time, distance, elevation
        metrics: { ...METRICS },
        shifting: { ...SHIFTING_REGION },
        workoutPanel: workout ? column.regions.workoutPanel : undefined,
        workoutControl: workout ? column.regions.workoutControl : undefined,
        upcoming: column.regions.upcoming,
        nearby: column.regions.nearby,
        prev: column.regions.prev,
        svLeft: sideViews && !workoutOnly ? { top: 40, left: 0, width: 25, height: 38 } : undefined,
        svRight:
            sideViews && !workoutOnly && svRightHeight >= SIDE_VIEW_MIN_HEIGHT
                ? { top: svTop, left: 75, width: 25, height: svRightHeight }
                : undefined,
        map: map ? { top: 80, left: 1.9, width: 16, height: 18 } : undefined,
        totalElevation: totalElevation
            ? map
                ? { top: 80, left: 19.5, width: 78.6, height: 18 }
                : { top: 80, left: 1.9, width: 96.2, height: 18 }
            : undefined,
        routeOptions: { top: 62, left: 26, width: 48, height: 16 },
        workoutGraph: workoutOnly ? { top: 40, left: 2, width: 96, height: 57 } : undefined,
    }
}

export const toCss = (region) =>
    region
        ? {
              top: `${region.top}vh`,
              left: `${region.left}vw`,
              width: `${region.width}vw`,
              height: `${region.height}vh`,
          }
        : undefined
