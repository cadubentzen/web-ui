const EMPTY = '–'

const text = (v) => (v === undefined || v === null || v === '') ? EMPTY : String(v)

// remaining values arrive as '-0:49:59' / '-9.20' (or undefined); the HUD shows a real minus sign
const remaining = (v) => {
    if (v === undefined || v === null || v === '') return undefined
    return '−' + String(v).replace(/^[-−]/, '')
}

// a route-less workout reports '-0.00' remaining distance (and a flat route '-0' elevation to
// climb): nothing to show
const remainingDistance = (v) => {
    const res = remaining(v)
    return res && parseFloat(res.slice(1)) === 0 ? undefined : res
}

// services sends 'RF 50%'; older stories use '50% RF'
const slopeBadge = (info) => {
    if (!info) return undefined
    const m = /^(?:RF\s*(\d+(?:\.\d+)?%)|(\d+(?:\.\d+)?%)\s*RF)$/i.exec(String(info).trim())
    return m ? `RF ${m[1] ?? m[2]}` : String(info)
}

const metric = (key, item) => {
    const first = item?.data?.[0]
    const res = { key, value: text(first?.value) }
    if (first?.unit !== undefined) res.unit = first.unit
    if (item?.dataState === 'amber' || item?.dataState === 'red') res.state = item.dataState
    return res
}

export const toHudModel = (items) => {
    const byTitle = {}
    ;(items ?? []).forEach(i => { if (i?.title) byTitle[i.title] = i })

    const timeItem = byTitle.Time
    const time = { value: text(timeItem?.data?.[0]?.value) }
    const timeRemaining = remaining(timeItem?.data?.[1]?.value)
    if (timeRemaining) time.remaining = timeRemaining

    const distItem = byTitle.Distance
    const distance = { value: text(distItem?.data?.[0]?.value) }
    if (distItem?.data?.[0]?.unit !== undefined) distance.unit = distItem.data[0].unit
    const distRemaining = remainingDistance(distItem?.data?.[1]?.value)
    if (distRemaining) distance.remaining = distRemaining

    // elevation gained so far and still to climb (only on rides with a route)
    const elev = byTitle.Slope?.elevation
    let elevation
    if (elev) {
        elevation = { value: text(elev.value) }
        if (elev.unit !== undefined) elevation.unit = elev.unit
        const elevRemaining = remainingDistance(elev.remaining)     // nothing left to climb: none
        if (elevRemaining) elevation.remaining = elevRemaining
    }

    const withGauge = (key, item) => {
        const m = metric(key, item)
        if (item?.gauge) m.gauge = item.gauge
        return m
    }

    const row = []
    if (byTitle.Speed) row.push(metric('speed', byTitle.Speed))
    if (byTitle.Slope) {
        const m = metric('slope', byTitle.Slope)
        const badge = slopeBadge(byTitle.Slope.data?.[0]?.info)
        if (badge) m.badge = badge
        row.push(m)
    }
    if (byTitle.Cadence) row.push(metric('cadence', byTitle.Cadence))
    if (byTitle.Gear) {
        const m = metric('gear', byTitle.Gear)
        if (byTitle.Gear.gearCount !== undefined) m.gearCount = byTitle.Gear.gearCount
        row.push(m)
    }

    return {
        time,
        distance,
        elevation,
        power: withGauge('power', byTitle.Power),
        heartrate: withGauge('heartrate', byTitle.Heartrate),
        row,
    }
}
