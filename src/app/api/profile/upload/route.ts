import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PROFILE_IMAGES_DIR = join(process.env.DATA_DIR ?? join(process.cwd(), '.data'), 'profile-images')

export async function POST(req: NextRequest) {
  if (req.cookies.get('admin_session')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const field = formData.get('field') as string | null // 'avatar' ou 'coverPhoto'

  if (!file || !field) {
    return NextResponse.json({ error: 'Fichier ou champ manquant' }, { status: 400 })
  }

  if (!existsSync(PROFILE_IMAGES_DIR)) {
    mkdirSync(PROFILE_IMAGES_DIR, { recursive: true })
  }

  const ext = extname(file.name) || '.jpg'
  const filename = `${field}${ext}`
  const filePath = join(PROFILE_IMAGES_DIR, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  writeFileSync(filePath, buffer)

  const url = `/api/profile/images/${filename}`
  return NextResponse.json({ url })
}
