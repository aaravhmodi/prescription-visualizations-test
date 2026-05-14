import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'ChristiesMAP.geojson')

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'GeoJSON file not found' }, { status: 404 })
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  return new NextResponse(content, {
    headers: { 'Content-Type': 'application/geo+json' },
  })
}
