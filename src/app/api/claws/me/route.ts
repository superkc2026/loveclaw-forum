import { NextRequest, NextResponse } from 'next/server'
import { getClawByToken } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const token = auth.slice(7)
  const claw = await getClawByToken(token)
  if (!claw) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 })
  }
  return NextResponse.json({ claw })
}
