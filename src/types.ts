export interface Coordinates {
  lat: number
  lng: number
}

export interface Animal {
  name: string
  scientificName: string
  emoji: string
  habitat: string
  status: string
  fact: string
  accent: string
}

export interface MapSpot {
  id: string
  label: string
  detail: string
  emoji: string
  x: number
  y: number
  color: string
}

export interface Zoo {
  id: string
  name: string
  shortName: string
  city: string
  state: string
  address: string
  coordinates: Coordinates
  distanceMiles: number
  driveTime: string
  transitNote: string
  tagline: string
  description: string
  heroEmoji: string
  palette: [string, string]
  officialUrl: string
  sourceUrl: string
  highlights: string[]
  animals: Animal[]
  mapSpots: MapSpot[]
}
