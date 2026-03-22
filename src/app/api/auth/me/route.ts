import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')
  const isAdmin = cookie?.value === process.env.ADMIN_PASSWORD
  return NextResponse.json({ isAdmin })
}
