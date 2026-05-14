// RdYlGn: red (low) → yellow → green (high)
const STOPS_NORMAL: [number, number, number][] = [
  [215, 25, 28],   // red        – low
  [253, 174, 97],  // orange
  [255, 255, 191], // pale yellow
  [166, 217, 106], // light green
  [26, 150, 65],   // dark green – high
]

// Inverted: green (low) → yellow → red (high)
const STOPS_INVERTED: [number, number, number][] = [
  [26, 150, 65],   // dark green – low
  [166, 217, 106], // light green
  [255, 255, 191], // pale yellow
  [253, 174, 97],  // orange
  [215, 25, 28],   // red        – high
]

function lerp(stops: [number, number, number][], t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const scaled = clamped * (stops.length - 1)
  const i = Math.floor(scaled)
  const f = scaled - i
  const a = stops[Math.min(i, stops.length - 1)]
  const b = stops[Math.min(i + 1, stops.length - 1)]
  const r = Math.round(a[0] + f * (b[0] - a[0]))
  const g = Math.round(a[1] + f * (b[1] - a[1]))
  const bl = Math.round(a[2] + f * (b[2] - a[2]))
  return `rgb(${r},${g},${bl})`
}

export function getColor(value: number, min: number, max: number, inverted = false): string {
  if (max === min) return inverted ? lerp(STOPS_INVERTED, 0.5) : lerp(STOPS_NORMAL, 0.5)
  const t = (value - min) / (max - min)
  return inverted ? lerp(STOPS_INVERTED, t) : lerp(STOPS_NORMAL, t)
}

export function getLegendStops(inverted = false): { color: string; label: string }[] {
  const stops = inverted ? STOPS_INVERTED : STOPS_NORMAL
  return stops.map((s, i) => ({
    color: `rgb(${s[0]},${s[1]},${s[2]})`,
    label: ['Min', '25%', '50%', '75%', 'Max'][i],
  }))
}
