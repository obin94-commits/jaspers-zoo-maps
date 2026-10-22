import { describe, expect, it } from 'vitest'
import { buildDirectionsUrl } from './routes'

describe('directions links', () => {
  it('builds a Google Maps driving route from Woodbine to a zoo', () => {
    const url = buildDirectionsUrl({ lat: 39.3498, lng: -77.0647 }, { lat: 38.9296, lng: -77.0498 }, 'driving')

    expect(url).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=39.3498%2C-77.0647&destination=38.9296%2C-77.0498&travelmode=driving',
    )
  })
})
