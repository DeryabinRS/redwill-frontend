import { Button, Tooltip } from 'antd'
import { StarFilled, StarOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '@utils/auth'
import {
  useAddRatingMutation,
  useRemoveRatingMutation,
  type RateableType,
} from '@features/rating/ratingSlice'

type StarRatingProps = {
  type: RateableType
  id: number
  starsCount: number
  isStarred: boolean
}

function StarRating({ type, id, starsCount, isStarred }: StarRatingProps) {
  const navigate = useNavigate()
  const [count, setCount] = useState(starsCount)
  const [starred, setStarred] = useState(isStarred)
  const [addRating, { isLoading: isAdding }] = useAddRatingMutation()
  const [removeRating, { isLoading: isRemoving }] = useRemoveRatingMutation()

  useEffect(() => {
    setCount(starsCount)
    setStarred(isStarred)
  }, [starsCount, isStarred])

  const handleToggle = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    try {
      if (starred) {
        const result = await removeRating({ type, id }).unwrap()
        setStarred(false)
        setCount(result.stars_count)
      } else {
        const result = await addRating({ type, id }).unwrap()
        setStarred(true)
        setCount(result.stars_count)
      }
    } catch {
      // Ошибки сети/401 обрабатываются в baseQuery, здесь ничего не делаем
    }
  }

  const label = starred ? 'Убрать звёздочку' : 'Отметить звёздочкой'

  return (
    <Tooltip title={label}>
      <Button
        type="text"
        size="middle"
        aria-label={label}
        icon={starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
        loading={isAdding || isRemoving}
        onClick={() => void handleToggle()}
        style={{ fontWeight: 600, fontSize: 16, padding: '0 8px' }}
      >
        {count}
      </Button>
    </Tooltip>
  )
}

export default StarRating
