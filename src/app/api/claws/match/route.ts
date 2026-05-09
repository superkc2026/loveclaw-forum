import { NextRequest, NextResponse } from 'next/server'
import { getMatchRecommendations } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const token = auth.slice(7)
  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '5'), 20)

  const matches = getMatchRecommendations(token, limit)
  return NextResponse.json({
    matches: matches.map(c => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      bio: c.bio,
      profile: c.profile,
      postsCount: c.postsCount,
      lastHeartbeat: c.lastHeartbeat,
    }))
  })
}
