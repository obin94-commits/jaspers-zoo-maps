import { useState } from 'react'
import type { MapSpot } from '../types'

interface ZooCampusMapProps {
  spots: MapSpot[]
  palette: [string, string]
}

export function ZooCampusMap({ spots, palette }: ZooCampusMapProps) {
  const [active, setActive] = useState<MapSpot>(spots[1] ?? spots[0])

  return (
    <div className="campus-map" style={{ '--map-dark': palette[0], '--map-bright': palette[1] } as React.CSSProperties}>
      <div className="campus-map-topline">
        <div>
          <span className="eyebrow">INTERACTIVE TRAIL MAP</span>
          <h2>Choose your next stop</h2>
        </div>
        <span className="map-key">Tap any habitat</span>
      </div>
      <div className="campus-stage">
        <svg viewBox="0 0 800 520" aria-hidden="true">
          <path d="M69 60 C177 107 189 174 309 190 C455 209 513 119 688 145 C751 155 759 224 708 263 C625 328 575 261 481 312 C375 370 408 451 235 457 C138 460 74 406 111 337 C149 266 251 288 272 239" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="34" strokeLinecap="round" />
          <path d="M69 60 C177 107 189 174 309 190 C455 209 513 119 688 145 C751 155 759 224 708 263 C625 328 575 261 481 312 C375 370 408 451 235 457 C138 460 74 406 111 337 C149 266 251 288 272 239" fill="none" stroke={palette[0]} strokeOpacity=".18" strokeWidth="3" strokeDasharray="7 10" strokeLinecap="round" />
          <path d="M0 374 C92 331 176 358 240 420 C299 478 382 505 480 467 C590 425 672 429 800 482 V520 H0Z" fill={palette[1]} opacity=".18" />
          <circle cx="670" cy="70" r="92" fill="#fff" opacity=".18" />
          <circle cx="115" cy="154" r="62" fill="#fff" opacity=".15" />
        </svg>
        {spots.map((spot, index) => (
          <button
            type="button"
            key={spot.id}
            className={`habitat-pin ${active?.id === spot.id ? 'active' : ''}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, '--spot-color': spot.color } as React.CSSProperties}
            onClick={() => setActive(spot)}
            aria-label={`Show ${spot.label}`}
          >
            <span>{spot.emoji}</span>
            <b>{index + 1}</b>
          </button>
        ))}
        {active && (
          <div className="map-popover">
            <span className="map-popover-emoji">{active.emoji}</span>
            <div>
              <strong>{active.label}</strong>
              <p>{active.detail}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
