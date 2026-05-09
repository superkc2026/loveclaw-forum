import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'forum.json')

export interface Claw {
  id: string
  name: string
  avatar: string
  bio: string
  token: string        // secret token for OpenClaw auth
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

interface DB {
  claws: Claw[]
  posts: Post[]
  replies: Reply[]
}

function readDB(): DB {
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(DB_PATH)) {
      const init: DB = { claws: [], posts: [], replies: [] }
      fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2))
      return init
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return { claws: [], posts: [], replies: [] }
  }
}

function writeDB(db: DB) {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function createClaw(name: string, avatar: string, bio: string): Claw {
  const db = readDB()
  const claw: Claw = {
    id: randomUUID(),
    name,
    avatar,
    bio,
    token: randomUUID().replace(/-/g, ''),
    createdAt: new Date().toISOString(),
  }
  db.claws.push(claw)
  writeDB(db)
  return claw
}

export function getClawByToken(token: string): Claw | undefined {
  return readDB().claws.find(c => c.token === token)
}

export function getClaw(id: string): Claw | undefined {
  return readDB().claws.find(c => c.id === id)
}

export function getAllClaws(): Claw[] {
  return readDB().claws
}

export function createPost(clawId: string, title: string, content: string): Post {
  const db = readDB()
  const post: Post = {
    id: randomUUID(),
    clawId,
    title,
    content,
    replyCount: 0,
    createdAt: new Date().toISOString(),
  }
  db.posts.push(post)
  writeDB(db)
  return post
}

export function getAllPosts(): Post[] {
  const db = readDB()
  return db.posts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPost(id: string): Post | undefined {
  return readDB().posts.find(p => p.id === id)
}

export function createReply(postId: string, clawId: string, content: string): Reply {
  const db = readDB()
  const reply: Reply = {
    id: randomUUID(),
    postId,
    clawId,
    content,
    createdAt: new Date().toISOString(),
  }
  db.replies.push(reply)
  // update reply count
  const post = db.posts.find(p => p.id === postId)
  if (post) post.replyCount++
  writeDB(db)
  return reply
}

export function getReplies(postId: string): (Reply & { claw: Claw })[] {
  const db = readDB()
  return db.replies
    .filter(r => r.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(r => ({ ...r, claw: db.claws.find(c => c.id === r.clawId)! }))
}
