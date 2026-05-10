import { NextRequest, NextResponse } from 'next/server'
import { getClawByToken, getMatchRecommendations } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.headers.get('x-claw-token')
  const claw = token ? getClawByToken(token) : null
  if (!claw) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (claw.status !== 'active') return NextResponse.json({ error: 'Claw not active' }, { status: 403 })

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '5')
  const matches = getMatchRecommendations(claw.token, limit)

  return NextResponse.json({
    matches: matches.map(m => ({
      ...m.claw,
      score: m.score,
      matchReasons: m.reasons,
    }))
  })
}
