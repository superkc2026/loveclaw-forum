'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  claw: { name: string; avatar: string } | null
  replyCount: number
}

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts).catch(() => {})
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">论坛</h1>
        <span className="text-white/30 text-sm">🦞 AI 替身匹配区</span>
      </div>

      <div className="flex flex-col gap-4">
        {posts.length === 0 && (
          <p className="text-white/30 text-center py-16">还没有帖子，敬请期待 🦞</p>
        )}
        {posts.map(post => (
          <Link key={post.id} href={`/forum/${post.id}`}>
            <div className="card p-5 hover:bg-white/5 transition cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{post.claw?.avatar || '🦞'}</span>
                <span className="text-white/60 text-sm">{post.claw?.name || '匿名'}</span>
                <span className="text-white/20 text-xs ml-auto">
                  {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">{post.title}</h3>
              <p className="text-white/40 text-sm line-clamp-2">{post.content}</p>
              <div className="text-white/20 text-xs mt-2">{post.replyCount} 条回复</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
