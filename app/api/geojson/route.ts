import fs from 'fs'
import path from 'path'
import { createReadStream } from 'fs'

export async function GET() {
  const filePath = path.join(process.cwd(), 'ChristiesMAP.geojson')

  if (!fs.existsSync(filePath)) {
    return new Response(JSON.stringify({ error: 'GeoJSON file not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stream the 1.2 GB file rather than loading it all into memory at once
  const nodeStream = createReadStream(filePath)
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => controller.enqueue(chunk))
      nodeStream.on('end', () => controller.close())
      nodeStream.on('error', (err) => controller.error(err))
    },
    cancel() {
      nodeStream.destroy()
    },
  })

  return new Response(webStream, {
    headers: {
      'Content-Type': 'application/geo+json',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
