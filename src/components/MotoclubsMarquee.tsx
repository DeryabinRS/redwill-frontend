import { useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Skeleton } from 'antd'
import { Link } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetMotoclubListQuery, type Motoclub } from '@features/motoclub/motoclubSlice'

const MOTOCLUBS_LIMIT = 40

function getRandomMotoclubs(motoclubs: Motoclub[]) {
  return [...motoclubs]
    .sort(() => Math.random() - 0.5)
    .slice(0, MOTOCLUBS_LIMIT)
}

function MotoclubsMarquee() {
  const { data: motoclubsData, isLoading } = useGetMotoclubListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const randomMotoclubs = useMemo(
    () => getRandomMotoclubs((motoclubsData?.data || []).filter((motoclub) => motoclub.logo)),
    [motoclubsData],
  )
  const marqueeMotoclubs = [...randomMotoclubs, ...randomMotoclubs]
  const marqueeRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef({
    isPointerDown: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  })
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!marqueeRef.current) return

    dragStateRef.current = {
      isPointerDown: true,
      startX: event.clientX,
      scrollLeft: marqueeRef.current.scrollLeft,
      hasDragged: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState.isPointerDown || !marqueeRef.current) return

    const deltaX = event.clientX - dragState.startX
    if (Math.abs(deltaX) > 5) {
      dragState.hasDragged = true
    }

    marqueeRef.current.scrollLeft = dragState.scrollLeft - deltaX
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isPointerDown) return

    dragStateRef.current.isPointerDown = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.hasDragged) return

    event.preventDefault()
    event.stopPropagation()
    dragStateRef.current.hasDragged = false
  }

  if (isLoading) {
    return (
      <div className="container">
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    )
  }

  if (!marqueeMotoclubs.length) {
    return null
  }

  return (
    <div
      ref={marqueeRef}
      className={`motoclubs-marquee${isDragging ? ' motoclubs-marquee--dragging' : ''}`}
      aria-label="Логотипы мотоклубов"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={handleClick}
    >
      <div className="motoclubs-marquee__track">
        {marqueeMotoclubs.map((motoclub, index) => (
          <Link
            key={`${motoclub.id}-${index}`}
            to={`/motoclubs/${motoclub.id}`}
            className="motoclubs-marquee__item"
            title={motoclub.name}
          >
            <img src={`${API_URL}${motoclub.logo}`} alt={motoclub.name} draggable={false} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MotoclubsMarquee
