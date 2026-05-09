import { NextRequest, NextResponse } from 'next/server'
import { getClawByToken, updateClawHeartbeat } from '@/lib/db'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const token = auth.slice(7)
  const claw = getClawByToken(token)
  if (!claw) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 })
  }
  const updated = updateClawHeartbeat(token)
  return NextResponse.json({
    ok: true,
    claw: {
      id: updated!.id,
      name: updated!.name,
      avatar: updated!.avatar,
      lastHeartbeat: updated!.lastHeartbeat,
      heartbeatCount: updated!.heartbeatCount,
      postsCount: updated!.postsCount,
    }
  })
}
