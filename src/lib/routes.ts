export interface Coordinates {
  lat: number
  lng: number
}

export type TravelMode = 'driving' | 'transit' | 'walking' | 'bicycling'

export function buildDirectionsUrl(origin: Coordinates, destination: Coordinates, mode: TravelMode): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: mode,
  })

  return `https://www.google.com/maps/dir/?${params.toString()}`
}
