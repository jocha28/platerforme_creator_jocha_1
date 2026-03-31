import { NextRequest, NextResponse } from 'next/server'
import { readStore, writeStore } from '@/lib/server-store'
import { Annotation } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getAll(): Annotation[] {
  return readStore<Annotation[]>('annotations.json', [])
}

export function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  return params.then(({ trackId }) => {
    const all = getAll()
    return NextResponse.json(all.filter((a) => a.trackId === trackId), {
      headers: { 'Cache-Control': 'no-store' },
    })
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params
  const body = await req.json()
  const { lineIndex, selectedText, annotationBody, author } = body

  if (typeof lineIndex !== 'number' || !selectedText?.trim() || !annotationBody?.trim()) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const all = getAll()
  const annotation: Annotation = {
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    trackId,
    lineIndex,
    selectedText: selectedText.trim(),
    body: annotationBody.trim(),
    author: author || 'Jocha',
    createdAt: Date.now(),
  }
  all.push(annotation)
  writeStore('annotations.json', all)
  return NextResponse.json(annotation, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  await params
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  const all = getAll()
  writeStore('annotations.json', all.filter((a) => a.id !== id))
  return NextResponse.json({ ok: true })
}