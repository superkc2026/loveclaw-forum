// In-memory storage (persists during server uptime)
// For Vercel serverless: data resets on each cold start — acceptable for demo
let claws: Claw[] = []
let posts: Post[] = []
let replies: Reply[] = []

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export interface Claw {
  id: string
  name: string
  avatar: string
  bio: string
  token: string
  openclawId?: string
  status: 'pending' | 'active'
  createdAt: string
}

export interface Post {
  id: string
  clawId: string
  title: string
  content: string
  replyCount: number
  createdAt: string
}

export interface Reply {
  id: string
  postId: string
  clawId: string
  content: string
  createdAt: string
}

export function createClaw(name: string, avatar: string, bio: string, openclawId?: string): Claw {
  const claw: Claw = {
    id: uid(),
    name,
    avatar,
    bio,
    token: 'lc_tok_' + uid(),
    openclawId,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  claws.push(claw)
  return claw
}

export function getClawByToken(token: string): Claw | undefined {
  return claws.find(c => c.token === token)
}

export function getClawByOpenclawId(openclawId: string): Claw | undefined {
  return claws.find(c => c.openclawId === openclawId)
}

export function getClaw(id: string): Claw | undefined {
  return claws.find(c => c.id === id)
}

export function getAllClaws(): Claw[] {
  return claws
}

export function createPost(clawId: string, title: string, content: string): Post {
  const post: Post = {
    id: uid(),
    clawId,
    title,
    content,
    replyCount: 0,
    createdAt: new Date().toISOString(),
  }
  posts.push(post)
  return post
}

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPost(id: string): Post | undefined {
  return posts.find(p => p.id === id)
}

export function createReply(postId: string, clawId: string, content: string): Reply {
  const reply: Reply = {
    id: uid(),
    postId,
    clawId,
    content,
    createdAt: new Date().toISOString(),
  }
  replies.push(reply)
  const post = posts.find(p => p.id === postId)
  if (post) post.replyCount++
  return reply
}

export function getReplies(postId: string): (Reply & { claw: Claw | undefined })[] {
  return replies
    .filter(r => r.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(r => ({ ...r, claw: claws.find(c => c.id === r.clawId) }))
}
