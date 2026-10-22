import { Compass, Home, Minus, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { HOME_BASE } from '../data/zoos'
import type { Zoo } from '../types'

interface AtlasMapProps {
  zoos: Zoo[]
  selectedId?: string
  onSelect: (zoo: Zoo) => void
}

function project(lat: number, lng: number) {
  return {
    x: ((lng + 80.35) / 5.7) * 100,
    y: ((41.2 - lat) / 2.7) * 100,
  }
}

export function AtlasMap({ zoos, selectedId, onSelect }: AtlasMapProps) {
  const [zoom, setZoom] = useState(1)
  const points = useMemo(
    () => zoos.map((zoo) => ({ zoo, ...project(zoo.coordinates.lat, zoo.coordinates.lng) })),
    [zoos],
  )
  const home = project(HOME_BASE.coordinates.lat, HOME_BASE.coordinates.lng)

  return (
    <section className="atlas-map" aria-label="Interactive zoo atlas">
      <div className="map-toolbar">
        <div>
          <span className="eyebrow light">MID-ATLANTIC EXPLORER</span>
          <strong>Four adventures from home</strong>
        </div>
        <div className="zoom-controls" aria-label="Map zoom controls">
          <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.15))} aria-label="Zoom out">
            <Minus size={17} />
          </button>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.45, value + 0.15))} aria-label="Zoom in">
            <Plus size={17} />
          </button>
        </div>
      </div>

      <div className="map-window">
        <div className="map-canvas" style={{ transform: `scale(${zoom})` }}>
          <div className="map-grid" />
          <svg className="map-land" viewBox="0 0 800 520" aria-hidden="true">
            <defs>
              <linearGradient id="land" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#dce8c8" />
                <stop offset="100%" stopColor="#a9c69d" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#173f35" floodOpacity=".18" />
              </filter>
            </defs>
            <path
              d="M42 36 C168 16 320 45 406 83 C478 115 510 142 555 177 C610 219 670 222 742 278 L780 504 L88 504 C117 441 112 394 84 330 C61 277 35 231 56 172 C76 115 15 88 42 36Z"
              fill="url(#land)"
              filter="url(#shadow)"
            />
            <path d="M48 290 C196 265 318 320 420 292 C530 263 643 295 756 255" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeDasharray="8 12" />
            <path d="M94 100 C222 148 291 203 382 254 C475 306 568 357 720 424" fill="none" stroke="#315e4d" strokeOpacity=".16" strokeWidth="18" strokeLinecap="round" />
            <path d="M94 100 C222 148 291 203 382 254 C475 306 568 357 720 424" fill="none" stroke="#f8d66d" strokeWidth="3" strokeDasharray="5 12" strokeLinecap="round" />
          </svg>

          <div className="home-pin" style={{ left: `${home.x}%`, top: `${home.y}%` }}>
            <span><Home size={15} /></span>
            <small>HOME</small>
          </div>

          {points.map(({ zoo, x, y }) => (
            <button
              className={`zoo-pin ${selectedId === zoo.id ? 'selected' : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, '--pin-color': zoo.palette[1] } as React.CSSProperties}
              key={zoo.id}
              type="button"
              onClick={() => onSelect(zoo)}
              aria-label={`Open ${zoo.name}`}
            >
              <span className="pin-emoji">{zoo.heroEmoji}</span>
              <span className="pin-label">{zoo.shortName}</span>
            </button>
          ))}

          <div className="map-compass" aria-hidden="true"><Compass size={25} /></div>
        </div>
      </div>
      <div className="map-footer">
        <span><i className="legend-dot home" /> Home base: Woodbine, MD</span>
        <span><i className="legend-dot zoo" /> Starter zoo</span>
        <span>Approximate map · tap a marker to explore</span>
      </div>
    </section>
  )
}
