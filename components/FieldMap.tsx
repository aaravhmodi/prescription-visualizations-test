'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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
}

// Fix Leaflet's default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function CanvasPoints({ points, activeLayer, min, max }: {
  points: FieldPoint[]
  activeLayer: string
  min: number
  max: number
}) {
  const map = useMap()
  const layerRef = useRef<L.LayerGroup | null>(null)
  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])
  const layer = findLayer(activeLayer)
  const inverted = layer?.colorDir === 'inverted'

  useEffect(() => {
    if (points.length === 0) return
    const lats = points.map((p) => p.Latitude)
    const lngs = points.map((p) => p.Longitude)
    const bounds = L.latLngBounds(
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    )
    map.fitBounds(bounds, { padding: [20, 20] })
  }, [points, map])

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.clearLayers()
      layerRef.current.remove()
    }

    const group = L.layerGroup().addTo(map)
    layerRef.current = group

    points.forEach((pt) => {
      const val = pt[activeLayer] as number
      if (isNaN(val)) return

      const color = getColor(val, min, max, inverted)

      const circle = L.circleMarker([pt.Latitude, pt.Longitude], {
        renderer,
        radius: 4,
        fillColor: color,
        fillOpacity: 0.85,
        color: 'rgba(0,0,0,0.2)',
        weight: 0.5,
      })

      circle.bindTooltip(
        `<div class="text-xs space-y-0.5">
          <div class="font-semibold">${layer?.label ?? activeLayer}</div>
          <div>${isNaN(val) ? '—' : val.toFixed(3)} ${layer?.unit ?? ''}</div>
          <div class="text-gray-400 text-[10px]">Lat: ${pt.Latitude.toFixed(5)}, Lon: ${pt.Longitude.toFixed(5)}</div>
        </div>`,
        { className: 'ag-tooltip', sticky: true }
      )

      circle.addTo(group)
    })

    return () => {
      group.clearLayers()
      group.remove()
    }
  }, [points, activeLayer, min, max, inverted, map, renderer, layer])

  return null
}

export default function FieldMap({ activeLayer }: Props) {
  const [points, setPoints] = useState<FieldPoint[]>([])
  const [geojson, setGeojson] = useState<object | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/fielddata').then((r) => r.json()),
      fetch('/api/geojson').then((r) => r.json()).catch(() => null),
    ])
      .then(([data, geo]) => {
        setPoints(data)
        if (geo && !geo.error) setGeojson(geo)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const { min, max } = useMemo(() => {
    const vals = points
      .map((p) => p[activeLayer] as number)
      .filter((v) => !isNaN(v) && isFinite(v))
    if (!vals.length) return { min: 0, max: 1 }
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [points, activeLayer])

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

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={[44.44, -81.19]}
        zoom={14}
        style={{ height: '100%', width: '100%', background: '#111' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={20}
        />

        {geojson && (
          <GeoJSON
            key="boundary"
            data={geojson as Parameters<typeof L.geoJSON>[0]}
            style={{
              color: '#52b788',
              weight: 1.5,
              fillOpacity: 0,
              dashArray: '4',
            }}
          />
        )}

        <CanvasPoints points={points} activeLayer={activeLayer} min={min} max={max} />
      </MapContainer>

      {/* Point count badge */}
      <div className="absolute top-3 right-3 z-[500] bg-gray-900/90 border border-gray-700 rounded px-2 py-1 text-xs text-gray-400">
        {points.length.toLocaleString()} points
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-6 right-3 z-[500]">
        <Legend activeLayer={activeLayer} min={min} max={max} />
      </div>
    </div>
  )
}
