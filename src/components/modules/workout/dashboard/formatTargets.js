const round = v => (v !== undefined && v !== null ? Number(v).toFixed(0) : undefined)

const format = (max, min, unit) => {
    if (max !== undefined && min !== undefined)
        return { value: min !== max ? `${min}–${max}` : `${max}`, unit }
    if (max !== undefined)
        return { value: `≤ ${max}`, unit }
    if (min !== undefined)
        return { value: `≥ ${min}`, unit }
    return {}
}

/** Display values for the power / heart rate / cadence targets of the current workout step */
export const formatTargets = (limits) => {
    if (!limits)
        return { power: {}, hrm: {}, cadence: {} }
    return {
        power: format(round(limits.maxPower), round(limits.minPower), 'W'),
        hrm: format(round(limits.maxHrm), round(limits.minHrm), 'bpm'),
        cadence: format(round(limits.maxCadence), round(limits.minCadence), 'rpm'),
    }
}
