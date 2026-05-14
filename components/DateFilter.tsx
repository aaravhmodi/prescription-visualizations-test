'use client'

import { APPLICATION_EVENTS } from '@/lib/applicationDates'

interface Props {
  weekFilter: number
  onChange: (week: number) => void
}

export default function DateFilter({ weekFilter, onChange }: Props) {
  const event = weekFilter > 0 ? APPLICATION_EVENTS[weekFilter - 1] : null

  return (
    <div className="px-3 py-3 border-t border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          📅 Application Week
        </span>
        {weekFilter > 0 && (
          <button
            onClick={() => onChange(0)}
            className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <input
        type="range"
        min={0}
        max={8}
        step={1}
        value={weekFilter}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 appearance-none rounded bg-gray-700 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-emerald-400
          [&::-webkit-slider-thumb]:cursor-pointer"
      />

      <div className="flex justify-between mt-1.5 text-[9px] text-gray-600">
        <span>All</span>
        <span>Oct 1</span>
      </div>

      <div className="mt-2 min-h-[28px]">
        {weekFilter === 0 ? (
          <p className="text-[10px] text-gray-500">All applications combined</p>
        ) : (
          <div className="bg-emerald-900/30 border border-emerald-800/50 rounded px-2 py-1">
            <p className="text-[10px] text-emerald-300 font-medium">
              Cumulative N as of {event!.display}
            </p>
            <p className="text-[9px] text-gray-500">
              App {weekFilter} of 8 · {event!.date}
            </p>
          </div>
        )}
      </div>

      <p className="text-[9px] text-gray-600 mt-1.5">Affects Total N Applied</p>
    </div>
  )
}
