import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

import { findFileRecursive } from '@/lib/audio-discovery'

export const runtime = 'nodejs'

const AUDIO_DIR = process.env.AUDIO_DIR ?? join(process.cwd(), 'public', 'music')


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: raw } = await params
  const filename = decodeURIComponent(raw)

  // Sécurité : bloquer les path traversal
  if (filename.includes('..')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const filePath = findFileRecursive(AUDIO_DIR, filename)

  if (!filePath || !existsSync(filePath)) {
    console.error(`Audio file not found: ${filename} (searched in ${AUDIO_DIR})`)
    return new NextResponse('Not Found', { status: 404 })
  }

  const stat = statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.get('range')

  // ── Streaming avec Range (indispensable pour le seek audio) ──
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
    const start = parseInt(startStr, 10)
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1
    const chunkSize = end - start + 1

    const nodeStream = createReadStream(filePath, { start, end })
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)))
        nodeStream.on('end', () => controller.close())
        nodeStream.on('error', (err) => controller.error(err))
      },
      cancel() { nodeStream.destroy() },
    })

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  // ── Streaming complet ──
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
    status: 200,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(fileSize),
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
