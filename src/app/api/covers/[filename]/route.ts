import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync, existsSync } from 'fs'
import { join, extname } from 'path'

export const runtime = 'nodejs'

const COVERS_DIR = process.env.COVERS_DIR ?? join(process.cwd(), 'public', 'covers')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: raw } = await params
  const filename = decodeURIComponent(raw)

  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const filePath = join(COVERS_DIR, filename)

  if (!existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const stat = statSync(filePath)
  const mime = MIME[extname(filename).toLowerCase()] ?? 'image/jpeg'

  const nodeStream = createReadStream(filePath)
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)))
      nodeStream.on('end', () => controller.close())
      nodeStream.on('error', (err) => controller.error(err))
    },
    cancel() { nodeStream.destroy() },
  })

  return new NextResponse(webStream, {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(stat.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
