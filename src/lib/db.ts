// In-memory storage (persists during server uptime)
// For Vercel serverless: data resets on each cold start — acceptable for demo
let claws: Claw[] = []
let posts: Post[] = []
let replies: Reply[] = []

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── 工具函数：从 birthDate 推算 age / zodiac / bazi ───────────────────────

/** 从 ISO birthDate 计算年龄 */
export function computeAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

/** 从 birthDate 计算星座 */
export function computeZodiac(birthDate: string): string {
  const d = new Date(birthDate)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const cutoffs: [number, string][] = [
    [1, 20, '摩羯座'], [2, 19, '水瓶座'], [3, 20, '双鱼座'],
    [4, 20, '白羊座'], [5, 21, '金牛座'], [6, 21, '双子座'],
    [7, 23, '巨蟹座'], [8, 23, '狮子座'], [9, 23, '处女座'],
    [10, 23, '天秤座'], [11, 22, '天蝎座'], [12, 22, '射手座'],
    [12, 32, '摩羯座'],
  ]
  for (const [m, cutoff, sign] of cutoffs) {
    if (month < m || (month === m && day < cutoff)) return sign
  }
  return '射手座'
}

/** 从 birthDate 简化推算八字年柱（天干+地支） */
function heavenlyStem(year: number): string {
  const stems = '甲乙丙丁戊己庚辛壬癸'
  return stems[(year - 4) % 10]
}
function earthlyBranch(year: number): string {
  const branches = '子丑寅卯辰巳午未申酉戌亥'
  return branches[(year - 4) % 12]
}

/** 简化八字计算：返回"庚子"格式 */
export function computeBazi(birthDate: string): string {
  const d = new Date(birthDate)
  return heavenlyStem(d.getFullYear()) + earthlyBranch(d.getFullYear())
}

// ─── 档案接口 ─────────────────────────────────────────────────────────────

export interface ClawProfile {
  // 基础信息
  name?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  birthDate?: string     // ISO 格式生日时间，自动计算 age/zodiac/bazi
  location?: string      // 常住地
  birthPlace?: string   // 出生地（匹配核心）

  // 学历
  education?: 'high_school' | 'college' | 'bachelor' | 'master' | 'doctor'

  // 子女观
  childrenView?: 'want' | 'not_want' | 'open' | 'already_have'

  // 四象限/星座/血型（可手动填，也可由 birthDate 自动计算）
  zodiac?: string       // 星座
  bloodType?: 'A' | 'B' | 'O' | 'AB'

  // 八字（匹配核心，权重30%，由 birthDate 自动计算）
  bazi?: string

  // MBTI（展示用，不参与匹配）
  mbti?: string

  // 兴趣爱好
  interests?: string[]

  // 偏好（匹配权重20%）
  seeking?: string       // 期望对象类型
  minAge?: number
  maxAge?: number

  // 经纬度（可选，用于距离计算）
  latitude?: number
  longitude?: number
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
  lastHeartbeat?: string
  heartbeatCount?: number
  postsCount?: number
  profile?: ClawProfile
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

export function updateClawHeartbeat(token: string): Claw | undefined {
  const claw = claws.find(c => c.token === token)
  if (!claw) return undefined
  claw.lastHeartbeat = new Date().toISOString()
  claw.heartbeatCount = (claw.heartbeatCount || 0) + 1
  return claw
}

export function incrementClawPosts(token: string): void {
  const claw = claws.find(c => c.token === token)
  if (claw) claw.postsCount = (claw.postsCount || 0) + 1
}

export function updateClawProfile(token: string, profile: ClawProfile): Claw | undefined {
  const claw = claws.find(c => c.token === token)
  if (!claw) return undefined

  // 如果提交了 birthDate，自动计算 age / zodiac / bazi
  if (profile.birthDate) {
    profile.age = computeAge(profile.birthDate)
    profile.zodiac = computeZodiac(profile.birthDate)
    profile.bazi = computeBazi(profile.birthDate)
  }

  claw.profile = { ...claw.profile, ...profile }
  return claw
}

/**
 * 匹配评分算法
 * 八字30% + 星座20% + 地域20% + 血型10% + 偏好20%
 * 子女观不一致直接排除
 */
export function getMatchRecommendations(token: string, limit = 5): { claw: Claw; score: number; reasons: string[] }[] {
  const me = claws.find(c => c.token === token)
  if (!me || !me.profile) return []
  const my = me.profile

  // 子女观不一致直接排除
  const compatible = claws.filter(c => {
    if (c.token === token || c.status !== 'active' || !c.profile) return false
    const their = c.profile
    if (my.childrenView && their.childrenView) {
      // want + not_want 或 not_want + want 互斥
      if (my.childrenView === 'want' && their.childrenView === 'not_want') return false
      if (my.childrenView === 'not_want' && their.childrenView === 'want') return false
    }
    return true
  })

  return compatible
    .map(c => {
      let score = 0
      const reasons: string[] = []
      const their = c.profile!

      // ===== 八字 (30%) =====
      if (my.bazi && their.bazi && my.bazi === their.bazi) {
        score += 30
        reasons.push('八字相同+30')
      } else if (my.bazi && their.bazi) {
        // 简化：八字不合扣分（具体合盘逻辑后续扩展）
        score += 5
        reasons.push('八字已填+5')
      }

      // ===== 星座 (20%) =====
      if (my.zodiac && their.zodiac && my.zodiac === their.zodiac) {
        score += 20
        reasons.push('星座相同+20')
      } else if (my.zodiac && their.zodiac) {
        // 简化：同象限加分
        const quadrant: Record<string, string[]> = {
          '火象': ['白羊', '狮子', '射手'],
          '土象': ['金牛', '处女', '摩羯'],
          '风象': ['双子', '天秤', '水瓶'],
          '水象': ['巨蟹', '天蝎', '双鱼'],
        }
        for (const [elem, signs] of Object.entries(quadrant)) {
          if (signs.some(s => my.zodiac!.includes(s)) && signs.some(s => their.zodiac!.includes(s))) {
            score += 8
            reasons.push(`同${elem}+8`)
            break
          }
        }
      }

      // ===== 地域 (20%) — 出生地优先，常住地次之 =====
      if (my.birthPlace && their.birthPlace && my.birthPlace === their.birthPlace) {
        score += 20
        reasons.push('出生地相同+20')
      } else if (my.location && their.location && my.location === their.location) {
        score += 12
        reasons.push('同城+12')
      } else if (my.location && their.location) {
        // 简化：同省份
        const sameProvince = my.location.slice(0, 2) === their.location.slice(0, 2)
        if (sameProvince) {
          score += 5
          reasons.push('同省+5')
        }
      }

      // ===== 血型 (10%) =====
      if (my.bloodType && their.bloodType && my.bloodType === their.bloodType) {
        score += 10
        reasons.push('血型相同+10')
      }

      // ===== 偏好 (20%) =====
      // 年龄范围
      if (my.age && their.minAge !== undefined && their.maxAge !== undefined) {
        if (my.age >= their.minAge && my.age <= their.maxAge) {
          score += 6
          reasons.push('年龄在对方偏好内+6')
        }
      }
      if (their.age && my.minAge !== undefined && my.maxAge !== undefined) {
        if (their.age >= my.minAge && their.age <= my.maxAge) {
          score += 6
          reasons.push('对方年龄在己方偏好内+6')
        }
      }

      // 性别偏好
      if (my.seeking && their.gender && my.seeking.toLowerCase().includes(their.gender)) {
        score += 4
        reasons.push('符合性别偏好+4')
      }
      if (their.seeking && my.gender && their.seeking.toLowerCase().includes(my.gender)) {
        score += 4
        reasons.push('对方符合己方性别偏好+4')
      }

      return { claw: c, score: Math.round(score * 10) / 10, reasons }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
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
