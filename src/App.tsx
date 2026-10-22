import {
  ArrowLeft,
  ArrowRight,
  Binoculars,
  BusFront,
  CalendarDays,
  CarFront,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  ExternalLink,
  Heart,
  ListChecks,
  Map,
  MapPin,
  Navigation,
  PawPrint,
  Search,
  Sparkles,
  Star,
  TrainFront,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AtlasMap } from './components/AtlasMap'
import { ZooCampusMap } from './components/ZooCampusMap'
import { HOME_BASE, zoos } from './data/zoos'
import { usePassport } from './hooks/usePassport'
import type { ZooStatus } from './lib/passport'
import { buildDirectionsUrl } from './lib/routes'
import type { Zoo } from './types'

type View = 'atlas' | 'passport'

function statusCopy(status: ZooStatus | undefined) {
  if (status === 'visited') return { label: 'Visited', icon: <Check size={15} /> }
  if (status === 'wishlist') return { label: 'Want to visit', icon: <Heart size={15} /> }
  return { label: 'Add to passport', icon: <PawPrint size={15} /> }
}

function ZooCard({
  zoo,
  status,
  onExplore,
  onStatus,
}: {
  zoo: Zoo
  status: ZooStatus | undefined
  onExplore: () => void
  onStatus: () => void
}) {
  const copy = statusCopy(status)
  return (
    <article className="zoo-card" style={{ '--zoo-dark': zoo.palette[0], '--zoo-bright': zoo.palette[1] } as React.CSSProperties}>
      <div className="zoo-card-visual">
        <div className="zoo-orbit orbit-one" />
        <div className="zoo-orbit orbit-two" />
        <span className="zoo-card-emoji">{zoo.heroEmoji}</span>
        <span className="distance-pill"><Navigation size={13} /> {zoo.distanceMiles} mi</span>
      </div>
      <div className="zoo-card-body">
        <div className="location-line"><MapPin size={14} /> {zoo.city}, {zoo.state}</div>
        <h3>{zoo.name}</h3>
        <p>{zoo.tagline}</p>
        <div className="card-meta">
          <span><Clock3 size={14} /> {zoo.driveTime}</span>
          <span><PawPrint size={14} /> {zoo.animals.length} featured</span>
        </div>
        <div className="card-actions">
          <button type="button" className="primary-button small" onClick={onExplore} aria-label={`Explore ${zoo.name}`}>
            Explore <ArrowRight size={16} />
          </button>
          <button type="button" className={`status-button ${status ?? ''}`} onClick={onStatus}>
            {copy.icon} {copy.label}
          </button>
        </div>
      </div>
    </article>
  )
}

function PassportView({
  passport,
  setStatus,
  onExplore,
}: {
  passport: Record<string, ZooStatus | undefined>
  setStatus: (id: string, status: ZooStatus | undefined) => void
  onExplore: (zoo: Zoo) => void
}) {
  const visited = zoos.filter((zoo) => passport[zoo.id] === 'visited')
  const wishlist = zoos.filter((zoo) => passport[zoo.id] === 'wishlist')

  return (
    <main className="page-shell passport-page">
      <section className="passport-hero">
        <div>
          <span className="eyebrow light">JASPER’S FIELD BOOK</span>
          <h1>Your zoo passport</h1>
          <p>Every stamp is a day of discovery. Save the places you’ve explored and choose the next adventure.</p>
        </div>
        <div className="passport-book-mark"><PawPrint size={40} /><span>JZM</span></div>
      </section>

      <section className="passport-section">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">STAMP COLLECTION</span>
            <h2>{visited.length ? `${visited.length} zoo ${visited.length === 1 ? 'stamp' : 'stamps'} earned` : 'Your first stamp is waiting'}</h2>
          </div>
        </div>
        <div className="stamp-grid">
          {zoos.map((zoo, index) => {
            const status = passport[zoo.id]
            return (
              <article className={`passport-stamp ${status ?? 'locked'}`} key={zoo.id}>
                <div className="stamp-number">0{index + 1}</div>
                <div className="stamp-ring" style={{ '--stamp-color': zoo.palette[1] } as React.CSSProperties}>
                  <span>{status === 'visited' ? zoo.heroEmoji : status === 'wishlist' ? '✦' : '?'}</span>
                </div>
                <small>{status === 'visited' ? 'EXPLORED' : status === 'wishlist' ? 'NEXT UP' : 'UNDISCOVERED'}</small>
                <h3>{zoo.shortName}</h3>
                <p>{zoo.city}, {zoo.state}</p>
                <div className="stamp-actions">
                  <button type="button" onClick={() => onExplore(zoo)}>View zoo</button>
                  {status === 'visited' ? (
                    <button type="button" onClick={() => setStatus(zoo.id, undefined)}>Reset</button>
                  ) : (
                    <button type="button" onClick={() => setStatus(zoo.id, 'visited')}>Stamp visited</button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="passport-summary">
        <div><Star size={23} /><span><strong>{visited.length}</strong> visited</span></div>
        <div><Heart size={23} /><span><strong>{wishlist.length}</strong> on the wish list</span></div>
        <div><Map size={23} /><span><strong>{Math.max(0, zoos.length - visited.length - wishlist.length)}</strong> still to discover</span></div>
      </section>
    </main>
  )
}

function ZooDetail({
  zoo,
  status,
  onBack,
  setStatus,
  visitedCount,
}: {
  zoo: Zoo
  status: ZooStatus | undefined
  onBack: () => void
  setStatus: (status: ZooStatus | undefined) => void
  visitedCount: number
}) {
  const [animalIndex, setAnimalIndex] = useState(0)
  const selectedAnimal = zoo.animals[animalIndex]
  const drivingUrl = buildDirectionsUrl(HOME_BASE.coordinates, zoo.coordinates, 'driving')
  const transitUrl = buildDirectionsUrl(HOME_BASE.coordinates, zoo.coordinates, 'transit')

  return (
    <main className="zoo-detail">
      <section className="detail-hero" style={{ '--zoo-dark': zoo.palette[0], '--zoo-bright': zoo.palette[1] } as React.CSSProperties}>
        <div className="detail-hero-art">
          <span className="detail-animal">{zoo.heroEmoji}</span>
          <div className="hero-leaf leaf-a">✦</div>
          <div className="hero-leaf leaf-b">●</div>
          <div className="hero-route-line" />
        </div>
        <div className="detail-hero-content page-shell">
          <button type="button" className="back-button" onClick={onBack}><ArrowLeft size={17} /> Back to atlas</button>
          <div className="detail-copy">
            <div className="location-line light"><MapPin size={15} /> {zoo.city}, {zoo.state} · {zoo.distanceMiles} miles from home</div>
            <h1>{zoo.name}</h1>
            <p>{zoo.description}</p>
            <div className="hero-highlights">
              {zoo.highlights.map((highlight) => <span key={highlight}><Sparkles size={14} /> {highlight}</span>)}
            </div>
            <div className="detail-actions">
              <button type="button" className={`primary-button cream ${status === 'visited' ? 'complete' : ''}`} onClick={() => setStatus(status === 'visited' ? undefined : 'visited')} aria-label={status === 'visited' ? 'Remove visited status' : 'Mark visited'}>
                {status === 'visited' ? <><Check size={18} /> Visited!</> : <><PawPrint size={18} /> Mark visited</>}
              </button>
              <button type="button" className="ghost-button light" onClick={() => setStatus(status === 'wishlist' ? undefined : 'wishlist')}>
                <Heart size={18} fill={status === 'wishlist' ? 'currentColor' : 'none'} /> {status === 'wishlist' ? 'On wish list' : 'Want to visit'}
              </button>
            </div>
          </div>
          <div className="detail-stat-card">
            <span className="eyebrow light">YOUR PASSPORT</span>
            <strong>{visitedCount} of {zoos.length}</strong>
            <span>zoos explored</span>
            <span className="detail-progress-text" aria-live="polite">{visitedCount} of {zoos.length} zoos visited</span>
            <div className="mini-progress"><i style={{ width: `${(visitedCount / zoos.length) * 100}%` }} /></div>
          </div>
        </div>
      </section>

      <div className="page-shell detail-body">
        <section className="trip-panel">
          <div className="trip-copy">
            <span className="eyebrow">PLAN FROM WOODBINE</span>
            <h2>How should we get there?</h2>
            <p>Route estimates are a starting point. Open the live route before you leave for current traffic and schedules.</p>
          </div>
          <div className="travel-options">
            <a href={drivingUrl} target="_blank" rel="noreferrer" className="travel-card featured">
              <CarFront size={25} />
              <span><small>DRIVE</small><strong>{zoo.driveTime}</strong><em>{zoo.distanceMiles} miles</em></span>
              <ExternalLink size={16} />
            </a>
            <a href={transitUrl} target="_blank" rel="noreferrer" className="travel-card">
              <TrainFront size={25} />
              <span><small>TRAIN + TRANSIT</small><strong>Check live route</strong><em>{zoo.transitNote}</em></span>
              <ExternalLink size={16} />
            </a>
            <a href={zoo.officialUrl} target="_blank" rel="noreferrer" className="travel-card">
              <CalendarDays size={25} />
              <span><small>BEFORE YOU GO</small><strong>Hours & tickets</strong><em>Open the zoo’s official site</em></span>
              <ExternalLink size={16} />
            </a>
          </div>
        </section>

        <ZooCampusMap spots={zoo.mapSpots} palette={zoo.palette} />

        <section className="animal-explorer">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MEET THE ANIMALS</span>
              <h2>Who lives here?</h2>
            </div>
            <a href={zoo.sourceUrl} target="_blank" rel="noreferrer">Official animal list <ExternalLink size={15} /></a>
          </div>
          <div className="animal-layout">
            <div className="animal-tabs" role="tablist" aria-label="Featured animals">
              {zoo.animals.map((animal, index) => (
                <button
                  type="button"
                  key={animal.name}
                  className={index === animalIndex ? 'active' : ''}
                  onClick={() => setAnimalIndex(index)}
                  role="tab"
                  aria-selected={index === animalIndex}
                >
                  <span style={{ background: animal.accent }}>{animal.emoji}</span>
                  <div><strong>{animal.name}</strong><small>{animal.habitat}</small></div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
            <article className="featured-animal" style={{ '--animal-accent': selectedAnimal.accent } as React.CSSProperties}>
              <div className="featured-animal-art"><span>{selectedAnimal.emoji}</span><i /><b /></div>
              <div className="featured-animal-copy">
                <span className="animal-status">{selectedAnimal.status}</span>
                <h3>{selectedAnimal.name}</h3>
                <em>{selectedAnimal.scientificName}</em>
                <p>{selectedAnimal.fact}</p>
                <div className="animal-home"><MapPin size={16} /><span><small>FIND IT AT</small><strong>{selectedAnimal.habitat}</strong></span></div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const [view, setView] = useState<View>('atlas')
  const [selectedZoo, setSelectedZoo] = useState<Zoo | null>(null)
  const [query, setQuery] = useState('')
  const zooIds = useMemo(() => zoos.map((zoo) => zoo.id), [])
  const { passport, stats, setStatus } = usePassport(zooIds)

  const filteredZoos = zoos.filter((zoo) => `${zoo.name} ${zoo.city} ${zoo.state}`.toLowerCase().includes(query.toLowerCase()))

  function showAtlas() {
    setSelectedZoo(null)
    setView('atlas')
  }

  if (selectedZoo) {
    return (
      <div className="app">
        <SiteHeader view={view} onAtlas={showAtlas} onPassport={() => { setSelectedZoo(null); setView('passport') }} />
        <ZooDetail
          zoo={selectedZoo}
          status={passport[selectedZoo.id]}
          onBack={showAtlas}
          setStatus={(status) => setStatus(selectedZoo.id, status)}
          visitedCount={stats.visited}
        />
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="app">
      <SiteHeader view={view} onAtlas={showAtlas} onPassport={() => setView('passport')} />
      {view === 'passport' ? (
        <PassportView passport={passport} setStatus={setStatus} onExplore={setSelectedZoo} />
      ) : (
        <main>
          <section className="home-hero">
            <div className="hero-sun" />
            <div className="hero-cloud cloud-one" />
            <div className="hero-cloud cloud-two" />
            <div className="hero-hills hill-back" />
            <div className="hero-hills hill-front" />
            <div className="page-shell home-hero-inner">
              <div className="hero-copy">
                <span className="eyebrow light">A FAMILY ATLAS OF WILD PLACES</span>
                <h1 aria-label="Jasper's Zoo Maps">Jasper’s<br /><em>Zoo Maps</em></h1>
                <p>Explore every zoo, plan the next adventure, and collect every memory along the way.</p>
                <div className="hero-search">
                  <Search size={20} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a zoo, city or animal…" aria-label="Search zoos" />
                  <span>{filteredZoos.length} nearby</span>
                </div>
              </div>
              <div className="hero-passport-card">
                <div className="passport-ring" style={{ '--progress': `${stats.percent * 3.6}deg` } as React.CSSProperties}>
                  <div><strong>{stats.visited}</strong><span>VISITED</span></div>
                </div>
                <div>
                  <span className="eyebrow light">JASPER’S PASSPORT</span>
                  <h2>{stats.visited} of {stats.total} zoos visited</h2>
                  <p>{stats.wishlist ? `${stats.wishlist} saved for the next trip.` : 'Pick a zoo to start the adventure.'}</p>
                  <button type="button" onClick={() => setView('passport')}>Open passport <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          </section>

          <section className="page-shell atlas-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">STARTER EXPEDITIONS</span>
                <h2>Four zoos. One home base.</h2>
                <p>A first playable hub from Woodbine, Maryland—built to expand across the country.</p>
              </div>
              <div className="section-chip"><Binoculars size={18} /> Northeast collection</div>
            </div>
            <AtlasMap zoos={filteredZoos} onSelect={setSelectedZoo} />
          </section>

          <section className="page-shell zoo-list-section">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">CHOOSE AN ADVENTURE</span>
                <h2>Where should we go next?</h2>
              </div>
              <span className="result-count">{filteredZoos.length} zoos</span>
            </div>
            <div className="zoo-grid">
              {filteredZoos.map((zoo) => (
                <ZooCard
                  key={zoo.id}
                  zoo={zoo}
                  status={passport[zoo.id]}
                  onExplore={() => setSelectedZoo(zoo)}
                  onStatus={() => {
                    const current = passport[zoo.id]
                    setStatus(zoo.id, !current ? 'wishlist' : current === 'wishlist' ? 'visited' : undefined)
                  }}
                />
              ))}
            </div>
            {!filteredZoos.length && (
              <div className="empty-state"><CircleHelp size={36} /><h3>No zoo found yet</h3><p>Try a city, state, or one of the four starter zoo names.</p></div>
            )}
          </section>

          <section className="page-shell coming-soon">
            <div className="coming-icon"><BusFront size={30} /></div>
            <div><span className="eyebrow light">THE ROAD AHEAD</span><h2>Next stop: every zoo in America.</h2><p>Regional collections, road-trip routes, family journals, live cameras and immersive 3D habitat walks can grow from this first atlas.</p></div>
            <ListChecks size={54} />
          </section>
        </main>
      )}
      <SiteFooter />
    </div>
  )
}

function SiteHeader({ view, onAtlas, onPassport }: { view: View; onAtlas: () => void; onPassport: () => void }) {
  return (
    <header className="site-header">
      <button type="button" className="brand" onClick={onAtlas}>
        <span><PawPrint size={22} /></span>
        <div><strong>Jasper’s</strong><small>ZOO MAPS</small></div>
      </button>
      <nav aria-label="Primary navigation">
        <button type="button" className={view === 'atlas' ? 'active' : ''} onClick={onAtlas}><Map size={17} /> Explore</button>
        <button type="button" className={view === 'passport' ? 'active' : ''} onClick={onPassport}><PawPrint size={17} /> My Passport</button>
      </nav>
      <div className="home-base"><MapPin size={15} /><span><small>HOME BASE</small>Woodbine, MD</span></div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="brand footer-brand"><span><PawPrint size={20} /></span><div><strong>Jasper’s</strong><small>ZOO MAPS</small></div></div>
      <p>Built for curious explorers. Zoo details are a family-planning preview; verify hours, animals and access on each zoo’s official site.</p>
      <span>Prototype atlas · Original maps · 2026</span>
    </footer>
  )
}
