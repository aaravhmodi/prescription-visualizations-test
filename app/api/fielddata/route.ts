import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

const NEEDED_COLS = [
  'fid',
  'Latitude',
  'Longitude',
  // prescriptions
  'TOTAL_N_APPLIED_LB_AC',
  'TARGET_N_LB_AC',
  'N_RATE',
  'NUE',
  // yield
  'VRYIELDVOL',
  'Moisture',
  'DRYMATTER',
  // soil
  'pH',
  'OM',
  'CEC',
  'K',
  'P1',
  'Ca',
  'Mg',
  'S',
  'Zn',
  'B',
  // water / risk
  'WTR_IDX',
  'WTR_IDX_FA',
  'WTR_IDX_FAWLOG',
  'DD_value',
  // topology
  'Elevation',
  'YLD_Elevation',
  'PLANT_Elevation',
  'SLP_value',
  'FA_value',
  'FAWLOG_value',
  // context
  'dom_tex',
  'TEX_RISK',
  'N_RESP',
  'YSIG',
]

export async function GET() {
  const csvPath = path.join(process.cwd(), 'Christies.csv')

  if (!fs.existsSync(csvPath)) {
    return NextResponse.json({ error: 'Data file not found' }, { status: 404 })
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8')

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  const rows = result.data
    .filter((row) => {
      const lat = parseFloat(row['Latitude'])
      const lng = parseFloat(row['Longitude'])
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })
    .map((row) => {
      const out: Record<string, number | string> = {}
      for (const col of NEEDED_COLS) {
        const raw = row[col]
        if (raw === undefined || raw === '' || raw === null) {
          out[col] = NaN
        } else {
          const num = parseFloat(raw)
          out[col] = isNaN(num) ? raw : num
        }
      }
      return out
    })

  return NextResponse.json(rows)
}
