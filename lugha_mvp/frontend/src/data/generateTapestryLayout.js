import { AFRICAN_LANGUAGE_NAMES } from './africanLanguages.js'

const PALETTES = [
  { color: 'rgba(93, 202, 165, VAR)', w: 200 },
  { color: 'rgba(250, 199, 117, VAR)', w: 200 },
  { color: 'rgba(175, 169, 236, VAR)', w: 200 },
  { color: 'rgba(29, 158, 117, VAR)', w: 300 },
]

function style(i, paletteIdx = 0) {
  const p = PALETTES[paletteIdx % PALETTES.length]
  const opacity = 0.26 + (i % 5) * 0.04
  return {
    size: 8.5 + (i % 4) * 0.8,
    opacity,
    color: p.color.replace('VAR', String(opacity)),
    weight: 200,
    delay: `${(i % 11) * 0.7}s`,
    duration: `${7 + (i % 6)}s`,
  }
}

/** Golden-angle scatter inside an ellipse — organic cloud */
function scatterEllipse(n, cx, cy, rx, ry, startIdx = 0) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n
    const r = Math.sqrt(t)
    const a = (i + startIdx) * golden
    return {
      x: cx + Math.cos(a) * rx * r,
      y: cy + Math.sin(a) * ry * r,
      rotate: (a * 180) / Math.PI + (i % 2 ? 12 : -8),
    }
  })
}

/** Double helix — inheritance / generations */
function doubleHelix(n, cx, cy, amp, length, startIdx = 0) {
  const out = []
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1)
    const y = cy + t * length
    const phase = t * Math.PI * 3.2 + startIdx * 0.4
    const strand = i % 2
    const x = cx + Math.sin(phase + strand * Math.PI) * amp
    out.push({
      x,
      y,
      rotate: Math.cos(phase) * 18 * (strand ? 1 : -1),
    })
  }
  return out
}

/** Names placed on a diamond perimeter */
function diamondRing(n, cx, cy, w, h) {
  const verts = [
    [cx, cy - h],
    [cx + w, cy],
    [cx, cy + h],
    [cx - w, cy],
  ]
  const out = []
  for (let i = 0; i < n; i++) {
    const seg = (i / n) * 4
    const s = Math.floor(seg) % 4
    const f = seg - Math.floor(seg)
    const [x1, y1] = verts[s]
    const [x2, y2] = verts[(s + 1) % 4]
    const dx = x2 - x1
    const dy = y2 - y1
    out.push({
      x: x1 + dx * f,
      y: y1 + dy * f,
      rotate: (Math.atan2(dy, dx) * 180) / Math.PI - 90,
    })
  }
  return out
}

/** Crescent — names along a thin arc */
function crescent(n, cx, cy, r, spread = Math.PI * 0.85, tilt = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = -spread / 2 + (i / Math.max(n - 1, 1)) * spread + tilt
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r * 0.55,
      rotate: (a * 180) / Math.PI + 90,
    }
  })
}

/** Star burst rays from a center */
function starBurst(n, cx, cy, inner, outer) {
  const rays = 6
  const perRay = Math.ceil(n / rays)
  const out = []
  for (let i = 0; i < n; i++) {
    const ray = i % rays
    const step = Math.floor(i / rays)
    const a = (ray / rays) * Math.PI * 2 - Math.PI / 2
    const t = (step + 1) / perRay
    const r = inner + (outer - inner) * t
    out.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      rotate: (a * 180) / Math.PI,
    })
  }
  return out
}

function assign(names, points, paletteIdx, cluster) {
  return points.map((pt, i) => ({
    id: `${cluster}-${i}`,
    name: names[i % names.length],
    x: pt.x,
    y: pt.y,
    rotate: pt.rotate,
    cluster,
    ...style(i, paletteIdx),
  }))
}

/** Build full layout — positions in % of viewport */
export function buildTapestryLayout() {
  const names = [...new Set(AFRICAN_LANGUAGE_NAMES)]
  let cursor = 0
  const take = (n) => {
    const chunk = []
    for (let i = 0; i < n; i++) {
      chunk.push(names[(cursor + i) % names.length])
    }
    cursor += n
    return chunk
  }

  const items = [
    ...assign(take(20), scatterEllipse(20, 50, 14, 38, 10, 0), 0, 'cloud'),
    ...assign(take(16), doubleHelix(16, 22, 6, 5.5, 28, 0), 1, 'helix-l'),
    ...assign(take(16), doubleHelix(16, 78, 6, 5.5, 28, 2), 2, 'helix-r'),
    ...assign(take(14), crescent(14, 50, 10, 42, Math.PI * 0.9, -0.2), 0, 'crown'),
    ...assign(take(12), diamondRing(12, 88, 18, 9, 7), 3, 'diamond'),
    ...assign(take(12), diamondRing(12, 12, 18, 8, 6), 1, 'diamond-l'),
    ...assign(take(10), starBurst(10, 72, 12, 4, 14), 2, 'burst'),
    ...assign(take(10), starBurst(10, 28, 12, 4, 13), 0, 'burst-l'),
    ...assign(take(18), scatterEllipse(18, 50, 22, 28, 8, 40), 3, 'mist'),
    ...assign(take(8), crescent(8, 15, 8, 18, Math.PI * 0.6, 0.5), 1, 'arc-l'),
    ...assign(take(8), crescent(8, 85, 8, 18, Math.PI * 0.6, -0.5), 2, 'arc-r'),
  ]

  return items
}

/** Faint connector lines between nearby words in same cluster */
export function buildTapestryLinks(items, maxDist = 9) {
  const links = []
  const byCluster = {}
  items.forEach((it) => {
    if (!byCluster[it.cluster]) byCluster[it.cluster] = []
    byCluster[it.cluster].push(it)
  })

  Object.values(byCluster).forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < maxDist) {
          links.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: 0.06 + (1 - d / maxDist) * 0.08 })
        }
      }
    }
  })
  return links.slice(0, 120)
}
