import {
  AttributionControl,
  type GeoJSONSource,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { HOME_BASE } from '../data/zoos'
import type { Zoo } from '../types'

setWorkerUrl(workerUrl)

const NATIONAL_CAMERA = {
  center: [-96, 38] as [number, number],
  zoom: 2.75,
  pitch: 18,
  bearing: -7,
}

export interface MapExplorerHandle {
  flyToZoo: (zoo: Zoo) => void
  reset: () => void
  setThreeDimensional: (enabled: boolean) => void
  flyHome: () => void
}

interface MapExplorerProps {
  zoos: Zoo[]
  visibleZooIds: string[]
  selectedId?: string
  threeDimensional: boolean
  onSelect: (zoo: Zoo) => void
}

function motionDuration(milliseconds: number) {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : milliseconds
}

function zooCameraPadding() {
  if (window.innerWidth <= 760) {
    return { top: 70, right: 18, bottom: Math.round(window.innerHeight * 0.62), left: 18 }
  }
  return { top: 90, right: 440, bottom: 145, left: 60 }
}

function makeZooMarker(zoo: Zoo, onSelect: () => void) {
  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = 'earth-zoo-marker'
  marker.setAttribute('aria-label', `Open ${zoo.name}`)
  marker.style.setProperty('--marker-color', zoo.palette[1])
  marker.innerHTML = `<span class="earth-marker-pulse"></span><span class="earth-marker-icon">${zoo.heroEmoji}</span><span class="earth-marker-label">${zoo.shortName}</span>`
  marker.addEventListener('click', onSelect)
  return marker
}

export const MapExplorer = forwardRef<MapExplorerHandle, MapExplorerProps>(function MapExplorer(
  { zoos, visibleZooIds, selectedId, threeDimensional, onSelect },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Map<string, HTMLElement>>(new Map())
  const markersAddedRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  const zoosRef = useRef(zoos)
  const visibleZooIdsRef = useRef(visibleZooIds)
  const selectedIdRef = useRef(selectedId)
  const threeDimensionalRef = useRef(threeDimensional)
  const styleReadyRef = useRef(false)
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'fallback'>('loading')

  onSelectRef.current = onSelect
  zoosRef.current = zoos
  visibleZooIdsRef.current = visibleZooIds
  selectedIdRef.current = selectedId
  threeDimensionalRef.current = threeDimensional

  function routeFeature(zoo?: Zoo) {
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: zoo
          ? [
              [HOME_BASE.coordinates.lng, HOME_BASE.coordinates.lat],
              [zoo.coordinates.lng, zoo.coordinates.lat],
            ]
          : [],
      },
    }
  }

  function flyToZoo(zoo: Zoo) {
    mapRef.current?.flyTo({
      center: [zoo.coordinates.lng, zoo.coordinates.lat],
      zoom: 14.4,
      pitch: threeDimensionalRef.current ? 62 : 0,
      bearing: threeDimensionalRef.current ? -20 : 0,
      padding: zooCameraPadding(),
      duration: motionDuration(2300),
    })
  }

  useImperativeHandle(forwardedRef, () => ({
    flyToZoo,
    reset() {
      mapRef.current?.flyTo({
        ...NATIONAL_CAMERA,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        duration: motionDuration(1800),
      })
    },
    setThreeDimensional(enabled) {
      threeDimensionalRef.current = enabled
      mapRef.current?.easeTo({
        pitch: enabled ? 62 : 0,
        bearing: enabled ? -18 : 0,
        duration: motionDuration(900),
      })
    },
    flyHome() {
      mapRef.current?.flyTo({
        center: [HOME_BASE.coordinates.lng, HOME_BASE.coordinates.lat],
        zoom: 9,
        pitch: threeDimensionalRef.current ? 52 : 0,
        bearing: threeDimensionalRef.current ? -15 : 0,
        padding: window.innerWidth <= 760
          ? { top: 70, right: 18, bottom: 190, left: 18 }
          : { top: 80, right: 80, bottom: 145, left: 80 },
        duration: motionDuration(1800),
      })
    },
  }))

  useEffect(() => {
    if (!containerRef.current || typeof WebGLRenderingContext === 'undefined') {
      setMapState('fallback')
      return
    }

    const markerElements = markersRef.current

    const map = new MapLibreMap({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      ...NATIONAL_CAMERA,
      attributionControl: false,
      canvasContextAttributes: { antialias: true },
      maxPitch: 75,
    })

    mapRef.current = map
    map.touchZoomRotate.disableRotation()
    map.touchPitch.disable()
    map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right')
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left')

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' })
      styleReadyRef.current = true
      if (!markersAddedRef.current) {
        const homeElement = document.createElement('div')
        homeElement.className = 'earth-home-marker'
        homeElement.innerHTML = '<span>⌂</span><small>HOME</small>'
        new Marker({ element: homeElement, anchor: 'bottom' })
          .setLngLat([HOME_BASE.coordinates.lng, HOME_BASE.coordinates.lat])
          .addTo(map)

        zoosRef.current.forEach((zoo) => {
          const element = makeZooMarker(zoo, () => {
            flyToZoo(zoo)
            onSelectRef.current(zoo)
          })
          element.hidden = !visibleZooIdsRef.current.includes(zoo.id)
          element.classList.toggle('selected', zoo.id === selectedIdRef.current)
          markerElements.set(zoo.id, element)
          new Marker({ element, anchor: 'bottom' })
            .setLngLat([zoo.coordinates.lng, zoo.coordinates.lat])
            .addTo(map)
        })
        markersAddedRef.current = true
      }
      setMapState('ready')
    })

    map.on('load', () => {
      try {
        map.addSource('jzm-route', {
          type: 'geojson',
          data: routeFeature(zoosRef.current.find((zoo) => zoo.id === selectedIdRef.current)),
        })
        map.addLayer({
          id: 'jzm-route-glow',
          type: 'line',
          source: 'jzm-route',
          paint: {
            'line-color': '#f4cd63',
            'line-width': 8,
            'line-opacity': 0.18,
          },
        })
        map.addLayer({
          id: 'jzm-route-line',
          type: 'line',
          source: 'jzm-route',
          paint: {
            'line-color': '#f4cd63',
            'line-width': 2.2,
            'line-opacity': 0.95,
            'line-dasharray': [2, 2],
          },
        })

        if (!map.getSource('jzm-terrain')) {
          map.addSource('jzm-terrain', {
            type: 'raster-dem',
            url: 'https://tiles.mapterhorn.com/tilejson.json',
          })
          map.setTerrain({ source: 'jzm-terrain', exaggeration: 1.08 })
        }

      } catch {
        // Terrain is a progressive enhancement.
      }

      setMapState('ready')
    })

    map.on('error', () => {
      if (!styleReadyRef.current) setMapState('fallback')
    })

    return () => {
      markerElements.clear()
      markersAddedRef.current = false
      styleReadyRef.current = false
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.classList.toggle('selected', id === selectedId)
    })
    const map = mapRef.current
    const source = map?.getSource('jzm-route') as GeoJSONSource | undefined
    source?.setData(routeFeature(zoosRef.current.find((zoo) => zoo.id === selectedId)))
  }, [selectedId])

  useEffect(() => {
    const visible = new Set(visibleZooIds)
    markersRef.current.forEach((marker, id) => {
      marker.hidden = !visible.has(id)
    })
  }, [visibleZooIds])

  return (
    <div className={`earth-map ${mapState}`} data-map-engine="maplibre">
      <div ref={containerRef} className="earth-map-canvas" role="region" aria-label="Pan and zoom zoo map" />
      {mapState !== 'ready' && (
        <div className="earth-map-loading" role="status">
          <div className="loading-globe"><i /><i /><i /></div>
          <span>{mapState === 'fallback' ? 'Map preview mode' : 'Building the zoo globe…'}</span>
        </div>
      )}
    </div>
  )
})
