import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import JSZip from 'jszip'
import { JOCHA_TRACKS } from '@/data/tracks'
import { JOCHA_LYRICS, LyricLine } from '../../../data/lyrics'
import { getPlaylists } from '@/app/api/playlists/route'

export const runtime = 'nodejs'

const AUDIO_DIR = process.env.AUDIO_DIR ?? join(process.cwd(), 'public', 'music')

function formatLrcTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(2).padStart(5, '0')
  return `[${String(mins).padStart(2, '0')}:${secs}]`
}

function convertToLrc(lines: LyricLine[]): string {
  return lines.map(line => `${formatLrcTime(line.time)}${line.text}`).join('\n')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'album' | 'playlist' | 'track'
  const id = searchParams.get('id')

  if (!type || !id) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  let tracksToDownload = []
  let downloadName = 'Download'

  if (type === 'album') {
    tracksToDownload = JOCHA_TRACKS.filter(t => t.albumId === id)
    downloadName = tracksToDownload[0]?.albumTitle || 'Album'
  } else if (type === 'track') {
    tracksToDownload = JOCHA_TRACKS.filter(t => t.id === id)
    downloadName = tracksToDownload[0]?.title || 'Track'
  } else if (type === 'playlist') {
    const playlists = getPlaylists()
    const playlist = playlists.find(p => p.id === id)
    if (!playlist) return new NextResponse('Playlist not found', { status: 404 })
    
    tracksToDownload = playlist.trackIds
      .map(tid => JOCHA_TRACKS.find(t => t.id === tid))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
    
    downloadName = playlist.name
  } else {
    return new NextResponse('Unsupported type', { status: 400 })
  }

  if (tracksToDownload.length === 0) {
    return new NextResponse('No tracks found', { status: 404 })
  }

  const zip = new JSZip()
  const folder = zip.folder(downloadName)

  // ─── Ajout de la Cover ───
  let coverFilename: string | null = null
  if (type === 'album') {
    const album = JOCHA_TRACKS.find(t => t.albumId === id)
    if (album) coverFilename = album.albumArt.split('/').pop() || null
  } else if (type === 'track') {
    const track = JOCHA_TRACKS.find(t => t.id === id)
    if (track) coverFilename = track.albumArt.split('/').pop() || null
  } else if (type === 'playlist') {
    const playlist = getPlaylists().find(p => p.id === id)
    if (playlist && playlist.cover) {
      coverFilename = playlist.cover.split('/').pop() || null
    } else if (tracksToDownload.length > 0) {
      coverFilename = tracksToDownload[0].albumArt.split('/').pop() || null
    }
  }

  if (coverFilename) {
    const cleanCoverName = decodeURIComponent(coverFilename)
    // Chercher dans public/covers ou public/profile/images (selon l'URL)
    const isProfileImg = tracksToDownload[0]?.albumArt.includes('/profile/images/') || 
                        (type === 'playlist' && getPlaylists().find(p => p.id === id)?.cover?.includes('/profile/images/'))
    
    const possiblePaths = [
      join(process.cwd(), 'public', 'covers', cleanCoverName),
      join(process.cwd(), 'public', 'profile', 'images', cleanCoverName),
    ]
    
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        folder?.file('cover.jpg', readFileSync(p))
        break
      }
    }
  }

  for (const track of tracksToDownload) {
    const filename = decodeURIComponent(track.audioUrl.split('/').pop() || '')
    const audioPath = join(AUDIO_DIR, filename)

    if (existsSync(audioPath)) {
      const audioData = readFileSync(audioPath)
      folder?.file(filename, audioData)

      // Paroles
      const lyrics = JOCHA_LYRICS[track.id]
      if (lyrics) {
        const lrcContent = convertToLrc(lyrics)
        const lrcFilename = filename.replace(/\.(mp3|wav|m4a)$/i, '.lrc')
        folder?.file(lrcFilename, lrcContent)
      }
    }
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${downloadName}.zip"`,
    },
  })
}
