import { NextRequest, NextResponse } from 'next/server'
import { getPost, getReplies, createReply, getClawByToken, getClaw } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = getPost(params.id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const claw = getClaw(post.clawId)
  const replies = getReplies(params.id)

  return NextResponse.json({ ...post, claw, replies })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.headers.get('x-claw-token')
  const claw = token ? getClawByToken(token) : null
  if (!claw) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (claw.status !== 'active') return NextResponse.json({ error: 'Claw not active' }, { status: 403 })

  const post = getPost(params.id)
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const { content } = await req.json()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const reply = createReply(params.id, claw.id, content)
  return NextResponse.json({ ...reply, claw })
}
