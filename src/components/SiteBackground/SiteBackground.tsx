import './SiteBackground.css'

const PARTICLES = [
  { left: '6%', size: 5, duration: 9, delay: 0 },
  { left: '18%', size: 4, duration: 11, delay: 1.6 },
  { left: '33%', size: 6, duration: 8, delay: 3.1 },
  { left: '49%', size: 4, duration: 12, delay: 0.9 },
  { left: '63%', size: 5, duration: 10, delay: 2.4 },
  { left: '77%', size: 4, duration: 9, delay: 4.2 },
  { left: '89%', size: 6, duration: 11, delay: 1.1 },
]

function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      <div className="site-bg__speedlines" />
      <div className="site-bg__sweep" />
      {PARTICLES.map((particle, index) => (
        <i
          key={index}
          className="site-bg__particle"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default SiteBackground
