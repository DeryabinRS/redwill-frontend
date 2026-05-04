import { useEffect, useRef, type CSSProperties } from 'react'
import './HeaderAnimation.css'

const networkRays = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  angle: `${index * 18 + (index % 3) * 1.4}deg`,
  length: `${34 + (index % 4) * 4}vmin`,
  delay: `${index * -0.18}s`,
}))

export default function HeaderAnimation() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let nextX = 0
    let nextY = 0

    const applyParallax = () => {
      raf = 0
      root.style.setProperty('--map-parallax-x', `${nextX.toFixed(2)}px`)
      root.style.setProperty('--map-parallax-y', `${nextY.toFixed(2)}px`)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return

      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      nextX = x * 44
      nextY = y * 26

      if (!raf) {
        raf = requestAnimationFrame(applyParallax)
      }
    }

    const resetParallax = () => {
      nextX = 0
      nextY = 0
      if (!raf) {
        raf = requestAnimationFrame(applyParallax)
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', resetParallax)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', resetParallax)
    }
  }, [])

  return (
    <div ref={rootRef} className="header-animation-wrap" aria-hidden>
      <div className="header-animation__map" />
      <div className="header-animation__moto" />
      <div className="header-animation__grid" />
      <div className="header-animation__network">
        <div className="header-animation__core" />
        {networkRays.map((ray) => (
          <span
            key={ray.id}
            className="header-animation__ray"
            style={{
              '--ray-angle': ray.angle,
              '--ray-length': ray.length,
              '--ray-delay': ray.delay,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="header-animation__glow" />
      <div className="header-animation__vignette" />
    </div>
  )
}
