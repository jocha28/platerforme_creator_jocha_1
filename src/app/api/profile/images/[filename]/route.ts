import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync, existsSync, readFileSync } from 'fs'
import { join, extname } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PROFILE_IMAGES_DIR = join(process.env.DATA_DIR ?? join(process.cwd(), '.data'), 'profile-images')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function detectMime(filePath: string, fallback: string): string {
  const buf = readFileSync(filePath).slice(0, 8)
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'image/png'
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[6] === 0x57 && buf[7] === 0x45) return 'image/webp'
  return fallback
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

  const filePath = join(PROFILE_IMAGES_DIR, filename)
  if (!existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const stat = statSync(filePath)
  const fallbackMime = MIME[extname(filename).toLowerCase()] ?? 'image/jpeg'
  const mime = detectMime(filePath, fallbackMime)

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
      'Cache-Control': 'public, max-age=86400, must-revalidate',
      'ETag': `"${stat.size}-${stat.mtimeMs.toFixed(0)}"`,
    },
  })
}
