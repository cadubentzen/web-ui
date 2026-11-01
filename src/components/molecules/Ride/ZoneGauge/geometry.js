export const ARC_START = 150
export const ARC_SWEEP = 240

const toRad = deg => (deg * Math.PI) / 180

/** point on a circle; angles are SVG degrees (clockwise from 3 o'clock) */
export const polar = (cx, cy, r, angle) => [cx + r * Math.cos(toRad(angle)), cy + r * Math.sin(toRad(angle))]

/** angle on the 240 degree gauge arc for a value, clamped to the arc ends */
export const valueToAngle = (value, min, max) => {
    const span = max - min
    const frac = span > 0 ? (value - min) / span : 0
    return ARC_START + ARC_SWEEP * Math.min(1, Math.max(0, frac))
}

/** SVG path of a clockwise arc from angle a0 to a1 (degrees) */
export const arcPath = (cx, cy, r, a0, a1) => {
    const [x0, y0] = polar(cx, cy, r, a0)
    const [x1, y1] = polar(cx, cy, r, a1)
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`
}
