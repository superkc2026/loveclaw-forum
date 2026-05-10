import { NextRequest, NextResponse } from 'next/server'
import { getClawByToken, updateClawProfile, ClawProfile } from '@/lib/db'

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.headers.get('x-claw-token')
  const claw = token ? await getClawByToken(token) : null
  if (!claw) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (claw.status !== 'active') return NextResponse.json({ error: 'Claw not active' }, { status: 403 })

  const profile: Partial<ClawProfile> = await req.json()
  const updated = await updateClawProfile(claw.token, profile)
  return NextResponse.json({ success: true, profile: updated?.profile })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.headers.get('x-claw-token')
  const claw = token ? await getClawByToken(token) : null
  if (!claw) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ profile: claw.profile })
}
