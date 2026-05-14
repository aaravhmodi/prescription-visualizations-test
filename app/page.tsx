'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import LayerSidebar from '@/components/LayerSidebar'

const FieldMap = dynamic(() => import('@/components/FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-950">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function Home() {
  const [activeLayer, setActiveLayer] = useState('TOTAL_N_APPLIED_LB_AC')

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <header className="flex-shrink-0 h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-lg">🌾</span>
          <span className="font-semibold text-white text-sm">Prescription Visualization</span>
          <span className="text-gray-600 text-sm">·</span>
          <span className="text-gray-400 text-sm">Christies Farm</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Live data
          </span>
          <span>2025 Season</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        <LayerSidebar activeLayer={activeLayer} onSelect={setActiveLayer} />
        <FieldMap activeLayer={activeLayer} />
      </div>
    </div>
  )
}
