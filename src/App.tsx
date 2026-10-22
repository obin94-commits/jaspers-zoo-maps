import {
  ArrowUpRight,
  Binoculars,
  CarFront,
  Check,
  Compass,
  ExternalLink,
  Globe2,
  Heart,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Mountain,
  Navigation,
  PawPrint,
  Route,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { MapExplorer, type MapExplorerHandle } from './components/MapExplorer'
import { HOME_BASE, zoos } from './data/zoos'
import { usePassport } from './hooks/usePassport'
import type { ZooStatus } from './lib/passport'
import { buildDirectionsUrl } from './lib/routes'
import type { Animal, MapSpot, Zoo } from './types'

type DrawerTab = 'overview' | 'grounds' | 'animals'

function matchesZoo(zoo: Zoo, query: string) {
  const haystack = [
    zoo.name,
    zoo.shortName,
    zoo.city,
    zoo.state,
    zoo.tagline,
    ...zoo.animals.flatMap((animal) => [animal.name, animal.habitat]),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query.trim().toLowerCase())
}

function ExplorerHeader({
  visited,
  total,
  onReset,
  onOpenPassport,
}: {
  visited: number
  total: number
  onReset: () => void
  onOpenPassport: () => void
}) {
  return (
    <header className="explorer-header">
      <h1 aria-label="Jasper's Zoo Maps" className="explorer-brand-heading">
        <button type="button" className="explorer-brand" onClick={onReset}>
          <span className="brand-orbit"><Globe2 size={23} /><i /></span>
          <span><strong>Jasper’s</strong><small>ZOO MAPS</small></span>
        </button>
      </h1>
      <div className="live-map-chip"><i /> LIVE EXPLORER</div>
      <button type="button" className="passport-chip" onClick={onOpenPassport} aria-label="Open passport">
        <PawPrint size={18} />
        <span><strong>{visited}/{total}</strong><small>MY PASSPORT</small></span>
      </button>
    </header>
  )
}

function MapControls({
  threeDimensional,
  onReset,
  onToggleDimension,
  onHome,
}: {
  threeDimensional: boolean
  onReset: () => void
  onToggleDimension: () => void
  onHome: () => void
}) {
  return (
    <div className="map-mode-controls" aria-label="Explorer view controls">
      <button type="button" onClick={onReset} aria-label="Reset globe view" data-tooltip="Orbit view">
        <Globe2 size={20} />
      </button>
      <button
        type="button"
        className={threeDimensional ? 'active' : ''}
        onClick={onToggleDimension}
        aria-label={threeDimensional ? 'Flatten to 2D' : 'Tilt to 3D'}
        data-tooltip={threeDimensional ? '2D map' : '3D terrain'}
      >
        <Mountain size={20} />
      </button>
      <button type="button" onClick={onHome} aria-label="Fly to Woodbine home base" data-tooltip="Home base">
        <LocateFixed size={20} />
      </button>
    </div>
  )
}

function DiscoveryRail({
  zoos: visibleZoos,
  selectedId,
  passport,
  onSelect,
}: {
  zoos: Zoo[]
  selectedId?: string
  passport: Record<string, ZooStatus | undefined>
  onSelect: (zoo: Zoo) => void
}) {
  return (
    <section className="discovery-rail" aria-label="Zoo discovery rail">
      <div className="rail-heading">
        <span><Compass size={16} /> DISCOVER</span>
        <strong>{visibleZoos.length} mapped {visibleZoos.length === 1 ? 'zoo' : 'zoos'}</strong>
      </div>
      <div className="rail-scroller">
        {visibleZoos.map((zoo) => (
          <button
            type="button"
            className={`rail-zoo ${selectedId === zoo.id ? 'selected' : ''}`}
            key={zoo.id}
            onClick={() => onSelect(zoo)}
            aria-label={`Fly to ${zoo.name}`}
          >
            <span className="rail-emoji" style={{ '--zoo-accent': zoo.palette[1] } as React.CSSProperties}>{zoo.heroEmoji}</span>
            <span className="rail-zoo-copy">
              <small>{zoo.city}, {zoo.state}</small>
              <strong>{zoo.shortName}</strong>
              <em><Navigation size={11} /> {zoo.distanceMiles} mi from home</em>
            </span>
            <span className={`rail-status ${passport[zoo.id] ?? ''}`}>
              {passport[zoo.id] === 'visited' ? <Check size={13} /> : passport[zoo.id] === 'wishlist' ? <Heart size={13} /> : <ArrowUpRight size={13} />}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function HabitatExplorer({ spots, palette }: { spots: MapSpot[]; palette: [string, string] }) {
  const [selectedId, setSelectedId] = useState(spots[0]?.id)
  const selected = spots.find((spot) => spot.id === selectedId) ?? spots[0]

  return (
    <div className="drawer-campus" style={{ '--campus-dark': palette[0], '--campus-bright': palette[1] } as React.CSSProperties}>
      <div className="campus-topography" />
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 4 C28 16 23 29 37 40 C49 49 69 48 67 62 C65 76 38 72 47 95" />
        <path d="M10 54 C24 48 27 37 39 36 M66 62 C79 60 82 49 91 43" />
      </svg>
      {spots.map((spot, index) => (
        <button
          type="button"
          key={spot.id}
          className={`campus-pin ${selected?.id === spot.id ? 'active' : ''}`}
          style={{ left: `${spot.x}%`, top: `${spot.y}%`, '--spot-color': spot.color } as React.CSSProperties}
          onClick={() => setSelectedId(spot.id)}
          aria-label={`Explore habitat ${spot.label}`}
        >
          <span>{spot.emoji}</span><b>{index + 1}</b>
        </button>
      ))}
      {selected && (
        <div className="campus-caption">
          <span>{selected.emoji}</span>
          <div><strong>{selected.label}</strong><p>{selected.detail}</p></div>
        </div>
      )}
    </div>
  )
}

function AnimalExplorer({ animals }: { animals: Animal[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const animal = animals[selectedIndex]

  return (
    <div className="drawer-animal-explorer">
      <div className="animal-picker" role="tablist" aria-label="Featured animals">
        {animals.map((item, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            className={selectedIndex === index ? 'active' : ''}
            key={item.name}
            onClick={() => setSelectedIndex(index)}
          >
            <span>{item.emoji}</span><small>{item.name}</small>
          </button>
        ))}
      </div>
      <article className="animal-focus" style={{ '--animal-accent': animal.accent } as React.CSSProperties}>
        <div className="animal-focus-art"><span>{animal.emoji}</span></div>
        <div>
          <small>{animal.status}</small>
          <h3>{animal.name}</h3>
          <em>{animal.scientificName}</em>
          <p>{animal.fact}</p>
          <strong><MapPin size={14} /> {animal.habitat}</strong>
        </div>
      </article>
    </div>
  )
}

function ZooDrawer({
  zoo,
  status,
  visitedCount,
  onClose,
  onStatus,
}: {
  zoo: Zoo
  status: ZooStatus | undefined
  visitedCount: number
  onClose: () => void
  onStatus: (status: ZooStatus | undefined) => void
}) {
  const [tab, setTab] = useState<DrawerTab>('overview')
  const featuredAnimal = zoo.animals[0]
  const drivingUrl = buildDirectionsUrl(HOME_BASE.coordinates, zoo.coordinates, 'driving')

  return (
    <aside className="zoo-drawer" role="dialog" aria-modal="false" aria-label={`${zoo.name} explorer`}>
      <button type="button" className="drawer-close" onClick={onClose} aria-label="Close zoo explorer"><X size={20} /></button>
      <div className="drawer-hero" style={{ '--zoo-dark': zoo.palette[0], '--zoo-bright': zoo.palette[1] } as React.CSSProperties}>
        <div className="drawer-hero-grid" />
        <span className="drawer-animal">{zoo.heroEmoji}</span>
        <div className="drawer-location"><MapPin size={14} /> {zoo.city}, {zoo.state}</div>
        <h2>{zoo.name}</h2>
        <p>{zoo.tagline}</p>
        <div className="drawer-metrics">
          <span><strong>{zoo.distanceMiles}</strong><small>MILES</small></span>
          <span><strong>{zoo.driveTime.replace('About ', '')}</strong><small>DRIVE</small></span>
          <span><strong>{zoo.animals.length}</strong><small>FEATURED</small></span>
        </div>
      </div>

      <div className="drawer-primary-actions">
        <button
          type="button"
          className={status === 'visited' ? 'visited' : ''}
          onClick={() => onStatus(status === 'visited' ? undefined : 'visited')}
          aria-label={status === 'visited' ? 'Remove visited status' : 'Mark visited'}
        >
          {status === 'visited' ? <Check size={17} /> : <PawPrint size={17} />}
          {status === 'visited' ? 'Visited' : 'Mark visited'}
        </button>
        <button
          type="button"
          className={status === 'wishlist' ? 'wishlist' : ''}
          onClick={() => onStatus(status === 'wishlist' ? undefined : 'wishlist')}
        >
          <Heart size={17} fill={status === 'wishlist' ? 'currentColor' : 'none'} />
          {status === 'wishlist' ? 'Saved' : 'Want to go'}
        </button>
      </div>
      <span className="drawer-progress" aria-live="polite">{visitedCount} of {zoos.length} zoos visited</span>

      <div className="drawer-tabs" role="tablist" aria-label="Zoo explorer sections">
        {(['overview', 'grounds', 'animals'] as DrawerTab[]).map((item) => (
          <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>
            {item === 'overview' ? 'Overview' : item === 'grounds' ? 'Zoo map' : 'Animals'}
          </button>
        ))}
      </div>

      <div className="drawer-scroll">
        {tab === 'overview' && (
          <div className="drawer-overview">
            <p className="drawer-description">{zoo.description}</p>
            <div className="highlight-list">
              {zoo.highlights.map((highlight) => <span key={highlight}><Sparkles size={13} /> {highlight}</span>)}
            </div>
            <button type="button" className="enter-map-button" onClick={() => setTab('grounds')}>
              <span><MapIcon size={20} /><span><small>ZOOM CLOSER</small><strong>Enter the zoo map</strong></span></span>
              <ArrowUpRight size={19} />
            </button>
            <article className="featured-animal-mini" style={{ '--animal-accent': featuredAnimal.accent } as React.CSSProperties}>
              <span>{featuredAnimal.emoji}</span>
              <div><small>FEATURED ANIMAL</small><h3>{featuredAnimal.name}</h3><p>{featuredAnimal.fact}</p></div>
            </article>
            <div className="trip-links">
              <a href={drivingUrl} target="_blank" rel="noreferrer"><CarFront size={18} /><span><small>ROUTE FROM WOODBINE</small><strong>Open live directions</strong></span><ExternalLink size={15} /></a>
              <a href={zoo.officialUrl} target="_blank" rel="noreferrer"><Binoculars size={18} /><span><small>OFFICIAL ZOO SITE</small><strong>Hours, tickets & updates</strong></span><ExternalLink size={15} /></a>
            </div>
          </div>
        )}
        {tab === 'grounds' && (
          <div className="drawer-grounds">
            <div className="drawer-section-heading"><small>ORIGINAL INTERACTIVE MAP</small><h3>Explore the grounds</h3><p>Tap a habitat to move through the zoo.</p></div>
            <HabitatExplorer spots={zoo.mapSpots} palette={zoo.palette} />
          </div>
        )}
        {tab === 'animals' && (
          <div className="drawer-animals">
            <div className="drawer-section-heading"><small>ANIMAL RADAR</small><h3>Who lives here?</h3><p>Meet a few of the zoo’s featured residents.</p></div>
            <AnimalExplorer animals={zoo.animals} />
            <a className="official-animal-link" href={zoo.sourceUrl} target="_blank" rel="noreferrer">See the official animal list <ExternalLink size={15} /></a>
          </div>
        )}
      </div>
    </aside>
  )
}

function PassportOverlay({
  passport,
  onClose,
  onSelect,
  setStatus,
}: {
  passport: Record<string, ZooStatus | undefined>
  onClose: () => void
  onSelect: (zoo: Zoo) => void
  setStatus: (id: string, status: ZooStatus | undefined) => void
}) {
  return (
    <div className="overlay-scrim" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="passport-overlay" role="dialog" aria-modal="true" aria-label="Zoo passport">
        <button type="button" className="overlay-close" onClick={onClose} aria-label="Close passport"><X size={20} /></button>
        <div className="passport-overlay-heading">
          <span className="passport-seal"><PawPrint size={28} /></span>
          <div><small>JASPER’S FIELD BOOK</small><h2>Zoo passport</h2><p>Choose the next expedition or stamp a place you’ve explored.</p></div>
        </div>
        <div className="passport-map-grid">
          {zoos.map((zoo, index) => {
            const status = passport[zoo.id]
            return (
              <article className={`passport-map-card ${status ?? ''}`} key={zoo.id}>
                <span className="passport-card-number">0{index + 1}</span>
                <button type="button" className="passport-zoo-orb" onClick={() => { onSelect(zoo); onClose() }} aria-label={`Fly to ${zoo.name}`}>
                  <span>{status === 'visited' ? zoo.heroEmoji : status === 'wishlist' ? '✦' : '?'}</span>
                </button>
                <small>{status === 'visited' ? 'EXPLORED' : status === 'wishlist' ? 'NEXT UP' : 'UNDISCOVERED'}</small>
                <h3>{zoo.shortName}</h3>
                <p>{zoo.city}, {zoo.state}</p>
                <button type="button" className="passport-stamp-action" onClick={() => setStatus(zoo.id, status === 'visited' ? undefined : 'visited')}>
                  {status === 'visited' ? 'Remove stamp' : 'Stamp visited'}
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const mapRef = useRef<MapExplorerHandle | null>(null)
  const [selectedZoo, setSelectedZoo] = useState<Zoo | null>(null)
  const [query, setQuery] = useState('')
  const [threeDimensional, setThreeDimensional] = useState(true)
  const [passportOpen, setPassportOpen] = useState(false)
  const zooIds = useMemo(() => zoos.map((zoo) => zoo.id), [])
  const { passport, stats, setStatus } = usePassport(zooIds)

  const filteredZoos = useMemo(
    () => zoos.filter((zoo) => matchesZoo(zoo, query)),
    [query],
  )
  const visibleZooIds = useMemo(() => filteredZoos.map((zoo) => zoo.id), [filteredZoos])

  function selectZoo(zoo: Zoo) {
    setSelectedZoo(zoo)
    mapRef.current?.flyToZoo(zoo)
  }

  function resetGlobe() {
    setSelectedZoo(null)
    mapRef.current?.reset()
  }

  function toggleDimension() {
    const next = !threeDimensional
    setThreeDimensional(next)
    mapRef.current?.setThreeDimensional(next)
  }

  return (
    <div className="earth-app">
      <main className={`earth-stage ${selectedZoo ? 'has-selection' : ''}`} aria-label="Interactive 3D zoo globe">
        <MapExplorer
          ref={mapRef}
          zoos={zoos}
          visibleZooIds={visibleZooIds}
          selectedId={selectedZoo?.id}
          threeDimensional={threeDimensional}
          onSelect={setSelectedZoo}
        />
        <div className="earth-vignette" aria-hidden="true" />

        <ExplorerHeader visited={stats.visited} total={stats.total} onReset={resetGlobe} onOpenPassport={() => setPassportOpen(true)} />

        <section className="explorer-intro" aria-label="Explorer introduction">
          <span><i /> ZOO EARTH · BETA</span>
          <h2>Explore from orbit<br />to animal habitat.</h2>
          <p>Drag the globe, zoom into a city, then enter a zoo.</p>
        </section>

        <label className="map-search">
          <Search size={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search zoo, city, animal…"
            aria-label="Search zoos"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}
          <span>{filteredZoos.length}</span>
        </label>

        <MapControls
          threeDimensional={threeDimensional}
          onReset={resetGlobe}
          onToggleDimension={toggleDimension}
          onHome={() => mapRef.current?.flyHome()}
        />

        <div className="map-context-chip"><Route size={14} /><span><small>ORIGIN</small>Woodbine, Maryland</span></div>

        <DiscoveryRail zoos={filteredZoos} selectedId={selectedZoo?.id} passport={passport} onSelect={selectZoo} />

        {selectedZoo && (
          <ZooDrawer
            key={selectedZoo.id}
            zoo={selectedZoo}
            status={passport[selectedZoo.id]}
            visitedCount={stats.visited}
            onClose={() => setSelectedZoo(null)}
            onStatus={(status) => setStatus(selectedZoo.id, status)}
          />
        )}
      </main>

      {passportOpen && (
        <PassportOverlay
          passport={passport}
          onClose={() => setPassportOpen(false)}
          onSelect={selectZoo}
          setStatus={setStatus}
        />
      )}
    </div>
  )
}
