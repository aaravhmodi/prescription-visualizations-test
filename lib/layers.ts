export interface LayerDef {
  id: string
  label: string
  unit: string
  colorDir?: 'normal' | 'inverted' // inverted = high value is good (e.g. yield)
}

export interface LayerGroup {
  id: string
  label: string
  icon: string
  color: string
  layers: LayerDef[]
}

export const LAYER_GROUPS: LayerGroup[] = [
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: '💉',
    color: 'emerald',
    layers: [
      { id: 'TOTAL_N_APPLIED_LB_AC', label: 'Total N Applied', unit: 'lb/ac' },
      { id: 'TARGET_N_LB_AC', label: 'Target N', unit: 'lb/ac' },
      { id: 'N_RATE', label: 'N Rate', unit: 'lb/ac' },
      { id: 'NUE', label: 'N Use Efficiency', unit: '%', colorDir: 'inverted' },
    ],
  },
  {
    id: 'yield',
    label: 'Yield',
    icon: '🌽',
    color: 'yellow',
    layers: [
      { id: 'VRYIELDVOL', label: 'Yield Volume', unit: 'bu/ac', colorDir: 'inverted' },
      { id: 'Moisture', label: 'Moisture', unit: '%' },
      { id: 'DRYMATTER', label: 'Dry Matter', unit: 'bu/ac', colorDir: 'inverted' },
    ],
  },
  {
    id: 'soil',
    label: 'Soil',
    icon: '🪨',
    color: 'amber',
    layers: [
      { id: 'pH', label: 'Soil pH', unit: '' },
      { id: 'OM', label: 'Organic Matter', unit: '%', colorDir: 'inverted' },
      { id: 'CEC', label: 'CEC', unit: 'meq/100g', colorDir: 'inverted' },
      { id: 'K', label: 'Potassium (K)', unit: 'ppm', colorDir: 'inverted' },
      { id: 'P1', label: 'Phosphorus (P)', unit: 'ppm', colorDir: 'inverted' },
      { id: 'Ca', label: 'Calcium (Ca)', unit: 'ppm', colorDir: 'inverted' },
      { id: 'Mg', label: 'Magnesium (Mg)', unit: 'ppm', colorDir: 'inverted' },
      { id: 'S', label: 'Sulfur (S)', unit: 'ppm', colorDir: 'inverted' },
      { id: 'Zn', label: 'Zinc (Zn)', unit: 'ppm', colorDir: 'inverted' },
      { id: 'B', label: 'Boron (B)', unit: 'ppm', colorDir: 'inverted' },
    ],
  },
  {
    id: 'water',
    label: 'Water & Risk',
    icon: '💧',
    color: 'blue',
    layers: [
      { id: 'WTR_IDX', label: 'Water Index', unit: '', colorDir: 'inverted' },
      { id: 'WTR_IDX_FA', label: 'TWI (Flow Acc.)', unit: '', colorDir: 'inverted' },
      { id: 'WTR_IDX_FAWLOG', label: 'TWI (Weighted)', unit: '', colorDir: 'inverted' },
      { id: 'DD_value', label: 'Drainage', unit: '' },
    ],
  },
  {
    id: 'topology',
    label: 'Topology',
    icon: '⛰️',
    color: 'violet',
    layers: [
      { id: 'Elevation', label: 'Elevation', unit: 'm', colorDir: 'inverted' },
      { id: 'YLD_Elevation', label: 'Yield Elevation', unit: 'm', colorDir: 'inverted' },
      { id: 'PLANT_Elevation', label: 'Planting Elevation', unit: 'm', colorDir: 'inverted' },
      { id: 'SLP_value', label: 'Slope', unit: '°' },
      { id: 'FA_value', label: 'Flow Accumulation', unit: '', colorDir: 'inverted' },
      { id: 'FAWLOG_value', label: 'Flow Acc. (Log)', unit: '', colorDir: 'inverted' },
    ],
  },
]

export const ALL_LAYER_IDS = LAYER_GROUPS.flatMap((g) => g.layers.map((l) => l.id))

export function findLayer(id: string): LayerDef | undefined {
  for (const g of LAYER_GROUPS) {
    const l = g.layers.find((l) => l.id === id)
    if (l) return l
  }
}
