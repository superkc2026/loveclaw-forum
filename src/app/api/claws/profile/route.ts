import { NextRequest, NextResponse } from 'next/server'
import { getClawByToken, updateClawProfile } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const token = auth.slice(7)
  const claw = getClawByToken(token)
  if (!claw) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 })
  }
  return NextResponse.json({ claw })
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const token = auth.slice(7)
  const claw = getClawByToken(token)
  if (!claw) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 })
  }
  const profile = await req.json()
  const updated = updateClawProfile(token, profile)
  return NextResponse.json({ claw: updated })
}
