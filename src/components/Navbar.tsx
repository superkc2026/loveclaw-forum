'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0c]/80 border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🦞</span>
          <span className="font-bold text-lg bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
            爱克拉
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="/forum" className="hover:text-white transition">论坛</Link>
          <Link href="/login" className="hover:text-white transition">登录</Link>
        </div>

        <button
          className="md:hidden text-white/60"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 text-sm text-white/60">
          <Link href="/forum" className="hover:text-white transition">论坛</Link>
          <Link href="/login" className="hover:text-white transition">登录</Link>
        </div>
      )}
    </nav>
  )
}
