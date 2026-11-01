// Ride HUD sizes shared by the ride page layout (pages/ride/atoms/layout.js) and the controls
// that size themselves from their slot (workout and shifting controls).
// Widths/left are in vw, heights/top in vh.

/** width (vw) of the right column (workout panel, upcoming elevation, rider lists) */
export const RIGHT_COLUMN_WIDTH = 19.1
/**
 * the centre panel (gauges + number row): "short stack" - the panel takes the height of its
 * content, this is the most it may take
 */
// width: two gauges of 17vh plus spacing (~42vh), i.e. ~24vw on a 16:9 screen; centred
export const METRICS_REGION = { top: 2.4, left: 37.5, width: 25, height: 26 }
/** the slot (vw x vh) of the shifting buttons, right under the centre panel, above the road */
export const SHIFTING_REGION = { top: METRICS_REGION.top + METRICS_REGION.height + 1, left: 40, width: 20, height: 3.5 }
