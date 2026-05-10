import { NextRequest, NextResponse } from 'next/server'
import { createClaw, getClawByOpenclawId } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, avatar, bio, openclawId } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    if (openclawId) {
      const existing = await getClawByOpenclawId(openclawId)
      if (existing) {
        return NextResponse.json({ claw: existing, isExisting: true })
      }
    }

    const claw = await createClaw(name, avatar || '', bio || '', openclawId)
    return NextResponse.json({ claw, isExisting: false })
  } catch (e) {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
