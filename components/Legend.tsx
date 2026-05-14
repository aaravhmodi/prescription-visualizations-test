'use client'

import { getLegendStops } from '@/lib/colorScale'
import { findLayer } from '@/lib/layers'

interface Props {
  activeLayer: string
  min: number
  max: number
}

export default function Legend({ activeLayer, min, max }: Props) {
  const layer = findLayer(activeLayer)
  const inverted = layer?.colorDir === 'inverted'
  const stops = getLegendStops(inverted)

  const fmt = (v: number) => {
    if (isNaN(v)) return '—'
    if (Math.abs(v) < 10) return v.toFixed(2)
    return v.toFixed(0)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 min-w-[200px]">
      <div className="text-xs font-semibold text-gray-300 mb-2 truncate">
        {layer?.label ?? activeLayer}
        {layer?.unit ? <span className="text-gray-500 ml-1">({layer.unit})</span> : null}
      </div>

      <div className="flex h-3 rounded overflow-hidden mb-1">
        {stops.map((s, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: s.color }} />
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>{fmt(min)}</span>
        <span>{fmt((min + max) / 2)}</span>
        <span>{fmt(max)}</span>
      </div>

      <div className="flex justify-between text-xs text-gray-600 mt-0.5">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}
