import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const NEEDED_COLS = [
  'fid', 'Latitude', 'Longitude',
  'TOTAL_N_APPLIED_LB_AC', 'TARGET_N_LB_AC', 'N_RATE', 'NUE',
  'VRYIELDVOL', 'Moisture', 'DRYMATTER',
  'pH', 'OM', 'CEC', 'K', 'P1', 'Ca', 'Mg', 'S', 'Zn', 'B',
  'WTR_IDX', 'WTR_IDX_FA', 'WTR_IDX_FAWLOG', 'DD_value',
  'Elevation', 'YLD_Elevation', 'PLANT_Elevation', 'SLP_value', 'FA_value', 'FAWLOG_value',
  'dom_tex', 'TEX_RISK', 'N_RESP', 'YSIG',
  'L1_applied_nitrogen', 'L1_length',
  'L2_applied_nitrogen', 'L2_length',
  'L3_applied_nitrogen', 'L3_length',
  'L4_applied_nitrogen', 'L4_length',
  'L5_applied_nitrogen', 'L5_length',
  'L6_applied_nitrogen', 'L6_length',
  'L7_applied_nitrogen', 'L7_length',
  'L8_applied_nitrogen', 'L8_length',
]

console.log('Reading CSV...')
const csvText = fs.readFileSync(path.join(root, 'Christies.csv'), 'utf-8')

console.log('Parsing...')
const result = Papa.parse(csvText, { header: true, skipEmptyLines: true })

const rows = result.data.filter((row) => {
  const lat = parseFloat(row['Latitude'])
  const lng = parseFloat(row['Longitude'])
  return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
})

// Array-of-arrays: cols header + numeric rows — avoids repeating 40 key names 114k times
const values = rows.map((row) =>
  NEEDED_COLS.map((col) => {
    const raw = row[col]
    if (raw === undefined || raw === '' || raw === null) return null
    const num = parseFloat(raw)
    return isNaN(num) ? raw : num
  })
)

const out = { cols: NEEDED_COLS, rows: values }
const outPath = path.join(root, 'public', 'fielddata.json')

console.log(`Writing ${rows.length} rows × ${NEEDED_COLS.length} cols to public/fielddata.json...`)
fs.writeFileSync(outPath, JSON.stringify(out))

const size = fs.statSync(outPath).size
console.log(`Done. File size: ${(size / 1024 / 1024).toFixed(1)} MB`)
