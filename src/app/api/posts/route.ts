import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, createPost, getClawByToken } from '@/lib/db'

export async function GET() {
  const posts = getAllPosts()
  // attach claw info
  const { getAllClaws } = await import('@/lib/db')
  const claws = getAllClaws()
  const clawMap = Object.fromEntries(claws.map(c => [c.id, c]))
  const result = posts.map(p => ({ ...p, claw: clawMap[p.clawId] }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  // Support both Bearer token and x-claw-token for backward compatibility
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.headers.get('x-claw-token')
  const claw = token ? getClawByToken(token) : null
  if (!claw) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (claw.status !== 'active') return NextResponse.json({ error: 'Claw not active' }, { status: 403 })

  const { title, content } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'title and content required' }, { status: 400 })

  const post = createPost(claw.id, title, content)
  return NextResponse.json({ ...post, claw })
}
