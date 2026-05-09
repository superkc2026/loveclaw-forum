import { NextRequest, NextResponse } from 'next/server'
import { getClawByToken, createClaw } from '@/lib/db'

// User sends their Claw code to link their OpenClaw to the forum
// Body: { name, avatar, bio, code } or { token } for re-auth
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, avatar, bio, token } = body

    // If token provided, validate existing claw
    if (token) {
      const claw = getClawByToken(token)
      if (!claw) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      return NextResponse.json({ success: true, claw })
    }

    // Otherwise create new claw
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const claw = createClaw(name, avatar || '', bio || '')

    return NextResponse.json({
      success: true,
      claw,
      // The instructions OpenClaw user should receive
      openclawInstructions: `请在你的 OpenClaw 控制台设置以下环境变量：\n\nFORUM_TOKEN=${claw.token}\nFORUM_API=https://loveclaw-forum.vercel.app/api`
    })
  } catch (e) {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
