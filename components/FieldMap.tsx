'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { Layer, Popup, Source } from 'react-map-gl/mapbox'
import type { LayerProps, MapRef } from 'react-map-gl/mapbox'
import type { MapMouseEvent } from 'mapbox-gl'
import type { ExpressionSpecification } from 'mapbox-gl'
import type { FeatureCollection, GeoJsonProperties, Point } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getColor } from '@/lib/colorScale'
import { findLayer } from '@/lib/layers'
import Legend from './Legend'

interface FieldPoint {
  fid: number
  Latitude: number
  Longitude: number
  [key: string]: number | string
}

interface Props {
  activeLayer: string
  weekFilter: number
}

interface HoverInfo {
  longitude: number
  latitude: number
  label: string
  value: number
  unit: string
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function computeCumulativeN(pt: FieldPoint, weekIndex: number): number {
  const totalN = pt['TOTAL_N_APPLIED_LB_AC'] as number
  if (isNaN(totalN)) return NaN
  let cumSum = 0
  let totalSum = 0
  for (let i = 1; i <= 8; i++) {
    const applied = pt[`L${i}_applied_nitrogen`] as number
    const length = pt[`L${i}_length`] as number
    const contrib = (isNaN(applied) ? 0 : applied) * (isNaN(length) ? 2 : length)
    if (i <= weekIndex) cumSum += contrib
    totalSum += contrib
  }
  if (totalSum === 0) return 0
  return totalN * (cumSum / totalSum)
}

function buildColorExpression(
  min: number,
  max: number,
  inverted: boolean,
  valueKey: string
): ExpressionSpecification {
  if (min === max) {
    return ['literal', getColor(min, min, max, inverted)] as unknown as ExpressionSpecification
  }
  const steps = 10
  const stops: (number | string)[] = []
  for (let i = 0; i <= steps; i++) {
    const v = min + (i / steps) * (max - min)
    stops.push(v, getColor(v, min, max, inverted))
  }
  return ['interpolate', ['linear'], ['get', valueKey], ...stops] as unknown as ExpressionSpecification
}

export default function FieldMap({ activeLayer, weekFilter }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [points, setPoints] = useState<FieldPoint[]>([])
  const [geojson, setGeojson] = useState<object | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)

  useEffect(() => {
    const FIELD_KEY = 'fielddata_v1'

    async function loadData() {
      // Use sessionStorage to avoid re-fetching the CSV JSON on every page reload
      let fieldData: FieldPoint[] | null = null
      try {
        const cached = sessionStorage.getItem(FIELD_KEY)
        if (cached) fieldData = JSON.parse(cached)
      } catch {
        // sessionStorage unavailable or quota exceeded — fall through to fetch
      }

      const [data, geo] = await Promise.all([
        fieldData
          ? Promise.resolve(fieldData)
          : fetch('/api/fielddata')
              .then((r) => r.json())
              .then((d) => {
                try { sessionStorage.setItem(FIELD_KEY, JSON.stringify(d)) } catch { /* quota exceeded */ }
                return d
              }),
        fetch('/api/geojson').then((r) => r.json()).catch(() => null),
      ])

      setPoints(data)
      if (geo && !geo.error) setGeojson(geo)
      setLoading(false)
    }

    loadData().catch((e: Error) => {
      setError(e.message)
      setLoading(false)
    })
  }, [])

  const layer = findLayer(activeLayer)
  const inverted = layer?.colorDir === 'inverted'
  const useWeek = weekFilter > 0 && activeLayer === 'TOTAL_N_APPLIED_LB_AC'

  const { min, max } = useMemo(() => {
    const vals = points
      .map((p) => (useWeek ? computeCumulativeN(p, weekFilter) : (p[activeLayer] as number)))
      .filter((v) => !isNaN(v) && isFinite(v))
    if (!vals.length) return { min: 0, max: 1 }
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [points, activeLayer, weekFilter, useWeek])

  // Embed computed value as __val on each feature for GL expressions
  const pointsGeoJSON = useMemo<FeatureCollection<Point, GeoJsonProperties>>(() => ({
    type: 'FeatureCollection',
    features: points
      .map((pt) => {
        const val = useWeek ? computeCumulativeN(pt, weekFilter) : (pt[activeLayer] as number)
        if (isNaN(val) || !isFinite(val)) return null
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [pt.Longitude, pt.Latitude] },
          properties: { ...pt, __val: val },
        }
      })
      .filter(Boolean) as FeatureCollection<Point, GeoJsonProperties>['features'],
  }), [points, activeLayer, weekFilter, useWeek])

  const colorExpr = useMemo(
    () => buildColorExpression(min, max, inverted, '__val'),
    [min, max, inverted]
  )

  const circleLayer: LayerProps = {
    id: 'field-points',
    type: 'circle',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6, 20, 10] as ExpressionSpecification,
      'circle-color': colorExpr,
      'circle-opacity': 0.88,
      'circle-stroke-width': 0.5,
      'circle-stroke-color': 'rgba(0,0,0,0.25)',
    },
  }

  const boundaryLine: LayerProps = {
    id: 'boundary-line',
    type: 'line',
    paint: {
      'line-color': '#52b788',
      'line-width': 1.5,
      'line-dasharray': [3, 2],
    },
  }

  // Fit map to field points once loaded
  useEffect(() => {
    if (!mapRef.current || points.length === 0) return
    const lats = points.map((p) => p.Latitude)
    const lngs = points.map((p) => p.Longitude)
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 40, duration: 800 }
    )
  }, [points])

  const onMouseEnter = useCallback(
    (e: MapMouseEvent & { features?: GeoJSON.Feature[] }) => {
      const feat = e.features?.[0]
      if (!feat) return
      const val = feat.properties?.__val as number
      setHoverInfo({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        label: layer?.label ?? activeLayer,
        value: val,
        unit: layer?.unit ?? '',
      })
    },
    [layer, activeLayer]
  )

  const onMouseLeave = useCallback(() => setHoverInfo(null), [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading field data…</p>
        </div>
      </div>
    )
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 p-6">
        <div className="text-center space-y-3">
          <p className="text-white text-sm font-semibold">Mapbox access token is missing.</p>
          <p className="text-gray-400 text-xs max-w-sm">
            Add <code className="bg-gray-900 px-1 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to your environment and restart the app.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -81.19, latitude: 44.44, zoom: 14 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['field-points']}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Field boundary */}
        {geojson && (
          <Source id="boundary" type="geojson" data={geojson as FeatureCollection}>
            <Layer {...boundaryLine} />
          </Source>
        )}

        {/* Data points */}
        <Source id="field-points" type="geojson" data={pointsGeoJSON}>
          <Layer {...circleLayer} />
        </Source>

        {/* Hover tooltip */}
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={12}
          >
            <div className="text-xs space-y-0.5 bg-gray-900 text-white px-2 py-1.5 rounded shadow-lg">
              <div className="font-semibold text-emerald-400">{hoverInfo.label}</div>
              <div>{hoverInfo.value.toFixed(3)} {hoverInfo.unit}</div>
              <div className="text-gray-400 text-[10px]">
                {hoverInfo.latitude.toFixed(5)}, {hoverInfo.longitude.toFixed(5)}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Point count badge */}
      <div className="absolute top-3 right-3 z-[500] bg-gray-900/90 border border-gray-700 rounded px-2 py-1 text-xs text-gray-400 pointer-events-none">
        {pointsGeoJSON.features.length.toLocaleString()} points
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-6 right-3 z-[500]">
        <Legend activeLayer={activeLayer} min={min} max={max} />
      </div>
    </div>
  )
}
