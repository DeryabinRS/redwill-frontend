import { Space, Typography } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import type { MouseEvent as ReactMouseEvent } from 'react'

type Props = {
  links?: string[] | null
  compact?: boolean
  onLinkClick?: (event: ReactMouseEvent<HTMLElement>) => void
}

const { Link: TypographyLink } = Typography

function LinksList({ links, compact = false, onLinkClick }: Props) {
  const items = (links ?? []).filter((link) => typeof link === 'string' && link.trim() !== '')

  if (items.length === 0) {
    return null
  }

  const displayLink = (link: string) => link.replace(/^https?:\/\//i, '')

  return (
    <Space orientation="vertical" size={compact ? 4 : 8} style={{ width: '100%' }}>
      {items.map((link, index) => {
        const key = `${index}-${link}`

        if (compact) {
          return (
            <div key={key} className="post-card-location" style={{ minWidth: 0, width: '100%' }}>
              <LinkOutlined className="post-card-icon" />
              <TypographyLink
                href={link}
                target="_blank"
                rel="noreferrer"
                ellipsis
                onClick={onLinkClick}
                style={{ flex: 1, minWidth: 0 }}
              >
                {displayLink(link)}
              </TypographyLink>
            </div>
          )
        }

        return (
          <Space key={key} size={8}>
            <LinkOutlined />
            <a href={link} target="_blank" rel="noreferrer">
              {displayLink(link)}
            </a>
          </Space>
        )
      })}
    </Space>
  )
}

export default LinksList
