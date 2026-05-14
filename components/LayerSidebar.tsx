'use client'

import { LAYER_GROUPS } from '@/lib/layers'
import DateFilter from './DateFilter'

interface Props {
  activeLayer: string
  onSelect: (id: string) => void
  weekFilter: number
  onWeekFilter: (week: number) => void
}

const GROUP_COLORS: Record<string, string> = {
  prescriptions: 'hover:border-emerald-500 data-[active]:border-emerald-400 data-[active]:bg-emerald-900/40 data-[active]:text-emerald-300',
  yield: 'hover:border-yellow-500 data-[active]:border-yellow-400 data-[active]:bg-yellow-900/40 data-[active]:text-yellow-300',
  soil: 'hover:border-amber-500 data-[active]:border-amber-400 data-[active]:bg-amber-900/40 data-[active]:text-amber-300',
  water: 'hover:border-blue-500 data-[active]:border-blue-400 data-[active]:bg-blue-900/40 data-[active]:text-blue-300',
  topology: 'hover:border-violet-500 data-[active]:border-violet-400 data-[active]:bg-violet-900/40 data-[active]:text-violet-300',
}

const GROUP_HEADER_COLORS: Record<string, string> = {
  prescriptions: 'text-emerald-400 border-emerald-800',
  yield: 'text-yellow-400 border-yellow-800',
  soil: 'text-amber-400 border-amber-800',
  water: 'text-blue-400 border-blue-800',
  topology: 'text-violet-400 border-violet-800',
}

export default function LayerSidebar({ activeLayer, onSelect, weekFilter, onWeekFilter }: Props) {
  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Data Layers</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {LAYER_GROUPS.map((group) => (
          <div key={group.id} className="px-2">
            <div className={`flex items-center gap-1.5 px-2 py-1.5 mb-1 border-b ${GROUP_HEADER_COLORS[group.id]}`}>
              <span className="text-sm">{group.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">{group.label}</span>
            </div>
            <div className="space-y-0.5 mb-3">
              {group.layers.map((layer) => {
                const isActive = activeLayer === layer.id
                return (
                  <button
                    key={layer.id}
                    data-active={isActive ? '' : undefined}
                    onClick={() => onSelect(layer.id)}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs border transition-all
                      ${isActive
                        ? `border-opacity-100 ${GROUP_COLORS[group.id]}`
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }
                      ${GROUP_COLORS[group.id]}`}
                  >
                    <span className="block truncate">{layer.label}</span>
                    {layer.unit && (
                      <span className="text-gray-600 text-[10px]">{layer.unit}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <DateFilter weekFilter={weekFilter} onChange={onWeekFilter} />
    </aside>
  )
}
