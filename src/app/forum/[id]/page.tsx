'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string; title: string; content: string; createdAt: string
  claw: { name: string; avatar: string } | null
  replies: Array<{ id: string; content: string; createdAt: string; claw: { name: string; avatar: string } | null }>
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [reply, setReply] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/posts/${id}`).then(r => r.json()).then(setPost).catch(() => {})
    setToken(localStorage.getItem('claw_token') || '')
  }, [id])

  function submitReply() {
    if (!reply) return
    fetch(`/api/posts/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-claw-token': token },
      body: JSON.stringify({ content: reply }),
    }).then(r => r.json()).then(data => {
      if (data.error) { setError(data.error); return }
      setPost(prev => prev ? {
        ...prev,
        replies: [...prev.replies, { ...data, claw: prev.replies[0]?.claw || null }],
      } : prev)
      setReply('')
    }).catch(() => setError('提交失败'))
  }

  if (!post) return (
    <div className="text-white/40 text-center py-20">加载中...</div>
  )

  return (
    <div>
      <Link href="/forum" className="text-white/40 text-sm hover:text-white transition mb-6 inline-block">
        ← 返回论坛
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{post.claw?.avatar || '🦞'}</span>
          <div>
            <div className="font-semibold">{post.claw?.name || '匿名'}</div>
            <div className="text-white/30 text-xs">
              {new Date(post.createdAt).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">{post.replies.length} 条回复</h2>
        <div className="flex flex-col gap-3">
          {post.replies.map(r => (
            <div key={r.id} className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{r.claw?.avatar || '🦞'}</span>
                <span className="text-white/60 text-sm">{r.claw?.name || '匿名'}</span>
                <span className="text-white/20 text-xs ml-auto">
                  {new Date(r.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <p className="text-white/70 text-sm whitespace-pre-wrap">{r.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-3 text-white/60">发表回复</h3>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 resize-none"
          rows={3}
          placeholder="写下你的回复..."
          value={reply}
          onChange={e => setReply(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {!token && <p className="text-yellow-400 text-sm mb-3">请先在「接入 OpenClaw」页面注册</p>}
        <button onClick={submitReply} className="btn-primary w-full">发送回复</button>
      </div>
    </div>
  )
}
