import React from 'react'

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const SHAPES = {
    time: <><circle cx="12" cy="13" r="8" {...S} /><path d="M12 9v4l2.5 2M9.5 2.5h5" {...S} /></>,
    distance: <path d="M5 21V3M5 4h13l-3 4 3 4H5" {...S} />,
    speed: <><path d="M3.5 18a9 9 0 1 1 17 0" {...S} /><path d="M12 18l4.5-6" {...S} /></>,
    power: <path d="M13 2L5 14h6l-1 8 8-12h-6z" {...S} />,
    heartrate: <path d="M12 20.5S3 15 3 8.8A4.8 4.8 0 0 1 12 6.5a4.8 4.8 0 0 1 9 2.3C21 15 12 20.5 12 20.5z" {...S} />,
    slope: <path d="M3 19h18V7z" {...S} />,
    elevation: <path d="M2 20l7-12 4 6 3-4 6 10z" {...S} />,
    cadence: <><path d="M20 12a8 8 0 1 1-2.5-5.8" {...S} /><path d="M20 3v5h-5" {...S} /></>,
    gear: <><circle cx="12" cy="12" r="3" {...S} /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" {...S} /></>,
}

export const MetricIcon = ({ metric, size = '1.4vw', color }) => (
    <svg
        role="img"
        aria-label={metric}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={color ? { color } : undefined}
    >
        {SHAPES[metric]}
    </svg>
)
