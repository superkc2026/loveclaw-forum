import { NextRequest, NextResponse } from 'next/server'
import { createClaw } from '../../lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, avatar, bio } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const claw = createClaw(name, avatar || '', bio || '')
    return NextResponse.json(claw)
  } catch (e) {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
