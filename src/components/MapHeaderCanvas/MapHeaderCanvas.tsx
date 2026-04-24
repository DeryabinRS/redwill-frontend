import { useEffect, useRef } from 'react'
import './MapHeaderCanvas.css'

const MAP_SRC = '/img/map.png'
const MOTO_SRC = '/img/moto.png'

type P2 = { x: number; y: number }

type NetPath = {
  pts: P2[]
  speed: number
  phase: number
  dash: number
  gap: number
}

function lerp2(a: P2, b: P2, u: number): P2 {
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }
}

function pointOnPolyline(pts: P2[], t0: number): P2 {
  if (pts.length < 2) return pts[0] ?? { x: 0, y: 0 }
  const segLens: number[] = []
  let L = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x
    const dy = pts[i + 1].y - pts[i].y
    const len = Math.hypot(dx, dy)
    segLens.push(len)
    L += len
  }
  const tf = t0 % 1
  if (L < 0.5) return pts[0]
  const u = tf * L
  let s = 0
  for (let i = 0; i < segLens.length; i++) {
    if (s + segLens[i] >= u) {
      const w0 = (u - s) / (segLens[i] || 1e-6)
      return lerp2(pts[i], pts[i + 1], w0)
    }
    s += segLens[i]
  }
  return pts[pts.length - 1]
}

function buildNetwork(w: number, h: number): NetPath[] {
  const m = Math.min(w, h)
  const cx = w * 0.5
  const cy = h * 0.45
  const out: NetPath[] = []
  for (let i = 0; i < 20; i++) {
    const a0 = (i / 20) * Math.PI * 2 + 0.02 * (i % 3)
    const r1 = 0.17
    const r2 = 0.48 + (i % 4) * 0.04
    out.push({
      pts: [
        { x: cx, y: cy },
        { x: cx + Math.cos(a0) * m * r1, y: cy + Math.sin(a0) * m * (r1 * 0.92) },
        { x: cx + Math.cos(a0) * m * r2, y: cy + Math.sin(a0) * m * (r2 * 0.95) },
      ],
      speed: 0.11 + (i % 6) * 0.018,
      phase: i * 0.31,
      dash: 3.5 + (i % 5) * 1.2,
      gap: 9 + (i % 4) * 2.5,
    })
  }
  const b = m * 0.11
  out.push(
    { pts: [{ x: cx - b, y: cy - b }, { x: cx + b, y: cy - b }], speed: 0.22, phase: 0.1, dash: 7, gap: 5 },
    { pts: [{ x: cx + b, y: cy - b }, { x: cx + b, y: cy + b }], speed: 0.2, phase: 0.4, dash: 6, gap: 5 },
    { pts: [{ x: cx + b, y: cy + b }, { x: cx - b, y: cy + b }], speed: 0.21, phase: 0.2, dash: 7, gap: 4 },
    { pts: [{ x: cx - b, y: cy + b }, { x: cx - b, y: cy - b }], speed: 0.19, phase: 0.55, dash: 6, gap: 6 },
  )
  return out
}

function makeNoiseBuffer(nw: number, nh: number, seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = nw
  c.height = nh
  const nctx = c.getContext('2d')
  if (!nctx) return c
  const im = nctx.createImageData(nw, nh)
  const d = im.data
  let s = seed
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const v = 15 + (s & 0xff)
    d[i] = v
    d[i + 1] = v
    d[i + 2] = v
    d[i + 3] = 200
  }
  nctx.putImageData(im, 0, 0)
  return c
}

/**
 * Статика: public/img/map.png (cover) + public/img/moto.png (contain, screen — чёрный фон мото не глушит карту).
 */
function drawMapFromPng(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  img: HTMLImageElement,
  moto: HTMLImageElement,
  t: number,
  bootE: number,
  px: number,
  py: number,
  pulse: number,
  redPulse: number,
  noiseSmall: HTMLCanvasElement,
  noiseOff: { x: number; y: number },
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#08080a'
  ctx.fillRect(0, 0, w, h)

  const hasMap = img.naturalWidth > 0 && img.naturalHeight > 0
  const hasMoto = moto.naturalWidth > 0 && moto.naturalHeight > 0
  if (!hasMap && !hasMoto) {
    return
  }

  const scale = 1.03 + 0.015 * Math.sin(t * 0.2)
  const imgA = 0.5 + 0.5 * bootE

  if (hasMap) {
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const cover = Math.max(w / iw, h / ih) * scale
    const drawW = iw * cover
    const drawH = ih * cover
    const dx = (w - drawW) * 0.5 + px
    const dy = (h - drawH) * 0.5 + py

    ctx.save()
    ctx.globalAlpha = imgA
    ctx.filter = `brightness(${0.92 + 0.1 * pulse}) contrast(1.04) saturate(1.04)`
    ctx.drawImage(img, dx, dy, drawW, drawH)
    ctx.filter = 'none'
    ctx.restore()
  }

  if (hasMoto) {
    const mw = moto.naturalWidth
    const mh = moto.naturalHeight
    const k = Math.min(w / mw, h / mh) * 0.94
    const dw = mw * k
    const dh = mh * k
    const mx = (w - dw) * 0.5 + px * 0.45
    const my = (h - dh) * 0.5 + py * 0.4
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.78 * imgA * (0.88 + 0.1 * pulse)
    ctx.filter = 'brightness(1.06) contrast(1.05) saturate(1.08)'
    ctx.drawImage(moto, mx, my, dw, dh)
    ctx.filter = 'none'
    ctx.restore()
  }

  // Лёгкое дыхание цвета — не «другой» рисунок
  ctx.save()
  ctx.globalCompositeOperation = 'soft-light'
  ctx.globalAlpha = 0.07 * redPulse * imgA
  const lg = ctx.createLinearGradient(0, 0, w, h)
  lg.addColorStop(0, 'rgba(200, 40, 50, 0.5)')
  lg.addColorStop(0.5, 'rgba(255, 60, 70, 0.2)')
  lg.addColorStop(1, 'rgba(160, 20, 35, 0.45)')
  ctx.fillStyle = lg
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // Тонкая виньетка — только усиление края (как на рефе), без смены центра
  const vx = w * 0.5
  const vy = h * 0.5
  const g = ctx.createRadialGradient(vx, vy, h * 0.12, vx, vy, Math.max(w, h) * 0.72)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(0.52, 'rgba(0,0,0,0.06)')
  g.addColorStop(1, 'rgba(0,0,0,0.38)')
  ctx.save()
  ctx.globalAlpha = 0.65 * Math.max(0.45, bootE)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  noiseOff.x = (t * 8) % 64
  noiseOff.y = (t * 5) % 64
  ctx.save()
  ctx.globalAlpha = 0.03 * Math.max(0.45, bootE) * imgA
  ctx.imageSmoothingEnabled = true
  for (let nx = -64; nx < w + 64; nx += 64) {
    for (let ny = -64; ny < h + 64; ny += 64) {
      ctx.drawImage(noiseSmall, nx - noiseOff.x, ny - noiseOff.y, 128, 128)
    }
  }
  ctx.restore()
}

/**
 * Анимированные «неоновые» линии и точки — поверх карты (screen).
 */
function drawNetworkOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  bootE: number,
  pulse: number,
  network: NetPath[],
  cx0: number,
  cy0: number,
) {
  if (network.length === 0) return
  const m = Math.min(w, h)
  const lw = Math.max(1.2, m * 0.0011)
  const a = 0.62 * (0.4 + 0.6 * bootE)

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (const p of network) {
    ctx.beginPath()
    const pts = p.pts
    if (pts.length < 2) continue
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y)
    }
    ctx.setLineDash([p.dash, p.gap])
    ctx.lineDashOffset = t * 38 * p.speed + p.phase * 24
    ctx.lineWidth = lw
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = a
    ctx.shadowColor = 'rgba(255, 55, 75, 0.8)'
    ctx.shadowBlur = (5 + 7 * pulse) * 1.1
    ctx.strokeStyle = 'rgba(255, 95, 110, 0.7)'
    ctx.stroke()
  }
  ctx.setLineDash([])

  const cr = 3.5 + 2.2 * Math.sin(t * 2.4) * pulse
  const cg = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, cr * 1.4)
  cg.addColorStop(0, 'rgba(255, 245, 250, 0.95)')
  cg.addColorStop(0.35, 'rgba(255, 70, 90, 0.4)')
  cg.addColorStop(1, 'rgba(255, 0, 40, 0)')
  ctx.beginPath()
  ctx.arc(cx0, cy0, cr, 0, Math.PI * 2)
  ctx.fillStyle = cg
  ctx.globalAlpha = 0.88 * a
  ctx.fill()

  for (const p of network) {
    const u = (t * 0.32 * p.speed + p.phase * 0.3) % 1
    const pos = pointOnPolyline(p.pts, u)
    const r = 2.5 + 2.2 * pulse
    const g2 = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 1.2)
    g2.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    g2.addColorStop(0.4, 'rgba(255, 100, 115, 0.5)')
    g2.addColorStop(1, 'rgba(200, 0, 20, 0)')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
    ctx.fillStyle = g2
    ctx.globalAlpha = 0.6 * a
    ctx.fill()
  }

  const keyPts: P2[] = []
  const seen = new Set<string>()
  for (const p of network) {
    if (p.pts.length < 2) continue
    const end = p.pts[p.pts.length - 1]
    const k = `${Math.round(end.x / 6)}_${Math.round(end.y / 6)}`
    if (seen.has(k)) continue
    seen.add(k)
    keyPts.push(end)
  }
  let i = 0
  for (const q of keyPts) {
    const s = 0.35 + 0.65 * Math.sin(t * 2.1 + i * 0.23) ** 2
    i++
    const rr = 1.2 + 1.8 * s
    const g3 = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr * 1.2)
    g3.addColorStop(0, `rgba(255, 230, 240, ${0.55 * s})`)
    g3.addColorStop(0.5, 'rgba(255, 50, 70, 0.3)')
    g3.addColorStop(1, 'rgba(200, 0, 0, 0)')
    ctx.beginPath()
    ctx.arc(q.x, q.y, rr, 0, Math.PI * 2)
    ctx.fillStyle = g3
    ctx.globalAlpha = 0.7 * a
    ctx.fill()
  }

  ctx.restore()
}

export default function MapHeaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const parallaxRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const buffer = document.createElement('canvas')
    const bctx = buffer.getContext('2d')
    if (!bctx) return

    const img = new Image()
    img.src = MAP_SRC
    const moto = new Image()
    moto.src = MOTO_SRC
    if ('decode' in img) {
      void img.decode().catch(() => {})
    }
    if ('decode' in moto) {
      void moto.decode().catch(() => {})
    }

    const noiseSmall = makeNoiseBuffer(128, 128, 0x1a2b3c4d)
    const noiseOff = { x: 0, y: 0 }
    const bootAt = performance.now()
    const BOOT_MS = 2000

    let spikeEnd = 0
    let glitchLeft = 0
    let glitchSliceH = 10
    let glitchY0 = 0
    let glitchOffX = 0

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const smoothstep = (x: number) => x * x * (3 - 2 * x)

    const onMouseMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return
      mouseRef.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      }
    }

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const cw = container.clientWidth
      const ch = container.clientHeight
      const w = Math.max(1, Math.floor(cw * dpr))
      const h = Math.max(1, Math.floor(ch * dpr))
      canvas.width = w
      canvas.height = h
      buffer.width = w
      buffer.height = h
      canvas.style.width = `${cw}px`
      canvas.style.height = `${ch}px`
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    window.addEventListener('mousemove', onMouseMove)
    const tResize = window.setTimeout(resize, 0)
    const tResize2 = window.setTimeout(resize, 80)

    let lastNetW = 0
    let lastNetH = 0
    let network: NetPath[] = []
    const syncNetwork = (ww: number, hh: number) => {
      if (ww === lastNetW && hh === lastNetH) return
      lastNetW = ww
      lastNetH = hh
      network = buildNetwork(ww, hh)
    }

    let running = true
    let raf = 0
    const tick = (now: number) => {
      if (!running) return
      raf = requestAnimationFrame(tick)

      const w = canvas.width
      const h = canvas.height
      syncNetwork(w, h)
      const t = now * 0.001
      const boot = Math.min(1, (now - bootAt) / BOOT_MS)
      const bootE = smoothstep(boot)

      const pr = parallaxRef.current
      const m = mouseRef.current
      pr.x = lerp(pr.x, m.x, 0.06)
      pr.y = lerp(pr.y, m.y, 0.06)
      const inSpike = now < spikeEnd
      const px = (pr.x - 0.5) * 24 + (inSpike ? Math.sin(t * 88) * 0.6 : 0)
      const py = (pr.y - 0.5) * 16
      const pulse = 0.82 + 0.18 * Math.sin(t * 0.65)
      const redPulse = 0.06 * pulse

      bctx.setTransform(1, 0, 0, 1, 0, 0)
      drawMapFromPng(
        bctx,
        w,
        h,
        img,
        moto,
        t,
        bootE,
        px,
        py,
        pulse,
        redPulse,
        noiseSmall,
        noiseOff,
      )
      drawNetworkOverlay(
        bctx,
        w,
        h,
        t,
        bootE,
        pulse,
        network,
        w * 0.5,
        h * 0.45,
      )

      if (now >= spikeEnd && Math.random() < 0.0007) {
        spikeEnd = now + 80 + Math.random() * 140
        glitchLeft = 2 + Math.floor(Math.random() * 5)
        glitchSliceH = 6 + Math.floor(Math.random() * 16)
        glitchY0 = Math.max(0, Math.floor(Math.random() * Math.max(1, h - glitchSliceH - 1)))
        glitchOffX = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 26)
      }
      const shakeX = inSpike ? (Math.random() - 0.5) * 3.5 : 0

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(buffer, shakeX, 0)

      if (glitchLeft > 0 && glitchSliceH > 0) {
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.beginPath()
        ctx.rect(0, glitchY0, w, glitchSliceH)
        ctx.clip()
        ctx.drawImage(buffer, shakeX + glitchOffX, 0, w, h, 0, 0, w, h)
        ctx.restore()
        ctx.save()
        ctx.globalAlpha = 0.1
        ctx.fillStyle = 'rgba(255, 50, 85, 0.45)'
        ctx.fillRect(0, glitchY0, w, glitchSliceH)
        ctx.restore()
        glitchLeft--
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      clearTimeout(tResize)
      clearTimeout(tResize2)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="map-header-canvas-wrap"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="map-header-canvas" />
    </div>
  )
}
